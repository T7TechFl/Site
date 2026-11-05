# T7 Technology Solutions website

Source for https://t7techfl.com, hosted on Netlify (project: t7techsite, https://t7techsite.netlify.app).

- `index.html`: home page
- `thanks.html`: shown after the contact form is submitted (Netlify Forms)
- `leak-finder/index.html`: the free Leak Finder scorecard at /leak-finder. Its Netlify form is named `leak-finder`; each submission carries the visitor's score, Yes answers and dollar estimates.
- `hourly/index.html`: the free "What's your hour worth?" calculator at /hourly. Its Netlify form is named `hour-worth`; the result also carries into the Leak Finder's hourly value.
- `favicon.svg`: browser tab icon
- `netlify.toml`: tells Netlify to publish this folder as-is (no build step)

Pushing to `main` deploys the site automatically once the repo is linked in Netlify.
