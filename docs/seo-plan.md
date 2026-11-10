# SEO plan: The Social Hour Agency (original site)

Goal: when someone in South Jersey or Philadelphia searches for an engagement, proposal, real estate, event or
brand-content photographer, Bellasofia shows up in Google search and on Google Maps, and the page they land on
gets them to book.

Priorities run from **P0** (do before or at launch) to **P3** (ongoing). Each item says what to do, why, and where
it goes in this repo.

---

## Where the site stands today (November 2026)

| Area | Current state | Impact |
|---|---|---|
| Domain | Lives at `harryd12323.github.io/social-hour-site/` with no custom domain (no `CNAME`) | Weak brand signal. No control over `robots.txt` (the github.io root returns 404), and links built now point to a URL that will change |
| Duplicate copy | The preview (`harryd12323.github.io/social-hour-site-preview/`) is a public, indexable mirror of the full site | Google may index the preview instead of the real site, or split ranking between them |
| Pages | One page (`index.html`) plus FAQ, Privacy and Terms (all three `noindex` while in draft) | Every service competes for the same URL. There's no page to rank for "South Jersey real estate photographer" |
| `<title>` / description | "Bellasofia Fortino — The Social Hour Agency" / a generic list of categories | No service or location keywords in the title |
| `<h1>` | The logo image (alt "Bellasofia Fortino") | No visible, keyword-bearing heading |
| Location signals | "Philly + NJ" in the meta description, the Services note, Contact and the footer | Too vague for local search: no towns, no service-area detail |
| Structured data | FAQPage only (on `faq.html`, built from the page) | Nothing yet tells Google this is a local business, what it offers or where |
| Social / share tags | No Open Graph or Twitter tags, no favicon | Bare link previews when shared in iMessage, Instagram DMs or Facebook |
| Sitemap / robots | None | Slower discovery of new pages |
| Images | Good descriptive alt text. Filenames are codes (`img-007-026.jpg`). The `images/web/` photos are single JPEGs with no WebP or `srcset` | Missed image-search relevance, and heavier pages on phones |
| Analytics | None. The Privacy Policy says the site uses no analytics | Can't measure SEO. Adding analytics later means updating `privacy.html` |

---

## P0: Fix before launch

### 1. Move to a custom domain
- Buy a domain (for example `thesocialhouragency.com`) and point GitHub Pages at it with a `CNAME` file in the repo root.
- Do this **first**. Every link, Google Business Profile entry and Instagram bio link built afterwards keeps its value.
- Once it's on its own domain, the site can have its own `robots.txt` and `sitemap.xml` (item 4).

### 2. Keep the preview out of Google
The preview repo publishes the same files as production, so anything added to the HTML lands on both. Use a
canonical tag rather than `noindex`, so production isn't blocked by mistake:
- Add `<link rel="canonical" href="https://<domain>/…">` to every page, pointing at the **production** URL of that page.
  The preview then tells Google "the real copy is over there".
- **Done (Nov 2026):** every page has a canonical pointing at `https://harryd12323.github.io/social-hour-site/…`.
  When the custom domain is live, change these to the new domain.
- Also: in Google Search Console (item 4), verify only the production domain. If preview URLs ever appear in search,
  request their removal there.

### 3. Rewrite the home page's title, description and heading
- `<title>`: **Photographer & Content Creator in South Jersey + Philadelphia | The Social Hour Agency**
  (around 60 characters; the brand goes last).
- `<meta name="description">`: one sentence of what she shoots and where, plus a call to book. For example: "Engagement, proposal,
  real estate, event and brand photography and video across South Jersey, Philadelphia and the Jersey Shore. Book a shoot
  with Bellasofia Fortino."
- `<h1>`: keep the logo as the visible signature, and add the words inside the heading so the visual design doesn't change:
  `<h1><img … alt="Bellasofia Fortino"><span class="sr-only">Photographer and content creator in South Jersey and Philadelphia</span></h1>`.
  Even better, show a short visible line. The location line planned near the Instagram pill can carry these words.
- Keep the headline exactly as it is ("Capturing moments, / so you can live in them"). It's brand copy, not an SEO element.

### 4. Set up Google Search Console and Google Business Profile, and add a sitemap and robots.txt
- **Google Business Profile** (the biggest win for local search): category *Photographer*, plus secondary categories
  where they fit (*Wedding photographer*, *Real estate photographer*, *Videographer*). Set it up as a
  **service-area business** (address hidden) and list the actual towns and counties served. Add 20–30 of her best photos,
  the services, the booking link and the Instagram link.
- **Search Console**: verify the domain and submit the sitemap.
- `sitemap.xml` in the repo root, listing every indexable page. Update it whenever a page is added.
- `robots.txt` in the repo root: `Sitemap: https://<domain>/sitemap.xml`. Don't block anything else.

### 5. Confirm the business details and use them the same way everywhere
Decide on one form of the business name, service area, phone number and email, and use exactly that on the site footer, the Contact section,
Google Business Profile, Instagram and every directory listing (P3). **Confirm with Bella**: where she's based,
which towns and counties she actively serves, and whether she travels to the Shore and for destination work.
Everything in the location section below depends on these answers.

### 6. Finish the FAQ and let it be indexed
- Bella fills in every `[Answer coming soon]` in `faq.html`. The FAQPage JSON-LD updates itself from the page.
- Then delete the `<meta name="robots" content="noindex">` line at the top of `faq.html`.
- Answers should be 2–4 sentences, specific (price ranges or "starting at", turnaround in days, towns covered), and
  should link to the relevant service page (P1) where it helps.
- Note: since 2023 Google shows FAQ rich results only for a small set of authoritative sites, so don't expect expandable
  questions under the search result. The page still matters, because it answers long-tail searches ("how far in advance
  should I book an engagement photographer") and feeds AI answers.

### 7. Add LocalBusiness structured data to the home page
One JSON-LD block in `index.html`'s `<head>`. Fill it in from item 5, and leave out anything that isn't true:

```json
{
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "@id": "https://<domain>/#business",
  "name": "The Social Hour Agency",
  "url": "https://<domain>/",
  "image": "https://<domain>/images/hero.jpg",
  "logo": "https://<domain>/images/logo-bellasofia.png",
  "description": "Photography and video for engagements, real estate, events and brands in South Jersey and Philadelphia.",
  "telephone": "+1-267-516-0152",
  "email": "bellasofia4tno@gmail.com",
  "founder": { "@type": "Person", "name": "Bellasofia Fortino" },
  "areaServed": [
    { "@type": "AdministrativeArea", "name": "South Jersey" },
    { "@type": "City", "name": "Philadelphia" }
  ],
  "sameAs": ["https://www.instagram.com/thesocial.hour/"]
}
```

Add a `WebSite` entity alongside it. Leave out `address` if she works as a service-area business with no public address.

---

## P1: Service pages and internal linking

### 8. Give each service its own page
Today the Services cards and the gallery filters share one URL. Give each service its own page, so each can rank for
"[service] photographer [area]" searches:

| Page (clean URL) | Main search target | Content |
|---|---|---|
| `/engagements-proposals/` | South Jersey & Philadelphia proposal and engagement photographer | How a surprise proposal shoot works, favourite locations, 8–15 best photos, the reels, Weddings FAQ section, booking button |
| `/weddings/` (only if she books full weddings; confirm) | Wedding photographer / wedding content creator in South Jersey | Same structure. Wedding *content creator* (reels, same-day phone content) is a growing niche worth naming |
| `/real-estate/` | South Jersey real estate photographer, real estate photography Philadelphia | Audience is **agents**: turnaround, what's included (interiors, exteriors, drone), how to prepare a home, the house, condo and medical office sets |
| `/events-concerts/` | Philadelphia event photographer, concert photographer Philadelphia | Concert and DJ sets, private events, turnaround, highlight reels |
| `/sports/` | Sports photographer Philadelphia / NJ | Drexel, lifeguard/beach patrol work, team and season packages |
| `/brand-content/` | Social media content creator for brands in Philadelphia / NJ | Brand reels (CorePower, Yoga Sculpt, Layback), product shots, what a content day includes |

Notes:
- Build each as `folder/index.html` so GitHub Pages serves clean URLs (`/real-estate/`, not `/real-estate.html`).
- Each page gets: a unique `<title>` and description (item 10), one `<h1>` naming service and area, 300–600 words
  of real copy (Bella's voice, specific places and clients, no keyword filler), a photo set, the matching FAQ section,
  and a booking button that pre-fills the contact form's project type.
- **Implementation tradeoff:** the nav, footer and `<head>` are copied by hand on every page today. Up to about 5 pages
  that's manageable. Past that, a small static site generator (for example Eleventy) keeps them in one place and can also
  produce the sitemap. Decide before building P1.

### 9. Link the pages to each other
- **Home page → service pages:** each Services card's title and image link to its page, and "See the work" stays on
  the home gallery. The descriptive card title does the work as anchor text.
- **Service page → everything related:** its FAQ section (`faq.html#realestate`), the relevant location pages (P2),
  2–3 related services (engagements ↔ weddings, events ↔ sports ↔ brand content), and Contact with the type pre-filled.
- **FAQ → service pages:** answers link to the page that expands on them.
- **Footer:** add a "Services" column listing every service page, so every page links to every service.
- **Breadcrumbs** on inner pages (Home › Real Estate), marked up with `BreadcrumbList` (item 14).
- Anchor text says what's on the other end ("real estate photography in South Jersey"), never "click here".
  Vary it naturally and don't repeat the exact same keyword phrase everywhere.

### 10. Title and description pattern for each page
- Title: `[Service] Photographer in [Area] | The Social Hour Agency`, around 60 characters.
  For example: *Real Estate Photographer in South Jersey | The Social Hour Agency*.
- Description: 140–160 characters covering what, where, one differentiator and a call to action.
  For example: *Bright, true-to-life listing photos and drone shots for agents across South Jersey and Philadelphia, delivered fast. Book a shoot.*
- Every page also gets: `<link rel="canonical">`, Open Graph tags (`og:title`, `og:description`, `og:image` at 1200×630,
  `og:url`, `og:type`), `twitter:card=summary_large_image`, and a favicon/apple-touch-icon (the wax seal works well).

---

## P2: Location targeting, images, speed

### 11. South Jersey / Philadelphia location targeting
Use only areas Bella actually serves (item 5). The candidates below fit her current portfolio (Brigantine, Layback NJ, Drexel, Philly):

- **Areas to name:** South Jersey · Philadelphia · the Jersey Shore. Then towns: Cherry Hill, Haddonfield, Moorestown,
  Collingswood, Mount Laurel, Marlton, Voorhees; at the Shore: Brigantine, Atlantic City, Margate, Ocean City, Cape May,
  Long Beach Island; in Philadelphia: Rittenhouse, Old City, Fishtown, the Main Line.
- **Where they go:** the home page heading and location line, each service page's copy ("We photograph listings from
  Cherry Hill to Ocean City"), photo captions and alt text where true ("Proposal on the beach in Brigantine, NJ"),
  FAQ answers ("Where do you travel?"), and the Google Business Profile service area.
- **Location pages, used carefully:** start with at most three: `/south-jersey/`, `/philadelphia/`,
  `/jersey-shore/`. Each must be genuinely different: shoots done there, favourite spots, local venues, a photo set
  from that area, and links to the services offered there. **Don't** make one page per town by swapping the town name
  in the same text. Google treats that as doorway pages and it can hurt the whole site.
- **Location + service pages** (for example `/real-estate/cherry-hill/`) only once there's enough real work in that
  town to fill one.
- **Signals outside the site matter as much:** reviews on Google Business Profile that mention the town ("our proposal in
  Margate"), listings with the same business details (P3), and local links (P3).

### 12. Image alt text and filenames
The current alt text is good: descriptive and natural. Build on it:
- **Pattern:** what's in the photo + context + location *when true*. For example: "A couple shows off her engagement ring on
  marble steps in Philadelphia", not "Philadelphia engagement photographer engagement photos NJ".
- Mention the location in about 1 photo in 3, and never list keywords.
- Decorative images and images that sit next to the same text as a caption keep `alt=""` (the reel posters do
  this correctly today).
- **Filenames:** name new images descriptively (`brigantine-beach-proposal.jpg`, `cherry-hill-dining-room-listing.jpg`).
  Rename existing files only when they move onto new pages, since every reference to the old name has to change too.
- Keep `width`/`height` on every image (already done), which prevents layout shift.

### 13. Image speed (a ranking factor through Core Web Vitals)
- The `images/web/` photos are single JPEGs, some 1800–2000px wide, even when shown at 230px (the Services cards).
  Give them the same 800/1600px WebP + JPEG versions and `srcset` that `images/bella/` already uses.
- Keep `loading="lazy"` below the fold. Don't lazy-load the hero poster.
- Check the home page with PageSpeed Insights (mobile) after each big change. Aim for LCP under 2.5s.

### 14. More structured data
- **`Service`** on each service page (name, description, `provider` → `#business`, `areaServed`).
- **`BreadcrumbList`** on inner pages.
- **`VideoObject`** for each reel on the page where it plays (name, description, `thumbnailUrl` = poster, `uploadDate`,
  `contentUrl`). This makes the reels eligible for video results.
- **`ImageObject` licence metadata** (`creator`, `copyrightNotice`, `creditText`, `license`) on portfolio images. Google
  Images then shows her credit.
- **Reviews:** put real client testimonials on the pages. Don't add star-rating schema for her own reviews, since Google
  ignores self-published reviews for businesses. The Google Business Profile reviews are what produce stars.
- Test every page with Google's Rich Results Test and the Schema Markup Validator after adding schema.

---

## P3: Ongoing

### 15. Portfolio stories / blog
One post per real shoot, which is the long-tail content that ranks for venue and place searches:
"A sunrise proposal in Brigantine", "Listing photos for a Haddonfield family home", "Courtside with Drexel women's basketball".
Each post has 10–20 photos, 300–500 words, the location and venue named, and links to the service page and Contact.
One to two posts a month is plenty.

### 16. Links and directory listings
- **Directory listings with the same business details:** Google Business Profile, Bing Places, Apple Business Connect, Yelp, The Knot,
  WeddingWire/Zola (if she does weddings and engagements), and local chamber of commerce listings.
- **Links:** ask venues, planners, florists and real estate agents she's worked with to credit and link her. Submit proposal
  and engagement sessions to wedding blogs. Offer press-ready photos to local outlets. The *Suburban Life* cover in her
  gallery is exactly the kind of credit that should link back.
- **Instagram:** the bio link goes to the site (or a specific service page during campaigns). Use location tags on posts.

### 17. Measure
- Search Console: impressions and clicks for "[service] + [area]" searches, pages indexed, and Core Web Vitals.
- Google Business Profile insights: calls, website clicks and direction requests.
- If analytics is added (a privacy-friendly option such as Plausible or GoatCounter), **update `privacy.html` first**: it
  currently says the site uses no analytics.
- Review monthly. Adjust page copy toward searches that get impressions but few clicks (rewrite titles and descriptions).

---

## Searches to target (check volumes before committing)

No search volume data was used to write this plan. Before writing service pages, check these in Google Keyword Planner or
Search Console (once live) and keep the ones with real local demand:

- proposal photographer Philadelphia / South Jersey / Jersey Shore
- engagement photographer South Jersey / Philadelphia
- real estate photographer South Jersey / Cherry Hill / Philadelphia
- real estate drone photography NJ
- event photographer Philadelphia / South Jersey
- concert photographer Philadelphia
- sports photographer Philadelphia
- social media content creator for small businesses Philadelphia / NJ
- wedding content creator NJ / Philadelphia

---

## Order of work (checklist)

- [ ] **P0** Custom domain + `CNAME`
- [x] **P0** Canonical tags on every page (keeps the preview out of the index). Done, pointing at `harryd12323.github.io/social-hour-site/`. Change them when the custom domain is live
- [ ] **P0** Home page title / description / `<h1>` text
- [ ] **P0** Search Console + Google Business Profile + `sitemap.xml` + `robots.txt`
- [ ] **P0** Confirm business details and service area with Bella
- [ ] **P0** FAQ answers filled in, then remove `noindex` from `faq.html`
- [ ] **P0** LocalBusiness / ProfessionalService JSON-LD on the home page
- [ ] **P1** Decide: keep hand-built HTML or move to a small static site generator
- [ ] **P1** Service pages (engagements/proposals, real estate, events/concerts, sports, brand content; weddings if offered)
- [ ] **P1** Internal links: cards → pages, page ↔ FAQ, footer Services column, breadcrumbs
- [ ] **P1** Open Graph / Twitter tags + favicon on every page
- [ ] **P2** Three location pages (South Jersey, Philadelphia, Jersey Shore) with original content
- [ ] **P2** Alt text pass + descriptive filenames on new images
- [ ] **P2** Responsive WebP versions for `images/web/`
- [ ] **P2** Service, Breadcrumb, VideoObject and image licence schema
- [ ] **P3** One or two portfolio stories a month
- [ ] **P3** Directory listings + vendor/agent links + reviews
- [ ] **P3** Monthly Search Console / Google Business Profile review
