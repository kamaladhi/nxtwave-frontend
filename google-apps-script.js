/**
 * NxtWave Referral Intelligence Dashboard
 * Google Apps Script Backend
 * 
 * HOW TO DEPLOY:
 * 1. Go to script.google.com → New Project
 * 2. Paste this entire file
 * 3. Click Deploy → New Deployment → Web App
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 4. Copy the Web App URL
 * 5. Paste it in app.js → CONFIG.sheetsApiUrl
 * 
 * GOOGLE SHEET STRUCTURE:
 * Sheet 1 (Registrations): timestamp | name | email | college | year | code | refCode
 * Sheet 2 (PageViews):     timestamp | ref | utm_source | utm_medium
 * Sheet 3 (Leaderboard):   code | name | college | referrals | points  [auto-computed]
 */

const SHEET_ID = "YOUR_GOOGLE_SHEET_ID_HERE"; // Replace with your Sheet ID
const REGISTRATION_SHEET = "Registrations";
const PAGEVIEW_SHEET = "PageViews";
const LEADERBOARD_SHEET = "Leaderboard";

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const ss = SpreadsheetApp.openById(SHEET_ID);

    if (data.type === "pageview") {
      // Log page view (referral click)
      const pvSheet = ss.getSheetByName(PAGEVIEW_SHEET) || ss.insertSheet(PAGEVIEW_SHEET);
      pvSheet.appendRow([data.timestamp, data.ref, data.utm_source, data.utm_medium]);

      // Increment referral count for the rep
      updateLeaderboard(ss, data.ref);
    } else {
      // Registration submission
      const regSheet = ss.getSheetByName(REGISTRATION_SHEET) || ss.insertSheet(REGISTRATION_SHEET);
      
      // Add headers if first row
      if (regSheet.getLastRow() === 0) {
        regSheet.appendRow(["Timestamp", "Name", "Email", "College", "Year", "Code", "RefCode"]);
      }
      
      regSheet.appendRow([
        data.timestamp,
        data.name,
        data.email,
        data.college,
        data.year,
        data.code,
        data.refCode || "",
      ]);

      // If they used a referral code, credit the rep
      if (data.refCode) {
        creditReferral(ss, data.refCode);
      }
    }

    return ContentService
      .createTextOutput(JSON.stringify({ success: true }))
      .setMimeType(ContentService.MimeType.JSON);

  } catch (err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.message }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  // Returns leaderboard data (for live fetch from dashboard)
  const ss = SpreadsheetApp.openById(SHEET_ID);
  const sheet = ss.getSheetByName(LEADERBOARD_SHEET);
  if (!sheet) return ContentService.createTextOutput(JSON.stringify([])).setMimeType(ContentService.MimeType.JSON);

  const data = sheet.getDataRange().getValues();
  const headers = data[0];
  const rows = data.slice(1).map(row => {
    const obj = {};
    headers.forEach((h, i) => obj[h.toLowerCase()] = row[i]);
    return obj;
  }).sort((a, b) => b.referrals - a.referrals).slice(0, 10);

  return ContentService
    .createTextOutput(JSON.stringify(rows))
    .setMimeType(ContentService.MimeType.JSON);
}

function updateLeaderboard(ss, refCode) {
  const sheet = ss.getSheetByName(LEADERBOARD_SHEET) || ss.insertSheet(LEADERBOARD_SHEET);
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(["Code", "Name", "College", "Referrals", "Points"]);
  }

  const data = sheet.getDataRange().getValues();
  for (let i = 1; i < data.length; i++) {
    if (data[i][0] === refCode) {
      sheet.getRange(i + 1, 4).setValue(data[i][3] + 1); // Referrals
      sheet.getRange(i + 1, 5).setValue((data[i][3] + 1) * 10); // Points
      return;
    }
  }
  // Rep not found — add them (will be filled with name on next registration)
  sheet.appendRow([refCode, "Unknown Rep", "Unknown College", 1, 10]);
}

function creditReferral(ss, refCode) {
  updateLeaderboard(ss, refCode);
}

/**
 * Run this manually to set up your sheet headers
 */
function setupSheets() {
  const ss = SpreadsheetApp.openById(SHEET_ID);
  
  const regSheet = ss.getSheetByName(REGISTRATION_SHEET) || ss.insertSheet(REGISTRATION_SHEET);
  if (regSheet.getLastRow() === 0) {
    regSheet.appendRow(["Timestamp", "Name", "Email", "College", "Year", "Code", "RefCode"]);
    regSheet.setFrozenRows(1);
  }

  const pvSheet = ss.getSheetByName(PAGEVIEW_SHEET) || ss.insertSheet(PAGEVIEW_SHEET);
  if (pvSheet.getLastRow() === 0) {
    pvSheet.appendRow(["Timestamp", "RefCode", "UTM Source", "UTM Medium"]);
    pvSheet.setFrozenRows(1);
  }

  const lbSheet = ss.getSheetByName(LEADERBOARD_SHEET) || ss.insertSheet(LEADERBOARD_SHEET);
  if (lbSheet.getLastRow() === 0) {
    lbSheet.appendRow(["Code", "Name", "College", "Referrals", "Points"]);
    lbSheet.setFrozenRows(1);
  }

  Logger.log("✅ Sheets set up successfully!");
}
