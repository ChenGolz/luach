תיקון ל-V40 המתוקנת — קישור “צפייה בתצוגת הלוח”

להחליף ב-GitHub רק:
index.html
boindex.html
patient.html
sw.js

מה תוקן:
- הכפתור “👁️ צפייה בתצוגת הלוח” כבר לא בונה נתיב שבור.
- נוספה פונקציה יציבה appRootUrl() שמזהה נכון את שורש הפרויקט גם אם נכנסים דרך:
  /luach/
  /luach
  /luach/boindex.html
  /luach/patient.html
  /luach/backoffice/
- גם הקישורים שמועתקים/נשלחים למשפחה משתמשים עכשיו ב-patient.html ו-boindex.html ישירות.
- קישורי WhatsApp ישנים עם mode=patient/mode=backoffice הוחלפו לקישורים ישירים.
- sw.js קיבל CACHE_NAME חדש כדי לשבור cache ישן.

אין צורך למחוק שום קובץ.

בדיקה:
Ctrl+U ולחפש:
V40_PATCH_VIEW_BOARD_LINK_FIX_INDEX
V40_PATCH_VIEW_BOARD_LINK_FIX_BOINDEX
V40_PATCH_VIEW_BOARD_LINK_FIX_PATIENT

וב-sw.js:
V40_PATCH_VIEW_BOARD_LINK_FIX_SW
