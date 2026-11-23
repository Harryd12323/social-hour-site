// The Social Hour Agency — navbar, mobile menu, gallery filter, fade-up on scroll, contact form.

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
      const show = pick === "all" || item.dataset.category === pick;
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
