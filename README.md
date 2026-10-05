# TAMU SEDS Website

A static HTML/CSS/JS rebuild of the TAMU SEDS Google Site, with an animated
slide-out sidebar menu that's easy to extend with new pages.

## Folder structure

```
tamu-seds/
├── index.html              ← homepage
├── css/
│   └── style.css           ← all site styling (colors, layout, fonts)
├── js/
│   ├── nav-config.js        ← EDIT THIS to add/remove/reorder pages
│   └── main.js               ← builds + animates the sidebar (no need to edit)
├── pages/
│   ├── _template.html        ← copy this to start a new page
│   ├── about.html            ← placeholder pages, ready to fill in
│   ├── missions.html
│   ├── team.html
│   ├── sponsors.html
│   └── contact.html
└── assets/
    ├── logo.png              ← add your circular logo here
    └── advisors/              ← advisory board headshots go here
```

## How to add a new subpage

1. Copy `pages/_template.html` and rename it, e.g. `pages/gallery.html`.
2. Edit the title and the content section inside it.
3. Open `js/nav-config.js` and add one line to the `NAV_LINKS` array:
   ```js
   { label: "Gallery", href: "/pages/gallery.html" },
   ```
4. Save. The sidebar link appears automatically on every page — nothing
   else needs to change.

## Adding real images

Right now the hero background, advisory-board photos, and logo are
placeholders (CSS gradients / solid boxes) so the site works before any
images are added. Drop your real files into `assets/` using these names
(or update the paths in `index.html` / `style.css` to match your filenames):

- `assets/logo.png` — the circular TAMU SEDS logo in the header
- `assets/hero-nebula.jpg` — the hero background photo (then uncomment the
  `.hero { background-image: ... }` rule near the top of `css/style.css`)
- `assets/advisors/nachon.jpg`, `kennicutt.jpg`, `abell.jpg` — advisory
  board headshots

## Hosting note on link paths

`nav-config.js` uses root-relative links like `/pages/about.html`. This
works if the site is hosted at the root of a domain (e.g. a custom domain
or GitHub Pages with a custom domain). If instead it will live in a
subfolder (e.g. `yoursite.com/tamu-seds/`), either:

- change the links in `nav-config.js` to include that prefix
  (`/tamu-seds/pages/about.html`), or
- switch to relative paths (`pages/about.html` on the homepage,
  `../pages/about.html` inside `/pages/*.html`).

## Editing the footer embed

The dashed box in the footer is a placeholder for whatever you had
embedded on the Google Site (a form, a map, a newsletter signup, etc.).
Replace the `<div class="footer__embed">…</div>` in `index.html` with the
real embed code (an `<iframe>`, for example).

## Deployment and asset caching

GitHub Actions generates the sponsor logo list, assembles the site, and versions
local scripts, styles, and images by their content before deploying to Pages.
Changed assets receive new URLs automatically, including replaced sponsor images
with the same filename. Missing JavaScript or CSS files stop the build before
publication. Source HTML files keep their existing URLs for local previews.

Set the repository's Pages source to **GitHub Actions**. Push to `main` to deploy;
check the **Generate sponsor logos and deploy Pages** workflow for build results.
For local sponsor previews, run `node tools/update-sponsor-logos.mjs`.

## Previewing locally

Because the pages load CSS/JS from relative paths, open `index.html`
directly in a browser, or for the most accurate preview run a local
server from the `tamu-seds/` folder, e.g.:

```
python3 -m http.server 8000
```

then visit `http://localhost:8000`.

## Converting images to JPG

The project includes a small Pillow-based converter for HEIC/HEIF and other
common image formats. Install the dependencies from `requirements.txt`, then
pass the source folder to the converter:

```bash
python -m pip install -r requirements.txt
python tools/heic_to_jpg.py /path/to/my-images
```

This creates `/path/to/my-images-jpg` beside the source folder. Existing JPG
names are preserved when possible; if a name already exists, the converter
adds a numeric suffix. To convert nested folders while preserving their
structure, add `--recursive`. Images are resized to fit within `600x800`
pixels by default while preserving their aspect ratio. Set a different
maximum size with `--resolution WIDTHxHEIGHT`, for example
`--resolution 1200x1600`. Use `--overwrite` to replace existing JPGs.
