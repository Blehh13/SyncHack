# Evidence pack

Every claim in [`SUBMISSION.md`](../SUBMISSION.md) links to something in this folder or on GitHub. Nothing here is simulated, and the Thally screenshots are unedited except that the account email is blacked out in `02`.

## Timeline (UTC, 2026-09-15)

| Time | Event | Proof |
|---|---|---|
| 16:07:49 | Product builds and runs end to end (SyncHack#1 merged) | [SyncHack#1](https://github.com/Blehh13/SyncHack/pull/1) |
| 17:00:28 | Thally docs site published with 14 pages written against the code (docs#1 merged, `16e367d`) | [synchack-docs#1](https://github.com/Blehh13/synchack-docs/pull/1), https://synchack.thally.app |
| before 17:26 | Baseline captured from the live site | [`01-baseline-before-product-change.md`](01-baseline-before-product-change.md) |
| 17:26:53 | SHA-256 fingerprints of our impact prediction and feature decision posted on the product PR, before merge | [PR comment](https://github.com/Blehh13/SyncHack/pull/2#issuecomment-5684886934) |
| 17:27:10 | **Product change merged**: sync runs scoped to the docs path (SyncHack#2, `649991f`) | [SyncHack#2](https://github.com/Blehh13/SyncHack/pull/2) |
| after 17:27 | Track detects #2, analyzes it (1.6K credits), then **stops while writing the update** | [`screenshots/04`](screenshots/04-track-runs-2-failed-3-running.png), reference `1eead82e-1e15-42ce-9fa0-a71a8b6e9947` |
| 17:42:19 | CI-only change merged (SyncHack#3, `39d6f35`) | [SyncHack#3](https://github.com/Blehh13/SyncHack/pull/3) |
| after 17:42 | Track analyzes #3 and concludes **"No update needed"** (413.3 credits) | [`screenshots/05`](screenshots/05-track-runs-2-failed-3-no-update-needed.png) |
| 17:47:53 | Stale claims confirmed still live on every agent surface | [`05-drift-still-live-after-merge.md`](05-drift-still-live-after-merge.md) |

## Files

| File | What it proves |
|---|---|
| [`01-baseline-before-product-change.md`](01-baseline-before-product-change.md) | The published docs correctly described the old behavior before the change: Markdown mirrors, search API, MCP and `llms-full.txt` |
| [`02-IMPACT_MAP.md`](02-IMPACT_MAP.md) | Our prediction, written before Track ran: 8 pages that must change, 3 that should, 7 that should not |
| [`03-FEATURE_DECISION.md`](03-FEATURE_DECISION.md) | Why this product change was chosen, scored against four alternatives |
| [`05-drift-still-live-after-merge.md`](05-drift-still-live-after-merge.md) | After the merge, six published statements are false, and the code on `master` that makes them false |
| [`screenshots/01-thally-preview-site-not-found.png`](screenshots/01-thally-preview-site-not-found.png) | Deploy preview for docs#1 returned "Site not found" (the preview build failed) |
| [`screenshots/02-track-setup-connected-merged-changes-on.png`](screenshots/02-track-setup-connected-merged-changes-on.png) | Track set up: AI credits available, product repository connected, "Merged changes" trigger on |
| [`screenshots/03-track-product-repo-watching-master.png`](screenshots/03-track-product-repo-watching-master.png) | Track watching `blehh13/synchack` on `master`, all files |
| [`screenshots/04-track-runs-2-failed-3-running.png`](screenshots/04-track-runs-2-failed-3-running.png) | #2 failed while writing the update; #3 in progress |
| [`screenshots/05-track-runs-2-failed-3-no-update-needed.png`](screenshots/05-track-runs-2-failed-3-no-update-needed.png) | #3 correctly concluded "No update needed"; #2 still needs attention |

## Verify the prediction was not edited after Track ran

```bash
sha256sum evidence/02-IMPACT_MAP.md evidence/03-FEATURE_DECISION.md
```

Expected, as posted on SyncHack#2 at 17:26:53 UTC, before the merge:

```text
8ee9ee2d6d85cda48f60644e8774e6a4f59a1b3735ef7a57a642acd1bf82b0a0  02-IMPACT_MAP.md
dd35189f94ea44e3c3b26b9fdde15d740e7cd4ce2352773f64c8e22d9e0d9c95  03-FEATURE_DECISION.md
```

`.gitattributes` marks these files `-text`, so Git does not rewrite their line endings.

## Track result against the prediction

| Merge | Our expectation | Track result | Verdict |
|---|---|---|---|
| SyncHack#2 (docs path scoping) | Update 8 pages (M1–M8), ideally 3 more (S1–S3), and leave 7 alone | Detected and analyzed; **failed while writing**; no proposal produced | Cannot score proposals. Detection worked, drafting did not. |
| SyncHack#3 (CI workflow only) | No user-visible change, so no docs update | "No update needed" | **Correct** |

If Thally resolves reference `1eead82e-1e15-42ce-9fa0-a71a8b6e9947` and #2 produces a documentation PR, its proposals will be scored row by row against `02-IMPACT_MAP.md` and reviewed as accept, edit or reject before merge.
