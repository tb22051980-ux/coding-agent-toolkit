# Follow-up — fire `handoff` on compaction and session end

Origin: the review of `worldflowai/everything-claude-code`
(2026-09-06). See `.workspace/memory/external-toolkits.md` for the full
verdict.

**Status: A and B CLOSED by Step 0 — already implemented upstream, and
implemented better than this sheet proposed. C remains open.**

---

## Step 0 — prerequisite (DONE 2026-09-06)

Cloned `stefan-jansen/coding-agent-plugins` at `231add3` and read
`transition/hooks/`. All three events are already wired in
`transition/hooks/hooks.json`:

| Event | Hook | What it does |
|---|---|---|
| `PreCompact` | `pre-compact.sh` | stdout becomes the compaction's `custom_instructions` |
| `PostCompact` | `post-compact.sh` | writes `compact_summary` to `<transitions>/YYYY-MM-DD/HHMMSS.md` |
| `SessionEnd` | `session-end.sh` | appends an exit marker to the day's most recent transition file |

```bash
grep -rn 'PreCompact\|PostCompact\|SessionEnd' \
  /home/user/stefan-jansen/coding-agent-plugins/transition/hooks/hooks.json
# expect: all three registered
```

## A. `PreCompact` → durable snapshot — CLOSED

Implemented, and the upstream design is better than the floor-plus-nudge
this sheet proposed. Worth understanding *why*, because the reasoning
error is reusable:

This sheet argued that a hook cannot produce the prose half of a handoff
— it is a shell command, it cannot invoke a skill, so the best it can do
is write cheap facts and nudge the agent. **That is false**, and it
misses the mechanism that makes the upstream version work:

- `PreCompact` **stdout becomes `custom_instructions` for the
  compaction**. The hook does not write a breadcrumb; it *steers the
  summary the model is about to generate*. Upstream uses this to tell
  the model to write the summary as a cold-startable handoff following
  `/handoff` discipline — curate not transcribe, include verification
  state and open threads, exclude conversation replay and routine tool
  mechanics.
- `PostCompact` then **receives that generated summary on stdin** as
  `compact_summary` and writes it to a real timestamped file.

So the prose half is produced by the model and merely *persisted* by the
hook. The split this sheet drew — "facts a script can gather" vs "prose
only an agent can write" — was the wrong seam. The right one is: the
model writes, the hook steers and persists.

The `everything-claude-code` version this idea came from is far weaker
than either: its `PreCompact` hook appends one timestamp line to a log.
The idea was worth having; its implementation was not the thing to copy.

## B. `SessionEnd` → same — CLOSED

Implemented, and it deliberately does *less* than this sheet proposed.
`session-end.sh` appends an exit marker to the day's most recent
transition file and **does nothing when none exists** — because a bare
"session ended" file is the thin-file anti-pattern that got the hourly
`HH.md` stub hook removed on 2026-08-05.

That answers the open question this sheet left in section B (whether
`SessionEnd` should write a minimal facts-only `HHMMSS.md`): upstream
says no, and gives the reason. A marker annotates a real record; it is
not one.

### Drift this uncovered, fixed in the same change

`AGENTS.md` § "Session progress tracking" claimed hourly progress goes
to `HH.md` and that "the project hook auto-creates the file". No such
hook exists — `transition/hooks/init-transition.sh` is present but
explicitly unregistered, and the convention is one file per event
(`HHMMSS.md`), no hour-based grouping. Corrected.

Left alone deliberately: hard constraint 6 still names `HH.md` as its
example of a session-relative rotating file. The principle holds; only
the example is now dead. Rewording a hard constraint is the maintainer's
call, not a drive-by fix.

## C. Promote recurring friction into memory — OPEN, reframed

Step 0 changed this section's premise. The `memory@local` plugin (also
enabled in `.claude/settings.json`) already ships the machinery:
`/memory-gc` proposes status transitions from `last_referenced`,
reference counts and anchor health; `/memory-review` and
`bin/check_anchors.sh` back it. It reads a sidecar,
`.workspace/memory/.index_state.json`:

```json
{ "auto_loaded_cap": 5000, "last_gc_run": "YYYY-MM-DD",
  "files": { "<slug>.md": { "last_referenced": "...", "tokens": 0 } } }
```

**That sidecar does not exist in this project:**

```bash
ls -a .workspace/memory/
# expect: MEMORY_INDEX.md, history.md, external-toolkits.md, auto/
#         — and no .index_state.json
```

Two consequences, both live today:

1. `/memory-gc` has never run here, so `MEMORY_INDEX.md`'s
   `last_referenced` dates are hand-maintained and already drifting
   (`history.md` still reads 2026-06-23).
2. `pre-compact.sh`'s memory-relevance nudge is gated on that sidecar
   existing. Absent it, the nudge silently never fires — this project
   gets the compaction handoff but not the memory review.

So the concrete next step is **initialise the memory plugin's sidecar
here**, not build anything: run the plugin's init path, then
`/memory-gc` once to establish a `last_gc_run` baseline.

The original open questions (what counts as "friction worth keeping",
who promotes an `auto/` entry into `history.md`) still stand and are
still deliberately unanswered — but they are now questions about a
*policy on top of existing tooling*, not about tooling to build.
`.workspace/memory/auto/` remains empty apart from `.gitkeep`.

---

## Remaining work

C only, and its first move is configuration, not code.
