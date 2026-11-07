# Sushma's 21st Birthday Experience

A five-stage birthday experience created by Maverick for Sushma. The project keeps its original Three.js scenes, archery opening, candle interaction, gift reveal, personal letter and galaxy finale.

## Run locally

1. Install Node.js (LTS).
2. From the project folder, run `npm install`.
3. Run `npm run dev` and open the local URL printed by Vite.

For a production build, run `npm run build`. The generated static site is in `dist/`; `npm run preview` serves that build locally.

## Deploy

Deploy the contents of `dist/` to a static web host such as GitHub Pages, Netlify or Vercel. Configure the host to serve `index.html` as the site entry point.

## Notes

- The interface remains usable without microphone permission; manual candle controls are provided.
- Sound starts only after the visitor uses the sound control. It can remain off throughout the experience.
- Three.js, GSAP, Canvas Confetti and the fonts are loaded from third-party CDNs, so those effects and fonts require an internet connection. If Three.js or WebGL is unavailable, the page displays a notice and the stage controls remain available.
- Microphone input generally requires `localhost` or a secure HTTPS deployment.
