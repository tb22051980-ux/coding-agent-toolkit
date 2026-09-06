# coding-agent-toolkit

Contributor / maintainer notes. For the project introduction, see
[`README.md`](README.md).

## Purpose

Provide a small set of host-neutral workflow steps — `align`, `plan`,
`plan-issues`, `next-issue`, `ship`, `handoff`, `continue` — that take
a piece of work from rough idea to done, identically on Claude Code
and OpenAI Codex. The chain owns the structural work around producing
the thing: clarifying what "done" means, breaking it into chunks,
accumulating references and constraints as they surface, tracking
progress, carrying memory across sessions and host swaps, and
projecting state onto GitHub for review and version control. Local
state for each piece of work lives in `.workspace/work/<unit>/` (spec,
plan, follow-up notes, references); GitHub is the public projection
(milestone / issues / branches / PRs / `Closes #N`). The dominant
deliverable is a merged PR; the chain drives non-code work too (a
research report, a course module, a long-form post) since the
projection doesn't care what the deliverable is. The actor is the
agent; this repository supplies the step definitions and the
file-shaped contract they share.

## Cross-host primitive

The contract that makes the toolkit host-neutral is **shared durable
state under `.workspace/`**, read natively by both Claude Code and
Codex. There is no orchestrator. Either host runs a step; the step
writes files; the other host picks the state up by reading the same
files.

| Path | Role |
|---|---|
| `AGENTS.md` (this file) | Canonical project instructions. Codex reads natively; Claude includes via `CLAUDE.md`. |
| `CLAUDE.md` | One line — `@AGENTS.md`. |
| `.workspace/memory/` | Persistent project memory; load on demand. |
| `.workspace/transitions/YYYY-MM-DD/HHMMSS.md` | `/handoff` output; `/continue` resumes from any of these on either host. |
| `.workspace/work/` | Active work units (specs, plans, references, follow-up notes). |

Keep this contract tight. Never seed `.claude/transitions/` or
`.codex/state/` for new work; never invent a `run-as-other-host`
shortcut.

## Step chain

```
align         →  spec.md             (interrogation, or @brief.md seed)
plan          →  plan.md             (host-native plan mode, in-session
                                      or headless)
plan-issues   →  GitHub milestone + issues  (dry-run default; --apply)
next-issue    →  branch + impl + tests + PR  (lowest-numbered open
                                              issue in active milestone)
ship          →  squash-merge, close milestone  (verifies closing-footer
                                                 coverage)
handoff       →  .workspace/transitions/YYYY-MM-DD/HHMMSS.md
continue      →  read latest transition, verify, surface next steps
                 (no auto-execute)
```

Six steps live on disk under `skills/<step>/`. `plan` deliberately
delegates to each host's native plan mode plus a capture hook — that
is the right primitive, and re-implementing it as a shell command
loses the structured plan-mode output.

## Three surfaces, one source

| Surface | Location | Contents |
|---|---|---|
| Canonical | `skills/<step>/SKILL.md` here | Source of truth. |
| Claude plugin mirror | `workflow/skills/<step>/SKILL.md` in the [coding-agent-plugins](https://github.com/stefan-jansen/coding-agent-plugins) marketplace | Byte-identical mirror; how Claude users install. |
| Codex prompt | `codex/prompts/<step>.md` here | Codex-shape mirror; `codex exec` invokes by name. |

When you edit a step, edit all three. Verify byte-identity between
canonical and the plugin mirror (`diff -q`). The Codex prompt may
shape the same contract differently in the markdown body, but its YAML
frontmatter must stay strictly parseable — Codex uses strict YAML and
will silently skip an invalid prompt.

## Hard constraints

1. **Host-neutral state.** Durable state lives in `.workspace/`. Never
   seed `.claude/transitions/` or `.codex/state/` for new work.
2. **Statelessness.** Each step invocation starts fresh. All carry-over
   is files on disk.
3. **Self-containment.** Step logic lives inline in the SKILL or prompt.
   No external script sourcing.
4. **Idempotency.** Steps are safe to re-run. `/continue` re-verifies
   on each call; `/ship` is a no-op when already shipped.
5. **MCP optional.** Steps use `gh`, `git`, and the filesystem. No MCP
   is required for a step to do its job.
6. **Verify durable files only.** `/handoff` verification snapshots
   list commit SHAs, milestone states, branch tips, skill / prompt
   inventories — never session-relative rotating files (e.g. `HH.md`).

## Session progress tracking

Transition files are one per event —
`.workspace/transitions/YYYY-MM-DD/HHMMSS.md`, no hour-based grouping.
Three things write them, two of them without being asked:

- **Compaction** (automatic, `transition@local`). `PreCompact` steers
  the compact summary to be a cold-startable handoff; `PostCompact`
  writes it to a timestamped file. Nothing to invoke.
- **`/handoff`** (manual). The explicit snapshot, and the only one
  carrying the verification block `/continue` runs. Use it at
  end-of-session and before a context-budget cliff — compaction covers
  the cliff only when it actually fires.
- **`SessionEnd`** (automatic) appends an exit marker to the day's most
  recent transition file, or does nothing when there is none.

There is no hourly-progress hook. The `UserPromptSubmit` stub that
created `HH.md` was removed on 2026-08-05 as a thin-file anti-pattern;
`transition/hooks/init-transition.sh` survives upstream but is
unregistered.

## References (read on demand)

- [`README.md`](README.md) — project introduction.
- [`docs/planmode-probe.md`](docs/planmode-probe.md) — host plan-mode
  empirical findings.
- [`docs/api-drift-detection.md`](docs/api-drift-detection.md) —
  design note on what is deliberately not built yet.
- [`docs/relay-lessons.md`](docs/relay-lessons.md) — what the
  predecessor experiment taught.
- `.workspace/memory/` — persistent project memory (indexed below).
- `.workspace/work/` — active work units.

### Project memory

`.workspace/memory/MEMORY_INDEX.md` is generated by the `memory@local`
plugin's `memory_init_index.sh` and maintained by `/memory-gc`. To add a
memory file, write `.workspace/memory/<slug>.md` and re-run the init
script: it picks the file up as `active` and counts its tokens.

Of the four fields, three are the tooling's — `status` is `/memory-gc`'s
(`active`, `dormant`, `deprecated`, `superseded-by:<slug>`),
`last_referenced` comes from captured read signals, `tokens` is computed.
`anchors` is yours: a comma-separated list of **file paths, commands or
symbols** the memory describes, or `none`. It is not a description field
— `bin/check_anchors.sh` resolves each entry against the working tree and
feeds the result into GC, so prose there produces phantom missing anchors
and a wrong signal.

Two token budgets sit in the index frontmatter, and only one of them
bites. `auto_loaded_cap: 5000` is declarative — `verify_index.sh` prints
it and warns when it is absent, but never checks anything against it.
`default_file_cap: 4000` is enforced per memory file: over it, verify
names the file and the remedy — keep the conclusion and a pointer, move
the cut text to a sibling `<name>_archive.md`. An archive costs nothing
per session, since only the index is auto-loaded. `/memory-gc` will not
catch this on its own: an oversized file that is still actively used is
`active` and correctly so.

### Promoting to memory

An entry earns a place if it changed a step, a hard constraint, or a
document — or should have, and says what is still unfixed. When that is
arguable, the tiebreaker is whether a future session would spend real
work re-deriving it. A one-off fix that left no lasting state, a dead end
resolved in-session, and anything one `git log` re-derives are session
noise, not memory.

Promote when a unit ships, while the lessons are fresh; triage `auto/` at
the weekly review nudge. The agent drafts the entry and shows it, a
person accepts it — memory is instructions, so an agent does not write it
unattended. Headless, with nobody to accept: write the proposal into the
work unit and leave memory alone.

`.workspace/memory/auto/` is inside the managed tree — every `*.md` there
is a full index entry with a budget cost, and no tool ever removes one.
At each triage an entry leaves in one of three directions: promoted
(content folded in, original deleted), archived to `_archive/` (the only
directory the tooling skips), or left, and only while under a week old.
Letting one age into `deprecated` and stay indexed is the failure this
rule prevents.

`.index_state.json` beside the index is gitignored runtime state — the
per-file reference signals plus `last_gc_run`. It does not travel with
the repository, so each machine runs the init script once; a missing
sidecar is read as initial state, and the index wins over it on any
conflict. `PreCompact` nudges for a memory review when `last_gc_run` is
absent or older than seven days.

@.workspace/memory/MEMORY_INDEX.md
