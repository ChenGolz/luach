const CACHE_NAME="family-clock-v56-audio-music-proxy-contrast";
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
    url.hostname==="drive.google.com" ||
    url.hostname.includes("open-meteo") ||
    url.hostname.includes("googleapis") ||
    url.hostname.includes("youtube") ||
    url.hostname.includes("youtu.be") ||
    url.hostname.includes("doubleclick")
  );
}
function coreKeyFor(url){
  const fixed=fixedNestedLocalUrl(url);
  if(fixed)return coreKeyFor(new URL(fixed));
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
  if(url.protocol!=="http:"&&url.protocol!=="https:")return new Response("",{status:204});
  /* V49_SW_CACHEFIRST_HTTP_ONLY */
  /* V51_SW_NON_HTTP_SAFE_204 */
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


function fixedNestedLocalUrl(url){
  if(url.origin!==self.location.origin)return "";
  const u=new URL(url.href);
  let p=u.pathname;

  // Repair old/broken links such as:
  // /luach/boindex/patient.html -> /luach/patient.html
  // /luach/boindex/manifest.json -> /luach/manifest.json
  // /luach/boindex/icons/icon-192.png -> /luach/icons/icon-192.png
  p=p.replace(/\/(?:boindex|backoffice)\/(patient\.html|boindex\.html|index\.html|manifest\.json|favicon\.ico)$/,"/$1");
  p=p.replace(/\/(?:boindex|backoffice)\/(icons\/[^?#]+)$/,"/$1");
  p=p.replace(/\/(?:boindex|backoffice)\/(assets\/[^?#]+)$/,"/$1");
  p=p.replace(/\/(?:boindex|backoffice)\/?$/,"/boindex.html");

  if(p!==u.pathname){
    u.pathname=p;
    return u.toString();
  }
  return "";
}
/* V42_SW_NESTED_PATH_REDIRECT */

self.addEventListener("fetch",event=>{
  const req=event.request;
  if(req.method!=="GET")return;
  let url;
  try{url=new URL(req.url)}catch{return}
  if(url.protocol!=="http:"&&url.protocol!=="https:")return;
  /* V49_SW_FETCH_HTTP_ONLY_GUARD */
  const fixedNestedUrl=fixedNestedLocalUrl(url);
  if(fixedNestedUrl){
    event.respondWith(Response.redirect(fixedNestedUrl,302));
    return;
  }
  /* V42_SW_REDIRECT_APPLIED */

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

/* V40_PATCH_VIEW_BOARD_LINK_FIX_SW */

/* V40_PATCH_JSONP_LOADING_FAILOVER_SW */

/* V40_PATCH_UX_OFFLINE_COPY_SW */

/* V40_LOCKSERVICE_PWA_PATCH_SW */

/* V41_FINAL_QA_SW */

/* V42_PATHFIX_SW */

/* V43_FINAL_QA_SW */

/* V44_FAMILY_BOOK_VOICE_FIX_SW */

/* V45_VOICE_RECORDING_FIX_SW */

/* V47_PATIENT_FULLSCREEN_FIX_SW */

/* V48_PATIENT_VOICE_END_TO_END_SW */

/* V49_MUSIC_SW_FULLSCREEN_FIX_SW */

/* V50_PATIENT_FAMILY_VOICE_PRIORITY_SW */

/* V51_MUSIC_FOLDER_FULLSCREEN_SW */

/* V52_SECURITY_QA_FIXES_SW */

/* V53_MUSIC_FOLDER_DETECT_SW */

/* V54_NIGHT_DAY_FULLSCREEN_FIX_SW */

/* V55_RENDER_SAFE_FIX_SW */

/* V56_AUDIO_MUSIC_PROXY_CONTRAST_SW */
