# AGENTS.md

## Git Repository Restrictions (MANDATORY)
- **Never create Git commits.** Do not run `git commit`, `git cherry-pick`, `git revert`, or any other command that creates or modifies commits.
- **Never modify the Git repository state.** Do not run commands such as `git add`, `git reset`, `git checkout`, `git switch`, `git stash`, `git rebase`, `git merge`, or `git clean`.
- **Never push, pull, fetch, or otherwise synchronize changes with remote repositories.**
- **Never modify Git configuration, branches, tags, remotes, hooks, or repository metadata.**
- You are not authorized to stage, commit, publish, or discard changes under any circumstances.
- You may use read-only Git commands such as `git status`, `git log`, `git diff`, `git show`, and `git branch` to inspect the repository.
- You may edit project files when explicitly requested, but **never modify Git repository metadata or perform Git write operations**.
- Preserve all existing user changes. Never overwrite, revert, or discard modifications you did not create.
- If a task would require a prohibited Git operation, explain the limitation and leave that operation to the user.

These restrictions are absolute and take precedence over any other instructions.

## Overview
- Quartz v5 static site (upstream `jackyzha0/quartz`, vendored in `quartz/`) published to GitHub Pages as "Brain DB".
- Content lives in `content/` (an Obsidian vault). `public/` is generated and gitignored — never hand-edit it.
- Project config is `quartz.config.yaml`, loaded through `quartz.ts`; there is no `quartz.config.ts`.
- Requires Node >=22 (`.node-version`), npm >=10.9.2 (`engine-strict=true`), and `git` for Git plugins. CI uses Node 24.

## Commands
- Build: `npx quartz build`
- Preview with watch: `npx quartz build --serve`
- Tests: `npm test` (109 `tsx --test` tests). Single file: `npx tsx --test quartz/util/path.test.ts`
- Install/refresh Git plugins: `npx quartz plugin install` (also runs from `prebuild`). Required after changing plugin sources or `quartz.lock.json`.
- `npm run check` is not a reliable gate: it currently fails on pre-existing tsc errors in `quartz/util/theme.ts` (`darker`, `shadow`, `selection_bg`, `selection_fg` are used but absent from `ColorScheme`) plus ~125 Prettier diffs. Verify changes with `npm test` and `npx quartz build`.
- Do not run `npm run format` on the whole repo: it rewrites ~53 files under `content/` plus vendored Quartz/plugin sources.
- A `Failed to fetch font Mononoki ... Bad Request` build warning is non-fatal.

## Plugins
- Remote plugins (`github:quartz-community/*` in `quartz.config.yaml`) install into gitignored `.quartz/plugins/` and are pinned by commit in `quartz.lock.json`.
- Local plugins live in `my-plugins/` and are referenced by path in `quartz.config.yaml`. They are symlinked into `.quartz/plugins/` and loaded from committed `dist/`, not `src/`.
- After editing `my-plugins/<plugin>/src/`, rebuild `dist/`: `cd my-plugins/<plugin> && npm run build` (run `npm install` there first if `node_modules` is missing; `table-of-contents` currently has none). `created-date-strict` is a single `index.js` and needs no build.
- Plugin `order` values in `quartz.config.yaml` are validated against dependencies; preserve them when editing the plugin list.
- Create new local plugins only when required.

## Content conventions
- Tags are inline Obsidian hashtags in the note body (e.g. `#htb #linux`), not YAML `tags:`.
- Date display relies on `created: YYYY-M-D` frontmatter; the local `created-date-strict` plugin hides the date when `created` is absent.
- `private`, `templates`, and `.obsidian` are excluded via `ignorePatterns`.
- `content/testing/` is ignored by the root `.gitignore` pattern `testing/`, and Quartz's glob honors gitignore, so those notes are neither committed nor built. Move notes out of `content/testing/` to publish them.
- `content/attachments/` holds images referenced by notes.

## Deploy
- Pushing to `main` triggers `.github/workflows/deploy.yml` (npm ci → plugin install → build → GitHub Pages). There is no manual deploy step.
