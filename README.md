# TeamForge

TeamForge is a static LoL team analysis tool.

## Public deploy

For rank sync in the public version, deploy the project root to Vercel.

- Entry file: `public/index.html`
- Rank sync API: `api/ranks.js`
- Data storage: browser localStorage
- Rank sync: available on Vercel through `/api/ranks`

## Easy options

- Vercel: import this repository root. Do not deploy only the `public` folder.
- Netlify: drag and drop the `public` folder
- GitHub Pages: use the `docs` folder

## Vercel

Use Vercel when you want public rank sync.

1. Import the GitHub repository into Vercel.
2. Keep the project root as the root directory.
3. Deploy.
4. Open the Vercel URL.

The app is served from `public/index.html`, and rank sync is served from `api/ranks.js`.

## GitHub Pages

1. Create a GitHub repository.
2. Push this project to GitHub.
3. Open repository Settings.
4. Go to Pages.
5. Set Source to `Deploy from a branch`.
6. Select branch `main` and folder `/docs`.
7. Save, then open the generated Pages URL.

GitHub Pages cannot run the local rank sync server. TeamForge still works as a static analysis tool, and rank sync remains available on the local `http://127.0.0.1:8790/` version.

If you want GitHub Pages to call a separately deployed Vercel API, set this once in the browser console on the GitHub Pages version:

```js
localStorage.setItem("teamforge-rank-api-url", "https://YOUR-VERCEL-PROJECT.vercel.app");
```
