# TeamForge

TeamForge is a static LoL team analysis tool.

## Public deploy

Deploy the `public` folder as a static site.

- Entry file: `public/index.html`
- Data storage: browser localStorage
- Rank sync: requires a separate `/api/ranks` endpoint. The static public version works without it.

## Easy options

- Vercel: import this folder and set Output Directory to `public`
- Netlify: drag and drop the `public` folder
- GitHub Pages: use the `docs` folder

## GitHub Pages

1. Create a GitHub repository.
2. Push this project to GitHub.
3. Open repository Settings.
4. Go to Pages.
5. Set Source to `Deploy from a branch`.
6. Select branch `main` and folder `/docs`.
7. Save, then open the generated Pages URL.

GitHub Pages cannot run the local rank sync server. TeamForge still works as a static analysis tool, and rank sync remains available on the local `http://127.0.0.1:8790/` version.
