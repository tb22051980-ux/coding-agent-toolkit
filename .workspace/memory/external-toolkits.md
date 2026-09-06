# External toolkit evaluations (internal)

Project memory — not reader-facing. One entry per external
agent-toolkit repo we have looked at, with the verdict and the
reasoning behind it, so a future session does not re-derive it.

Each entry answers three questions: what it is, whether we adopt it,
and what (if anything) is worth stealing as a *concept*. Copying files
is the exception, not the default — see the licensing note in each
entry.

---

## everything-claude-code

- **Repo**: `worldflowai/everything-claude-code`
- **Reviewed**: 2026-09-06 (clone at `HEAD` = single squash commit
  `432485b`, authored 2026-01-23)
- **Verdict**: **do not adopt.** Three concepts worth taking, listed
  below. No files.

### What it is

A large Claude-only configuration collection: 82 files, ~13,300 lines
— 9 agents, 12 skills, 15 commands, 8 rule sheets, a `hooks.json`, a
set of Node.js hook scripts with tests, and MCP server configs.

Provenance is worth knowing. `.claude-plugin/plugin.json` and
`marketplace.json` both name `affaan-m/everything-claude-code` as
homepage and repository, and credit Affaan Mustafa as author. The
worldflowai copy carries a single squashed commit rather than that
history, so it is a re-publication, not a fork with lineage.

Freshness: last commit 2026-01-23, i.e. ~7.5 months stale at review
time.

### Licensing (blocks file-level reuse)

The README badge says MIT and `plugin.json` declares `"license":
"MIT"`, but **there is no LICENSE file anywhere in the repo** —
verified with `git ls-files | grep -i licen`, which returns nothing;
the badge links to a 404. Combined with the split authorship above,
that makes file-level copying the wrong move. Taking concepts costs
nothing and carries no such question.

### Why it does not fit (constraint by constraint)

Against the five hard constraints in `AGENTS.md`, it breaks two:

- **Constraint 1, host-neutral state.** Everything is rooted in
  Claude-only paths: `~/.claude/settings.json`,
  `${CLAUDE_PLUGIN_ROOT}`, `~/.claude/skills/learned/`. There is no
  equivalent of `.workspace/` — nothing Codex can read. Our entire
  cross-host contract is absent from its design.
- **Constraint 3, self-containment.** Its hooks are literally
  `node "${CLAUDE_PLUGIN_ROOT}/scripts/hooks/session-start.js"`.
  External script sourcing is the base pattern, not an exception.

Plus a mismatch that is not a numbered constraint but runs deeper than
either: it optimises for *coverage* where we optimise for a *tight
contract*. `skills/frontend-patterns/SKILL.md` is 631 lines,
`backend-patterns` 582, `coding-standards` 520. Our whole `AGENTS.md`
is ~116. Those files are context budget spent on generic advice.

Direct overlap with steps we deliberately shaped differently:
`commands/plan.md` (we delegate to host-native plan mode — see
`docs/planmode-probe.md`), `commands/code-review.md` (we delegate to
roborev), `commands/checkpoint.md` (a weaker `handoff`: git stash plus
a log line, with no verification snapshot and no `# expect:` lines,
which is the load-bearing part of ours), `commands/orchestrate.md`
(we have no orchestrator by design — see history.md #8).

### Concrete hazard

`hooks/hooks.json` carries a `PreToolUse` hook described as
*"Block creation of random .md files - keeps docs consolidated"*. It
blocks writing any `.md` except README / CLAUDE / AGENTS /
CONTRIBUTING. Our chain writes `.md` for everything durable:
`spec.md`, `plan.md`, `.workspace/transitions/*.md`, work notes. That
single hook would silently break `align`, `plan`, `handoff` and the
hourly progress files.

Same file, same flavour: block dev servers outside tmux, run Prettier
on every Edit, run a full `npx tsc --noEmit` after every `.ts` edit,
warn on `console.log`. Considered JS/TS web-dev ergonomics; wrong
instrument for a host- and language-neutral workflow toolkit.

### What is worth taking (concepts, not files)

1. ~~**`PreCompact` as a trigger for a durable snapshot.**~~ **Already
   built** — verified 2026-09-06 against
   `stefan-jansen/coding-agent-plugins` at `231add3`. The
   `transition@local` plugin registers `PreCompact`, `PostCompact` and
   `SessionEnd`, and its design beats what we would have built. The
   reusable lesson is in
   `.workspace/work/2026-09-06-compaction-handoff-trigger.md` § A:
   `PreCompact` stdout becomes the compaction's `custom_instructions`,
   so the hook *steers the summary the model is about to write* rather
   than writing a breadcrumb, and `PostCompact` receives that summary
   and persists it. The seam is "model writes, hook steers and
   persists" — not "facts a script can gather vs prose only an agent
   can write".
2. ~~**`SessionEnd` as a second trigger for the same.**~~ **Already
   built**, and deliberately narrower: it annotates the day's most
   recent transition file and does nothing when none exists, because a
   bare "session ended" file is the thin-file anti-pattern that got
   the hourly `HH.md` stub removed on 2026-08-05.
3. **The idea behind `continuous-learning`.** Their implementation is
   weak — the Stop hook counts messages and prints a nudge, it
   extracts nothing. But the concept (an end-of-session pass that
   promotes recurring friction into durable memory) is what
   `history.md`'s closed-friction backlog is maintained by hand today.
   Step 0 found the machinery already exists too: the `memory@local`
   plugin ships `/memory-gc`, `/memory-review` and `check_anchors.sh`,
   enabled here but never run. Initialised 2026-09-06 — sidecar seeded,
   GC baseline stamped. It immediately caught two errors in the
   hand-kept index: `history.md`'s token count was off by 2.4× (~6500
   indexed vs 2760 measured), and `anchors` had been used as a
   description field in both entries, producing phantom missing anchors.
   What remains is policy, not tooling; see the work note § C.

Marginal, listed for completeness: `skills/verification-loop/SKILL.md`
has a tidy compact report shape (per-phase PASS/FAIL plus one overall
`READY / NOT READY` verdict) that `next-issue` could adopt in a
language-agnostic form. Cosmetic, not a capability gain.

Explicitly *not* worth taking despite being solid tested code:
`scripts/lib/package-manager.js` (390 lines of npm/pnpm/yarn/bun
detection). It solves a JS-ecosystem problem we do not have.
