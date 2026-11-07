// The Social Hour Agency — navbar, video belt, photo showcase, mobile menu, services links, fade-up on scroll,
// sticky phone button, contact form.

// Where the contact form sends to: FormSubmit (formsubmit.co, no account needed), which emails each message to this
// address. Nothing is delivered until the inbox owner clicks "Activate Form" in FormSubmit's first email. After that,
// FormSubmit offers a random-string alias for the address: it can replace FORM_EMAIL here (and in the form's action
// in index.html) so the address isn't in the page.
const FORM_EMAIL = "bellasofia4tno@gmail.com";
const FORM_ENDPOINT = `https://formsubmit.co/ajax/${FORM_EMAIL}`;

// ---------- Navbar goes solid once you scroll past the top ----------
const nav = document.getElementById("nav");
const setNav = () => nav.classList.toggle("solid", window.scrollY > 40);
setNav();
window.addEventListener("scroll", setNav, { passive: true });

// ---------- Hero video: no moving background for people who've asked for reduced motion ----------
const heroVideo = document.getElementById("hero-video");
const calm = window.matchMedia("(prefers-reduced-motion: reduce)");
const setHeroVideo = () => {
  if (calm.matches) { heroVideo.removeAttribute("autoplay"); heroVideo.pause(); }   // the still poster stays
  else heroVideo.play().catch(() => {});      // a blocked or missing video just leaves the still image
};
setHeroVideo();
calm.addEventListener?.("change", setHeroVideo);

// ---------- Moving rows ("conveyor belts"): the videos and the photo showcase ----------
// Each belt is an ordinary sideways-scrolling row (so phones can swipe it) that drifts slowly on its own.
// Hover or a touch holds it still; the FIRST click/tap stops it, and a SECOND click/tap acts on what was tapped
// (videos: play it; photos: open "See all" at that category). It drifts again after a few quiet seconds.
// Reduced motion: it never drifts, so a single click/tap acts straight away.
const SPEED = 28;            // px per second
const tapWord = window.matchMedia("(hover: none)").matches ? "Tap" : "Click";
const overlays = [...document.querySelectorAll("dialog")];
const dialogOpen = () => overlays.some((d) => d.open);
const syncLock = () => document.documentElement.classList.toggle("dialog-open", dialogOpen());

// Only real Tab presses count as keyboard focus: focus coming back from a closed overlay shouldn't freeze a belt.
let tabbing = false;
document.addEventListener("keydown", (e) => { tabbing = e.key === "Tab"; });
document.addEventListener("pointerdown", () => { tabbing = false; });

const conveyor = ({ belt, track, hint, stoppedHint, idle = 5000, onPick = () => {}, onFrame = () => {} }) => {
  const originals = [...track.children];
  let stopped = false, hovered = false, touching = false, keyFocus = false, inView = false;
  let lastInteraction = 0, holdUntil = 0, pos = 0, lastSet = -1, setWidth = 0, rafId = 0, lastT = 0;

  // Loop seamlessly: append copies of the list until there's always one full set beyond the visible width.
  const addCopy = () => originals.forEach((li) => {
    const c = li.cloneNode(true);
    c.setAttribute("aria-hidden", "true");
    c.querySelectorAll("a, button").forEach((a) => { a.tabIndex = -1; });
    track.append(c);
  });
  const measure = () => {
    setWidth = track.children[originals.length].offsetLeft - originals[0].offsetLeft;
    while (track.scrollWidth < setWidth + belt.clientWidth + 2) addCopy();
  };
  addCopy();
  measure();
  window.addEventListener("resize", measure);

  const touched = () => { lastInteraction = performance.now(); };
  const canMove = () => !calm.matches && inView && !document.hidden && !stopped && !hovered && !touching &&
    !keyFocus && !dialogOpen() && performance.now() - lastInteraction > 1200;
  const setStopped = (on) => {
    stopped = on;
    belt.classList.toggle("is-stopped", on || calm.matches);
    hint.textContent = on || calm.matches ? stoppedHint : `${tapWord} to pause`;
  };
  setStopped(false);
  calm.addEventListener?.("change", () => setStopped(stopped));

  const frame = (t) => {
    const dt = Math.min((t - lastT) / 1000, 0.1);
    lastT = t;
    const now = performance.now();
    if (canMove()) {
      pos += SPEED * dt;
      if (pos >= setWidth) pos -= setWidth;
      belt.scrollLeft = pos;
      lastSet = belt.scrollLeft;
    } else {
      // After a long swipe, hop back one set (only once the swipe has settled, so momentum isn't cut short)
      if (!touching && setWidth && belt.scrollLeft >= setWidth && now - lastInteraction > 400) belt.scrollLeft -= setWidth;
      pos = belt.scrollLeft;
      lastSet = pos;
      if (stopped && !hovered && !keyFocus && !dialogOpen() && now > holdUntil && now - lastInteraction > idle) setStopped(false);
    }
    onFrame(belt.scrollLeft, setWidth);
    rafId = requestAnimationFrame(frame);
  };
  const run = () => {
    const go = inView && !document.hidden;
    if (go && !rafId) { lastT = performance.now(); rafId = requestAnimationFrame(frame); }
    if (!go && rafId) { cancelAnimationFrame(rafId); rafId = 0; }
  };
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(([e]) => { inView = e.isIntersecting; run(); }).observe(belt);
  } else { inView = true; run(); }
  document.addEventListener("visibilitychange", run);

  belt.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse") hovered = true; });
  belt.addEventListener("pointerleave", (e) => { if (e.pointerType === "mouse") { hovered = false; touched(); } });
  belt.addEventListener("pointerdown", (e) => { if (e.pointerType !== "mouse") touching = true; touched(); });
  ["pointerup", "pointercancel", "touchend", "touchcancel"].forEach((ev) =>
    belt.addEventListener(ev, () => { touching = false; touched(); }, { passive: true }));
  belt.addEventListener("touchstart", () => { touching = true; touched(); }, { passive: true });
  belt.addEventListener("wheel", touched, { passive: true });
  belt.addEventListener("scroll", () => { if (Math.abs(belt.scrollLeft - lastSet) > 2) touched(); }, { passive: true });
  // Tabbing into a belt holds it still (moving content under keyboard focus is hard to use).
  belt.addEventListener("focusin", () => { if (tabbing) { keyFocus = true; setStopped(true); } });
  belt.addEventListener("focusout", () => { keyFocus = false; touched(); });

  belt.addEventListener("click", (e) => {
    e.preventDefault();
    touched();
    if (!stopped && !calm.matches) { setStopped(true); return; }   // first click/tap: stop the belt
    onPick(e.target);                                               // second: act on what was tapped
  });

  return {
    originals,
    touched,
    get stopped() { return stopped; },
    // Stop and stay stopped for at least `hold` ms (e.g. after picking a category)
    stop(hold = 0) { setStopped(true); holdUntil = performance.now() + hold; touched(); },
    // Glide to an x offset inside the current loop of the row
    glideTo(x) {
      const base = setWidth ? Math.floor(belt.scrollLeft / setWidth) * setWidth : 0;
      belt.scrollTo({ left: base + x, behavior: calm.matches ? "auto" : "smooth" });
    },
  };
};

// ---------- Videos ----------
const player = document.getElementById("reel-player");
const playerVideo = player.querySelector("video");
const playerCap = player.querySelector(".reel-player-cap");
const grid = document.getElementById("reel-grid");

// One player for every reel, so only one video ever plays.
const openReel = (link) => {
  playerVideo.poster = link.dataset.poster;
  playerVideo.src = link.dataset.video;
  playerCap.textContent = link.querySelector(".reel-cap").lastChild.textContent.trim();
  player.showModal();
  syncLock();
  playerVideo.play().catch(() => {});      // if autoplay is refused, the controls are right there
};
const videos = conveyor({
  belt: document.getElementById("reel-belt"),
  track: document.getElementById("reel-track"),
  hint: document.getElementById("reel-hint"),
  stoppedHint: `${tapWord} a video to play`,
  onPick: (el) => { const link = el.closest(".reel-link"); if (link) openReel(link); },
});
player.addEventListener("close", () => {
  playerVideo.pause();
  playerVideo.removeAttribute("src");       // stop downloading
  playerVideo.load();
  syncLock();
  videos.touched();
});

// "See all" videos: every reel in a simple grid; one click/tap plays.
const gridList = grid.querySelector(".reel-grid-list");
videos.originals.forEach((li) => gridList.append(li.cloneNode(true)));
gridList.addEventListener("click", (e) => {
  const link = e.target.closest(".reel-link");
  if (!link) return;
  e.preventDefault();
  openReel(link);
});
document.getElementById("see-all").addEventListener("click", () => { grid.showModal(); syncLock(); });
grid.addEventListener("close", () => { syncLock(); videos.touched(); });

// ---------- Photos: a rotating showcase, three per category; the category names jump to (and hold) one ----------
const photoBelt = document.getElementById("photo-belt");
const photoGrid = document.getElementById("photo-grid");
const chips = [...document.querySelectorAll("#work .filter")];
let groupStarts = [], shownCat = "", shownPicked = false, pickedCat = "";
const showCat = (cat, picked = false) => {
  if (cat === shownCat && picked === shownPicked) return;
  shownCat = cat;
  shownPicked = picked;
  chips.forEach((c) => {
    c.classList.toggle("active", c.dataset.filter === cat);
    c.setAttribute("aria-pressed", String(picked && c.dataset.filter === cat));
  });
};
const openAllPhotos = (cat) => {
  photoGrid.showModal();
  syncLock();
  const section = cat && document.getElementById(`all-${cat}`);
  if (section) photoGrid.scrollTop = section.offsetTop - photoGrid.querySelector(".reel-grid-head").offsetHeight;
  else photoGrid.scrollTop = 0;
};
const photos = conveyor({
  belt: photoBelt,
  track: document.getElementById("photo-track"),
  hint: document.getElementById("photo-hint"),
  stoppedHint: `${tapWord} a photo or See all for more`,
  idle: 8000,
  onPick: (el) => { const g = el.closest(".pgroup"); if (g) openAllPhotos(g.dataset.category); },
  // Light up the category that's passing by (the group nearest the left third of the row)
  onFrame: (x, setWidth) => {
    if (pickedCat) { if (photos.stopped) return; pickedCat = ""; showCat(shownCat); }   // a tapped category stays chosen while stopped
    if (!setWidth || !groupStarts.length) return;
    const at = (x + photoBelt.clientWidth / 3) % setWidth;
    let i = 0;
    while (i + 1 < groupStarts.length && groupStarts[i + 1] <= at) i++;
    showCat(photos.originals[i].dataset.category);
  },
});
const measureGroups = () => { groupStarts = photos.originals.map((g) => g.offsetLeft - photos.originals[0].offsetLeft); };
measureGroups();
window.addEventListener("resize", measureGroups);
window.addEventListener("load", measureGroups);

const pickCat = (cat) => {
  const i = photos.originals.findIndex((g) => g.dataset.category === cat);
  if (i < 0) return;
  photos.stop(15000);           // hold on the chosen category for a good look
  pickedCat = cat;
  showCat(cat, true);
  photos.glideTo(groupStarts[i]);
};
chips.forEach((c) => c.addEventListener("click", () => pickCat(c.dataset.filter)));
document.getElementById("photo-see-all").addEventListener("click", () => openAllPhotos(pickedCat));
photoGrid.addEventListener("close", () => { syncLock(); photos.touched(); });

// Close buttons, and a click on the dark backdrop, close any overlay.
overlays.forEach((d) => {
  d.querySelector(".dialog-close").addEventListener("click", () => d.close());
  d.addEventListener("click", (e) => { if (e.target === d) d.close(); });
});

// ---------- Mobile menu ----------
const toggle = document.getElementById("nav-toggle");
const setMenu = (open) => {
  nav.classList.toggle("open", open);
  toggle.setAttribute("aria-expanded", String(open));
  toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
  document.body.style.overflow = open ? "hidden" : "";
};
toggle.addEventListener("click", () => setMenu(!nav.classList.contains("open")));
document.querySelectorAll(".nav-links a").forEach((a) => a.addEventListener("click", () => setMenu(false)));
document.addEventListener("keydown", (e) => { if (e.key === "Escape") setMenu(false); });

// ---------- Fade-up on scroll ----------
const fadeEls = document.querySelectorAll(".fade-up");
if ("IntersectionObserver" in window) {
  const io = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("in-view");
        io.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: "0px 0px -40px 0px" });
  fadeEls.forEach((el) => io.observe(el));
} else {
  fadeEls.forEach((el) => el.classList.add("in-view"));
}

// ---------- Services: "See the work" shows that photo category; the booking button picks it in the form ----------
document.querySelectorAll("[data-tab]").forEach((a) => a.addEventListener("click", () => pickCat(a.dataset.tab)));
const projectType = document.getElementById("project-type");
document.querySelectorAll("[data-type]").forEach((a) => a.addEventListener("click", () => { projectType.value = a.dataset.type; }));

// ---------- Phones: sticky "Book a shoot" ----------
// Hidden while the hero (which has its own button), the contact form or the footer is on screen.
const sticky = document.getElementById("sticky-book");
if ("IntersectionObserver" in window) {
  const onScreen = new Set();
  const watch = new IntersectionObserver((entries) => {
    entries.forEach((e) => (e.isIntersecting ? onScreen.add(e.target) : onScreen.delete(e.target)));
    sticky.classList.toggle("show", onScreen.size === 0);
  });
  ["top", "contact"].forEach((id) => watch.observe(document.getElementById(id)));
  watch.observe(document.querySelector(".footer"));
}

// ---------- Contact form ----------
const form = document.getElementById("contact-form");
const status = document.getElementById("form-status");
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  let ok = true;
  form.querySelectorAll("[required]").forEach((field) => {
    const bad = !field.value.trim() || (field.type === "email" && !/^\S+@\S+\.\S+$/.test(field.value));
    field.classList.toggle("invalid", bad);
    if (bad) ok = false;
  });
  if (!ok) {
    status.textContent = "Please fill in your name, a valid email and a message.";
    return;
  }
  const thanks = document.getElementById("form-thanks");
  const showThanks = () => {
    form.querySelector(".form-frame").hidden = true;
    form.querySelector("button[type=submit]").hidden = true;
    status.textContent = "";
    thanks.hidden = false;
    thanks.focus();
  };
  if (form.elements._honey.value) { showThanks(); return; }   // a bot filled the spam trap: look sent, send nothing
  const button = form.querySelector("button[type=submit]");
  button.disabled = true;
  status.textContent = "Sending…";
  try {
    const res = await fetch(FORM_ENDPOINT, {
      method: "POST",
      headers: { "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify(Object.fromEntries(new FormData(form))),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || String(data.success) !== "true") throw new Error(data.message || `HTTP ${res.status}`);
    form.reset();
    showThanks();
  } catch (err) {
    status.textContent = /activat/i.test(err.message)
      ? `This form is still being switched on, so your message wasn't sent. Please email ${FORM_EMAIL} instead.`
      : `Sorry, that didn't send. Please try again, or email ${FORM_EMAIL}.`;
  } finally {
    button.disabled = false;
  }
});

document.getElementById("year").textContent = new Date().getFullYear();
