# Claude Agent Guidelines

## Critical Rules & Boundaries

- **Never commit directly to `main`**: All changes and commits must occur on `develop` or a dedicated feature branch. Check out a branch before making edits.
- **High-frequency granular commits**: Commit frequently with high granularity. Commits should not contain more than 1 or 2 files. Commit incrementally as each file or unit is completed.
- **Single-line commits only**: Every commit message must be strictly one line, brief and direct (e.g. `feat: description`, `fix: description`). No multi-line bodies.
- **No co-authors**: Under no circumstances should any co-author (`Co-authored-by:`) or AI attribution be added to commit messages.
- **Feature-based directory organization**: Organize code using directories grouped by feature or domain. If functions can be grouped in a feature folder, do so. Make the source tree intuitive to navigate without opening files.
- **Enforcement**: Repository hooks in `.githooks/` actively validate branch and commit message constraints.
