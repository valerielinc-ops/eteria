# eteria — coming soon

A static, mobile-first launch page for eteria. It is intentionally a sealed teaser: kinetic image collage, one rotating claim, email capture, and optional music.

## Configuration

All runtime configuration is at the top of `app.js`.

- **Email signups:** replace `https://formspree.io/f/YOUR_ID` in `FORM_ENDPOINT` with a Formspree form URL or a compatible endpoint that accepts `POST` JSON shaped as `{ "email": "..." }`.
- **Countdown:** set `SHOW_COUNTDOWN` to `true` and update `LAUNCH_DATE` with an ISO 8601 date including its timezone.
- **Images:** replace the paired files in `images/` while keeping the `image-01-400.webp` / `image-01-800.webp` naming pattern. Update `IMAGE_COUNT` if the number of image pairs changes.
- **Social preview:** replace `images/og-eteria-1200x630.webp` with a 1200×630 WebP and keep the same filename, or update the absolute Open Graph/Twitter URLs in `index.html`.
- **Music:** `AUDIO_PREVIEW_URL` points to the official Apple Music preview of “Movin’ To The Sun” by HUGEL, Imael Angel & Ultra Naté. If that remote preview is unavailable, the player tries `assets/movin-to-the-sun.mp3` and otherwise hides the sound control. Replace either constant at the top of `app.js` to change the track.
- **Canonical URL:** if a custom domain is connected, update the canonical, Open Graph, JSON-LD, `robots.txt`, and `sitemap.xml` URLs.

No build step or framework is required. Serve the repository root with any static server.

```sh
python3 -m http.server 4173
```

Then open `http://localhost:4173`.

## Quality checklist

- [x] Mobile-first layout designed for 360×640 and 390×844 viewports
- [x] Full viewport composition with no navigation or scrolling sections
- [x] Exactly one `<h1>`; JavaScript rotates its text without adding headings
- [x] Email-provider autocomplete, strict format/typo checks, inline feedback, loading/success states, and honeypot
- [x] Visible keyboard focus states and 44px+ primary tap targets
- [x] `prefers-reduced-motion` disables rotation and collage motion
- [x] No forced audio autoplay; playback starts only after button activation
- [x] Audio controls disappear gracefully when the file is missing
- [x] SEO title, description, canonical, robots, Open Graph, Twitter Card, and JSON-LD
- [x] Responsive WebP image pairs plus a preloaded poster image
- [x] `robots.txt` and `sitemap.xml` included

## GitHub Pages

The site is designed for deployment from the root of the `main` branch at:

`https://valerielinc-ops.github.io/eteria/`
