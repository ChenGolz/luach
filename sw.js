const CACHE_NAME="family-clock-final-v25-clean-fixes";
const AUDIO_CACHE_NAME="family-clock-drive-audio-runtime-v2";

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
    url.hostname.includes("open-meteo") ||
    url.hostname.includes("googleapis") ||
    url.hostname.includes("youtube") ||
    url.hostname.includes("youtu.be") ||
    url.hostname.includes("doubleclick")
  );
}

self.addEventListener("fetch",event=>{
  const req=event.request;
  if(req.method!=="GET")return;
  const url=new URL(req.url);

  // Runtime cache for family voice files. If a recording played once online,
  // it has a better chance of working during a temporary Wi-Fi drop.
  if(isDriveAudioDownload(url)){
    event.respondWith(
      caches.open(AUDIO_CACHE_NAME).then(cache=>
        cache.match(req).then(cached=>{
          const network=fetch(req).then(res=>{
            cache.put(req,res.clone()).catch(()=>{});
            return res;
          }).catch(()=>cached);
          return cached || network || Response.error();
        })
      )
    );
    return;
  }

  // Do not cache live data APIs or embedded media.
  if(isLiveApiOrEmbeddedMedia(url))return;

  // Cache first, network update: instant load from device, quiet refresh for next time.
  event.respondWith(
    caches.open(CACHE_NAME).then(cache=>
      cache.match(req).then(cached=>{
        const network=fetch(req).then(res=>{
          cache.put(req,res.clone()).catch(()=>{});
          return res;
        }).catch(async()=>{
          if(cached)return cached;
          if(req.mode==="navigate")return (await cache.match("./index.html")) || Response.error();
          return Response.error();
        });
        return cached || network;
      })
    )
  );
});

/* V24_BEST_POSSIBLE_PATCH_SW */

/* V24_QUALITY_FIXES_PATCH_SW */

/* V24_HOTFIX_MISSING_FUNCTIONS_SW */

/* V24_REPO_AUDIT_HOTFIX_SW */

/* FINAL_CLEAN_V24_SW */

/* FINAL_V25_CLEAN_FIXES_SW */
