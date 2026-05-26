תיקון ל-V40 — JSONP loading failover + board id normalize

להחליף ב-GitHub:
index.html
boindex.html
patient.html
sw.js

ולהחליף ב-Apps Script:
apps-script/Code.gs

אחרי החלפת Code.gs:
Deploy → Manage deployments → Edit → New version → Deploy

מה תוקן:
- patient.html ו-boindex.html כבר לא אמורים להיתקע לנצח על “טוען...”.
- jsonpLoad קיבל timeout של 8.5 שניות.
- אם Apps Script מחזיר HTML/שגיאה במקום callback JavaScript, ה-callback לא יישאר תלוי.
- אם טעינת הענן נכשלת, הדף מציג נתונים מקומיים/הודעת fallback במקום להיתקע.
- רינדור ראשוני מתבצע גם לפני שהענן חוזר.
- נוספה נורמליזציה ל-board id בעברית/מקודד URL בצד הדפדפן וב-Code.gs.
- sw.js קיבל CACHE_NAME חדש.

אין צורך למחוק שום קובץ.

בדיקה:
Ctrl+U ולחפש:
V40_PATCH_JSONP_LOADING_FAILOVER_INDEX
V40_PATCH_JSONP_LOADING_FAILOVER_BOINDEX
V40_PATCH_JSONP_LOADING_FAILOVER_PATIENT

ב-Code.gs:
V40_PATCH_JSONP_LOADING_FAILOVER_APPS_SCRIPT

וב-sw.js:
V40_PATCH_JSONP_LOADING_FAILOVER_SW
