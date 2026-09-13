(function () {
  "use strict";

  var CONFIG = window.PLAY_TALK_CONFIG || {};
  var UTM_KEYS = [
    "utm_source",
    "utm_medium",
    "utm_campaign",
    "utm_content",
    "utm_term"
  ];
  var STORAGE_KEY = "playtalk_attribution_v1";
  var VARIANT_KEY = "playtalk_variant_v1";

  function getBackend() {
    if (CONFIG.formBackend) return CONFIG.formBackend;
    return CONFIG.formEndpoint ? "custom" : "local";
  }

  function readParams() {
    var params = new URLSearchParams(window.location.search);
    var data = {};

    UTM_KEYS.forEach(function (key) {
      data[key] = params.get(key) || "";
    });

    data.page_path = window.location.pathname;
    data.page_url = window.location.href;
    data.referrer = document.referrer || "";
    data.landed_at = new Date().toISOString();

    return data;
  }

  function getAttribution() {
    var current = readParams();
    var hasCampaign = UTM_KEYS.some(function (key) {
      return current[key];
    });

    try {
      if (hasCampaign) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(current));
        return current;
      }

      var stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        return Object.assign({}, JSON.parse(stored), {
          page_path: current.page_path,
          page_url: current.page_url,
          referrer: current.referrer
        });
      }
    } catch (error) {
      console.warn("Attribution storage unavailable:", error);
    }

    return current;
  }

  function applyAttribution(form) {
    var attribution = getAttribution();

    Object.keys(attribution).forEach(function (key) {
      var input = form.querySelector('input[name="' + key + '"]');
      if (input) input.value = attribution[key] || "";
    });
  }

  function getVariant() {
    var params = new URLSearchParams(window.location.search);
    var queryVariant = params.get("v");
    var variant = queryVariant === "b" ? "b" : "a";

    try {
      if (queryVariant) {
        sessionStorage.setItem(VARIANT_KEY, variant);
      } else {
        variant = sessionStorage.getItem(VARIANT_KEY) || "a";
      }
    } catch (error) {
      console.warn("Variant storage unavailable:", error);
    }

    document.documentElement.setAttribute("data-variant", variant);
    return variant;
  }

  function applyHeadlineVariant(variant) {
    document.querySelectorAll("[data-headline-a]").forEach(function (element) {
      var text = element.getAttribute(
        variant === "b" ? "data-headline-b" : "data-headline-a"
      );
      if (text) element.textContent = text;
    });

    document.querySelectorAll('input[name="page_variant"]').forEach(function (input) {
      input.value = variant;
    });
  }

  function loadPostHog() {
    if (!CONFIG.posthogKey) return;

    var script = document.createElement("script");
    script.async = true;
    script.src = CONFIG.posthogHost + "/static/array.js";
    script.onload = function () {
      if (!window.posthog) return;
      window.posthog.init(CONFIG.posthogKey, {
        api_host: CONFIG.posthogHost,
        person_profiles: "identified_only",
        capture_pageview: true
      });
    };
    document.head.appendChild(script);
  }

  function track(eventName, properties) {
    var payload = Object.assign({}, properties || {});

    if (Array.isArray(window.dataLayer)) {
      window.dataLayer.push(Object.assign({ event: eventName }, payload));
    }

    if (window.posthog && typeof window.posthog.capture === "function") {
      window.posthog.capture(eventName, payload);
    }

    document.dispatchEvent(
      new CustomEvent("playtalk:track", {
        detail: { event: eventName, properties: payload }
      })
    );
  }

  function scrollToWaitlist() {
    var target = document.getElementById("waitlist");
    if (target) {
      target.scrollIntoView({ behavior: "smooth", block: "start" });
      var firstInput = target.querySelector("input:not([type=hidden])");
      if (firstInput) {
        window.setTimeout(function () {
          firstInput.focus({ preventScroll: true });
        }, 600);
      }
    }
  }

  function bindCtas() {
    document.querySelectorAll("[data-cta]").forEach(function (element) {
      element.addEventListener("click", function (event) {
        var label = element.getAttribute("data-cta") || "cta";
        track("cta_click", { cta: label });
        if (element.getAttribute("href") === "#waitlist") {
          event.preventDefault();
          scrollToWaitlist();
        }
      });
    });
  }

  function setFormStatus(form, type, message) {
    var status = form.querySelector("[data-form-status]");
    if (!status) return;
    status.hidden = false;
    status.dataset.status = type;
    status.textContent = message;
  }

  function serializeForm(form) {
    var result = {};
    new FormData(form).forEach(function (value, key) {
      if (key === "website") return;
      result[key] = typeof value === "string" ? value.trim() : value;
    });
    return result;
  }

  function saveLocalSubmission(payload) {
    var key = "playtalk_waitlist_v1";
    try {
      var existing = JSON.parse(localStorage.getItem(key) || "[]");
      existing.push(payload);
      localStorage.setItem(key, JSON.stringify(existing));
    } catch (error) {
      console.warn("Local waitlist storage unavailable:", error);
    }
  }

  function bindForms() {
    document.querySelectorAll("[data-waitlist-form]").forEach(function (form) {
      applyAttribution(form);

      var backend = getBackend();

      if (backend === "local") {
        setFormStatus(form, "pending", form.dataset.demoText || "Demo mode: configure formEndpoint before collecting leads.");
      }

      form.addEventListener("submit", function (event) {
        event.preventDefault();

        if (!form.reportValidity()) return;

        var honeypot = form.querySelector('input[name="website"]');
        if (honeypot && honeypot.value) return;

        var submit = form.querySelector('button[type="submit"]');
        var payload = serializeForm(form);
        payload.submitted_at = new Date().toISOString();
        payload.user_agent = navigator.userAgent;

        if (submit) {
          submit.disabled = true;
          submit.dataset.originalText = submit.textContent;
          submit.textContent = form.dataset.loadingText || "Submitting...";
        }

        setFormStatus(form, "pending", form.dataset.pendingText || "Sending...");
        track("waitlist_submit", {
          page_variant: payload.page_variant,
          language: payload.language,
          utm_source: payload.utm_source,
          utm_content: payload.utm_content
        });

        function finish(success) {
          if (submit) {
            submit.disabled = false;
            submit.textContent = submit.dataset.originalText || "Submit";
          }

          if (!success) {
            setFormStatus(
              form,
              "error",
              form.dataset.errorText || "Something went wrong. Please try again."
            );
            return;
          }

          form.reset();
          applyAttribution(form);
          applyHeadlineVariant(getVariant());
          setFormStatus(form, "success", form.dataset.successText || "You are on the list.");
          track("waitlist_success", {
            language: payload.language,
            page_variant: payload.page_variant
          });
        }

        if (backend === "local") {
          saveLocalSubmission(payload);
          window.setTimeout(function () {
            finish(true);
          }, 450);
          return;
        }

        var request;
        if (backend === "netlify") {
          var netlifyData = new FormData(form);
          request = fetch(window.location.pathname, {
            method: "POST",
            headers: {
              "Content-Type": "application/x-www-form-urlencoded"
            },
            body: new URLSearchParams(netlifyData).toString()
          });
        } else {
          request = fetch(CONFIG.formEndpoint, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Accept: "application/json"
            },
            body: JSON.stringify(payload)
          });
        }

        request
          .then(function (response) {
            if (!response.ok) throw new Error("Request failed with " + response.status);
            finish(true);
          })
          .catch(function (error) {
            console.error(error);
            finish(false);
          });
      });
    });
  }

  function bindYear() {
    document.querySelectorAll("[data-year]").forEach(function (element) {
      element.textContent = String(new Date().getFullYear());
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    var variant = getVariant();
    applyHeadlineVariant(variant);
    bindCtas();
    bindForms();
    bindYear();
    loadPostHog();

    track("page_view", Object.assign({}, getAttribution(), { page_variant: variant }));
  });
})();
