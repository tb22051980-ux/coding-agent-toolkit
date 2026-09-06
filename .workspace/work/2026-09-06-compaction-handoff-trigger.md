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

## C. Promote recurring friction into memory — sidecar DONE, policy OPEN

Step 0 changed this section's premise, and the first move is now done.

### Done 2026-09-06 — memory tooling initialised

The `memory@local` plugin already ships the machinery: `/memory-gc`
proposes status transitions from `last_referenced`, reference counts and
anchor health, backed by `memory_init_index.sh`, `verify_index.sh` and
`check_anchors.sh`. It was enabled here but had never been run — no
`.workspace/memory/.index_state.json` existed, so `/memory-gc` had never
run and `pre-compact.sh`'s memory nudge was gated off.

Ran, in order: `memory_init_index.sh`, then `gc_propose.py` →
`gc_apply.py`. Baseline stamped, `last_gc_run: 2026-09-06`, no
transitions proposed (`history.md` at 75 days is inside the 90-day stale
threshold).

Three things it surfaced:

1. **The hand-kept token counts were badly wrong.** `history.md` was
   indexed at `~6500`; `bin/token_count.py` measures **2760** — off by
   2.4×. Any memory-budget reasoning done against the old number was
   wrong. Now computed, not guessed.
2. **`anchors` had been misused as a description field** — in the
   `history.md` entry from the start, and in the `external-toolkits.md`
   entry this sheet's own change added. The spec is comma-separated
   file paths / commands / symbols, resolved against the working tree by
   `check_anchors.sh` and fed into GC. The prose was splitting on its
   commas into phantom anchors: 4 missing across 2 entries. Corrected to
   a real path and `none`; now 1 present, 0 missing. `AGENTS.md`
   § "Project memory" documents the field so it does not drift back.
3. **`memory_init_index.sh` rewrites `MEMORY_INDEX.md` wholesale.** It
   preserves entries, statuses and anchors, but drops anything else in
   the file — here, the hand-written block explaining how to register a
   new memory file. Moved to `AGENTS.md` before running it. Anyone
   adding prose to the index should expect the next init to eat it.

Verification:

```bash
bash <plugins>/memory/bin/verify_index.sh
# expect: Result: OK — 0 missing entries, 2 file(s) verified
bash <plugins>/memory/bin/check_anchors.sh
# expect: Summary: 1 present, 0 missing, 0 n/a (across 2 entries)
python3 -c "import json;print(json.load(open('.workspace/memory/.index_state.json'))['last_gc_run'])"
# expect: a date, not None  (local only — the sidecar is gitignored)
```

### Open — two decisions, neither urgent

**`auto_loaded_cap` is unset.** `verify_index.sh` warns about it. Not
set here on purpose: `memory_init_index.sh`'s own header says the cap
value "is decided downstream; init does not invent one". It is a
per-project budget decision, so it wants a maintainer, not a default
copied from a fixture.

**Promotion policy.** The original questions stand and are still
deliberately unanswered: what counts as "friction worth keeping" (a fix
that took more than one attempt? a user correction? a host-behaviour
surprise?), and who promotes a `.workspace/memory/auto/` entry into
`history.md`. These are now questions about policy on top of working
tooling, not about tooling to build. `auto/` remains empty apart from
`.gitkeep`.

---

## Remaining work

The two decisions in C. Both are maintainer calls, neither blocks
anything.
