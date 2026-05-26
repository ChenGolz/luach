V42 Path Fix

תיקון לבעיה שנראתה בקונסול:
- /luach/boindex/patient.html
- /luach/boindex/manifest.json
- /luach/boindex/icons/icon-192.png

מה תוקן:
1. appRootUrl() מזהה עכשיו גם נתיבים שבורים תחת /boindex/ ו-/backoffice/.
2. Service Worker עושה redirect אוטומטי מנתיבים שבורים לנתיבים הנכונים בשורש.
3. אם דף נפתח בטעות תחת /boindex/patient.html, הדף מתקן את הכתובת עם location.replace().
4. boindex.html כבר לא משתמש ב-../icons או ../favicon.
5. sw.js קיבל CACHE_NAME חדש: family-clock-v42-pathfix.

להעלות ל-GitHub את כל הקבצים בגרסה המלאה, או רק את הקבצים מה-patch:
index.html
boindex.html
patient.html
sw.js
manifest.json

אין צורך לעדכן Apps Script עבור תיקון זה.
