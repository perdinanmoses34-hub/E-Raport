// Google Apps Script Template (Code.gs)
// Deploy as Web App: Execute as "Me", Who has access: "Anyone"
// This connects the E-Raport SMP Web/PWA App to Google Sheets and Google Drive

export const APPS_SCRIPT_CODE = `/**
 * =========================================================================
 * GOOGLE APPS SCRIPT CONNECTOR FOR E-RAPORT SMP
 * Official School Middleware for Google Sheets & Google Drive
 * Pemilik / Super Admin: perdinan.moses34@guru.smp.belajar.id
 * =========================================================================
 */

var SHEET_NAMES = [
  "USERS", "SEKOLAH", "TAHUN_PELAJARAN", "SISWA", "GURU", "KELAS",
  "MATA_PELAJARAN", "NILAI", "SIKAP", "ABSENSI", "EKSTRAKURIKULER",
  "NILAI_EKSTRA", "PRESTASI", "CATATAN_WALI", "RAPORT", "PENGATURAN",
  "LOG_AKTIVITAS", "NOTIFIKASI"
];

function doGet(e) {
  var action = e.parameter.action || "test_connection";
  var ss = SpreadsheetApp.getActiveSpreadsheet();

  try {
    if (action === "test_connection") {
      return responseJSON({
        status: "success",
        message: "Google Apps Script connected to E-RAPORT SMP successfully.",
        spreadsheet_name: ss.getName(),
        spreadsheet_id: ss.getId(),
        timestamp: new Date().toISOString()
      });
    }

    if (action === "get_all") {
      var allData = {};
      SHEET_NAMES.forEach(function(sheetName) {
        var sheet = ss.getSheetByName(sheetName);
        if (sheet) {
          allData[sheetName] = sheetToJSON(sheet);
        } else {
          allData[sheetName] = [];
        }
      });
      return responseJSON({ status: "success", data: allData });
    }

    if (action === "get_sheet") {
      var sheetName = e.parameter.sheet;
      var sheet = ss.getSheetByName(sheetName);
      if (!sheet) {
        return responseJSON({ status: "error", message: "Sheet not found: " + sheetName });
      }
      return responseJSON({ status: "success", data: sheetToJSON(sheet) });
    }

    return responseJSON({ status: "error", message: "Action not recognized" });
  } catch (err) {
    return responseJSON({ status: "error", message: err.toString() });
  }
}

function doPost(e) {
  var ss = SpreadsheetApp.getActiveSpreadsheet();
  try {
    var body = JSON.parse(e.postData.contents);
    var action = body.action;

    if (action === "init_sheets") {
      initAllSheets(ss);
      return responseJSON({ status: "success", message: "All 18 sheets initialized successfully with headers." });
    }

    if (action === "sync_bulk") {
      var payload = body.data;
      Object.keys(payload).forEach(function(sheetName) {
        if (SHEET_NAMES.indexOf(sheetName) !== -1) {
          var sheet = ss.getSheetByName(sheetName) || ss.insertSheet(sheetName);
          var rows = payload[sheetName];
          if (Array.isArray(rows) && rows.length > 0) {
            writeJSONToSheet(sheet, rows);
          }
        }
      });
      return responseJSON({ status: "success", message: "Data synced to Google Sheets successfully." });
    }

    if (action === "save_pdf_to_drive") {
      var folderId = body.folder_id;
      var base64Data = body.pdf_base64;
      var fileName = body.file_name;
      
      var folder = folderId ? DriveApp.getFolderById(folderId) : DriveApp.getRootFolder();
      var decodedBlob = Utilities.newBlob(Utilities.base64Decode(base64Data), 'application/pdf', fileName);
      var file = folder.createFile(decodedBlob);
      file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

      return responseJSON({
        status: "success",
        file_id: file.getId(),
        file_url: file.getUrl(),
        file_name: file.getName()
      });
    }

    return responseJSON({ status: "error", message: "Unknown POST action" });
  } catch (err) {
    return responseJSON({ status: "error", message: err.toString() });
  }
}

function sheetToJSON(sheet) {
  var data = sheet.getDataRange().getValues();
  if (data.length <= 1) return [];
  var headers = data[0];
  var result = [];
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var obj = {};
    for (var j = 0; j < headers.length; j++) {
      obj[headers[j]] = row[j];
    }
    result.push(obj);
  }
  return result;
}

function writeJSONToSheet(sheet, items) {
  if (!items || items.length === 0) return;
  sheet.clearContents();
  var headers = Object.keys(items[0]);
  var rows = [headers];
  for (var i = 0; i < items.length; i++) {
    var row = [];
    for (var j = 0; j < headers.length; j++) {
      var val = items[i][headers[j]];
      if (typeof val === 'object' && val !== null) {
        row.push(JSON.stringify(val));
      } else {
        row.push(val === undefined ? "" : val);
      }
    }
    rows.push(row);
  }
  sheet.getRange(1, 1, rows.length, headers.length).setValues(rows);
}

function initAllSheets(ss) {
  SHEET_NAMES.forEach(function(name) {
    if (!ss.getSheetByName(name)) {
      ss.insertSheet(name);
    }
  });
}

function responseJSON(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
`;
