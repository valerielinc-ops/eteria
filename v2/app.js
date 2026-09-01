"use strict";

const introRoot = document.body;
const introCollage = document.querySelector("#collage");
const introReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
let introGeneration = 0;
let introTimers = [];

function shuffled(items) {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [result[index], result[swapIndex]] = [result[swapIndex], result[index]];
  }
  return result;
}

function clearIntroTimers() {
  introTimers.forEach((timer) => window.clearTimeout(timer));
  introTimers = [];
}

function revealCollage() {
  const tiles = [...introCollage.querySelectorAll(".tile")];
  if (!tiles.length) return;

  introGeneration += 1;
  const generation = introGeneration;
  clearIntroTimers();
  introRoot.classList.remove("intro-complete");

  tiles.forEach((tile) => {
    tile.classList.remove("is-revealed");
    tile.style.setProperty("--entry-x", `${Math.round(Math.random() * 34 - 17)}%`);
    tile.style.setProperty("--entry-y", `${Math.round(Math.random() * 28 - 4)}%`);
    tile.style.setProperty("--entry-rotation", `${Math.round(Math.random() * 14 - 7)}deg`);
  });

  if (introReducedMotion.matches) {
    tiles.forEach((tile) => tile.classList.add("is-revealed"));
    introRoot.classList.add("intro-complete");
    return;
  }

  const orderedTiles = shuffled(tiles);
  orderedTiles.forEach((tile, index) => {
    const timer = window.setTimeout(() => {
      if (generation === introGeneration) tile.classList.add("is-revealed");
    }, 180 + index * 105);
    introTimers.push(timer);
  });

  const completeTimer = window.setTimeout(() => {
    if (generation === introGeneration) introRoot.classList.add("intro-complete");
  }, 180 + orderedTiles.length * 105 + 650);
  introTimers.push(completeTimer);
}

const collageObserver = new MutationObserver(() => {
  if (introRoot.classList.contains("intro-complete")) {
    introCollage.querySelectorAll(".tile").forEach((tile) => tile.classList.add("is-revealed"));
    return;
  }
  revealCollage();
});

collageObserver.observe(introCollage, { childList: true });
revealCollage();
