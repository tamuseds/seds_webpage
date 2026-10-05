# Sponsor logos

Add SVG, PNG, JPG, WebP, GIF, or AVIF files here, then run from the project root:

```sh
node tools/update-sponsor-logos.mjs
```

Commit the images and generated `logos.js` together. Run the command again after
adding, removing, or renaming logos. A static website cannot list folder contents
on its own, so `logos.js` supplies the filenames without needing a backend.

Use sponsor names as filenames (for example, `Acme-Aerospace.svg`); filenames
become accessible image descriptions. Logos display alphabetically, retain their
aspect ratios, and sit on white cards so dark logos stay visible.

The donations page adjusts card sizes and loop duration to the logo count and
screen width. Hover or focus pauses movement; the pause button also works on
touchscreens. Reduced-motion preferences show a static, wrapping logo list.
The section stays hidden until at least one logo loads successfully.
