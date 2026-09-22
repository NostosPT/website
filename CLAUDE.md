# Claude Agent Guidelines

## Critical Rules & Boundaries

- **Never commit directly to `main`**: All changes and commits must occur on `develop` or a dedicated feature branch. Check out a branch before making edits.
- **Granular commits**: Commit frequently and incrementally as logical tasks are completed.
- **Single-line commits only**: Every commit message must be strictly one line, brief and direct (e.g. `feat: description`, `fix: description`). No multi-line bodies.
- **No co-authors**: Under no circumstances should any co-author (`Co-authored-by:`) or AI attribution be added to commit messages.
- **Enforcement**: Repository hooks in `.githooks/` actively validate branch and commit message constraints.
