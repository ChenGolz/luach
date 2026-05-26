Patch ל-V40 — LockService + PWA Manifest hardening

להחליף ב-GitHub:
manifest.json
sw.js

ולהחליף ב-Apps Script:
apps-script/Code.gs

אחרי החלפת Code.gs חובה:
Deploy → Manage deployments → Edit → Version: New version → Deploy

מה תוקן:
- Apps Script:
  - נוספה פונקציה withScriptLock_().
  - פעולות כתיבה קריטיות עטופות ב-LockService:
    save
    ping
    clearPing
    saveAudio
    deleteAudio
    rotateAccessKey
  - המטרה: להפחית סיכון שבן משפחה אחד ידרוס שמירה של בן משפחה אחר בזמן כתיבה מקבילה.

- manifest.json:
  - display עודכן ל-standalone.
  - נוסף display_override:
    fullscreen, standalone, minimal-ui
  - נשמר orientation:any כדי לא לשבור שימוש בטלפון/טאבלט.
  - נוסף id בסיסי.

- sw.js:
  - CACHE_NAME חדש כדי לשבור cache ישן.

מה כבר היה קיים ולא היה צריך לתקן:
- JSONP כבר מנקה script tags עם script.remove() בהצלחה/שגיאה/טיימאאוט.
- patient.html כבר כולל שכבת “הפעלת השעון” לפתיחת הרשאות אודיו בלחיצה ראשונה.

אין צורך למחוק שום קובץ.
