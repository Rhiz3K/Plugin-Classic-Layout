# Contributing to Classic Layout

## Development

```bash
npm run build      # build into dist/
npm run test       # run this plugin's tests
npm run typecheck  # type-check this plugin
npm run validate   # check manifest.json
npm run format     # format the code with Prettier
```

## Docs

The docs for this plugin are in [docs/](docs/) and are published at https://docs.termix.site/plugins/classic-layout. Settings, permissions, services, environment variables and the API reference are made from `manifest.json` and the `@openapi` comments in the code, so keep those up to date instead of writing them by hand. See [writing docs](https://docs.termix.site/develop/docs).

## Settings search

The Settings search reads `src/frontend/settings/settings-search-index.ts`, which is made from the settings sections. After you change one, run:

```bash
npm run generate:settings-index
```
