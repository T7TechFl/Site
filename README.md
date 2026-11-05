# T7 Technology Solutions website

Source for https://t7techfl.com, hosted on Netlify (project: t7techsite, https://t7techsite.netlify.app).

- `index.html`: home page
- `thanks.html`: shown after the contact form is submitted (Netlify Forms)
- `leak-finder/index.html`: the free Leak Finder scorecard at /leak-finder. Its Netlify form is named `leak-finder`; each submission carries the visitor's score, Yes answers and dollar estimates.
- `favicon.svg`: browser tab icon
- `netlify.toml`: tells Netlify to publish this folder as-is (no build step)

Pushing to `main` deploys the site automatically once the repo is linked in Netlify.
