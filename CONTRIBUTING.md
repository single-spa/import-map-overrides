# Contributing

## Publishing

```sh
pnpm install
GITHUB_TOKEN=<token> pnpm exec changeset version
git add .
git commit -m "version number"
pnpm exec changeset publish
```
