// Paste this entire file into Extensions > Apps Script > Code.gs.
// Create a Google Sheet tab named exactly: RSVP Responses
const SHEET_NAME = 'RSVP Responses';

function doPost(e) {
  const lock = LockService.getScriptLock();
  try {
    lock.waitLock(10000);
    const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEET_NAME);
    if (!sheet) throw new Error('RSVP Responses tab not found');
    const data = JSON.parse(e.postData.contents);
    const name = String(data.name || '').trim();
    const attendance = String(data.attendance || '');
    const guests = Number(data.guests);
    if (!name || name.length > 120 || !['Joyfully accepts', 'Regretfully declines'].includes(attendance) ||
        !Number.isInteger(guests) || guests < 0 || guests > 20 ||
        (attendance === 'Joyfully accepts' && guests < 1) ||
        (attendance === 'Regretfully declines' && guests !== 0)) throw new Error('Invalid RSVP');
    const safe = (value) => {
      const str = String(value || '').slice(0, 1000);
      return /^[=+\-@\t\r]/.test(str) ? "'" + str : str;
    };
    sheet.appendRow([new Date(), safe(name), attendance, guests, safe(data.message)]);
    SpreadsheetApp.flush();
    return ContentService.createTextOutput(JSON.stringify({ success: true })).setMimeType(ContentService.MimeType.JSON);
  } catch (error) {
    return ContentService.createTextOutput(JSON.stringify({ success: false, error: String(error.message) })).setMimeType(ContentService.MimeType.JSON);
  } finally {
    if (lock.hasLock()) lock.releaseLock();
  }
}
