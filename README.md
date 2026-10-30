# Matrix Digital Rain

Interactive Matrix digital-rain editor with WebGPU, WebGL2, and standalone HTML export.

[Open the live demo](https://gvastethecreator.github.io/matrix/).

## Use the editor

Pick a preset card in **Presets** (filter by group: classic, color, depth, motion, glitch, reveal, live), press **mutate** to change three to five random controls at a time, and use the other tabs to adjust the character set, colors and palettes, motion (including **Wave**), depth layers, and pointer effects. **Reveal** shapes the rain from a message, an uploaded image, or the live camera; **Invert** swaps light and dark for image and camera sources. **Input → Mic reactive** makes the rain speed up, glow, and splash with the microphone; **Sensitivity** scales the response. Double-click a slider to reset it. **Export HTML** copies a standalone page and downloads it if clipboard access fails. **Descargar** downloads the page directly. The side panel opens and closes with H or Escape, and the controls fade out after a few seconds without input.

The editor saves your configuration in browser storage. It does not need an API key or an application backend. Exported pages load Three.js from a CDN and need a network connection.

The renderer uses WebGPU when available and WebGL2 otherwise. Add `?webgl` to force WebGL2. Density supports up to 8,000 columns within a total budget of 1,000,000 glyphs. This is a capacity limit, not an FPS guarantee. Frame rate depends on the GPU, resolution, glyph size, and overlap.

## Run locally

Use Node.js 22.12 or later and pnpm 12. Install the locked dependencies and start the editor:

```sh
pnpm install --frozen-lockfile
pnpm dev
```

Open `http://127.0.0.1:3000`.

## Development commands

The scripts in `package.json` are the command source of truth. VS Code tasks expose the same commands.

| Command             | Purpose                                                                                                                  |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------ |
| `pnpm dev`          | Start the development server.                                                                                            |
| `pnpm check`        | Run types, lint, formatting, dead-code checks, build, and tests.                                                         |
| `pnpm test`         | Run configuration, persistence, and export tests with `node --test`. Build first to include the production-bundle check. |
| `pnpm typecheck`    | Check TypeScript without emitting files.                                                                                 |
| `pnpm lint`         | Run Oxlint.                                                                                                              |
| `pnpm format`       | Apply Oxfmt formatting.                                                                                                  |
| `pnpm format:check` | Check formatting without writing files.                                                                                  |
| `pnpm deadcode`     | Find unused files, exports, and dependencies with Knip.                                                                  |
| `pnpm build`        | Build the app into `dist/`.                                                                                              |
| `pnpm start`        | Serve an existing local build at `http://127.0.0.1:4173`.                                                                |
| `pnpm preview`      | Preview the static build with Vite.                                                                                      |

`pnpm start` accepts `HOST` and `PORT` environment variables. Its defaults are `127.0.0.1` and `4173`.

See the [contributor architecture overview](docs/ARCHITECTURE.md) for module ownership and supported boundaries.

## GitHub Pages

Pushes to `main` deploy through `.github/workflows/pages.yml`. You can also select **Run workflow** in Actions. The single job installs the locked dependencies, runs `pnpm build --base=/matrix/`, and publishes `dist/`. Pages serves static files and does not run `server.mjs`.

To preview the Pages build locally:

```sh
pnpm build --base=/matrix/
pnpm preview --base=/matrix/ --host 127.0.0.1
```

Open `http://127.0.0.1:4173/matrix/`. Development with `pnpm dev` uses `/`.

## License

[MIT](LICENSE).
