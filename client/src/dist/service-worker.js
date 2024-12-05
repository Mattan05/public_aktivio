let static_assets = "static_v1";
let dynamic_assets = "dynamic-v1";

//Kan istället skapa fil med koden för htmx och till exempel google fonts osv
let assets=[
    "/",
    "index.html",
    "header.html",
    "style.css",
    "main.js",
    "assets/image.jpg"
]
//
self.addEventListener("install", install);
self.addEventListener("activate", activate);
self.addEventListener("fetch", handleFetch);

function install(ev){
    console.log(ev);

    ev.waitUntil( //Gör att man inte kan använda async await, krockar

// Öppnar cache och skapar en cache för static_assets. Sen får programmet tag på cache, 
// och då läggs alla viktiga resurser (assets) till i cachen med cache.addAll(). 
// Efter det kallar vi self.skipWaiting() för att direkt aktivera den nya service workern 
// utan att vänta på att den gamla service workern ska sluta användas (t.ex. när användaren stänger alla flikar).
    caches.open(static_assets).then(cache=>{
        cache.addAll(assets).then(()=>{
            console.log("static assets added")
        });
    })
    .then(()=>{
        self.skipWaiting(); 
    })
    .catch(error=>{
        console.log("error:" + error);
    })
);
}

function activate(ev){
    caches.keys().then(keys=>{
        keys.forEach(cache=>{
            if(cache != static_assets && cache != dynamic_assets){
                caches.delete(cache).then(()=>{
                    console.log(cache, " deleted");
                })
                .catch(()=>{
                    console.log("Nothing deleted");
                });
            }
        });
    })
}

function handleFetch(ev){
    ev.respondWith(
        fetch(ev.request)
        .then(response=>{

            return caches.open(dynamic_assets).then(cache=>{
                cache.put(ev.request.url, response.clone())
                return response;
            })
        })
            .catch(error=>{
                return caches.match(ev.request);
            })
     
    )
}