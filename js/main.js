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
      var sel = document.querySelector('#request-form select[name="service"]');
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

  /* ---------- Request form (FormSubmit) + tracking ---------- */
  // The form posts straight to FormSubmit, which shows its "I'm not a robot"
  // check, emails the request (cc + auto-reply copy to the customer) and then
  // sends the visitor back here with ?sent=request.
  var SITE_URL = location.protocol === "https:" || location.protocol === "http:"
    ? location.origin + location.pathname
    : "https://dmg159.github.io/Hailey_dog_walking/";
  var PAGE_OPENED = Date.now();

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
    var buttonText = button.textContent;
    var started = false;

    function setStatus(msg, kind) {
      status.textContent = msg;
      status.className = "form-status" + (kind ? " " + kind : "");
    }
    function setField(field, value) {
      var el = form.elements[field];
      if (!el) return;
      if (value) el.value = value;
      else el.parentNode.removeChild(el); // FormSubmit ignores missing options
    }

    if (cfg.FORM_EMAIL) {
      form.action = "https://formsubmit.co/" + encodeURIComponent(cfg.FORM_EMAIL);
      form.method = "POST";
      var cc = (cfg.FORM_CC || "").split(",").map(function (s) { return s.trim(); })
        .filter(function (s) { return s && s.toLowerCase() !== cfg.FORM_EMAIL.toLowerCase(); }).join(",");
      setField("_cc", cc);
      setField("_autoresponse", cfg.AUTORESPONSE || "");
      setField("_blacklist", (cfg.BLOCKED_WORDS || []).join(", "));
      setField("_next", SITE_URL + "?sent=" + name + "#book");
    }

    form.addEventListener("input", function () {
      if (!started) { started = true; track("form_start", name); }
    });

    // Plain-language label for a field, e.g. "Phone number"
    function labelFor(f) {
      var label = f.closest("label");
      if (!label) return f.name;
      var copy = label.cloneNode(true);
      copy.querySelectorAll("input, select, textarea, .field-error, .opt").forEach(function (n) { n.remove(); });
      return copy.textContent.replace(/\s+/g, " ").trim();
    }
    function errorText(f) {
      if (f.validity.valueMissing) return f.tagName === "SELECT" ? "Please choose one." : "Please fill this in.";
      if (f.validity.typeMismatch && f.type === "email") return "Please enter a full email address, like name@example.com.";
      if (f.validity.rangeUnderflow && f.type === "date") return "Please pick today or a later date.";
      return f.validationMessage || "Please check this.";
    }
    function showFieldError(f, msg) {
      var label = f.closest("label") || f.parentNode;
      var el = label.querySelector(".field-error");
      if (!msg) { if (el) el.remove(); f.removeAttribute("aria-describedby"); return; }
      if (!el) {
        el = document.createElement("span");
        el.className = "field-error";
        el.id = "err-" + f.name;
        label.appendChild(el);
      }
      el.textContent = msg;
      f.setAttribute("aria-describedby", el.id);
    }

    form.addEventListener("submit", function (e) {
      // Validation: mark every problem field and say which ones
      var bad = [];
      form.querySelectorAll("input, select, textarea").forEach(function (f) {
        if (f.type === "hidden" || f.classList.contains("hp")) return;
        var ok = f.checkValidity();
        f.setAttribute("aria-invalid", ok ? "false" : "true");
        showFieldError(f, ok ? "" : errorText(f));
        if (!ok) bad.push(f);
      });
      if (bad.length) {
        e.preventDefault();
        var details = bad[0].closest("details");
        if (details) details.open = true;
        setStatus("Almost there! Please fix: " + bad.map(labelFor).join(", ") + ".", "err");
        bad[0].scrollIntoView({ block: "center", behavior: "smooth" });
        bad[0].focus({ preventScroll: true });
        track("form_error", name + "-validation");
        return;
      }
      if (!cfg.FORM_EMAIL) {
        e.preventDefault();
        setStatus(fallbackMessage(), "err");
        track("form_error", name + "-not-configured");
        return;
      }
      // (A filled-in _honey field is discarded by FormSubmit itself, so no
      // silent block here: phone autofill can fill it by mistake.)
      if (Date.now() - PAGE_OPENED < 3000) {
        e.preventDefault(); // too fast for a person: likely a bot
        setStatus("Please take a moment, then send again.", "err");
        return;
      }
      var who = form.elements["name"] ? form.elements["name"].value.trim() : "";
      var what = form.elements["service"] ? form.elements["service"].value : "";
      form.elements["_subject"].value = "New request" + (what ? ": " + what : "") + (who ? " from " + who : "");
      button.disabled = true;
      button.textContent = "Sending…";
      setStatus("Sending… next you'll see a quick \u201cI'm not a robot\u201d check, then you'll come right back here.", "");
      // The browser now posts to FormSubmit and comes back with ?sent=...
    });

    // The back button can restore the page with the button still disabled
    window.addEventListener("pageshow", function () {
      button.disabled = false;
      button.textContent = buttonText;
    });

    // Clear a field's error as soon as it's fixed
    function recheck(e) {
      var f = e.target;
      if (f.getAttribute("aria-invalid") === "true" && f.checkValidity()) {
        f.setAttribute("aria-invalid", "false");
        showFieldError(f, "");
        if (!form.querySelector('[aria-invalid="true"]')) setStatus("", "");
      }
    }
    form.addEventListener("input", recheck);
    form.addEventListener("change", recheck);
  });

  // Back from FormSubmit: thank the visitor, count the lead, tidy the address bar
  var sentForm = new URLSearchParams(location.search).get("sent");
  if (sentForm) {
    var f = document.querySelector('form[data-form-name="' + sentForm + '"]');
    if (f) {
      var st = f.querySelector(".form-status");
      st.textContent = "Thanks! Your request is on its way, and a copy is in your inbox. Hailey will get back to you soon.";
      st.className = "form-status ok";
    }
    track("generate_lead", sentForm);
    if (history.replaceState) history.replaceState(null, "", location.pathname + location.hash);
  }

  /* ---------- Gallery carousel ---------- */
  var gallery = document.getElementById("gallery-track");
  if (gallery) {
    var slides = Array.prototype.slice.call(gallery.children);
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
      return slides.length > 1 ? slides[1].offsetLeft - slides[0].offsetLeft : gallery.clientWidth;
    }
    function goTo(i) {
      i = Math.max(0, Math.min(slides.length - 1, i));
      gallery.scrollTo({ left: slides[i].offsetLeft - slides[0].offsetLeft, behavior: "smooth" });
    }
    function perView() { return Math.max(1, Math.round(gallery.clientWidth / step())); }
    function update() {
      var max = gallery.scrollWidth - gallery.clientWidth - 2;
      var idx = gallery.scrollLeft >= max ? slides.length - 1 : Math.round(gallery.scrollLeft / step());
      prevBtn.disabled = gallery.scrollLeft <= 2;
      nextBtn.disabled = gallery.scrollLeft >= max;
      dots.forEach(function (d, i) { d.setAttribute("aria-current", i === idx ? "true" : "false"); });
    }
    prevBtn.addEventListener("click", function () { goTo(Math.round(gallery.scrollLeft / step()) - perView()); });
    nextBtn.addEventListener("click", function () { goTo(Math.round(gallery.scrollLeft / step()) + perView()); });
    var ticking = false;
    gallery.addEventListener("scroll", function () {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(function () { ticking = false; update(); });
    }, { passive: true });
    gallery.addEventListener("scrollend", update);
    window.addEventListener("resize", update);
    update();
  }
})();
