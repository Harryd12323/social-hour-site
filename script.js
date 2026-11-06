// The Social Hour Agency — navbar, video belt, mobile menu, gallery filter, fade-up on scroll, contact form.

// Where the contact form sends to. Empty = not connected: the form checks the fields but sends nothing,
// and says so. To connect it, paste the URL from a form service (e.g. Formspree or Basin) here.
const FORM_ENDPOINT = "";

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

// ---------- Videos: moving gallery ("conveyor belt") ----------
// The belt is an ordinary sideways-scrolling row of poster images (no video plays in it), so phones can swipe it.
// It drifts slowly on its own. Hover or a touch holds it still; the FIRST click/tap stops it (play buttons appear),
// the SECOND click/tap on a reel opens it in the one shared player. It drifts again after a few quiet seconds.
// Reduced motion: it never drifts, so a single click/tap plays.
const belt = document.getElementById("reel-belt");
const track = document.getElementById("reel-track");
const hint = document.getElementById("reel-hint");
const player = document.getElementById("reel-player");
const playerVideo = player.querySelector("video");
const playerCap = player.querySelector(".reel-player-cap");
const grid = document.getElementById("reel-grid");
const originals = [...track.children];
const SPEED = 28;            // px per second
const IDLE_MS = 5000;        // quiet time before a stopped belt drifts again
const tapWord = window.matchMedia("(hover: none)").matches ? "Tap" : "Click";
let stopped = false, hovered = false, touching = false, keyFocus = false, inView = false;
let lastInteraction = 0, pos = 0, lastSet = -1, setWidth = 0, rafId = 0, lastT = 0;

// Loop seamlessly: append copies of the list until there's always one full set beyond the visible width.
const addCopy = () => originals.forEach((li) => {
  const c = li.cloneNode(true);
  c.setAttribute("aria-hidden", "true");
  c.querySelector("a").tabIndex = -1;
  track.append(c);
});
const measure = () => {
  setWidth = track.children[originals.length].offsetLeft - originals[0].offsetLeft;
  while (track.scrollWidth < setWidth + belt.clientWidth + 2) addCopy();
};
addCopy();
measure();
window.addEventListener("resize", measure);

const dialogOpen = () => player.open || grid.open;
const canMove = () => !calm.matches && inView && !document.hidden && !stopped && !hovered && !touching &&
  !keyFocus && !dialogOpen() && performance.now() - lastInteraction > 1200;

const setStopped = (on) => {
  stopped = on;
  belt.classList.toggle("is-stopped", on || calm.matches);
  hint.textContent = on || calm.matches ? `${tapWord} a video to play` : `${tapWord} to pause`;
};
setStopped(false);
calm.addEventListener?.("change", () => setStopped(stopped));

const frame = (t) => {
  const dt = Math.min((t - lastT) / 1000, 0.1);
  lastT = t;
  if (canMove()) {
    pos += SPEED * dt;
    if (pos >= setWidth) pos -= setWidth;
    belt.scrollLeft = pos;
    lastSet = belt.scrollLeft;
  } else {
    // After a long swipe, hop back one set (only once the swipe has settled, so momentum isn't cut short)
    if (!touching && setWidth && belt.scrollLeft >= setWidth && performance.now() - lastInteraction > 400) belt.scrollLeft -= setWidth;
    pos = belt.scrollLeft;
    lastSet = pos;
    if (stopped && !hovered && !keyFocus && !dialogOpen() && performance.now() - lastInteraction > IDLE_MS) setStopped(false);
  }
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

const touched = () => { lastInteraction = performance.now(); };
belt.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse") hovered = true; });
belt.addEventListener("pointerleave", (e) => { if (e.pointerType === "mouse") { hovered = false; touched(); } });
belt.addEventListener("pointerdown", (e) => { if (e.pointerType !== "mouse") touching = true; touched(); });
["pointerup", "pointercancel", "touchend", "touchcancel"].forEach((ev) =>
  belt.addEventListener(ev, () => { touching = false; touched(); }, { passive: true }));
belt.addEventListener("touchstart", () => { touching = true; touched(); }, { passive: true });
belt.addEventListener("wheel", touched, { passive: true });
belt.addEventListener("scroll", () => { if (Math.abs(belt.scrollLeft - lastSet) > 2) touched(); }, { passive: true });
// Tabbing onto a reel holds the belt still (moving content under keyboard focus is hard to use).
// Only real Tab presses count: focus coming back from a closed player shouldn't freeze it for good.
let tabbing = false;
document.addEventListener("keydown", (e) => { tabbing = e.key === "Tab"; });
document.addEventListener("pointerdown", () => { tabbing = false; });
belt.addEventListener("focusin", () => { if (tabbing) { keyFocus = true; setStopped(true); } });
belt.addEventListener("focusout", () => { keyFocus = false; touched(); });

// One player for every reel, so only one video ever plays.
const syncLock = () => document.documentElement.classList.toggle("dialog-open", dialogOpen());
const openReel = (link) => {
  playerVideo.poster = link.dataset.poster;
  playerVideo.src = link.dataset.video;
  playerCap.textContent = link.querySelector(".reel-cap").lastChild.textContent.trim();
  player.showModal();
  syncLock();
  playerVideo.play().catch(() => {});      // if autoplay is refused, the controls are right there
};
player.addEventListener("close", () => {
  playerVideo.pause();
  playerVideo.removeAttribute("src");       // stop downloading
  playerVideo.load();
  syncLock();
  touched();
});

belt.addEventListener("click", (e) => {
  e.preventDefault();
  touched();
  if (!stopped && !calm.matches) { setStopped(true); return; }   // first click/tap: stop the belt
  const link = e.target.closest(".reel-link");
  if (link) openReel(link);                                       // second: play that reel
});

// "See all": every reel in a simple grid; one click/tap plays.
const gridList = grid.querySelector(".reel-grid-list");
originals.forEach((li) => gridList.append(li.cloneNode(true)));
gridList.addEventListener("click", (e) => {
  const link = e.target.closest(".reel-link");
  if (!link) return;
  e.preventDefault();
  openReel(link);
});
document.getElementById("see-all").addEventListener("click", () => { grid.showModal(); syncLock(); });
grid.addEventListener("close", () => { syncLock(); touched(); });

// Close buttons, and a click on the dark backdrop, close either overlay.
[player, grid].forEach((d) => {
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

// ---------- Gallery filter ----------
const filters = document.querySelectorAll(".filter");
const items = document.querySelectorAll(".gallery .item");
filters.forEach((btn) => {
  btn.addEventListener("click", () => {
    const pick = btn.dataset.filter;
    filters.forEach((b) => {
      b.classList.toggle("active", b === btn);
      b.setAttribute("aria-pressed", String(b === btn));
    });
    items.forEach((item) => {
      const placeholder = item.classList.contains("placeholder");   // "coming soon" tiles only show under their own filter
      const show = pick === "all" ? !placeholder : item.dataset.category === pick;
      item.classList.toggle("hidden", !show);
      item.classList.remove("filtering");
      if (show) {
        item.classList.add("in-view");              // already-filtered tiles shouldn't wait for a scroll
        void item.offsetWidth;                      // restart the little pop-in animation
        item.classList.add("filtering");
      }
    });
  });
});

// Touch screens have no hover: a tap shows the caption instead.
items.forEach((item) => {
  item.addEventListener("click", () => {
    if (window.matchMedia("(hover: none)").matches) item.classList.toggle("show-caption");
  });
});

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
  if (!FORM_ENDPOINT) {
    status.textContent = "This form isn't connected yet, so nothing was sent. Please email bellasofia4tno@gmail.com instead.";
    return;
  }
  const button = form.querySelector("button");
  button.disabled = true;
  status.textContent = "Sending…";
  try {
    const res = await fetch(FORM_ENDPOINT, {
      method: "POST",
      body: new FormData(form),
      headers: { Accept: "application/json" },
    });
    if (!res.ok) throw new Error(res.status);
    form.reset();
    status.textContent = "Thanks — your message is on its way. We'll be in touch soon.";
  } catch {
    status.textContent = "Sorry, that didn't send. Please try again in a moment.";
  } finally {
    button.disabled = false;
  }
});

document.getElementById("year").textContent = new Date().getFullYear();
