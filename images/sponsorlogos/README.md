# Sponsor logos

Add SVG, PNG, JPG, WebP, GIF, or AVIF files here, then commit and push to `main`.
The GitHub Actions workflow in `.github/workflows/deploy-pages.yml` generates
`logos.js` and deploys the updated website automatically on every push to `main`.
It can also be started manually from the repository's Actions tab.

One-time setup: in the GitHub repository, open **Settings → Pages → Build and
deployment → Source** and select **GitHub Actions**. Commit and push the workflow
along with the website files to enable it.

The generated list is included in the deployed website; the action does not commit
it back to the repository. For a local preview, run from the project root:

```sh
node tools/update-sponsor-logos.mjs
```

Run the local command again after adding, removing, or renaming logos if you want
to preview those changes before pushing. A static website cannot list folder
contents on its own, so `logos.js` supplies filenames without needing a backend.

Use sponsor names as filenames (for example, `Acme-Aerospace.svg`); filenames
become accessible image descriptions. Logos display alphabetically, retain their
aspect ratios, and have transparent card backgrounds.

The donations page adjusts card sizes and loop duration to the logo count and
screen width. Hover pauses movement. Reduced-motion preferences show a static,
wrapping logo list.
The section stays hidden until at least one logo loads successfully.
