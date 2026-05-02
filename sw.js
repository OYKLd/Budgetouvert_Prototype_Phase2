self.addEventListener("fetch", (event) => {
  // Pour l'instant, on laisse passer toutes les requêtes
  // Vous pouvez ajouter ici une logique de cache plus tard
  event.respondWith(fetch(event.request));
});
