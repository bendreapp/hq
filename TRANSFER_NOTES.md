# Transfer notes: bendreapp/hq

## What happened on 13 Nov 2026 (laptop transfer)
The founder moved to a new laptop and cleaned up the old one. For this repo:
- 4 changed or untracked items, plus 1 unpushed local commit, were saved to branch **`wip/transfer-2026-11-13`**.
- A Claude agent worktree was untracked from the branch. Its own branch was pushed as **`wip/agent-worktree-2026-11-13`**.
- Old local path: `~/Documents/Projects/Bendre/hq`.
- The local copy on the old laptop was **deleted** after everything was confirmed on GitHub. It now lives **only on GitHub**.
- Build folders (`node_modules`, `.next`, `target`, `dist`) were never in git. They come back with `npm install`, `cargo build` and the like.

## How to pick this up again
```bash
git clone https://github.com/bendreapp/hq.git
cd hq
git checkout wip/transfer-2026-11-13   # the branch holding the saved work
# then install dependencies (npm install / pnpm install / cargo build) and add your .env if the project needs one
```

**Secrets:** `.env.local` is in `Harp0859/bendre-workspace` → `env-files/hq/.env.local`.

*Note written by Claude (Claude Code) for the founder, 13 Nov 2026. Master index of every repo moved that day: `blureonlabs/blubabyshow` → `docs/REPO_TRANSFER_INDEX.md`.*
