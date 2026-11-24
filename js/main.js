(function () {
  "use strict";
  var cfg = window.SITE_CONFIG || {};

  /* ---------- Analytics (GoatCounter, cookieless) ---------- */
  // Nothing loads until GOATCOUNTER_CODE is filled in (js/config.js).
  if (cfg.GOATCOUNTER_CODE) {
    var gc = document.createElement("script");
    gc.async = true;
    gc.src = "https://gc.zgo.at/count.js";
    gc.setAttribute("data-goatcounter", "https://" + cfg.GOATCOUNTER_CODE + ".goatcounter.com/count");
    document.head.appendChild(gc);
  }

  // Sends a GoatCounter event; queues it if the script hasn't loaded yet.
  var queue = [];
  function track(name, label) {
    if (!cfg.GOATCOUNTER_CODE) return;
    var ev = { path: name + (label ? "/" + label : ""), title: name, event: true };
    if (window.goatcounter && window.goatcounter.count) window.goatcounter.count(ev);
    else queue.push(ev);
  }
  window.addEventListener("load", function () {
    var tries = 0;
    (function flush() {
      if (window.goatcounter && window.goatcounter.count) {
        while (queue.length) window.goatcounter.count(queue.shift());
      } else if (queue.length && tries++ < 20) setTimeout(flush, 500);
    })();
  });

  /* ---------- Mobile nav ---------- */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("site-nav");
  toggle.addEventListener("click", function () {
    var open = nav.classList.toggle("open");
    toggle.setAttribute("aria-expanded", open ? "true" : "false");
  });
  nav.addEventListener("click", function (e) {
    if (e.target.tagName === "A") {
      nav.classList.remove("open");
      toggle.setAttribute("aria-expanded", "false");
    }
  });

  /* ---------- Config-driven contact details ---------- */
  function showContact(kind, text, href) {
    var li = document.querySelector('[data-contact="' + kind + '"]');
    if (!li || !text) return;
    var a = li.querySelector("a");
    a.textContent = text;
    a.href = href;
    li.hidden = false;
  }
  if (cfg.PHONE) showContact("phone", cfg.PHONE, "tel:" + cfg.PHONE.replace(/[^\d+]/g, ""));
  if (cfg.EMAIL) showContact("email", cfg.EMAIL, "mailto:" + cfg.EMAIL);
  if (cfg.GOOGLE_REVIEW_URL) {
    var rb = document.getElementById("review-btn");
    rb.href = cfg.GOOGLE_REVIEW_URL;
    rb.hidden = false;
  }

  // "Free meet-and-greet" buttons preselect that service in the booking form.
  document.querySelectorAll("[data-meet]").forEach(function (el) {
    el.addEventListener("click", function () {
      var sel = document.querySelector('#booking-form select[name="service"]');
      if (sel) sel.value = "Free meet-and-greet";
    });
  });

  // No booking dates in the past.
  var today = new Date();
  today.setMinutes(today.getMinutes() - today.getTimezoneOffset());
  document.querySelectorAll('input[type="date"]').forEach(function (d) {
    d.min = today.toISOString().slice(0, 10);
  });

  document.getElementById("year").textContent = new Date().getFullYear();

  /* ---------- Forms (Formspree) + tracking ---------- */
  function fallbackMessage() {
    var ways = [];
    if (cfg.PHONE) ways.push("call or text " + cfg.PHONE);
    if (cfg.EMAIL) ways.push("email " + cfg.EMAIL);
    ways.push("message @" + (cfg.INSTAGRAM || "hailey.nardone") + " on Instagram");
    return "Online requests aren't switched on yet. Please " + ways.join(", or ") + ".";
  }

  document.querySelectorAll("form[data-form-name]").forEach(function (form) {
    var name = form.getAttribute("data-form-name");
    var status = form.querySelector(".form-status");
    var button = form.querySelector('button[type="submit"]');
    var started = false;

    function setStatus(msg, kind) {
      status.textContent = msg;
      status.className = "form-status" + (kind ? " " + kind : "");
    }

    form.addEventListener("input", function () {
      if (!started) { started = true; track("form_start", name); }
    });

    form.addEventListener("submit", function (e) {
      e.preventDefault();

      // Validation
      var firstBad = null;
      form.querySelectorAll("input, select, textarea").forEach(function (f) {
        if (f.classList.contains("hp")) return;
        var bad = !f.checkValidity();
        f.setAttribute("aria-invalid", bad ? "true" : "false");
        if (bad && !firstBad) firstBad = f;
      });
      if (firstBad) {
        var details = firstBad.closest("details");
        if (details) details.open = true;
        firstBad.focus();
        setStatus("Please fill in the highlighted fields.", "err");
        track("form_error", name + "-validation");
        return;
      }

      if (!cfg.FORMSPREE_ID) {
        setStatus(fallbackMessage(), "err");
        track("form_error", name + "-not-configured");
        return;
      }

      button.disabled = true;
      setStatus("Sending…");
      fetch("https://formspree.io/f/" + encodeURIComponent(cfg.FORMSPREE_ID), {
        method: "POST",
        body: new FormData(form),
        headers: { Accept: "application/json" }
      }).then(function (res) {
        if (!res.ok) throw new Error("HTTP " + res.status);
        form.reset();
        started = false;
        setStatus(name === "booking"
          ? "Thanks! Your request is on its way. Hailey will reply to confirm availability."
          : "Thanks! Your message is on its way. Hailey will be in touch soon.", "ok");
        track("generate_lead", name);
      }).catch(function () {
        setStatus("Sorry, something went wrong sending that. " + fallbackMessage().replace("Online requests aren't switched on yet. ", ""), "err");
        track("form_error", name + "-send-failed");
      }).finally(function () {
        button.disabled = false;
      });
    });

    form.addEventListener("change", function (e) {
      if (e.target.getAttribute("aria-invalid") === "true" && e.target.checkValidity()) {
        e.target.setAttribute("aria-invalid", "false");
      }
    });
  });

  /* ---------- Gallery carousel ---------- */
  var track = document.getElementById("gallery-track");
  if (track) {
    var slides = Array.prototype.slice.call(track.children);
    var prevBtn = document.querySelector(".car-prev");
    var nextBtn = document.querySelector(".car-next");
    var dotsWrap = document.querySelector(".car-dots");
    var dots = slides.map(function (slide, i) {
      slide.setAttribute("role", "group");
      slide.setAttribute("aria-roledescription", "slide");
      slide.setAttribute("aria-label", (i + 1) + " of " + slides.length);
      var b = document.createElement("button");
      b.type = "button";
      b.setAttribute("aria-label", "Show photo " + (i + 1));
      b.addEventListener("click", function () { goTo(i); });
      dotsWrap.appendChild(b);
      return b;
    });
    function step() {
      return slides.length > 1 ? slides[1].offsetLeft - slides[0].offsetLeft : track.clientWidth;
    }
    function goTo(i) {
      i = Math.max(0, Math.min(slides.length - 1, i));
      track.scrollTo({ left: slides[i].offsetLeft - slides[0].offsetLeft, behavior: "smooth" });
    }
    function perView() { return Math.max(1, Math.round(track.clientWidth / step())); }
    function update() {
      var max = track.scrollWidth - track.clientWidth - 2;
      var idx = track.scrollLeft >= max ? slides.length - 1 : Math.round(track.scrollLeft / step());
      prevBtn.disabled = track.scrollLeft <= 2;
      nextBtn.disabled = track.scrollLeft >= max;
      dots.forEach(function (d, i) { d.setAttribute("aria-current", i === idx ? "true" : "false"); });
    }
    prevBtn.addEventListener("click", function () { goTo(Math.round(track.scrollLeft / step()) - perView()); });
    nextBtn.addEventListener("click", function () { goTo(Math.round(track.scrollLeft / step()) + perView()); });
    var ticking = false;
    track.addEventListener("scroll", function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () { ticking = false; update(); });
    }, { passive: true });
    track.addEventListener("scrollend", update);
    window.addEventListener("resize", update);
    update();
  }
})();
