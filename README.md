# Carom

Carom is a browser based paddle duel built around spin and bank shots. Guide a paddle against an AI opponent or another local player while the ball curves from paddle motion and ricochets off two moving, rotating obstacles.

## Install and run

```sh
npm ci
npm run dev
```

Vite prints the local development URL. To produce the static production site:

```sh
npm run build
```

The finished site is written to `dist/` and can be served from the root of any static file host. `npm run preview` serves that build locally.

## Controls

- **Solo:** Player One moves with `W` and `S`; the right paddle is controlled by the AI.
- **Versus:** Player One uses `W`/`S`; Player Two uses `↑`/`↓`.
- **Menus:** `↑`/`↓` or `W`/`S` to choose, `Enter` or `Space` to confirm.
- **Pause/resume:** `P` or `Escape`.
- **Mute:** `M`.

Move as the ball meets your paddle to add spin to its flight. Reach 11 points and lead by two to win.
