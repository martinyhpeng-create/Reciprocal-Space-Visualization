# Reciprocal Lab

A browser-based crystallography explorer with linked real-space and reciprocal-space 3D views.

## Publish on GitHub Pages — no installation needed

The `docs/` folder is already built and ready to publish. Visitors do not need a GitHub or ChatGPT account.

1. Create a **public** GitHub repository named `reciprocal-lab`. You can enable **Add README** when creating it.
2. Extract the download. Open the inner `reciprocal-lab` folder.
3. In your repository, select **Add file → Upload files**. Drag the **contents** of that folder into the upload area. Upload the folders themselves so their contents keep their paths. Do not upload the ZIP or the enclosing `reciprocal-lab` folder.
4. Commit the upload to `main`. At the repository's top level you should see `docs`, `src`, `public`, `vendor`, `tests`, and `package.json`.
5. Open **Settings → Pages**. Under **Build and deployment**, choose **Deploy from a branch**, then **main** and **/docs**. Click **Save**.
6. Wait for GitHub's Pages deployment. The same settings page will show **Visit site**. Initial publication can take up to 10 minutes.
7. Open that site in a private/incognito window to verify that it works without signing in. Try (100), (200), a skew cell, and a guided experiment.

Your normal project-site URL is `https://YOUR-USERNAME.github.io/reciprocal-lab/`. Use the exact link GitHub shows after publication. The repository's Code page is not the website.

### Common issues

- **The /docs option is missing:** Check that `docs` is at the repository root on `main`, not inside another `reciprocal-lab` folder.
- **You see the README instead of the app:** Select `/docs`, not `/(root)`, as the publishing folder.
- **First visit gives 404:** Check the Actions tab for the Pages deployment and allow it to finish.
- **A ZIP appears in the repository:** Extract it on your computer and upload its contents; GitHub Pages does not extract ZIP files.
- **The model does not load:** Confirm that `docs/assets/` was uploaded along with `docs/index.html` and `docs/favicon.svg`. Enable JavaScript in the browser.

## What is included

- Linked 3D views with orbit, zoom, reciprocal-point picking, and keyboard camera controls.
- Six primitive-cell presets and custom parameters.
- Miller indices from −4 to 4; negative indices and the 000 origin are handled explicitly.
- Live plane spacing and reciprocal length.
- Normal/direction comparison, a z = 0 section, and two reciprocal conventions.
- Five guided experiments, with three steps each.

The model represents ideal primitive translation lattices. It does not calculate diffraction intensities, atomic form factors, systematic absences, or an Ewald-sphere construction.

## Edit the app later

Requires Node.js 22.13 or newer. Open this folder in VS Code and use its terminal:

```bash
npm install
npm run dev
```

After editing the source:

```bash
npm test
npm run build
```

`npm run build` recreates `docs/`. Commit and upload the updated `docs` files, including its `assets` folder. GitHub Pages automatically republishes changes to the selected `main` branch and `/docs` folder. **Editing source files alone does not update the published app; rebuild first.**

The `base: './'` setting keeps asset URLs relative so the app can run under a GitHub project subdirectory. The logo also links to `./`.

## Source map

- `src/reciprocal-lab.tsx`: interface, controls, and guided lessons.
- `src/lattice-view.tsx`: canvas 3D renderer and interactions.
- `src/lib/lattice.ts`: basis vectors, reciprocal vectors, and plane clipping.
- `src/globals.css`: visual styles.
- `tests/lattice.mjs`: numerical checks.
- `docs/`: ready-to-publish website.

## Validation

The standalone TypeScript check, production build, and numerical tests passed when this package was prepared. The tests cover dual-basis identities for all six presets, clipped plane equations, known cubic spacings, inverse scaling, skew cells, negative indices, the origin, and invalid cell rejection. Full browser interaction QA was not available in the preparation environment.

## Scientific reference

International Union of Crystallography: https://www.iucr.org/what-we-do/education/pamphlets/reciprocal-lattice

## Third-party software

The app uses React, Radix UI, Lucide, Tailwind CSS, and shadcn/ui-style components. Bundled dependency notices are in `THIRD_PARTY_NOTICES.txt`. No project-wide license has been selected for the original app code; choose one if you want to explicitly permit others to reuse it.
