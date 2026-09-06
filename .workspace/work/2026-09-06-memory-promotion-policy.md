# Proposal — promotion policy for `.workspace/memory/`

**Status: ACCEPTED 2026-09-06 with one amendment; one part deferred.**
The criteria, the two rhythms and the `auto/` lifecycle are installed in
`AGENTS.md` § "Promoting to memory". The `/ship` step change is deferred
with a stated blocker — see "Decision" at the foot of this sheet, which
is now the live part. Origin: the last open item in
`2026-09-06-compaction-handoff-trigger.md` § C.

---

## What this has to solve

Three findings, each verified rather than assumed, set the shape.

**1. `/memory-gc` cannot answer the question.** Its heuristic is recency,
and its own documentation is blunt about the limit:

> It cannot tell you a file is *wrong*. A memory file read every day and
> contradicted by the code six weeks ago stays `active`, correctly by
> this rule and uselessly for you. An empty GC diff means "nothing has
> gone unread", not "memory is accurate".

So the gap is worth and correctness, which no timer decides. That is the
whole reason a policy is needed at all.

**2. `auto/` files become real index entries.** `.claude/settings.json`
sets `autoMemoryDirectory: ./.workspace/memory/auto`, which puts
harness-written memories *inside* the plugin's managed tree. Verified on
a scratch copy:

```
new  auto/2026-09-06-sample.md            10 tokens  [active]
skip _archive/old.md                  (under _archive/ (superseded by convention))
```

Every `auto/*.md` gets a status, accumulates reference signals, and
counts against the budget. Only the `_archive/` directory is skipped —
and note the rule is the *directory*: a top-level `_archive_probe.md`
was indexed like any other file.

**3. Nothing ever removes them.** `/memory-gc` "changes statuses only; it
never deletes or moves a memory file". Left alone, `auto/` accumulates
forever: `active` → `dormant` at 90 days → `deprecated` at 180, and then
sits there, indexed, costing budget, misreported as memory. Today the
directory is empty, so this is a trap not yet sprung.

**4. The budget is already half spent.** `history.md` is 2760 tokens
against `default_file_cap: 4000`. A promotion policy with no eviction
rule breaks its own budget within a few entries.

---

## Proposed policy

### What earns a place

The empirical test, read off the entries `history.md` already holds:
**every one of them changed a step definition, a constraint, or a
document — or should have and did not.** They are not a record of what
happened; they are the reasons the toolkit is shaped as it is.

So, one criterion and one tiebreaker:

- **Primary.** It changed a step, a hard constraint, or a document — or
  it should have, and the entry says what is still unfixed.
- **Tiebreaker, when the primary is arguable.** A future session would
  spend real work re-deriving it. The `everything-claude-code` verdict
  qualifies: a clone, seven tool calls, and a licensing check to reach
  "no". Re-deriving that is pure waste.

**Does not earn a place**, however true: a one-off fix that left no
lasting state; a dead end that was resolved inside the session; anything
one `git log`, `gh issue list`, or a glance at the working tree
re-derives. Session noise is not memory.

### Where it goes

- A friction with a fix or an open follow-up → `history.md`'s backlog
  section, in the existing shape (numbered, bold lead-in,
  `(FIXED <date>, <repo> commit <sha>)`).
- A standing verdict or reference that is not chronological → its own
  `.workspace/memory/<slug>.md`, registered by re-running the init
  script. `external-toolkits.md` is the pattern.
- Everything else → `_archive/`, or nowhere.

### Who, and when

Two rhythms, because two different jobs:

| Moment | Job | Actor |
|---|---|---|
| `/ship` | Promote this unit's lessons | Agent proposes, maintainer disposes |
| The weekly review nudge | Triage `auto/`, run `/memory-gc` | Same |

`/ship` is the natural promotion point: the work is done and its lessons
are known and still fresh. The memory plugin's own "Auto-reflection"
section already assumes this shape ("After `/ship`: prompt to add").

The weekly moment already exists too and needs no building: `PreCompact`
and `SessionStart` both nudge when `last_gc_run` is absent or older than
seven days.

The actor split matches the house pattern rather than inventing one —
`/memory-gc` is dry-run by default and applies only on `--execute` after
confirmation. Promotion should read the same way: the agent drafts the
entry and shows it; a person accepts it. An agent that silently edits
project memory is writing its own instructions.

### `auto/` lifecycle — the part currently unspecified

At each weekly triage, every entry under `auto/` leaves in one of three
directions:

1. **Promote** — fold its content into `history.md` or a topic memory,
   then delete the original. The content survives; the auto file does
   not.
2. **Archive** — move to `_archive/`. The tooling skips that directory,
   so it stops costing budget and stops appearing in the index.
3. **Leave** — only when it is under a week old and not yet judged.

Never a fourth: leaving it to age into `deprecated` and stay indexed.
That is the failure mode this policy exists to prevent.

### Eviction, so the budget holds

When `history.md` crosses `default_file_cap: 4000`, `verify_index.sh`
already names the remedy:

> keep the conclusion and a pointer, move the cut text to
> `history_archive.md`

Follow it — oldest closed frictions first, conclusions kept in place. An
archive costs nothing per session, since only the index is auto-loaded.
At 2760 there is room for roughly a dozen more entries before this fires.

---

## Decision (2026-09-06)

**Accepted**, with one amendment and one deferral.

### Installed

The criteria, the two rhythms, the propose-then-accept split and the
`auto/` lifecycle are in `AGENTS.md` § "Promoting to memory", compressed
to three paragraphs.

### Amendment — headless runs

The draft said "agent proposes, maintainer disposes" without saying what
happens when there is no maintainer. This toolkit runs headless by
design (`codex exec`, `claude -p`), and a rule whose only enforcement is
a human in the loop silently becomes "agent writes memory unattended" the
first time nobody is there. Added: **headless, write the proposal into
the work unit and leave memory alone.** Deferring a promotion costs one
session's freshness; an unattended write costs the project's instructions.

### Deferred — the `/ship` closing step, and why

Adding "propose memory entries for this unit" to `skills/ship/SKILL.md`
is the right shape and is *not* being done here. Two reasons, the first
decisive:

1. **The three-surface rule cannot be honoured from this session.**
   `AGENTS.md` requires canonical, plugin mirror and Codex prompt to move
   together, with byte-identity between the first two. The mirror lives
   in `stefan-jansen/coding-agent-plugins`, attached read-only — this
   session can clone it and cannot push to it. Editing the canonical
   skill alone would break the invariant the project checks with
   `diff -q`, and a knowingly broken invariant is worse than an unwritten
   step.
2. **`/ship` is idempotent by hard constraint 4**, and has a section
   (`## Idempotency`) enforcing it. A promotion step must be a no-op on
   re-run of an already-shipped unit — proposing the same entries twice
   is exactly the annoyance that gets a step's suggestions ignored. That
   is a design question, not a paragraph to append.

**What it needs to land:** write access to the plugins repo (or a
maintainer to carry the mirror commit), plus a decision on the
idempotency marker — most likely "propose only when the unit's work
directory has no recorded memory proposal yet".

Until then the policy has criteria and a stated moment but no automatic
trigger. That is a real limit, not a papered-over one: promotion happens
because someone runs it, and `AGENTS.md` now says what to do when they
do.

## What is deliberately not proposed

- **No automated extraction.** A hook that mines transcripts for
  "patterns" is what `everything-claude-code`'s `continuous-learning`
  attempted; its implementation counts messages and prints a nudge,
  extracting nothing. The judgment is the hard part, and it does not
  survive being handed to a word counter.
- **No new tooling.** Every mechanism above already exists and runs.
- **No numeric thresholds for "worth keeping".** A count of attempts or
  a time-spent bar would be measurable and wrong; the criterion is
  whether it changed the toolkit, which is a reading, not a metric.
