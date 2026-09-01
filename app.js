"use strict";

const FORM_ENDPOINT = "https://formspree.io/f/YOUR_ID";
const SHOW_COUNTDOWN = false;
const LAUNCH_DATE = "2026-12-01T10:00:00+01:00";
const AUDIO_PREVIEW_URL = "https://audio-ssl.itunes.apple.com/itunes-assets/AudioPreview221/v4/a9/d2/09/a9d209b4-55a5-67e8-2e15-949cb00e716d/mzaf_11935934741751979581.plus.aac.p.m4a";
const AUDIO_FALLBACK_URL = "./assets/movin-to-the-sun.mp3";

const IMAGE_COUNT = 14;
const CLAIMS = [
  "Something brilliant is about to drop.",
  "Diamonds are having a moment. You’re early.",
  "Not just diamonds. Smarter ones. Soon.",
  "Good things come to those who sign up.",
];
const EMAIL_PROVIDERS = [
  "gmail.com",
  "outlook.com",
  "icloud.com",
  "hotmail.com",
  "yahoo.com",
  "proton.me",
  "protonmail.com",
  "live.com",
  "fastmail.com",
  "gmx.com",
  "mail.com",
  "aol.com",
  "libero.it",
  "virgilio.it",
  "bluewin.ch",
  "sunrise.ch",
];
const PROVIDER_TYPOS = {
  "gamil.com": "gmail.com",
  "gmal.com": "gmail.com",
  "gmial.com": "gmail.com",
  "gmail.co": "gmail.com",
  "gmail.con": "gmail.com",
  "hotmai.com": "hotmail.com",
  "hotnail.com": "hotmail.com",
  "outlok.com": "outlook.com",
  "outlook.co": "outlook.com",
  "iclod.com": "icloud.com",
  "icloud.co": "icloud.com",
  "yaho.com": "yahoo.com",
  "yahoo.co": "yahoo.com",
  "protonmai.com": "protonmail.com",
};
const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");

const imagePath = (index, width) => `./images/image-${String(index).padStart(2, "0")}-${width}.webp`;
const imageSource = (index) => ({
  src: imagePath(index, 400),
  srcset: `${imagePath(index, 400)} 400w, ${imagePath(index, 800)} 800w`,
});

const randomBetween = (min, max) => Math.round(min + Math.random() * (max - min));

function preloadImages() {
  const size = window.devicePixelRatio > 1.25 && window.innerWidth > 700 ? 800 : 400;
  for (let index = 1; index <= IMAGE_COUNT; index += 1) {
    const image = new Image();
    image.decoding = "async";
    image.src = imagePath(index, size);
  }
}

function makeImage(index, modifier) {
  const image = document.createElement("img");
  const source = imageSource(index);
  image.className = `tile__image tile__image--${modifier}`;
  image.src = source.src;
  image.srcset = source.srcset;
  image.sizes = "(min-width: 1000px) 15vw, (min-width: 600px) 17vw, 25vw";
  image.alt = "";
  image.decoding = "async";
  image.draggable = false;
  return image;
}

function buildCollage() {
  const collage = document.querySelector("#collage");
  const columns = window.innerWidth < 600 ? 4 : window.innerWidth < 1000 ? 6 : 7;
  const tileWidth = window.innerWidth / columns;
  const rows = Math.ceil(window.innerHeight / tileWidth);
  const tileCount = columns * rows;
  const fragment = document.createDocumentFragment();

  collage.style.setProperty("--columns", columns);
  collage.style.setProperty("--rows", rows);

  for (let position = 0; position < tileCount; position += 1) {
    const index = (position * 5) % IMAGE_COUNT + 1;
    const tile = document.createElement("div");
    tile.className = "tile";
    tile.dataset.imageIndex = String(index);
    tile.style.setProperty("--drift-duration", `${randomBetween(18, 30)}s`);
    tile.style.setProperty("--drift-delay", `${-randomBetween(0, 16)}s`);
    tile.append(makeImage(index, "current"), makeImage(index, "next"));
    fragment.append(tile);
  }

  collage.replaceChildren(fragment);
  requestAnimationFrame(() => collage.classList.add("is-ready"));
}

async function swapTile(tile) {
  if (!tile || tile.dataset.swapping === "true") return;

  const currentIndex = Number(tile.dataset.imageIndex);
  let nextIndex = randomBetween(1, IMAGE_COUNT);
  while (nextIndex === currentIndex) nextIndex = randomBetween(1, IMAGE_COUNT);

  const nextImage = tile.querySelector(".tile__image--next");
  const currentImage = tile.querySelector(".tile__image--current");
  const source = imageSource(nextIndex);
  tile.dataset.swapping = "true";
  nextImage.src = source.src;
  nextImage.srcset = source.srcset;

  try {
    await nextImage.decode();
  } catch {
    // The browser can still render a cached image when decode() is unavailable.
  }

  tile.classList.add("is-swapping");
  window.setTimeout(() => {
    currentImage.src = source.src;
    currentImage.srcset = source.srcset;
    tile.dataset.imageIndex = String(nextIndex);
    tile.classList.remove("is-swapping");
    tile.dataset.swapping = "false";
  }, 700);
}

function startCollageMotion() {
  if (reducedMotion.matches) return;

  const scheduleSwaps = () => {
    window.setTimeout(() => {
      const tiles = [...document.querySelectorAll(".tile:not(.is-hero)")];
      const count = window.innerWidth < 600 ? 2 : 3;
      for (let index = 0; index < count && tiles.length; index += 1) {
        const tileIndex = randomBetween(0, tiles.length - 1);
        swapTile(tiles.splice(tileIndex, 1)[0]);
      }
      scheduleSwaps();
    }, randomBetween(1200, 2000));
  };

  scheduleSwaps();
  window.setInterval(() => {
    const tiles = [...document.querySelectorAll('.tile[data-swapping="false"], .tile:not([data-swapping])')];
    if (!tiles.length) return;
    const tile = tiles[randomBetween(0, tiles.length - 1)];
    tile.classList.add("is-hero");
    window.setTimeout(() => tile.classList.remove("is-hero"), 1200);
  }, 8000);
}

function startClaimRotation() {
  if (reducedMotion.matches) return;

  const claim = document.querySelector("#launch-claim");
  let index = 0;
  window.setInterval(() => {
    claim.classList.add("is-fading");
    window.setTimeout(() => {
      index = (index + 1) % CLAIMS.length;
      claim.textContent = CLAIMS[index];
      claim.classList.remove("is-fading");
    }, 320);
  }, 6000);
}

function setupCountdown() {
  if (!SHOW_COUNTDOWN) return;

  const countdown = document.querySelector("#countdown");
  const launchTime = new Date(LAUNCH_DATE).getTime();
  countdown.hidden = false;

  const update = () => {
    const difference = Math.max(0, launchTime - Date.now());
    const days = Math.floor(difference / 86400000);
    const hours = Math.floor((difference / 3600000) % 24);
    const minutes = Math.floor((difference / 60000) % 60);
    countdown.textContent = difference
      ? `Drop 01 lands in ${days}d ${String(hours).padStart(2, "0")}h ${String(minutes).padStart(2, "0")}m`
      : "Drop 01 has landed";
  };

  update();
  window.setInterval(update, 60000);
}

function emailIssue(value) {
  const email = value.trim();
  if (!email) return { message: "Enter your email to join." };
  if (email.length > 254 || email.includes(" ")) return { message: "That email format doesn’t look right." };

  const parts = email.split("@");
  if (parts.length !== 2) return { message: "Use one @ between your name and email provider." };

  const [local, rawDomain] = parts;
  const domain = rawDomain.toLowerCase();
  const localPattern = /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+$/i;
  if (
    !local ||
    local.length > 64 ||
    !localPattern.test(local) ||
    local.startsWith(".") ||
    local.endsWith(".") ||
    local.includes("..")
  ) {
    return { message: "Check the part before @ — there may be a missing or extra character." };
  }

  const labels = domain.split(".");
  const labelPattern = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/i;
  const validTld = /^[a-z]{2,63}$/i.test(labels.at(-1)) || labels.at(-1)?.startsWith("xn--");
  if (labels.length < 2 || !validTld || labels.some((label) => !labelPattern.test(label))) {
    return { message: "Check the email provider after @ (for example, gmail.com)." };
  }

  const correctedDomain = PROVIDER_TYPOS[domain];
  if (correctedDomain) {
    return {
      message: "That provider looks mistyped. Did you mean",
      suggestion: `${local}@${correctedDomain}`,
    };
  }

  return null;
}

function setupForm() {
  const form = document.querySelector("#signup-form");
  const email = document.querySelector("#email");
  const providerList = document.querySelector("#email-provider-list");
  const feedback = document.querySelector("#form-feedback");
  const button = document.querySelector("#submit-button");
  const success = document.querySelector("#success-message");

  const showFeedback = (issue) => {
    feedback.replaceChildren(document.createTextNode(issue.message));
    if (!issue.suggestion) return;

    feedback.append(document.createTextNode(" "));
    const suggestion = document.createElement("button");
    suggestion.className = "email-suggestion";
    suggestion.type = "button";
    suggestion.textContent = issue.suggestion;
    suggestion.addEventListener("click", () => {
      email.value = issue.suggestion;
      email.removeAttribute("aria-invalid");
      feedback.replaceChildren();
      email.focus();
    });
    feedback.append(suggestion, document.createTextNode("?"));
  };

  const updateProviderSuggestions = () => {
    const [local, fragment = ""] = email.value.trim().split("@");
    if (!local || !email.value.includes("@") || email.value.split("@").length !== 2) {
      providerList.replaceChildren();
      return;
    }

    const matches = EMAIL_PROVIDERS
      .filter((provider) => provider.startsWith(fragment.toLowerCase()) && provider !== fragment.toLowerCase())
      .slice(0, 8);
    providerList.replaceChildren(...matches.map((provider) => {
      const option = document.createElement("option");
      option.value = `${local}@${provider}`;
      return option;
    }));
  };

  email.addEventListener("input", () => {
    email.removeAttribute("aria-invalid");
    feedback.replaceChildren();
    updateProviderSuggestions();
  });

  email.addEventListener("blur", () => {
    email.value = email.value.trim();
  });

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    if (form.elements.company.value) return;

    email.value = email.value.trim();
    const issue = emailIssue(email.value);
    if (issue || !email.validity.valid) {
      email.setAttribute("aria-invalid", "true");
      showFeedback(issue || { message: "Enter a valid email so we know where to find you." });
      email.focus();
      return;
    }

    button.disabled = true;
    button.classList.add("is-loading");
    button.setAttribute("aria-busy", "true");
    feedback.replaceChildren();

    try {
      const response = await fetch(FORM_ENDPOINT, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email.value.trim() }),
      });

      if (!response.ok) throw new Error("Signup request failed");

      form.hidden = true;
      success.hidden = false;
    } catch {
      showFeedback({ message: "That didn’t sparkle. Please try again in a moment." });
    } finally {
      button.disabled = false;
      button.classList.remove("is-loading");
      button.removeAttribute("aria-busy");
    }
  });
}

function setupAudio() {
  const audio = document.querySelector("#background-audio");
  const control = document.querySelector("#sound-control");
  const button = document.querySelector("#sound-button");
  const toast = document.querySelector("#sound-toast");
  let toastTimer;
  let fadeFrame;
  let triedFallback = false;

  const dismissToast = () => {
    window.clearTimeout(toastTimer);
    toast.classList.add("is-dismissed");
  };

  const revealControl = () => {
    control.hidden = false;
    toastTimer = window.setTimeout(dismissToast, 6000);
  };

  const fadeVolume = (target, duration, complete) => {
    window.cancelAnimationFrame(fadeFrame);
    const startVolume = audio.volume;
    const startTime = performance.now();
    const step = (now) => {
      const progress = Math.min(1, (now - startTime) / duration);
      audio.volume = startVolume + (target - startVolume) * progress;
      if (progress < 1) fadeFrame = window.requestAnimationFrame(step);
      else if (complete) complete();
    };
    fadeFrame = window.requestAnimationFrame(step);
  };

  const setPlayingState = (isPlaying) => {
    button.classList.toggle("is-playing", isPlaying);
    button.setAttribute("aria-pressed", String(isPlaying));
    button.setAttribute("aria-label", isPlaying ? "Pause Movin’ To The Sun preview" : "Play Movin’ To The Sun preview");
  };

  audio.volume = 0.35;
  audio.addEventListener("loadedmetadata", revealControl, { once: true });
  audio.addEventListener("error", () => {
    if (!triedFallback) {
      triedFallback = true;
      audio.src = AUDIO_FALLBACK_URL;
      audio.load();
      return;
    }
    control.hidden = true;
  });

  button.addEventListener("click", async () => {
    dismissToast();
    if (audio.paused) {
      audio.volume = 0;
      try {
        await audio.play();
        setPlayingState(true);
        fadeVolume(0.35, 500);
      } catch {
        setPlayingState(false);
        control.hidden = true;
      }
    } else {
      fadeVolume(0, 500, () => {
        audio.pause();
        audio.volume = 0.35;
        setPlayingState(false);
      });
    }
  });

  audio.src = AUDIO_PREVIEW_URL;
  audio.load();
}

preloadImages();
buildCollage();
startCollageMotion();
startClaimRotation();
setupCountdown();
setupForm();
setupAudio();

let resizeTimer;
window.addEventListener("resize", () => {
  window.clearTimeout(resizeTimer);
  resizeTimer = window.setTimeout(buildCollage, 180);
});
