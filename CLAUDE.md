# Claude Instructions for This Repo

## Who you're talking to

**Default: assume Allison.** Allison is not a developer. When discussing technical topics, use plain language and analogies — for example, explain a git commit as "saving a named snapshot of your work," explain a static site as "a printed flyer — looks the same for everyone, no moving parts."

If the person says they're Michael, switch to developer-level communication. Michael is a professional software developer.

## Project structure

- `claude_code_projects/` is the repo root and a uv workspace.
- **Use plain directories by default** for new projects. Only upgrade to a uv package (with `pyproject.toml`) when a project needs Python dependencies.
- Each project lives in its own subdirectory: `project_name/`

To add a Python project as a uv package when needed:
```bash
/Users/Allison/.local/bin/uv init --package project_name
/Users/Allison/.local/bin/uv add --package project-name some-dependency
```

## Public site (GitHub Pages)

The repo publishes to `https://thundercat1.github.io/allison-development-environment/` via Jekyll.

**Before making any area of the repo public:**
1. Confirm with the user whether the project/content should be publicly visible
2. If not, add it to the `exclude:` list in `_config.yml`
3. If yes, make sure it's linked from `index.md`

**Before every `git push`**, remind Allison that pushing will update the live public website within ~60 seconds. For major visual changes, suggest running a local preview first (see below).

### What Jekyll publishes vs. skips
- `.html` and `.md` files are published (Jekyll passes raw HTML through untouched)
- Anything in the `exclude:` list in `_config.yml` is not published to the site
- `hello_world/` and Python packaging files (`*.toml`, `*.lock`) are already excluded

> **IMPORTANT: `_config.yml` is NOT a privacy control.** The repo is public. Everything pushed to it is visible to anyone on GitHub — `_config.yml` only controls what appears on the website. If something is sensitive (API keys, personal data, private work), it must never be committed to this repo at all. Use `.gitignore` to prevent accidental commits, and confirm with the user before pushing anything that could contain sensitive content.

## Static vs. interactive

**Default: static HTML + JS.** At the start of any new project, confirm with the user:
- Static = HTML + JS files, no server needed, can be hosted on GitHub Pages. Good for demos, displays, tools that don't need to save data.
- Interactive = needs a Flask backend (Python), a database (SQLite), and a server to run. Necessary when the app needs to store data, handle logins, process forms, etc.

Only reach for Flask + SQLite when static genuinely won't work.

## Safety rails

- **Never commit secrets.** Always add `.env` files, API keys, and credentials to `.gitignore` before touching them.
- **Always warn before `git push`** that it will update the live public site.
- **Suggest a local preview** before pushing if: (a) the user asks, (b) something looks broken, or (c) the change is a major visual update.

## Local preview (Jekyll)

Use this to preview the site locally without pushing. Only run when debugging or when the user asks.

```bash
# Requires Ruby + Bundler. Run once to install:
gem install bundler jekyll

# Then to preview:
bundle exec jekyll serve
# Site will be at http://localhost:4000
```

If Jekyll isn't installed or throws errors, diagnose before pushing — don't push blind and rely on GitHub Actions to catch it.

## Running Python projects

The Bash tool runs non-interactively and doesn't load `.zshrc`, so `uv` won't be on PATH. Always use the full path:
```bash
/Users/Allison/.local/bin/uv run --package package-name entry-point
```

In Allison's own terminal, `uv` works normally.

## Git

Credentials are stored in macOS Keychain via `git credential-osxkeychain`. Pushes should work without prompting.

If a push fails with auth errors, check that the remote URL doesn't have a token embedded:
```bash
git remote -v
# Should show: https://github.com/thundercat1/allison-development-environment.git
# NOT: https://oauth2:token@github.com/...
```

## Teaching approach for Allison

When explaining concepts, lead with an analogy before the technical detail:
- Git push → "like uploading your saved document so others (and the website) can see the latest version"
- Virtual environment → "like a separate toolbox for each project so tools don't clash"
- Flask → "the waiter between the webpage and the database — takes requests and brings back answers"

Keep explanations brief. One analogy, one sentence of detail. Offer to go deeper if asked.
