/* San Diego, Calling — interactions */
(function () {
  "use strict";

  var prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  /* ---------- Scroll reveal ---------- */
  var revealables = document.querySelectorAll(".reveal, .day");

  if ("IntersectionObserver" in window && !prefersReduced) {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -8% 0px" }
    );
    revealables.forEach(function (el) { revealObserver.observe(el); });
  } else {
    revealables.forEach(function (el) { el.classList.add("is-visible"); });
  }

  /* ---------- Active day in sticky nav ---------- */
  var links = Array.prototype.slice.call(document.querySelectorAll(".daynav__link"));
  var days = links
    .map(function (link) { return document.querySelector(link.getAttribute("href")); })
    .filter(Boolean);

  function setActive(id) {
    links.forEach(function (link) {
      link.classList.toggle("is-active", link.getAttribute("href") === "#" + id);
    });
  }

  if ("IntersectionObserver" in window && days.length) {
    var navObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      { rootMargin: "-45% 0px -50% 0px", threshold: 0 }
    );
    days.forEach(function (day) { navObserver.observe(day); });
  }

  /* ---------- Real photos: explicit slot → file mapping ---------- */
  /* Slot ids live in index.html (data-photo); files live in img/. */
  var photoMap = {
    "thu-beach": "tourmo.jpg",
    "fri-tram": "Tramcar-Exterior.jpg",
    "fri-joshua": "joshua-tree.jpg",
    "fri-tinypony": "tiny-pony.jpg",
    "sat-calumet": "calumet.jpg",
    "sat-pizza": "pizza-cassette.jpeg",
    "sat-flamingo": "flamingo.jpg",
    "sun-football": "scott.jpeg",
    "sun-wayfarer": "wayfarer.jpeg",
    "sun-brcr": "brcr.jpeg"
  };

  var photoSlots = document.querySelectorAll(".ph[data-photo], .feature[data-photo]");

  function tryPhoto(name) {
    return new Promise(function (resolve) {
      var probe = new Image();
      probe.onload = function () { resolve(true); };
      probe.onerror = function () { resolve(false); };
      probe.src = "img/" + name;
    });
  }

  photoSlots.forEach(function (slot) {
    var key = slot.getAttribute("data-photo");
    var file = photoMap[key];
    if (!file) return;
    tryPhoto(file).then(function (ok) {
      if (!ok) return;
      var img = new Image();
      img.alt = (slot.querySelector(".ph__tag") || {}).textContent || key;
      img.loading = "lazy";
      img.src = "img/" + file;
      if (img.complete && img.naturalWidth) { img.classList.add("loaded"); }
      else { img.onload = function () { img.classList.add("loaded"); }; }
      slot.insertBefore(img, slot.firstChild);
      slot.classList.add("has-photo");
    });
  });

  /* ---------- Countdown to landing ---------- */
  var arrival = new Date("2026-10-28T15:00:00-07:00"); // wheels down, San Diego (PDT)
  var hero = document.querySelector(".hero__meta");

  function renderCountdown() {
    if (!hero) return;
    var diff = arrival.getTime() - Date.now();
    if (diff <= 0) {
      var landed = document.createElement("span");
      landed.innerHTML = "<strong>They're</strong> here";
      hero.appendChild(landed);
      return;
    }
    var daysLeft = Math.ceil(diff / 86400000);
    var span = document.createElement("span");
    span.innerHTML = "<strong>" + daysLeft + "</strong> days to go";
    var dot = document.createElement("span");
    dot.className = "dot";
    hero.insertBefore(dot, hero.firstChild);
    hero.insertBefore(span, dot);
  }

  renderCountdown();

  /* ---------- Sunset times: keep the DOM and data in sync ---------- */
  document.querySelectorAll(".sunset[data-sunset]").forEach(function (el) {
    var parts = el.getAttribute("data-sunset").split(":");
    var hours = parseInt(parts[0], 10);
    var minutes = parts[1];
    var display = el.querySelector(".sunset__time");
    if (!display) return;
    var suffix = hours >= 12 ? "PM" : "AM";
    var h12 = hours % 12 || 12;
    display.innerHTML = h12 + ":" + minutes + "<span>" + suffix + "</span>";
  });
})();
