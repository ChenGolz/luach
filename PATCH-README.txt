Patch ל-V40 — ללא YouTube במסך המטופל

להחליף ב-GitHub רק:
patient.html
boindex.html
sw.js

מה השתנה:
- YouTube לא מוצג יותר במסך המטופל/ת.
- כפתור מוזיקה במסך המטופל מופיע רק אם הוגדר קובץ שמע בטוח:
  הגדרות → מוזיקה רגועה ללא פרסומות → קישור קובץ שמע בטוח למסך המטופל/ת.
- אפשר להדביק קישור Google Drive לקובץ MP3/שמע או קישור MP3 ישיר.
- קישור YouTube נשאר בניהול בלבד ולא מוצג למטופל/ת.
- במסך המטופל נפתח נגן audio רגיל, בלי iframe, בלי YouTube ובלי פרסומות.
- sw.js קיבל CACHE_NAME חדש כדי לשבור cache ישן.

איך להשתמש:
1. העלו MP3/קובץ שמע רגוע ל-Google Drive.
2. שתפו אותו כצפייה לכל מי שיש לו קישור.
3. הדביקו את קישור הקובץ בשדה:
   קישור קובץ שמע בטוח למסך המטופל/ת - Drive או MP3
4. שמרו.
5. במסך המטופל יופיע כפתור מוזיקה רגועה.

בדיקה:
Ctrl+U ולחפש:
V40_PATCH_NO_YOUTUBE_PATIENT_AUDIO_PATIENT
V40_PATCH_NO_YOUTUBE_PATIENT_AUDIO_BOINDEX

וב-sw.js:
V40_PATCH_NO_YOUTUBE_PATIENT_AUDIO_SW
