תיקון ל-V40 — UX Offline badge + Copy links

להחליף ב-GitHub רק:
patient.html
boindex.html
sw.js

אין צורך לעדכן Apps Script בשביל התיקון הזה.

מה נוסף:
- patient.html:
  - מניעת pinch-zoom בטאבלט/טלפון רק במסך הלוח.
  - תג עדין: “☁️ אין חיבור לענן - מוצגים נתונים שמורים” כשיש כשל ענן.
  - התג קטן ולא מלחיץ, ומופיע רק בזמן בעיית חיבור.

- boindex.html:
  - כפתור “📋 העתקת קישור תצוגת הלוח”.
  - כפתור “📋 העתקת קישור לניהול”.
  - ניסוח סטטוס ענן ברור יותר: “אין חיבור לענן - מוצגים נתונים שמורים”.

- sw.js:
  - CACHE_NAME חדש כדי לשבור cache ישן.

בדיקה:
Ctrl+U ולחפש:
V40_PATCH_UX_OFFLINE_COPY_PATIENT
V40_PATCH_UX_OFFLINE_COPY_BOINDEX

וב-sw.js:
V40_PATCH_UX_OFFLINE_COPY_SW
