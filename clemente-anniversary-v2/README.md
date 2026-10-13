# Victor & Perlita — Golden Anniversary Website

## Edit directly in VS Code
1. Extract the ZIP and open the whole folder with VS Code.
2. Change celebration date, time, venue, attire, and maps link in `config.js`.
3. Change invitation wording in `index.html` and appearance in `style.css`.
4. Add JPG photos to `assets/photos/` named `couple.jpg` and `memory-1.jpg` through `memory-6.jpg`.
5. Save files (Ctrl+S). Double-click `index.html` to preview the invitation locally in your browser. Refresh to see code changes. You do NOT need Live Server or a browser-based editor. The RSVP form ONLY works on deployed Netlify (or Netlify Dev), not in a local file preview.

## Google Sheets setup (one time)
1. Create a Google spreadsheet. Rename its first sheet/tab exactly `RSVP Responses`.
2. Add headers in row 1: `Timestamp`, `Guest Name`, `Attendance`, `Number of Guests`, `Message`.
3. From that spreadsheet, go to Extensions > Apps Script. Replace `Code.gs` contents with `google-apps-script.gs` from this project and save.
4. Deploy > New deployment > Web app. Choose Execute as **Me**, Who has access **Anyone**. Authorize, then copy the `/exec` URL. Do not use the `/dev` URL.
5. If you edit the Apps Script later, go to Deploy > Manage deployments > Edit > New version > Deploy. Merely saving the script does NOT update the existing web app deployment.

## Netlify deployment
1. Sign in to Netlify. Use Add new project > Deploy manually, and upload the extracted project folder (or ZIP if Netlify accepts it). For reliable function deployment, connecting a GitHub repository and letting Netlify build it is recommended. Ensure `netlify/functions/rsvp.js` is deployed as a function. The Netlify Drop static-only workflow may not deploy functions; use a Git-based Netlify site if it does not.
2. In your Netlify site's Site configuration > Environment variables, add `GOOGLE_APPS_SCRIPT_URL` with the exact Google Apps Script `/exec` URL as its value. Do NOT paste this URL into client-side JavaScript.
3. Trigger a fresh Netlify deploy after adding the environment variable.
4. Test the published website RSVP. Only a confirmed Google Sheets save displays the success popup. If it fails, check Netlify Function logs and Apps Script Executions.
5. Google Sheets > Share > General access > Anyone with the link > Viewer. Share that sheet link with family. Anyone who gets that link can read the guest data, so don't collect private/sensitive information.
6. To export Excel: Google Sheets > File > Download > Microsoft Excel (.xlsx).

## Important notes
- Do not open the editor in the browser. All content is directly editable in VS Code.
- The frontend uses a Netlify Function as a backend. Local `file://` preview works for visuals, but cannot submit RSVPs.
- Public forms can attract spam and duplicate submissions. Consider rate limiting/CAPTCHA before widely sharing.
- A timed-out submission can occasionally have been saved even if the browser shows an error. Check the sheet before retrying.
- This version uses a Google Apps Script web app and a Netlify Function; both must be deployed and authorized to work. The code is supplied but not yet connected to your accounts.
