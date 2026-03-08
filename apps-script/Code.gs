const SPREADSHEET_ID = '1zPbH8RcBarPho4miI6BY5wBOpiBb3r6CF77wwvl0ii0';
const DRIVE_FOLDER_ID = '1PlTvn5v_1mho2c-tc5IYg7aLiIE9qlU1';
const TIMEZONE = 'Asia/Seoul';

const RSVP_SHEET_NAME = 'RSVP';
const PHOTO_SHEET_NAME = 'PHOTO';
const VISIT_SHEET_NAME = 'VISIT';

const RSVP_COLUMNS = [
  'timestamp',
  'attendance',
  'side',
  'name',
  'phone',
  'companions',
  'companionNames',
  'meal',
  'shuttleChoice',
  'shuttleCount',
  'memo',
];

const PHOTO_COLUMNS = [
  'timestamp',
  'source',
  'uploaderName',
  'uploaderPhone',
  'folderName',
  'folderUrl',
  'fileName',
  'fileUrl',
];

const VISIT_COLUMNS = ['timestamp', 'source', 'page', 'visitorId', 'userAgent', 'referrer'];

function doGet(e) {
  try {
    const action = String((e.parameter && e.parameter.action) || '').toLowerCase().trim();

    if (!action) {
      return jsonResponse({
        ok: true,
        service: 'wedding-webapp',
        message: 'alive',
      });
    }

    if (action === 'health') {
      return jsonResponse({
        ok: true,
        service: 'wedding-webapp',
        timestamp: new Date().toISOString(),
      });
    }

    if (action === 'rsvp_list') {
      return jsonResponse({ ok: true, items: readRows_(RSVP_SHEET_NAME, RSVP_COLUMNS, 500) });
    }

    if (action === 'photo_list') {
      return jsonResponse({ ok: true, items: readRows_(PHOTO_SHEET_NAME, PHOTO_COLUMNS, 500) });
    }

    if (action === 'visit_stats') {
      return jsonResponse({ ok: true, stats: getVisitStats_() });
    }

    return jsonResponse({ ok: false, message: 'Unknown action', action: action });
  } catch (error) {
    return jsonResponse({ ok: false, message: String(error) });
  }
}

function doPost(e) {
  try {
    const payload = parsePayload_(e);
    const type = String(payload.type || '').toUpperCase().trim();

    if (!type) {
      return jsonResponse({ ok: false, message: 'type is required' });
    }

    if (type === 'RSVP') {
      const row = {
        timestamp: payload.timestamp || new Date().toISOString(),
        attendance: payload.attendance || '',
        side: payload.side || '',
        name: payload.name || '',
        phone: payload.phone || '',
        companions: payload.companions || '0',
        companionNames: payload.companionNames || '',
        meal: payload.meal || '',
        shuttleChoice: payload.shuttleChoice || '',
        shuttleCount: payload.shuttleCount || '0',
        memo: payload.memo || '',
      };

      appendRsvp_(row);
      notifyRsvpKakao_(row);
      return jsonResponse({ ok: true, type: 'RSVP' });
    }

    if (type === 'PHOTO') {
      const row = savePhoto_(payload);
      appendPhoto_(row);
      return jsonResponse({ ok: true, type: 'PHOTO', fileUrl: row.fileUrl, folderUrl: row.folderUrl });
    }

    if (type === 'VISIT') {
      const row = {
        timestamp: payload.timestamp || new Date().toISOString(),
        source: payload.source || 'INVITATION',
        page: payload.page || 'guest',
        visitorId: payload.visitorId || '',
        userAgent: payload.userAgent || '',
        referrer: payload.referrer || '',
      };

      appendVisit_(row);
      return jsonResponse({ ok: true, type: 'VISIT' });
    }

    return jsonResponse({ ok: false, message: 'Unknown type', type: type });
  } catch (error) {
    return jsonResponse({ ok: false, message: String(error) });
  }
}

function parsePayload_(e) {
  const raw = String((e && e.postData && e.postData.contents) || '').trim();
  if (!raw) return {};

  try {
    return JSON.parse(raw);
  } catch (jsonError) {
    const obj = {};
    raw.split('&').forEach(function (pair) {
      const idx = pair.indexOf('=');
      const key = idx >= 0 ? pair.substring(0, idx) : pair;
      const val = idx >= 0 ? pair.substring(idx + 1) : '';
      obj[decodeURIComponent(key)] = decodeURIComponent(val);
    });
    return obj;
  }
}

function appendRsvp_(row) {
  const sheet = ensureSheet_(RSVP_SHEET_NAME, RSVP_COLUMNS);
  sheet.appendRow([
    row.timestamp,
    row.attendance,
    row.side,
    row.name,
    row.phone,
    row.companions,
    row.companionNames,
    row.meal,
    row.shuttleChoice,
    row.shuttleCount,
    row.memo,
  ]);
}

function appendPhoto_(row) {
  const sheet = ensureSheet_(PHOTO_SHEET_NAME, PHOTO_COLUMNS);
  sheet.appendRow([
    row.timestamp,
    row.source,
    row.uploaderName,
    row.uploaderPhone,
    row.folderName,
    row.folderUrl,
    row.fileName,
    row.fileUrl,
  ]);
}

function appendVisit_(row) {
  const sheet = ensureSheet_(VISIT_SHEET_NAME, VISIT_COLUMNS);
  sheet.appendRow([row.timestamp, row.source, row.page, row.visitorId, row.userAgent, row.referrer]);
}

function savePhoto_(payload) {
  const rootFolder = DriveApp.getFolderById(payload.driveFolderId || DRIVE_FOLDER_ID);
  const uploaderName = sanitizeFolderName_(payload.uploaderName || '이름미기재');
  const folder = getOrCreateChildFolder_(rootFolder, uploaderName);
  const base64 = payload.fileBase64 || '';

  if (!base64) {
    throw new Error('fileBase64 is required');
  }

  const mimeType = payload.mimeType || 'image/jpeg';
  const fileName = payload.fileName || ('photo_' + Utilities.formatDate(new Date(), TIMEZONE, 'yyyyMMdd_HHmmss') + '.jpg');
  const bytes = Utilities.base64Decode(base64);
  const blob = Utilities.newBlob(bytes, mimeType, fileName);
  const file = folder.createFile(blob);

  return {
    timestamp: payload.timestamp || new Date().toISOString(),
    source: payload.source || 'SNAP_QR',
    uploaderName: payload.uploaderName || uploaderName,
    uploaderPhone: payload.uploaderPhone || '',
    folderName: folder.getName(),
    folderUrl: folder.getUrl(),
    fileName: file.getName(),
    fileUrl: file.getUrl(),
  };
}

function readRows_(sheetName, keys, limit) {
  const sheet = ensureSheet_(sheetName, keys);
  const values = sheet.getDataRange().getValues();

  if (values.length <= 1) return [];

  const rows = values.slice(1).map(function (row) {
    const item = {};
    keys.forEach(function (key, index) {
      item[key] = row[index] == null ? '' : row[index];
    });
    return item;
  });

  return rows.reverse().slice(0, limit || 100);
}

function getVisitStats_() {
  const rows = readRows_(VISIT_SHEET_NAME, VISIT_COLUMNS, 1000000);
  const uniqueVisitorMap = {};
  const today = Utilities.formatDate(new Date(), TIMEZONE, 'yyyy-MM-dd');
  let todayViews = 0;

  rows.forEach(function (row) {
    const visitorId = String(row.visitorId || '').trim();
    if (visitorId) uniqueVisitorMap[visitorId] = true;

    const timestamp = new Date(row.timestamp || '');
    if (!isNaN(timestamp.getTime())) {
      const day = Utilities.formatDate(timestamp, TIMEZONE, 'yyyy-MM-dd');
      if (day === today) todayViews += 1;
    }
  });

  return {
    totalViews: rows.length,
    uniqueVisitors: Object.keys(uniqueVisitorMap).length,
    todayViews: todayViews,
  };
}

function notifyRsvpKakao_(row) {
  const webhookUrl = PropertiesService.getScriptProperties().getProperty('KAKAO_ALERT_WEBHOOK_URL');
  if (!webhookUrl) return;

  const sideLabel = row.side === 'groom' ? '신랑측' : row.side === 'bride' ? '신부측' : row.side || '-';
  const text =
    '[RSVP 신규]\n' +
    '- 이름: ' + (row.name || '-') + '\n' +
    '- 구분: ' + sideLabel + '\n' +
    '- 참석: ' + (row.attendance || '-') + '\n' +
    '- 추가인원: ' + (row.companions || '0') + '\n' +
    '- 식사: ' + (row.meal || '-') + '\n' +
    '- 셔틀: ' + (row.shuttleCount || '0') + '\n' +
    '- 연락처: ' + (row.phone || '-');

  try {
    UrlFetchApp.fetch(webhookUrl, {
      method: 'post',
      contentType: 'application/json',
      payload: JSON.stringify({ text: text }),
      muteHttpExceptions: true,
    });
  } catch (error) {
    Logger.log(error);
  }
}

function sanitizeFolderName_(name) {
  const cleaned = String(name || '')
    .replace(/[\\/?%*:|"<>]/g, '_')
    .trim();
  if (!cleaned) return '이름미기재';
  return cleaned.substring(0, 80);
}

function getOrCreateChildFolder_(parent, childName) {
  const folders = parent.getFoldersByName(childName);
  if (folders.hasNext()) return folders.next();
  return parent.createFolder(childName);
}

function ensureSheet_(sheetName, headers) {
  const spreadsheet = SpreadsheetApp.openById(SPREADSHEET_ID);
  let sheet = spreadsheet.getSheetByName(sheetName);

  if (!sheet) {
    sheet = spreadsheet.insertSheet(sheetName);
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
  }

  return sheet;
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
