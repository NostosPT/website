# AI Agent Guidelines & Boundaries

These instructions apply to all AI models, coding agents, automated tools, and contributors working on this repository.

The repository owner has final authority over architecture and product decisions. When requirements are unclear, inspect the existing code and documentation first. Do not invent missing requirements.

---

## 1. Repository Safety

### Main branch

* `main` is protected.
* Never make changes directly on `main`.
* Never commit directly to `main`.
* All work must happen on a dedicated branch:

  * `feat/<name>`
  * `fix/<name>`
  * `chore/<name>`
  * `refactor/<name>`
  * `docs/<name>`

Before modifying files, verify:

```bash
git branch --show-current
```

If currently on `main`, stop and create or switch to an appropriate working branch.

Never force-push or rewrite shared branch history unless explicitly requested.

---

## 2. Read Before Changing

Before making changes:

1. Read this `AGENTS.md`.
2. Inspect the existing project structure.
3. Inspect the relevant implementation.
4. Inspect existing types, utilities, configuration, and API contracts.
5. Check whether the requested functionality already exists.
6. Prefer extending existing code over creating duplicate implementations.

Never assume a file, component, route, API endpoint, database table, environment variable, or service exists.

Do not invent architecture when the repository already contains an established pattern.

---

## 3. Plan Before Implementation

For non-trivial work, use plan mode first.

The plan must identify:

* objective;
* current implementation;
* files that will change;
* files that will be created;
* database/schema implications;
* API implications;
* security implications;
* testing/verification;
* dependencies;
* unresolved decisions.

Do not implement a large architectural change before the plan has been reviewed and approved when explicit approval is requested.

For small, obvious fixes, planning may be lightweight.

---

## 4. Scope Control

Implement only what the current task requires.

Do not:

* refactor unrelated code;
* rename unrelated files;
* redesign existing UI;
* upgrade dependencies without a reason;
* change authentication while fixing an unrelated issue;
* modify database schema without identifying the reason;
* introduce new libraries when existing functionality is sufficient;
* "clean up" unrelated lint/type issues;
* change behavior outside the requested scope.

If an issue is discovered outside the scope, report it separately instead of silently fixing it.

Minimal, targeted changes are preferred.

---

## 5. Architecture Principles

### Existing code first

Prefer the existing architecture, conventions, utilities, and abstractions unless there is a documented reason to change them.

Before creating a new abstraction, check whether an equivalent already exists.

Avoid:

* duplicate utilities;
* duplicate types;
* parallel implementations;
* unnecessary wrapper layers;
* speculative abstractions.

### Feature/domain organization

Organize code by feature or domain where appropriate.

Related functionality should live together rather than being scattered across generic catch-all directories.

Examples:

```text
src/
├── lib/
│   ├── server/
│   │   ├── auth/
│   │   ├── uploads/
│   │   └── external/
│   └── components/
└── routes/
    ├── admin/
    └── api/
```

Do not force artificial directory structures onto simple functionality.

---

## 6. Security

Security-sensitive functionality must be implemented server-side.

Never expose secrets, private credentials, signing keys, or server-only environment variables to the browser.

Never trust client-provided:

* filenames;
* MIME types;
* file extensions;
* IDs;
* roles;
* permissions;
* prices;
* ownership;
* authentication state.

Validate security-sensitive data on the server.

For uploads:

* validate file size;
* validate actual file type/magic bytes;
* validate allowed formats;
* sanitize filenames;
* prevent path traversal;
* reject unsupported active content such as SVG unless explicitly required;
* never rely exclusively on the browser's `accept` attribute.

For authentication:

* do not invent authentication protocols;
* do not introduce JWT unless explicitly requested;
* keep secrets server-side;
* use secure cookie attributes where applicable;
* enforce authorization server-side;
* never rely on client-side guards as the security boundary.

Security changes must not weaken existing protections for convenience.

---

## 7. API & Database Rules

The API is a contract, not an implementation detail.

Before creating or changing an endpoint:

* inspect existing routes;
* inspect existing request/response types;
* inspect database schema;
* inspect migrations;
* inspect frontend consumers;
* inspect authentication boundaries.

Never invent an external API contract without evidence.

When an API does not yet exist, define the contract before implementing the frontend integration.

Database changes must:

* have a clear purpose;
* preserve existing data where possible;
* include migrations when required;
* maintain referential integrity;
* use appropriate constraints and indexes;
* avoid storing unnecessary personal data.

Never modify production-oriented data structures based solely on assumptions.

---

## 8. Environment Variables & Secrets

Never commit:

```text
.env
.env.*
*.pem
*.key
*.crt
```

unless a file is explicitly documented as a non-secret example.

Server-only secrets must never be imported into client-side code.

When adding an environment variable:

* document its purpose;
* identify whether it is server-only or public;
* provide a safe example when appropriate;
* never include real credentials.

---

## 9. Dependencies

Do not add or upgrade dependencies unless necessary.

Before adding a dependency:

1. Check whether the functionality already exists.
2. Check whether an existing dependency can provide it.
3. Consider maintenance and security implications.
4. Keep the dependency change isolated.

Do not perform unrelated dependency upgrades during feature work.

Keep `package.json` and `pnpm-lock.yaml` consistent.

---

## 10. TypeScript & Code Quality

Prefer strict, explicit types.

Avoid:

```ts
any
```

unless there is a documented and unavoidable reason.

Prefer existing project conventions for:

* naming;
* imports;
* error handling;
* async code;
* component structure;
* validation;
* API responses.

Do not suppress TypeScript or ESLint errors without understanding and documenting the reason.

Do not introduce formatting tools or configuration changes unless explicitly required.

---

## 11. Frontend Rules

Preserve the existing visual language and component architecture.

Do not redesign UI during backend, security, or infrastructure work unless the task explicitly requires it.

Prefer existing components over creating visually or functionally duplicated components.

Client-side state must not be treated as an authorization boundary.

SSR/server load functions should be used for security-sensitive access control where appropriate.

---

## 12. Testing & Verification

After implementation, run the project's relevant checks.

At minimum, when available:

```bash
pnpm check
pnpm lint
pnpm test
pnpm build
```

Do not claim a check passed unless it was actually executed.

Distinguish:

* errors introduced by the current change;
* pre-existing errors;
* unrelated environment/tooling failures.

For security-sensitive changes, include targeted verification of:

* unauthorized access;
* authorization boundaries;
* invalid input;
* invalid files;
* oversized files;
* malformed requests;
* missing/invalid sessions;
* CSRF behavior where applicable.

---

## 13. Git Commits

Commits must be logical and atomic.

Prefer small commits that represent one coherent change.

Do not impose an artificial file-count limit when a logical change necessarily spans multiple files.

A commit may contain more than two files when those files are required for the same atomic change.

Commit messages must be exactly one line.

Preferred format:

```text
feat: add admin session validation
fix: reject unsupported upload formats
chore: configure production security headers
```

Never add:

```text
Co-authored-by:
```

or any AI/agent attribution trailer.

Do not commit unrelated changes.

---

## 14. Pull Requests

Before opening a PR:

* verify the branch;
* inspect the complete diff against the target branch;
* run relevant checks;
* confirm no secrets are included;
* confirm no unrelated files were modified;
* confirm the implementation matches the requested scope.

A PR should describe:

* what changed;
* why it changed;
* relevant security implications;
* verification performed;
* known limitations or follow-up work.

Do not merge a PR automatically unless explicitly requested.

---

## 15. Existing Uncommitted Changes

Never discard, reset, stash, or overwrite existing user changes without explicit permission.

Before modifying a file with existing uncommitted changes:

* inspect the diff;
* preserve the user's work;
* modify only the necessary sections.

If the existing changes conflict with the requested task, stop and report the conflict.

---

## 16. Stop Conditions

Stop and ask for clarification when:

* requirements conflict;
* an important API contract is missing;
* a security decision cannot be determined safely;
* a database migration could cause data loss;
* the requested behavior contradicts the existing architecture and no migration strategy is defined;
* required credentials or external service information are missing;
* implementation would require significant out-of-scope changes.

Do not guess when guessing could create security, data, or architectural problems.

---

## 17. Agent Operating Principle

The goal is not to maximize the amount of code changed.

The goal is to make the smallest correct change that leaves the repository in a more maintainable, secure, and verifiable state.

**Inspect → Plan → Implement → Verify → Review → Commit.**

When in doubt, preserve existing behavior and ask before changing architecture.
