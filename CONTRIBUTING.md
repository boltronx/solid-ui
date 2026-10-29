# Contributing

Thanks for helping. Bug reports, fixes, docs and new components are all welcome. For anything
larger than a small fix, please open an issue first so we can agree on the approach.

## Setup

You need Node.js 24.22.1 (see `.nvmrc`) and pnpm 12 (pinned via `devEngines.packageManager` in `package.json`; pnpm switches to it automatically).

```sh
pnpm install
pnpm dev        # builds the library in watch mode and serves the docs at http://localhost:5173
pnpm dev:server # the same, with a server-rendered, hydrated page at http://localhost:3000
```

## Project layout

```
packages/solid-ui/          the published library
  src/components/<Name>/    one folder per component: <Name>.tsx, <Name>.css, <Name>.test.tsx
  src/styles/               tokens.css (theme variables), base.css, global.css
  scripts/build-css.mjs     combines the CSS files into dist/styles.css and dist/components.css
apps/docs/                  the documentation site (GitHub Pages)
  src/demos/<section>/      each demo is a file; the docs show its source next to it
apps/ssr-playground/        a page rendered on the server and hydrated (`pnpm dev:server`)
```

## Conventions

- **Styles.** A component's CSS lives next to it and only targets its own `bx-<Name>` classes.
  Variants and states are `data-*` attributes (`data-variant="primary"`), not extra classes. Use
  tokens from `tokens.css`, never literal colors; if a value is missing, add a token. The tests in
  `test/css.test.ts` enforce these rules.
- **Forms.** An input works uncontrolled (`defaultValue`, restored by `form.reset()`) and
  controlled (`value` + `onChange`), and submits through `FormData` under its `name`. Add a test
  for both when you add an input.
- **Accessibility.** Label every control, keep keyboard support, and prefer native elements.

## Before you open a pull request

```sh
pnpm check      # format, spelling, lint, build, typecheck, tests, package checks
```

CI runs the same checks. `pnpm format` and `pnpm lint:fix` fix most issues automatically.

## Releasing (maintainers)

Releases publish `packages/solid-ui` to npm with
[provenance](https://docs.npmjs.com/generating-provenance-statements), through npm trusted
publishing, so no npm token is stored anywhere.

**Automatic:** change `version` in `packages/solid-ui/package.json` in a pull request and merge
it. The Release workflow publishes that version, tags it `vX.Y.Z` and creates a GitHub release
with generated notes.

**Manual:** Actions → Release → Run workflow. Enter a bump (`patch`, `minor`, `major`,
`prerelease`, ...) or an exact version, or leave it empty to publish the version already in
`package.json`. Prereleases go to the `next` dist-tag unless you pick another.

Re-running a failed release is safe: each step is skipped if it already happened.

### One-time setup

1. **First publish by hand**, since trusted publishing can only be configured on a package that
   exists: `pnpm --filter @boltronx/solid-ui build`, then `npm publish --access public` from
   `packages/solid-ui`.
2. **On npmjs.com**, open the package → Settings → Trusted publishing → GitHub Actions, and enter
   the `boltronx` organization, the `solid-ui` repository, the workflow file `release.yml` and the
   environment `npm`.
3. **On GitHub**, create the `npm` environment (Settings → Environments). Add yourself as a
   required reviewer to approve each release, and limit it to the `main` branch.
4. **Manual bumps push a commit to `main`.** If `main` has a ruleset that blocks direct pushes,
   either add GitHub Actions to its bypass list, or release by pull request (the automatic path).
5. **GitHub Pages**: Settings → Pages → Source: GitHub Actions.
6. **Run history**: the Clean up workflow deletes completed runs older than 7 days every night,
   except Release runs, which npm provenance links to. To also expire their logs and artifacts
   sooner, set Settings → Actions → General → Artifact and log retention.
