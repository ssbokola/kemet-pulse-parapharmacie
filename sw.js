/* Service worker de Kemet Pulse — Parapharmacie -- PRODUIT PAR construire-pwa.py, ne pas editer a la main.
   Version applicative : 1.4.1 (2026-09-16)

   RAISON D'ETRE : sans service worker + manifeste, Chrome refuse navigator.storage.persist(),
   et le stockage local reste eligible a l'eviction. C'est exactement ce qui a fait disparaitre
   l'officine reelle du DG le 15/09/2026, sur les trois origines a la fois.

   REGLE ABSOLUE : ne JAMAIS servir une version perimee de l'application. Meme origine = reseau
   d'abord, cache uniquement quand le reseau est injoignable. Une application figee sur une
   vieille version serait pire que le defaut qu'on corrige. */
const VERSION = "1.4.1";
const CACHE = "kemet-pulse-parapharmacie-" + VERSION;

// URL epinglees et versionnees : leur contenu ne change jamais, le cache peut donc primer.
// C'est ce qui rend l'application reellement utilisable hors ligne.
const CDN_EPINGLE = /^https:\/\/cdnjs\.cloudflare\.com\//;

self.addEventListener("install", (e) => {
  // Pas de pre-chargement : l'application est un fichier unique de plusieurs megaoctets, le
  // telecharger une seconde fois a l'installation doublerait la facture du client pour rien.
  // Il entre dans le cache a la premiere visite, qui vient de toute facon d'avoir lieu.
  self.skipWaiting();
});

self.addEventListener("activate", (e) => {
  e.waitUntil((async () => {
    const noms = await caches.keys();
    await Promise.all(noms
      .filter((n) => n.startsWith("kemet-pulse-parapharmacie-") && n !== CACHE)
      .map((n) => caches.delete(n)));
    await self.clients.claim();
  })());
});

self.addEventListener("fetch", (e) => {
  const req = e.request;
  if (req.method !== "GET") return;

  const url = new URL(req.url);

  if (CDN_EPINGLE.test(req.url)) {
    // CACHE D'ABORD : URL immuable, donc aucun risque de servir du perime.
    e.respondWith((async () => {
      const connu = await caches.match(req);
      if (connu) return connu;
      const reponse = await fetch(req);
      // Une reponse opaque (mode no-cors) a un statut 0 : on l'accepte, c'est la seule forme
      // disponible pour un script tiers, et c'est elle qui permet le hors-ligne.
      if (reponse && (reponse.ok || reponse.type === "opaque")) {
        const c = await caches.open(CACHE);
        c.put(req, reponse.clone());
      }
      return reponse;
    })());
    return;
  }

  if (url.origin !== self.location.origin) return;   // tout autre tiers : jamais intercepte

  // RESEAU D'ABORD. L'en-tete Cache-Control du site est deja "no-cache, must-revalidate" :
  // quand la version n'a pas bouge, le serveur repond 304 et rien n'est retelecharge.
  e.respondWith((async () => {
    try {
      const reponse = await fetch(req);
      if (reponse && reponse.ok) {
        const c = await caches.open(CACHE);
        c.put(req, reponse.clone());
      }
      return reponse;
    } catch (err) {
      const connu = await caches.match(req);
      if (connu) return connu;
      // Navigation hors ligne sans rien en cache : on rend la page d'accueil si on l'a.
      if (req.mode === "navigate") {
        const accueil = await caches.match("./");
        if (accueil) return accueil;
      }
      throw err;
    }
  })());
});
