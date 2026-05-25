# השעון המשפחתי — גרסה מלאה

גרסה זו כוללת:

- קישור אחד למשפחה.
- תצוגת מטופל/ת רגועה.
- Backoffice לניהול.
- קול משפחתי מוקלט.
- שמירת הקלטות ב-Google Drive במקום Google Sheets.
- בחירה אם לשמור הקלטות בדרייב של החשבון שמריץ את Apps Script או בתיקיית Drive פרטית של המשפחה.
- קישור לפלייליסט YouTube.
- תמונות משפחה בהעלאה פשוטה מהמחשב/טלפון.
- PWA: manifest + service worker + אייקונים.
- מזג אוויר לפי עיר/יישוב המטופל/ת.
- רקע עדין ומרגיע, לא תמונות עמוסות.

## חשוב מאוד אחרי העלאה

צריך להעלות ל-GitHub:

```txt
index.html
patient.html
backoffice/index.html
manifest.json
sw.js
favicon.ico
icons/
assets/
README.md
```

## חשוב מאוד ב-Google Apps Script

כדי שהקלטות יישמרו ב-Google Drive, חייבים לעדכן את Apps Script:

1. לפתוח את Google Sheet.
2. Extensions → Apps Script.
3. להחליף את כל הקוד בקובץ:
   `apps-script/Code.gs`
4. ללחוץ Save.
5. Deploy → Manage deployments → Edit.
6. לבחור New version.
7. ללחוץ Deploy.

## שמירת הקלטות

ב-Backoffice → קול משפחתי:

אפשר לבחור:

```txt
בדרייב של מנהלת האתר — הכי קל
```

או:

```txt
בתיקיית Drive משותפת של המשפחה
```

אם בוחרים תיקייה משפחתית:
1. המשפחה יוצרת תיקייה ב-Google Drive.
2. משתפת אותה עם חשבון Google של מנהלת האתר.
3. מדביקה ב-Backoffice את הקישור לתיקייה או את ה-Folder ID.

## פלייליסט YouTube

ב-Backoffice → הגדרות חכמות:

אפשר להדביק קישור לפלייליסט YouTube, למשל:

```txt
https://www.youtube.com/playlist?list=...
```

במסך המטופל/ת יופיע כפתור מוזיקה פשוט.

## רקעים מרגיעים

נוסף רקע עדין מאוד ב-SVG. לא הוספתי תמונות מפורטות או מתחלפות מאחורי טקסט, כי אצל חולי שכחה רקע עמוס עלול לבלבל ולהפחית קריאות. עדיף רקע שקט, בהיר, קבוע ועדין.

## בדיקת גרסה

באתר עצמו אפשר ללחוץ Ctrl+U ולחפש:

```txt
FULL_VOICE_FIX_V4
```

וב-Apps Script החדש יש:

```txt
saveAudio
קבצי_קול
```


---

# תיקון V5 — כפתור קול משפחתי ושמירת הקלטות

בגרסה זו תוקנו שני דברים:

## כפתור קול משפחתי
הכפתור העליון `🎙️ קול משפחתי` הוא עכשיו גם קישור אמיתי, לא רק JavaScript.
אם JavaScript של הכפתור נתקע, הקישור עדיין פותח:
`mode=backoffice&tab=voice`

בדיקה:
`Ctrl+U` ולחפש:
`TOP_VOICE_LINK_FIX_V5`

## שמירת הקלטות
שמירת הקלטות ל-Google Drive עוברת עכשיו דרך טופס נסתר ל-Apps Script.
זה יציב יותר מול redirect/CORS של Google.

חשוב מאוד:
צריך לעדכן Apps Script עם הקוד החדש:
`apps-script/Code.gs`

ואז:
Deploy → Manage deployments → Edit → New version → Deploy

בדיקה ב-Apps Script:
לחפש בקוד:
`FORM_PAYLOAD_FIX_V5`


---

# תיקון V6 — השמעת הקלטות Drive

בגרסה זו כפתור `השמעה לבדיקה` כבר לא מנסה לטעון את קובץ הקול דרך Apps Script כ-Base64.
במקום זה הוא משתמש בקישור ישיר לקובץ Google Drive:

```txt
https://drive.google.com/uc?export=download&id=FILE_ID
```

בנוסף, מיד אחרי הקלטה נשמר עותק זמני מקומי בדפדפן, כך שאפשר לבדוק את ההקלטה גם לפני שהסנכרון חזר מהענן.

צריך להעלות את הקבצים החדשים וגם לעדכן Apps Script עם `apps-script/Code.gs`, ואז:
Deploy → Manage deployments → Edit → New version → Deploy

בדיקה באתר:
Ctrl+U ולחפש:
`DRIVE_PLAYBACK_FIX_V6`


---

# תיקון V7 — שגיאת drive: ERR_UNKNOWN_URL_SCHEME

אם בקונסול הופיעה שגיאה כמו:

```txt
Failed to load resource: drive:...
ERR_UNKNOWN_URL_SCHEME
```

זה אומר שהדפדפן קיבל `drive:FILE_ID` במקום URL אמיתי.

בגרסה זו כל `drive:FILE_ID` מומר לפני ההשמעה לכתובת תקינה:

```txt
https://drive.google.com/uc?export=download&id=FILE_ID
```

בדיקה באתר:
Ctrl+U ולחפש:
`DRIVE_URL_SCHEME_FIX_V7`


---

# תיקיית Drive מוגדרת מראש להקלטות

בגרסה זו תיקיית ברירת המחדל להקלטות היא:

```txt
https://drive.google.com/drive/folders/1q861AukKjnvhTPYz0BG1bL8bh9MGoJH_?usp=drive_link
```

Folder ID:

```txt
1q861AukKjnvhTPYz0BG1bL8bh9MGoJH_
```

ב-Backoffice → קול משפחתי נוסף כפתור:

```txt
פתיחת תיקיית ההקלטות בדרייב
```

חשוב: התיקייה צריכה להיות משותפת עם חשבון Google שמריץ את Apps Script, כלומר החשבון שבחרת בו ב-Deploy כ-Execute as: Me.


---

# תיקון V9 — כפתור קול משפחתי בתפריט העליון

בגרסה זו כפתור `🎙️ קול משפחתי` עושה ניווט קשיח של הדפדפן לכתובת:

```txt
?board=...&mode=backoffice&tab=voice
```

כך גם אם המעבר הפנימי נתקע, הדף נטען מחדש ישירות בלשונית קול משפחתי.

בדיקה:
`Ctrl+U` ולחפש:
`TOP_VOICE_HARD_FIX_V9`

בגלל Service Worker, אחרי העלאה מומלץ לפתוח פעם אחת ב-Incognito או לנקות cache לאתר.


---

# תיקון V10 — מניעת השמעות כפולות ועצירת קול

בגרסה זו נוסף מנהל שמע:

- תמיד מתנגנת רק הקלטה אחת בכל פעם.
- לחיצה חוזרת על השמעה עוצרת קודם את ההשמעה הקודמת.
- ב-Backoffice נוסף כפתור `עצירת השמעה`.
- במסך המטופל/ת נוסף כפתור `⏹️ עצירת קול` במצב הרגעה ובמצב לילה.
- סגירת מצב הרגעה עוצרת גם קול משפחתי וגם TTS.
- התחלת הקלטה ב-Backoffice עוצרת קודם כל השמעה קיימת.

בדיקה באתר:
Ctrl+U ולחפש:
`AUDIO_STOP_FIX_V10_INDEX`


---

# תיקון V11 — תיקונים מלאים לפי בדיקה

כולל:
- זיהוי מיקום בעברית, כולל “קיבוץ רוחמה”.
- חיווי ברור אחרי שמירה ועדכון.
- תיקון כפתורי המטופל/ת במצב פסיבי.
- תיקון פלייליסט YouTube.
- מניעת השמעות כפולות + עצירת קול.
- מניעת קפיצה במסך קול משפחתי.
- לוז שבועי עם ימים בשבוע.
- לשונית “מפת עריכה” שמסבירה איפה עורכים כל דבר שמופיע במסך המטופל/ת.
- קובץ טקסט: `הצעות-להמשך.txt`.

בדיקה:
Ctrl+U ולחפש:
`FULL_FIX_V11_INDEX`


---

# תיקון V12 — תיקון Syntax ב-Backoffice

בגרסת V11 הייתה שגיאת JavaScript:
`async async function playVoice`

זה גרם ל-Backoffice להישאר ריק עם שגיאה:
`SyntaxError: Unexpected token 'async'`

בגרסה זו השגיאה תוקנה, ונבדקו תחבירית הקבצים:
- index.html
- patient.html
- backoffice/index.html

בדיקה באתר:
Ctrl+U ולחפש:
`FULL_FIX_V12_SYNTAX`


---

# תיקון V13 — יציבות, ווטסאפ ונעילת מגע

כולל:
- החלמה עצמית במסך המטופל/ת: אם יש כמה שגיאות תקשורת ברצף או שהדף קפא זמן רב, הוא מרענן את עצמו.
- כפתור ב-Backoffice: `🟢 שליחת הודעת הסבר פשוטה לווטסאפ המשפחתי`.
- הגדרה חדשה: `נעילת מסך לנגיעות בטעות`.
- אם נעילת מגע פעילה, לחיצה רגילה במסך המטופל/ת לא משנה את המסך ומציגה הודעה מרגיעה.
- Service Worker כבר לא תלוי בקובץ `הצעות-להמשך.txt` כדי להצליח בהתקנה.

בדיקה:
Ctrl+U ולחפש:
`FULL_FIX_V13_INDEX`

בנוסף הרצתי בדיקת תחביר על:
- index.html
- patient.html
- backoffice/index.html


---

# תיקון V14 — יציבות UI, מוזיקה וקפיצות מסך

מה תוקן:
- מסך המטופל/ת כבר לא נבנה מחדש כל שנייה. הוא מתעדכן לפי דקה, ושומר על יציבות.
- בזמן שנגן YouTube פתוח, המסך לא מרנדר מחדש את ה-iframe, כדי שהמוזיקה לא תתאפס.
- נוסף כפתור `פתיחה ביוטיוב` אם הנגן הפנימי נשאר שחור או נחסם.
- נוספה שמירת מיקום גלילה ב-Backoffice ובמסך המטופל/ת כדי להפחית קפיצות.
- נוספו aliases לכפתורים כמו full/fullscreen ו-showDay/dayView כדי שכפתורים לא ייחסמו בטעות.
- ה-Service Worker נהיה סלחני: אם קובץ אחד חסר, הוא לא מפיל את כל התקנת ה-PWA.
- נוסף גם `boindex.html` כעותק של Backoffice למקרה שמעלים קובץ ניהול שטוח בטעות.

בדיקה:
Ctrl+U ולחפש:
`STABLE_UI_FIX_V14_INDEX`

בדיקת תחביר הורצה על:
- index.html
- patient.html
- backoffice/index.html
- boindex.html


---

# תיקון V15 — calmHtml / מסך מטופל ריק

בגרסת V14 הייתה שגיאה במסך המטופל/ת:

```txt
ReferenceError: calmHtml is not defined
```

הפונקציה `render()` קראה ל-`calmHtml()` אבל הפונקציה הייתה חסרה.
בגרסה זו:
- נוספה פונקציית `calmHtml()` יציבה.
- נוספו fallback-ים כדי שפונקציות תצוגה חסרות לא ישברו את כל המסך.
- תוקן כפל אפשרי בספירת שגיאות תקשורת.
- הורצה בדיקת תחביר על index/patient/backoffice/boindex.

בדיקה:
Ctrl+U ולחפש:
`CALM_RENDER_FIX_V15_PATIENT`


---

# תיקון V16 — PWA, אודיו וניווט iframe

כולל:
- Service Worker בטוח יותר: אין תלות בקובץ עברי או בקובץ חסר כדי להתקין PWA.
- `CORE_FILES` קטן ומבוסס על קבצים בטוחים בלבד.
- התקנת cache סלחנית: קובץ חסר לא מפיל את כל ה-PWA.
- שכבת פתיחה במסך המטופל/ת: `הפעלת השעון המשפחתי`, כדי לשחרר חסימת אודיו בדפדפנים.
- סנכרון URL בין Backoffice בתוך iframe לבין החלון הראשי באמצעות postMessage.
- הגנת מזג אוויר: אם Open-Meteo נכשל, השעון ממשיך לעבוד בלי מזג אוויר.
- הקובץ `.nojekyll` הוסר מה-ZIP כי GitHub לא נתן להעלות אותו דרך הממשק.

בדיקה:
Ctrl+U ולחפש:
`PWA_AUDIO_ROUTER_FIX_V16_INDEX`

בדיקת תחביר הורצה על:
- index.html
- patient.html
- backoffice/index.html
- boindex.html


---

# V17 — חיבור פרטי למשפחה אחרת

מטרה:
חבר/ה יכולים להשתמש באתר שלך, אבל הנתונים וההקלטות נשמרים בגוגל שלהם, כך שאין לך גישה אליהם.

חשוב:
קישור רגיל ל-Google Sheet לא מספיק. צריך Google Apps Script Web App URL.

## הדרך הקלה לחבר/ה

1. החבר/ה יוצרים Google Sheet חדש בחשבון שלהם.
2. Extensions → Apps Script.
3. מדביקים את הקוד מתוך:
   `apps-script/Code.gs`
4. Deploy → New deployment → Web app.
5. Execute as: Me.
6. Who has access: Anyone with the link.
7. מעתיקים את Web App URL.
8. יוצרים תיקיית Drive להקלטות.
9. פותחים את האתר.
10. במסך הראשון מדביקים:
   - Web App URL
   - קישור או Folder ID של תיקיית Drive
11. לוחצים `שמירת חיבור פרטי`.
12. יוצרים לוח ומעתיקים קישורים.

## ב-Backoffice

נוספה לשונית:
`ענן פרטי`

שם אפשר לשמור או להעתיק קישורים שכוללים את החיבור הפרטי.

בדיקה:
Ctrl+U ולחפש:
`PRIVATE_FAMILY_CLOUD_V17_INDEX`


---

# V18 — תיקון סופי ל-PWA ולניווט

כולל:

1. `sw.js`
   - `CORE_FILES` כולל רק קבצים בטוחים שקיימים בשורש.
   - הניהול נשמר כ-`./boindex.html`.
   - אין תלות בקובץ עברי בתוך התקנת ה-PWA.
   - `backoffice/index.html` נשמר רק כקובץ אופציונלי ולא יכול להפיל התקנה.

2. `boindex.html`
   - רישום Service Worker עובד גם כשהקובץ בשורש וגם כשהוא בתוך `/backoffice/`.
   - הנתיב מחושב אוטומטית:
     `/backoffice/` → `../sw.js`
     שורש → `./sw.js`

3. `index.html`
   - `openMode` ו-`openVoice` מעדכנים את ה-URL האמיתי של הדפדפן בעזרת `history.pushState` דרך `updateBrowserUrl`.
   - רענון הדף אמור לשמור על מצב: מטופל/ת, ניהול, או קול משפחתי.

בדיקה:
Ctrl+U ולחפש:
`FINAL_PWA_ROUTER_FIX_V18_INDEX`

בדיקת תחביר הורצה על:
- index.html
- patient.html
- backoffice/index.html
- boindex.html
- sw.js


---

# V19 — גרסה נקייה אחרי בדיקה מחדש

תיקונים שבוצעו:

1. `sw.js`
   - `CORE_FILES` כולל רק קבצים שקיימים בשורש:
     `index.html`, `patient.html`, `boindex.html`, `manifest.json`, icons, assets, favicon.
   - אין `הצעות-להמשך.txt` בתוך `CORE_FILES`.
   - אין `backoffice/` או `backoffice/index.html` בתוך `CORE_FILES`.

2. `index.html`
   - ה-iframe של הניהול נטען מ-`./boindex.html`, לא מ-`./backoffice/`.
   - `openMode` ו-`openVoice` מעדכנים את ה-URL האמיתי של הדפדפן בעזרת `history.pushState`.

3. `boindex.html`
   - רישום Service Worker הוא `./sw.js`, כי הקובץ יושב בשורש.

4. ענן פרטי
   - תוקן הניסוח המבלבל: בענן פרטי של משפחה לא צריך לשתף את התיקייה עם מנהלת האתר.
   - התיקייה צריכה להיות נגישה רק לחשבון ה-Google שמריץ את ה-Apps Script.

בדיקה:
Ctrl+U ולחפש:
`CLEAN_PRIVATE_PWA_V19_INDEX`

בדיקת תחביר הורצה על:
- index.html
- patient.html
- backoffice/index.html
- boindex.html
- sw.js


---

# V20 — שיפורי UI/UX

שיפורי מסך המטופל/ת:
- Fade עדין לתמונות שומר המסך / זיכרונות.
- רקע שמיים עדין לפי זמן ביום: בוקר, יום, ערב, לילה.
- משימות שסומנו כבוצעו נחלשות ויזואלית, מקבלות פחות צבע וקו חוצה עדין.

שיפורי Backoffice:
- כפתורי שמירה מקבלים מצב טעינה בזמן שמירה לענן.
- טאב “קול משפחתי” קיבל כרטיסי קול ברורים, גדולים ונעימים יותר.
- קישורי שיתוף מוכנים ניתנים להעתקה בלחיצה אחת.
- נשמרו תיקוני V19: PWA נקי, boindex בשורש, וענן פרטי ללא צורך בשיתוף עם מנהלת האתר.

בדיקה:
Ctrl+U ולחפש:
`UI_POLISH_V20_INDEX`

בדיקת תחביר הורצה על:
- index.html
- patient.html
- backoffice/index.html
- boindex.html
- sw.js


---

# V21 — תיקון pingHtml במסך המטופל/ת

תוקן:
- `patient.html` קרא ל-`pingHtml()` בזמן render, אבל הפונקציה לא הייתה קיימת.
- נוספה פונקציית `pingHtml()` אמיתית להודעות משפחה מיידיות.
- נוספה שכבת הודעה נעימה וברורה עם כפתור `הבנתי ❤️`.
- נוספה הגנה נוספת: אם פונקציית תצוגה חסרה בעתיד, היא לא תשבור את כל מסך המטופל/ת.
- הודעות Live Ping שפג תוקפן מתנקות אוטומטית.

בדיקה:
Ctrl+U ולחפש:
`PINGHTML_FIX_V21_PATIENT`

בדיקת תחביר הורצה על:
- index.html
- patient.html
- backoffice/index.html
- boindex.html
- sw.js

נבדק גם שאין קריאות לפונקציות `*Html()` שלא מוגדרות.


---

# V22 — תיקון קשיח ל-pingHtml/cache

תוקן:
- `patient.html` כבר לא יכול להישבר מ-`ReferenceError: pingHtml is not defined`.
- נוספה פונקציית `safeOptionalHtml()` שמעטפת תצוגות אופציונליות.
- בתוך `render`, קריאות כמו `pingHtml()` מוחלפות בקריאה בטוחה:
  `safeOptionalHtml("pingHtml")`
- גם אם הדפדפן טוען גרסה מעורבבת מה-cache, המסך לא אמור להישבר.
- Service Worker cache name הוחלף כדי לכפות רענון.

בדיקה:
Ctrl+U ולחפש:
`HARD_PING_FALLBACK_V22_PATIENT`

בדיקת תחביר הורצה על:
- index.html
- patient.html
- backoffice/index.html
- boindex.html
- sw.js


---

# V23 — Perfect PWA Router Check

בוצעו ונבדקו 3 התיקונים הקריטיים:

1. `sw.js`
   - `CACHE_NAME="family-clock-v23-perfect-pwa-router"`
   - `CORE_FILES` כולל רק:
     `./`, `index.html`, `patient.html`, `boindex.html`, `manifest.json`, icons, assets, favicon.
   - אין `backoffice/`, אין `backoffice/index.html`, ואין קובץ עברי בתוך `CORE_FILES`.

2. `boindex.html`
   - רישום Service Worker הוא בדיוק:
     `navigator.serviceWorker.register("./sw.js")`

3. `index.html`
   - `openMode` ו-`openVoice` מעדכנים את ה-URL של חלון האב דרך `history.pushState`.
   - הניהול נטען דרך `./boindex.html`.

בדיקה:
Ctrl+U ולחפש:
`PERFECT_PWA_ROUTER_V23_INDEX`

בדיקת תחביר הורצה על:
- index.html
- patient.html
- backoffice/index.html
- boindex.html
- sw.js


---

# V24 — תיקון כפתורים בחלונות קופצים

תוקן:
- כפתורי `עצירת קול`, `הבנתי, לחזור לשעון`, `הקריאי לי שוב`, `הבנתי ❤️` ו-`סגירה`
  בתוך חלונות קופצים כבר לא נחסמים על ידי `event.stopPropagation()`.
- נוספה האזנה בשלב capture לפני שהחלון הפנימי עוצר את הלחיצה.
- נוספה הגנה נוספת ל-`onclick` של חלונות קופצים כדי שלא יחסום כפתורים, קישורים, אודיו או iframe.
- נשמרו תיקוני V23 ל-PWA ול-router.

בדיקה:
Ctrl+U ולחפש:
`OVERLAY_BUTTONS_FIX_V24_PATIENT`

בדיקת תחביר הורצה על:
- index.html
- patient.html
- backoffice/index.html
- boindex.html
- sw.js
