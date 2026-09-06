# Follow-up — fire `handoff` on compaction and session end

Origin: the review of `worldflowai/everything-claude-code`
(2026-09-06). See `.workspace/memory/external-toolkits.md` for the full
verdict; this sheet carries only the part worth building.

Nothing here is implemented yet. Step 0 is a prerequisite and may close
the whole sheet.

---

## The gap

`AGENTS.md` § "Session progress tracking" says:

> Run `/handoff` at end-of-session or when approaching a context-budget
> cliff to produce the durable `HHMMSS.md` snapshot that `/continue`
> resumes from.

Both triggers are instructions to *notice a state*. The
context-budget one is issued to the actor least able to notice it at
that moment — an agent close to compaction. The session-end one is
issued to an actor that may not get another turn at all. When either
is missed, the session's durable artifact is simply absent, and
`/continue` has nothing to resume from.

Claude Code exposes `PreCompact` and `SessionEnd` hook events. Wiring
the write to the events removes the reliance on noticing.

---

## Step 0 — prerequisite: does the transition plugin already do this?

Could not be checked from the session that wrote this note: the hooks
live in the `transition@local` plugin, in the
[coding-agent-plugins](https://github.com/stefan-jansen/coding-agent-plugins)
repo, which was not attached. `.claude/settings.json` here only
enables the plugin; it registers no hooks of its own.

```bash
# in a checkout of coding-agent-plugins
grep -rn 'PreCompact\|SessionEnd\|SessionStart' transition/ workflow/
# expect: SessionStart present (it creates the hourly HH.md);
#         if PreCompact is also present, steps A/B below are already done
```

If `PreCompact` is already wired, close this sheet and record that in
`.workspace/memory/external-toolkits.md` under the
everything-claude-code entry.

---

## Design decision to settle first

**A Claude-only hook does not violate hard constraint 1.** Constraint 1
requires durable *state* to be host-neutral, not every trigger to exist
on both hosts. A hook that only Claude Code fires, but whose output is
a file under `.workspace/` that Codex reads natively, satisfies the
contract. Precedent: the roborev `SessionStart` hook is already
Claude-only and documented as optional in the README.

The Codex side stays as it is — `/handoff` invoked explicitly. Worth
one sentence in the README so the asymmetry is deliberate rather than
an oversight.

**A hook cannot invoke a skill.** It is a shell command receiving JSON
on stdin. That splits the work in two, and the split matters:

- The *prose* half of a handoff and the `# expect:` verification block
  need agent reasoning. A shell script cannot produce them.
- The *cheap facts* half (branch, HEAD SHA, dirty-file count, active
  work unit, path of the newest transition) is exactly what a shell
  script does well.

So the shape is **floor + nudge**, not one or the other:

- **Floor** — the hook itself appends the cheap facts to today's
  `HH.md`. Guarantees a record even if the agent does nothing further.
- **Nudge** — the hook emits a message asking the agent to run
  `/handoff` for the real durable snapshot.

Constraint 6 ("verify durable files only ... never session-relative
rotating files (e.g. `HH.md`)") is the reason the floor goes to
`HH.md` and not to a `HHMMSS.md`. `HH.md` is where session-relative
progress belongs; a `HHMMSS.md` that no `/continue` can trust because
it has prose-free, unverifiable content would be worse than none. The
floor is a breadcrumb, not a substitute snapshot.

---

## A. `PreCompact` → floor + nudge

Hook in the `transition@local` plugin. Sketch of the floor payload:

```
## [PreCompact HH:MM:SS] context compaction
- branch: <git rev-parse --abbrev-ref HEAD>
- head:   <git rev-parse --short HEAD>
- dirty:  <git status --porcelain | wc -l> file(s)
- work:   <newest dir under .workspace/work/, if any>
- last transition: <newest .workspace/transitions/*/HHMMSS.md>
```

Requirements:

- Never block compaction. Exit 0 on every path, including "not a git
  repo" and "no `.workspace/`".
- Idempotent — repeated compactions append, never rewrite.
- No network, no `gh`. Compaction is a latency-sensitive moment.

Verify after implementing, in a session driven to compaction:

```bash
grep -c 'PreCompact' .workspace/transitions/$(date +%F)/$(date +%H).md
# expect: >= 1
```

## B. `SessionEnd` → same floor, plus the nudge earlier

Same payload, `[SessionEnd HH:MM:SS]` marker. The difference that
matters: at session end the nudge is useless — there is no turn left
to act on it. So the honest fix is upstream of the hook, in the skill
descriptions: `handoff` should be reachable from "I am about to stop"
phrasing, not only from an explicit `/handoff`.

Open question, deliberately not answered here: whether `SessionEnd`
should attempt a *minimal* durable `HHMMSS.md` (facts only, prose
section marked `[not written — session ended without handoff]`) rather
than only a breadcrumb. Argument for: `/continue` finds something.
Argument against: constraint 6 — a snapshot whose verification block is
empty invites exactly the silent-staleness failure `handoff` was built
to prevent. Decide before building B; A stands on its own either way.

## C. Promote recurring friction into memory (lower priority)

The concept behind their `continuous-learning` skill, minus its
implementation (which counts messages and prints a nudge — it extracts
nothing).

Today `history.md`'s closed-friction backlog is maintained by hand.
`.claude/settings.json` already sets
`autoMemoryDirectory: ./.workspace/memory/auto`, so the destination
exists and is unused:

```bash
ls -la .workspace/memory/auto/
# expect: only .gitkeep — nothing has ever written here
```

Two things to settle before building anything: what qualifies as
"friction worth keeping" (a fix that took more than one attempt? a
user correction? a host-behaviour surprise?), and who promotes an
`auto/` entry into `history.md`. Left open on purpose — the wrong
answer produces a directory of noise that costs context and gets
ignored.

---

## Suggested order

Step 0 → A → (decide the B question) → B → C.

A is the one with a clear payoff and no unresolved design question.
