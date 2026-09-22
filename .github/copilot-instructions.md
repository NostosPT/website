# GitHub Copilot Instructions

## Boundaries & Workflow

- **Branch isolation**: Do not touch or commit to `main`. Always perform changes on `develop` or a feature branch.
- **Granular commits**: Commit logical changes incrementally.
- **Single-line commit messages**: Commit messages must always be a single line, brief, direct, and without multi-line bodies.
- **No co-authors**: Never include `Co-authored-by:` or any assistant attribution in commits.
- Git hooks in `.githooks/` enforce single-line commits, no co-authors, and block direct commits to `main`.
