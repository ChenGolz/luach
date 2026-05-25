Patch ל-V24 — Hotfix missing functions

להחליף ב-GitHub רק:
boindex.html
patient.html
sw.js

מה תוקן:
- boindex.html:
  - תוקן ReferenceError: tabs is not defined
  - תוקן ReferenceError: profile is not defined
  - הוחזרו פונקציות חסרות: input/textarea/select/boolSelect/profile/live/settings
  - content() עטוף בצורה בטוחה כדי שטאב חסר לא ישבור את כל הניהול
  - תוקן manifest path ל-./manifest.json

- patient.html:
  - תוקן ReferenceError: orient is not defined
  - תוקן ReferenceError: nxl is not defined
  - הוחזרו פונקציות תצוגה: items/nxl/nowNext/phones/orient/family/daily
  - נוספו fallback בטוחים ל-nightScreen/memories
  - render() לא אמור לקרוס אם בלוק תצוגה חסר בעתיד

- sw.js:
  - CACHE_NAME חדש כדי לשבור cache ישן.

אחרי העלאה:
F12 → Application → Service Workers → Unregister
Application → Storage → Clear site data
ואז לפתוח מחדש.

בדיקה:
Ctrl+U ולחפש:
V24_HOTFIX_MISSING_FUNCTIONS_BOINDEX
V24_HOTFIX_MISSING_FUNCTIONS_PATIENT

וב-sw.js:
V24_HOTFIX_MISSING_FUNCTIONS_SW
