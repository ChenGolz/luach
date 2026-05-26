/**
 * FORM_PAYLOAD_FIX_V5
 * DRIVE_DIRECT_PLAYBACK_FIX_V6

 * השעון המשפחתי — Google Sheets + Google Drive backend
 * ------------------------------------------------------
 * גרסה מלאה:
 * - נתוני הלוח נשמרים ב-Google Sheets.
 * - הקלטות קול נשמרות כקבצים ב-Google Drive, לא בתוך התא של הגיליון.
 * - אפשר לשמור בדרייב של מנהלת האתר או בתיקיית Drive משותפת של המשפחה.
 *
 * התקנה אחרי החלפת הקוד:
 * Deploy → Manage deployments → Edit → New version → Deploy
 */

const BOARDS_SHEET = 'לוחות';
const CHUNKS_SHEET = 'לוחות_חלקים';
const LOG_SHEET = 'לוג';
const SECURITY_SHEET = 'לוחות_אבטחה';
const AUDIO_SHEET = 'קבצי_קול';
const READABLE_PREFIX = 'טבלה_';
const DEFAULT_AUDIO_FOLDER_NAME = 'השעון המשפחתי - הקלטות';
const CHUNK_SIZE = 45000;


function normalizeBoardId_(boardId) {
  boardId = String(boardId || '').trim();
  try {
    if (boardId.indexOf('%') !== -1) boardId = decodeURIComponent(boardId);
  } catch (err) {}
  try {
    if (boardId.normalize) boardId = boardId.normalize('NFC');
  } catch (err) {}
  return boardId;
}

/* V40_BOARD_ID_NORMALIZE_APPS_SCRIPT */


function withScriptLock_(fn) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    return fn();
  } finally {
    try { lock.releaseLock(); } catch (err) {}
  }
}

/* V40_LOCKSERVICE_WRITE_GUARD */

function doGet(e) {
  const params = e && e.parameter ? e.parameter : {};
  const action = params.action || 'load';
  const callback = params.callback || '';

  let result;
  try {
    if (action === 'load') {
      const boardId = normalizeBoardId_(params.board || 'grandma-home-board');
      requireBoardAccess_(boardId, accessKeyFromParams_(params), false);
      result = loadBoard_(boardId);
    } else if (action === 'musicFolder') {
      const boardId = normalizeBoardId_(params.board || '');
      requireBoardAccess_(boardId, accessKeyFromParams_(params), false);
      result = listMusicFolder_(params.folderId || params.driveFolderId || params.id || '');
    } else if (action === 'musicFile') {
      const boardId = normalizeBoardId_(params.board || '');
      requireBoardAccess_(boardId, accessKeyFromParams_(params), false);
      result = getMusicFile_(params.folderId || params.driveFolderId || '', params.fileId || params.id || '');
    } else if (action === 'audioMeta') {
      const boardId = normalizeBoardId_(params.board || '');
      requireBoardAccess_(boardId, accessKeyFromParams_(params), false);
      result = getAudioMeta_(boardId, params.recordingKey || params.audioKey || params.key || '');
    } else if (action === 'audio') {
      const boardId = normalizeBoardId_(params.board || '');
      requireBoardAccess_(boardId, accessKeyFromParams_(params), false);
      result = getAudio_(boardId, params.recordingKey || params.audioKey || params.key || '');
    } else if (action === 'ping') {
      const boardId = normalizeBoardId_(params.board || 'grandma-home-board');
      requireBoardAccess_(boardId, accessKeyFromParams_(params), true);
      const minutes = Math.max(1, Number(params.minutes || 5));
      const ping = {
        id: Number(params.id || new Date().getTime()),
        message: String(params.message || ''),
        createdAt: Number(params.createdAt || new Date().getTime()),
        durationMs: Number(params.durationMs || minutes * 60000),
        ack: false
      };
      result = withScriptLock_(() => saveLivePing_(boardId, ping));
    } else if (action === 'clearPing') {
      const boardId = normalizeBoardId_(params.board || 'grandma-home-board');
      requireBoardAccess_(boardId, accessKeyFromParams_(params), true);
      result = withScriptLock_(() => saveLivePing_(boardId, null));
    } else if (action === 'health') {
      result = { ok: true, message: 'החיבור תקין', time: new Date().toISOString() };
    } else {
      result = { ok: false, error: 'פעולה לא מוכרת' };
    }
  } catch (err) {
    result = { ok: false, error: String(err && err.message ? err.message : err) };
  }

  return output_(result, callback);
}


function parsePostBody_(e) {
  let raw = '';
  if (e && e.parameter && e.parameter.payload) raw = String(e.parameter.payload || '');
  else if (e && e.postData && e.postData.contents) raw = String(e.postData.contents || '');
  else raw = '{}';

  raw = raw.trim();

  // text/plain form submit may arrive as: payload={...}
  if (raw.indexOf('payload=') === 0) raw = raw.slice(8);

  // x-www-form-urlencoded fallback may arrive as payload=%7B...%7D
  if (raw.indexOf('payload%3D') === 0) raw = raw.slice(10);

  try { return JSON.parse(raw || '{}'); } catch (err) {}

  try {
    const decoded = decodeURIComponent(raw.replace(/\+/g, ' '));
    if (decoded.indexOf('payload=') === 0) return JSON.parse(decoded.slice(8));
    return JSON.parse(decoded || '{}');
  } catch (err) {
    throw new Error('לא הצלחתי לקרוא את בקשת השמירה: ' + String(err && err.message ? err.message : err));
  }
}

/* V57_APPS_SCRIPT_TEXT_PLAIN_POST_PARSE */

function doPost(e) {
  let result;
  try {
    const body = parsePostBody_(e);

    if (body.action === 'rotateAccessKey') {
      const boardId = normalizeBoardId_(body.boardId || body.board || 'grandma-home-board');
      result = withScriptLock_(() => rotateBoardAccessKey_(boardId, body.oldAccessKey || body.currentAccessKey || accessKeyFromBody_(body), body.newAccessKey || ''));
    } else if (body.action === 'ping') {
      const boardId = normalizeBoardId_(body.boardId || body.board || 'grandma-home-board');
      requireBoardAccess_(boardId, accessKeyFromBody_(body), true);
      result = withScriptLock_(() => saveLivePing_(boardId, body.livePing || {
        id: Number(body.id || new Date().getTime()),
        message: String(body.message || ''),
        createdAt: Number(body.createdAt || new Date().getTime()),
        durationMs: Number(body.durationMs || Math.max(1, Number(body.minutes || 5)) * 60000),
        ack: false
      }));
    } else if (body.action === 'clearPing') {
      const boardId = normalizeBoardId_(body.boardId || body.board || 'grandma-home-board');
      requireBoardAccess_(boardId, accessKeyFromBody_(body), true);
      result = withScriptLock_(() => saveLivePing_(boardId, null));
    } else if (body.action === 'save') {
      const boardId = normalizeBoardId_(body.boardId || body.board || 'grandma-home-board');
      requireBoardAccess_(boardId, accessKeyFromBody_(body), true);
      result = withScriptLock_(() => saveBoard_(boardId, body.value || {}));
    } else if (body.action === 'saveAudio') {
      const boardId = normalizeBoardId_(body.boardId || body.board || 'grandma-home-board');
      requireBoardAccess_(boardId, accessKeyFromBody_(body), true);
      result = withScriptLock_(() => saveAudio_(boardId, body.key || 'calm', body.dataUrl || '', body.folderId || ''));
    } else if (body.action === 'deleteAudio') {
      const boardId = normalizeBoardId_(body.boardId || body.board || 'grandma-home-board');
      requireBoardAccess_(boardId, accessKeyFromBody_(body), true);
      result = withScriptLock_(() => deleteAudio_(boardId, body.key || 'calm'));
    } else {
      result = { ok: false, error: 'פעולה לא מוכרת' };
    }
  } catch (err) {
    result = { ok: false, error: String(err && err.message ? err.message : err) };
  }

  return output_(result, '');
}


function accessKeyFromParams_(params) {
  return String((params && (params.accessKey || params.token || params.boardKey || params.key)) || '');
}

function accessKeyFromBody_(body) {
  return String((body && (body.accessKey || body.token || body.boardKey || body.key)) || '');
}

function hashAccessKey_(key) {
  key = String(key || '');
  if (!key) return '';
  const bytes = Utilities.computeDigest(Utilities.DigestAlgorithm.SHA_256, key, Utilities.Charset.UTF_8);
  return bytes.map(function(b) {
    const v = (b < 0 ? b + 256 : b);
    return ('0' + v.toString(16)).slice(-2);
  }).join('');
}

function getSecurityRow_(boardId) {
  const sheet = getOrCreateSheet_(SECURITY_SHEET, ['board_id', 'access_hash', 'created_at', 'updated_at']);
  const last = sheet.getLastRow();
  if (last <= 1) return null;
  const values = sheet.getRange(2, 1, last - 1, 4).getValues();
  for (let i = 0; i < values.length; i++) {
    if (String(values[i][0]) === String(boardId)) {
      return { row: i + 2, hash: String(values[i][1] || '') };
    }
  }
  return null;
}

function registerBoardAccess_(boardId, accessKey) {
  if (!accessKey) return;
  const sheet = getOrCreateSheet_(SECURITY_SHEET, ['board_id', 'access_hash', 'created_at', 'updated_at']);
  const hash = hashAccessKey_(accessKey);
  const now = new Date();
  const existing = getSecurityRow_(boardId);
  if (existing) {
    if (!existing.hash) sheet.getRange(existing.row, 2, 1, 3).setValues([[hash, now, now]]);
    return;
  }
  sheet.appendRow([boardId, hash, now, now]);
}

function requireBoardAccess_(boardId, accessKey, allowRegister) {
  ensureSheets_();
  boardId = normalizeBoardId_(boardId);
  if (!boardId) throw new Error('חסר מזהה לוח');

  const row = getSecurityRow_(boardId);

  // Backward compatibility: old boards can still be read.
  // Writes must include a family access key; first write with a key migrates the board.
  if (!row) {
    if (allowRegister) {
      if (!accessKey) throw new Error('חסר מפתח גישה משפחתי לשמירה');
      registerBoardAccess_(boardId, accessKey);
    }
    return true;
  }

  if (!row.hash) {
    if (allowRegister) {
      if (!accessKey) throw new Error('חסר מפתח גישה משפחתי לשמירה');
      registerBoardAccess_(boardId, accessKey);
    }
    return true;
  }
  /* V52_REQUIRE_KEY_FOR_LEGACY_WRITES */

  if (!accessKey) throw new Error('חסר מפתח גישה משפחתי');
  if (hashAccessKey_(accessKey) !== row.hash) throw new Error('מפתח גישה לא נכון ללוח הזה');

  return true;
}

/* V24_SECURITY_ACCESS_KEY_PATCH_APPS_SCRIPT */


function rotateBoardAccessKey_(boardId, oldAccessKey, newAccessKey) {
  ensureSheets_();
  boardId = normalizeBoardId_(boardId);
  oldAccessKey = String(oldAccessKey || '');
  newAccessKey = String(newAccessKey || '');

  if (!boardId) throw new Error('חסר מזהה לוח');
  if (!newAccessKey) throw new Error('חסר מפתח חדש');

  const sheet = getOrCreateSheet_(SECURITY_SHEET, ['board_id', 'access_hash', 'created_at', 'updated_at']);
  const row = getSecurityRow_(boardId);
  const now = new Date();
  const newHash = hashAccessKey_(newAccessKey);

  // Backward compatibility: if the board has no security row yet, create it.
  if (!row || !row.hash) {
    if (row && !row.hash) {
      sheet.getRange(row.row, 2, 1, 3).setValues([[newHash, now, now]]);
    } else {
      sheet.appendRow([boardId, newHash, now, now]);
    }
    return { rotated: true, registered: true };
  }

  if (!oldAccessKey) throw new Error('כדי להחליף מפתח צריך את המפתח הנוכחי');
  if (hashAccessKey_(oldAccessKey) !== row.hash) throw new Error('המפתח הנוכחי לא נכון');

  sheet.getRange(row.row, 2).setValue(newHash);
  sheet.getRange(row.row, 4).setValue(now);
  return { rotated: true, registered: false };
}

/* V24_ACCESS_KEY_MANAGER_PATCH_APPS_SCRIPT */


function safeJsonpCallback_(callback) {
  callback = String(callback || '').trim();
  if (!callback) return '';
  if (/^[A-Za-z_$][A-Za-z0-9_$]*(?:\.[A-Za-z_$][A-Za-z0-9_$]*)?$/.test(callback)) return callback;
  return '';
}

/* V52_JSONP_CALLBACK_VALIDATION */

function output_(obj, callback) {
  callback = safeJsonpCallback_(callback);
  const json = JSON.stringify(obj);
  if (callback) {
    return ContentService.createTextOutput(callback + '(' + json + ');')
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(json).setMimeType(ContentService.MimeType.JSON);
}

function getSpreadsheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  if (!ss) throw new Error('הסקריפט חייב להיות מחובר ל-Google Sheet.');
  return ss;
}

function getOrCreateSheet_(name, headers) {
  const ss = getSpreadsheet_();
  let sheet = ss.getSheetByName(name);
  if (!sheet) sheet = ss.insertSheet(name);

  if (headers && headers.length) {
    const firstRow = sheet.getRange(1, 1, 1, headers.length).getValues()[0];
    const isEmpty = firstRow.every(v => !v);
    if (isEmpty) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
      sheet.setFrozenRows(1);
      sheet.autoResizeColumns(1, headers.length);
    }
  }
  return sheet;
}

function ensureSheets_() {
  getOrCreateSheet_(BOARDS_SHEET, ['board_id', 'mode', 'updated_at', 'chunk_count', 'json_small']);
  getOrCreateSheet_(CHUNKS_SHEET, ['board_id', 'part', 'chunk']);
  getOrCreateSheet_(AUDIO_SHEET, ['board_id', 'key', 'file_id', 'file_name', 'mime_type', 'folder_id', 'updated_at']);
  getOrCreateSheet_(LOG_SHEET, ['time', 'board_id', 'action', 'note']);
  getOrCreateSheet_(SECURITY_SHEET, ['board_id', 'access_hash', 'created_at', 'updated_at']);
}


function saveLivePing_(boardId, ping) {
  boardId = normalizeBoardId_(boardId);
  const loaded = loadBoard_(boardId);
  const value = (loaded && loaded.value) ? loaded.value : {};
  value.livePing = ping || null;
  const saved = saveBoard_(boardId, value);
  return { ok: true, livePing: value.livePing, saved: saved && saved.ok !== false };
}

/* V27_APPS_SCRIPT_JSONP_PING_FIX */

function loadBoard_(boardId) {
  boardId = normalizeBoardId_(boardId);
  ensureSheets_();
  const sheet = getOrCreateSheet_(BOARDS_SHEET, ['board_id', 'mode', 'updated_at', 'chunk_count', 'json_small']);
  const values = sheet.getDataRange().getValues();

  for (let i = 1; i < values.length; i++) {
    if (String(values[i][0]) === String(boardId)) {
      const mode = String(values[i][1] || 'small');
      let json = '';

      if (mode === 'chunked') json = readChunks_(boardId, Number(values[i][3] || 0));
      else json = values[i][4] || '{}';

      let value = {};
      try { value = JSON.parse(json || '{}'); } catch (err) { value = {}; }

      value.voiceRecordings = value.voiceRecordings || {};
      attachAudioRefs_(boardId, value);

      return { ok: true, exists: true, boardId, value, updated_at: values[i][2] || '' };
    }
  }

  return { ok: true, exists: false, boardId, value: null, updated_at: '' };
}

function saveBoard_(boardId, value) {
  boardId = normalizeBoardId_(boardId);
  ensureSheets_();

  // Important: audio dataUrl should not be stored inside the Sheet JSON.
  if (value && value.voiceRecordings) {
    Object.keys(value.voiceRecordings).forEach(k => {
      const v = String(value.voiceRecordings[k] || '');
      if (v.indexOf('data:audio') === 0) value.voiceRecordings[k] = '';
    });
  }

  const sheet = getOrCreateSheet_(BOARDS_SHEET, ['board_id', 'mode', 'updated_at', 'chunk_count', 'json_small']);
  const json = JSON.stringify(value || {});
  const now = new Date();

  let row = findBoardRow_(sheet, boardId);
  if (row === -1) row = sheet.getLastRow() + 1;

  clearChunks_(boardId);

  if (json.length <= CHUNK_SIZE) {
    sheet.getRange(row, 1, 1, 5).setValues([[boardId, 'small', now, 0, json]]);
  } else {
    const chunks = splitString_(json, CHUNK_SIZE);
    writeChunks_(boardId, chunks);
    sheet.getRange(row, 1, 1, 5).setValues([[boardId, 'chunked', now, chunks.length, '']]);
  }

  writeReadableSheets_(boardId, value || {});
  log_(boardId, 'save', 'נשמר. גודל JSON: ' + json.length);
  return { ok: true, boardId, updated_at: now.toISOString(), size: json.length };
}

function saveAudio_(boardId, key, dataUrl, folderId) {
  boardId = normalizeBoardId_(boardId);
  ensureSheets_();
  if (!dataUrl || String(dataUrl).indexOf('data:audio') !== 0) throw new Error('לא התקבל קובץ קול תקין');

  const match = String(dataUrl).match(/^data:([^;]+);base64,(.*)$/);
  if (!match) throw new Error('פורמט קובץ קול לא תקין');

  const mime = String(match[1] || 'audio/webm').toLowerCase();
  const allowedMime = {
    'audio/webm': true,
    'audio/mp4': true,
    'audio/mpeg': true,
    'audio/wav': true,
    'audio/x-wav': true,
    'audio/aac': true,
    'audio/ogg': true
  };
  if (!allowedMime[mime]) throw new Error('סוג קובץ קול לא נתמך');
  const base64 = String(match[2] || '');
  if (base64.length > 7 * 1024 * 1024) throw new Error('קובץ הקול גדול מדי');
  const bytes = Utilities.base64Decode(base64);
  if (bytes.length > 5 * 1024 * 1024) throw new Error('קובץ הקול גדול מדי');
  const ext = mime.indexOf('mp4') >= 0 ? 'm4a' : mime.indexOf('mpeg') >= 0 ? 'mp3' : mime.indexOf('wav') >= 0 ? 'wav' : mime.indexOf('ogg') >= 0 ? 'ogg' : 'webm';
  /* V52_AUDIO_SERVER_LIMITS */
  const fileName = boardId + '_' + key + '_' + new Date().toISOString().replace(/[:.]/g, '-') + '.' + ext;

  const folder = resolveAudioFolder_(folderId);
  const blob = Utilities.newBlob(bytes, mime, fileName);
  const file = folder.createFile(blob);
  try { file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW); } catch (err) {}

  upsertAudioRow_(boardId, key, file.getId(), fileName, mime, folder.getId());
  log_(boardId, 'saveAudio', key + ' נשמר בדרייב');

  return { ok: true, boardId, key, fileId: file.getId(), fileName: fileName, mimeType: mime, folderId: folder.getId(), updated_at: new Date().toISOString() };
}


function listMusicFolder_(folderId) {
  folderId = String(folderId || '').trim();
  if (!folderId) return { ok: false, error: 'חסרה תיקיית שירים' };

  const folder = DriveApp.getFolderById(folderId);
  const files = folder.getFiles();
  const out = [];
  const allowed = /\.(mp3|m4a|aac|wav|ogg|oga|webm)$/i;

  while (files.hasNext() && out.length < 60) {
    const file = files.next();
    const name = String(file.getName() || '');
    const mime = String(file.getMimeType() || '');
    if (mime.indexOf('audio/') !== 0 && !allowed.test(name)) continue;

    try { file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW); } catch (err) {}

    out.push({
      id: file.getId(),
      fileId: file.getId(),
      name: name,
      mimeType: mime || 'audio/mpeg',
      url: driveAudioUrl_(file.getId())
    });
  }

  out.sort(function(a, b) {
    return String(a.name || '').localeCompare(String(b.name || ''), 'he');
  });

  return { ok: true, count: out.length, files: out };
}

/* V51_MUSIC_FOLDER_APPS_SCRIPT */


function getMusicFile_(folderId, fileId) {
  folderId = String(folderId || '').trim();
  fileId = String(fileId || '').trim();
  if (!folderId || !fileId) return { ok: false, error: 'חסרה תיקייה או קובץ שיר' };

  const folder = DriveApp.getFolderById(folderId);
  let file = null;
  const files = folder.getFiles();
  while (files.hasNext()) {
    const f = files.next();
    if (String(f.getId()) === fileId) {
      file = f;
      break;
    }
  }
  if (!file) return { ok: false, error: 'קובץ השיר לא נמצא בתיקייה' };

  const name = String(file.getName() || '');
  const allowed = /\.(mp3|m4a|aac|wav|ogg|oga|webm)$/i;
  const blob = file.getBlob();
  const mime = String(blob.getContentType() || file.getMimeType() || 'audio/mpeg');
  if (mime.indexOf('audio/') !== 0 && !allowed.test(name)) return { ok: false, error: 'הקובץ אינו קובץ שמע נתמך' };

  const bytes = blob.getBytes();
  if (bytes.length > 15 * 1024 * 1024) return { ok: false, error: 'קובץ השיר גדול מדי להשמעה ישירה' };

  return {
    ok: true,
    fileId: fileId,
    name: name,
    mimeType: mime,
    dataUrl: 'data:' + mime + ';base64,' + Utilities.base64Encode(bytes)
  };
}

/* V56_MUSIC_FILE_DATAURL_APPS_SCRIPT */


function getAudioMeta_(boardId, key) {
  boardId = normalizeBoardId_(boardId);
  ensureSheets_();
  const row = findAudioRow_(boardId, key);
  if (!row || !row.fileId) return { ok: true, exists: false, boardId: boardId, key: key };
  return {
    ok: true,
    exists: true,
    boardId: boardId,
    key: key,
    fileId: row.fileId,
    fileName: row.fileName || '',
    mimeType: row.mimeType || '',
    folderId: row.folderId || '',
    directUrl: driveAudioUrl_(row.fileId),
    updated_at: row.updatedAt || ''
  };
}

/* V57_AUDIO_META_APPS_SCRIPT */

function getAudio_(boardId, key) {
  boardId = normalizeBoardId_(boardId);
  ensureSheets_();
  const row = findAudioRow_(boardId, key);
  if (!row) return { ok: true, exists: false, boardId, key, dataUrl: '' };

  const file = DriveApp.getFileById(row.fileId);
  const blob = file.getBlob();
  const dataUrl = 'data:' + (row.mimeType || blob.getContentType() || 'audio/webm') + ';base64,' + Utilities.base64Encode(blob.getBytes());
  return { ok: true, exists: true, boardId, key, dataUrl, directUrl: driveAudioUrl_(row.fileId), fileId: row.fileId, updated_at: row.updatedAt || '' };
}

function deleteAudio_(boardId, key) {
  boardId = normalizeBoardId_(boardId);
  ensureSheets_();
  const sheet = getOrCreateSheet_(AUDIO_SHEET, ['board_id', 'key', 'file_id', 'file_name', 'mime_type', 'folder_id', 'updated_at']);
  const last = sheet.getLastRow();
  if (last <= 1) return { ok: true, deleted: false };

  const values = sheet.getRange(2, 1, last - 1, 7).getValues();
  for (let i = values.length - 1; i >= 0; i--) {
    if (String(values[i][0]) === String(boardId) && String(values[i][1]) === String(key)) {
      const fileId = String(values[i][2] || '');
      if (fileId) {
        try { DriveApp.getFileById(fileId).setTrashed(true); } catch (err) {}
      }
      sheet.deleteRow(i + 2);
    }
  }
  log_(boardId, 'deleteAudio', key + ' נמחק');
  return { ok: true, deleted: true };
}

function driveAudioUrl_(fileId) {
  return 'https://drive.google.com/uc?export=download&id=' + encodeURIComponent(fileId);
}

function resolveAudioFolder_(folderId) {
  if (folderId) {
    try { return DriveApp.getFolderById(folderId); }
    catch (err) { throw new Error('לא נמצאה תיקיית Drive. בדקי Folder ID ושיתוף עם בעלת האתר.'); }
  }

  const props = PropertiesService.getScriptProperties();
  const existing = props.getProperty('DEFAULT_AUDIO_FOLDER_ID');
  if (existing) {
    try { return DriveApp.getFolderById(existing); } catch (err) {}
  }

  const folder = DriveApp.createFolder(DEFAULT_AUDIO_FOLDER_NAME);
  props.setProperty('DEFAULT_AUDIO_FOLDER_ID', folder.getId());
  return folder;
}

function upsertAudioRow_(boardId, key, fileId, fileName, mime, folderId) {
  const sheet = getOrCreateSheet_(AUDIO_SHEET, ['board_id', 'key', 'file_id', 'file_name', 'mime_type', 'folder_id', 'updated_at']);
  const last = sheet.getLastRow();
  let row = -1;
  if (last > 1) {
    const values = sheet.getRange(2, 1, last - 1, 7).getValues();
    for (let i = 0; i < values.length; i++) {
      if (String(values[i][0]) === String(boardId) && String(values[i][1]) === String(key)) row = i + 2;
    }
  }
  if (row === -1) row = sheet.getLastRow() + 1;
  sheet.getRange(row, 1, 1, 7).setValues([[boardId, key, fileId, fileName, mime, folderId, new Date()]]);
}

function findAudioRow_(boardId, key) {
  const sheet = getOrCreateSheet_(AUDIO_SHEET, ['board_id', 'key', 'file_id', 'file_name', 'mime_type', 'folder_id', 'updated_at']);
  const last = sheet.getLastRow();
  if (last <= 1) return null;
  const values = sheet.getRange(2, 1, last - 1, 7).getValues();
  for (let i = 0; i < values.length; i++) {
    if (String(values[i][0]) === String(boardId) && String(values[i][1]) === String(key)) {
      return {
        fileId: String(values[i][2] || ''),
        fileName: String(values[i][3] || ''),
        mimeType: String(values[i][4] || ''),
        folderId: String(values[i][5] || ''),
        updatedAt: values[i][6] || ''
      };
    }
  }
  return null;
}

function attachAudioRefs_(boardId, value) {
  boardId = normalizeBoardId_(boardId);
  const keys = ['calm', 'confused', 'night'];
  value.voiceRecordings = value.voiceRecordings || {};
  value.voiceDriveRefs = value.voiceDriveRefs || {};
  keys.forEach(key => {
    const row = findAudioRow_(boardId, key);
    if (row && row.fileId) {
      value.voiceRecordings[key] = 'drive:' + row.fileId;
      value.voiceDriveRefs[key] = { fileId: row.fileId, directUrl: driveAudioUrl_(row.fileId), updatedAt: row.updatedAt || '' };
    }
  });
}

function findBoardRow_(sheet, boardId) {
  const last = sheet.getLastRow();
  if (last <= 1) return -1;
  const values = sheet.getRange(2, 1, last - 1, 1).getValues();
  for (let i = 0; i < values.length; i++) if (String(values[i][0]) === String(boardId)) return i + 2;
  return -1;
}

function splitString_(str, size) {
  const out = [];
  for (let i = 0; i < str.length; i += size) out.push(str.slice(i, i + size));
  return out;
}

function writeChunks_(boardId, chunks) {
  boardId = normalizeBoardId_(boardId);
  const sheet = getOrCreateSheet_(CHUNKS_SHEET, ['board_id', 'part', 'chunk']);
  if (!chunks.length) return;
  const rows = chunks.map((chunk, i) => [boardId, i, chunk]);
  sheet.getRange(sheet.getLastRow() + 1, 1, rows.length, 3).setValues(rows);
}

function readChunks_(boardId, expectedCount) {
  boardId = normalizeBoardId_(boardId);
  const sheet = getOrCreateSheet_(CHUNKS_SHEET, ['board_id', 'part', 'chunk']);
  const last = sheet.getLastRow();
  if (last <= 1) return '{}';
  const values = sheet.getRange(2, 1, last - 1, 3).getValues();
  const chunks = [];
  values.forEach(r => { if (String(r[0]) === String(boardId)) chunks[Number(r[1])] = String(r[2] || ''); });
  if (expectedCount && chunks.filter(x => x !== undefined).length < expectedCount) throw new Error('חסרים חלקי נתונים');
  return chunks.join('') || '{}';
}

function clearChunks_(boardId) {
  boardId = normalizeBoardId_(boardId);
  const sheet = getOrCreateSheet_(CHUNKS_SHEET, ['board_id', 'part', 'chunk']);
  const last = sheet.getLastRow();
  if (last <= 1) return;
  const values = sheet.getRange(2, 1, last - 1, 1).getValues();
  for (let i = values.length - 1; i >= 0; i--) if (String(values[i][0]) === String(boardId)) sheet.deleteRow(i + 2);
}

function writeReadableSheets_(boardId, data) {
  writeKeyValue_(READABLE_PREFIX + 'פרופיל', boardId, data.person || {}, [
    ['stage', data.stage || ''],
    ['firstName', data.person && data.person.firstName || ''],
    ['fullName', data.person && data.person.fullName || ''],
    ['address', data.person && data.person.address || ''],
    ['city', data.person && data.person.city || ''],
    ['safeMessage', data.person && data.person.safeMessage || ''],
    ['identityNote', data.person && data.person.identityNote || ''],
    ['calmingTips', data.person && data.person.calmingTips || ''],
    ['riskNotes', data.person && data.person.riskNotes || '']
  ]);
  writeArray_(READABLE_PREFIX + 'שגרה', boardId, data.schedule || [], ['id', 'time', 'text', 'image', 'days', 'forPatient', 'done']);
  writeArray_(READABLE_PREFIX + 'טלפונים', boardId, data.contacts || [], ['id', 'relation', 'name', 'phone', 'note', 'photo', 'videoLink']);
  writeArray_(READABLE_PREFIX + 'משפחה', boardId, data.family || [], ['id', 'relation', 'name', 'city', 'note', 'emoji', 'photo']);
  writeArray_(READABLE_PREFIX + 'תרופות', boardId, data.medications || [], ['id', 'time', 'name', 'dose', 'instructions', 'taken', 'givenBy', 'notes']);
  writeArray_(READABLE_PREFIX + 'יומן', boardId, data.symptoms || [], ['id', 'date', 'time', 'type', 'what', 'before', 'helped']);
  writeArray_(READABLE_PREFIX + 'חודשי', boardId, data.monthly || [], ['id', 'date', 'title']);
}

function writeKeyValue_(sheetName, boardId, obj, rows) {
  const sheet = getOrCreateSheet_(sheetName, ['board_id', 'field', 'value']);
  removeBoardRows_(sheet, boardId);
  if (!rows || !rows.length) return;
  const output = rows.map(r => [boardId, r[0], stringifyCell_(r[1])]);
  sheet.getRange(sheet.getLastRow() + 1, 1, output.length, 3).setValues(output);
}

function writeArray_(sheetName, boardId, arr, fields) {
  const headers = ['board_id'].concat(fields);
  const sheet = getOrCreateSheet_(sheetName, headers);
  removeBoardRows_(sheet, boardId);
  if (!arr || !arr.length) return;
  const output = arr.map(item => [boardId].concat(fields.map(f => stringifyCell_(item && item[f]))));
  sheet.getRange(sheet.getLastRow() + 1, 1, output.length, headers.length).setValues(output);
}

function removeBoardRows_(sheet, boardId) {
  const last = sheet.getLastRow();
  if (last <= 1) return;
  const values = sheet.getRange(2, 1, last - 1, 1).getValues();
  for (let i = values.length - 1; i >= 0; i--) if (String(values[i][0]) === String(boardId)) sheet.deleteRow(i + 2);
}

function stringifyCell_(value) {
  if (value === null || value === undefined) return '';
  if (Array.isArray(value)) return value.join(',');
  if (typeof value === 'object') {
    const s = JSON.stringify(value);
    return s.length > 49000 ? s.slice(0, 49000) : s;
  }
  const s = String(value);
  return s.length > 49000 ? s.slice(0, 49000) : s;
}

function log_(boardId, action, note) {
  const sheet = getOrCreateSheet_(LOG_SHEET, ['time', 'board_id', 'action', 'note']);
  getOrCreateSheet_(SECURITY_SHEET, ['board_id', 'access_hash', 'created_at', 'updated_at']);
  sheet.appendRow([new Date(), boardId, action, note || '']);
}

function onOpen() {
  SpreadsheetApp.getUi()
    .createMenu('השעון המשפחתי')
    .addItem('הכנת גיליונות', 'ensureSheets_')
    .addItem('בדיקת חיבור', 'showHealth_')
    .addToUi();
}

function showHealth_() {
  SpreadsheetApp.getUi().alert('הכול תקין. עכשיו צריך לפרוס כ-Web App ולהעתיק את ה-URL.');
}


/* FINAL_CLEAN_V24_APPS_SCRIPT */

/* V26_VISIBLE_PING_FIX_APPS_SCRIPT */

/* FORMOM_FINAL_CLEAN_V36_APPS_SCRIPT */

/* V40_PATCH_JSONP_LOADING_FAILOVER_APPS_SCRIPT */

/* V40_LOCKSERVICE_PATCH_APPS_SCRIPT */

/* V41_FINAL_QA_APPS_SCRIPT */

/* V51_MUSIC_FOLDER_FULLSCREEN_APPS_SCRIPT */

/* V52_SECURITY_QA_FIXES_APPS_SCRIPT */

/* V56_AUDIO_MUSIC_PROXY_CONTRAST_APPS_SCRIPT */

/* V57_VOICE_DRIVE_UPLOAD_CONFIRM_APPS_SCRIPT */
