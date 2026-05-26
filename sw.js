const CACHE_NAME="family-clock-v40-view-board-label";
const AUDIO_CACHE_NAME="family-clock-drive-audio-runtime-v3";

const CORE_FILES=[
  "./",
  "./index.html",
  "./patient.html",
  "./boindex.html",
  "./manifest.json",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./assets/calm-background.svg",
  "./favicon.ico"
];

self.addEventListener("install",event=>{
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache=>Promise.all(CORE_FILES.map(file=>cache.add(file).catch(err=>console.warn("cache skip",file,err)))))
      .then(()=>self.skipWaiting())
  );
});

self.addEventListener("activate",event=>{
  event.waitUntil(
    caches.keys()
      .then(keys=>Promise.all(keys.filter(k=>![CACHE_NAME,AUDIO_CACHE_NAME].includes(k)).map(k=>caches.delete(k))))
      .then(()=>self.clients.claim())
  );
});

function isDriveAudioDownload(url){
  return url.hostname==="drive.google.com" && url.pathname.includes("/uc") && url.search.includes("export=download");
}
function isLiveApiOrEmbeddedMedia(url){
  return (
    url.hostname.includes("script.google") ||
    url.hostname.includes("script.googleusercontent") ||
    url.hostname.includes("googleusercontent") ||
    url.hostname.includes("open-meteo") ||
    url.hostname.includes("googleapis") ||
    url.hostname.includes("youtube") ||
    url.hostname.includes("youtu.be") ||
    url.hostname.includes("doubleclick")
  );
}
function coreKeyFor(url){
  const path=url.pathname.split("/").pop()||"";
  if(path==="patient.html")return "./patient.html";
  if(path==="boindex.html")return "./boindex.html";
  if(path==="index.html"||path==="")return "./index.html";
  if(path==="manifest.json")return "./manifest.json";
  if(path==="favicon.ico")return "./favicon.ico";
  if(url.pathname.endsWith("/"))return "./index.html";
  return "";
}
async function cacheFirstWithUpdate(req){
  const url=new URL(req.url);
  const cache=await caches.open(CACHE_NAME);
  const core=coreKeyFor(url);
  const cached=core ? await cache.match(core) : await cache.match(req,{ignoreSearch:true});
  const network=fetch(req).then(res=>{
    if(res && res.ok){
      const putKey=core||req;
      cache.put(putKey,res.clone()).catch(()=>{});
    }
    return res;
  }).catch(()=>cached);
  return cached || network || Response.error();
}

self.addEventListener("fetch",event=>{
  const req=event.request;
  if(req.method!=="GET")return;
  const url=new URL(req.url);

  if(isDriveAudioDownload(url)){
    event.respondWith(
      caches.open(AUDIO_CACHE_NAME).then(cache=>
        cache.match(req).then(cached=>{
          const network=fetch(req).then(res=>{
            if(res&&res.ok)cache.put(req,res.clone()).catch(()=>{});
            return res;
          }).catch(()=>cached);
          return cached || network || Response.error();
        })
      )
    );
    return;
  }

  if(isLiveApiOrEmbeddedMedia(url))return;

  event.respondWith(cacheFirstWithUpdate(req));
});

/* FINAL_CLEAN_V31_SW */

/* FORMOM_FINAL_CLEAN_V32_SW */

/* FORMOM_FINAL_CLEAN_V33_SW */

/* FORMOM_FINAL_CLEAN_V34_SW */

/* FORMOM_FINAL_CLEAN_V35_SW */

/* FORMOM_FINAL_CLEAN_V36_SW */

/* FORMOM_FINAL_CLEAN_V37_SW */

/* FORMOM_FINAL_CLEAN_V38_SW */

/* FORMOM_FINAL_CLEAN_V39_SW */

/* FORMOM_FINAL_CLEAN_V40_SW */

/* V40_PATCH_NO_YOUTUBE_PATIENT_AUDIO_SW */

/* V40_PATCH_VIEW_BOARD_LABEL_SW */
