# GUI Schema Editor — Release Notes v.3.0

**Release Date:** 2026-03-27
**Branch:** main
**Commits:** 2 (`ea9ac92`, `5b50f21`)

---

## What's New

### Flowchart Export as PNG

You can now export the schema diagram as a high-resolution PNG image directly from the flowchart toolbar.

- Added an **Export PNG** button to the FlowchartPanel toolbar
- Exports the ReactFlow viewport at 2x pixel ratio with a clean `#f9fafb` background
- File downloads automatically as `schema-mapping.png`
- Powered by the new `html-to-image` dependency

### Fullscreen Mode for Flowchart

The flowchart panel now supports a dedicated fullscreen view for working with large or complex schemas.

- Toggle fullscreen with the new **Fullscreen** / **Exit Fullscreen** button in the toolbar
- Press `Escape` to exit fullscreen at any time
- Fullscreen is rendered via a React portal (`createPortal`) into `document.body`, ensuring the overlay sits above all other UI at `z-50`
- Wraps the inner flow in `ReactFlowProvider` to preserve diagram state correctly during portal rendering
- Fixes an earlier issue where `fixed inset-0` positioning broke ReactFlow's internal coordinate system when rendered inside nested layout containers

---

## Bug Fixes

- **Fullscreen rendering fix:** Refactored the fullscreen container to use `createPortal` + `ReactFlowProvider`, resolving a bug where the fixed-position overlay did not correctly cover the three-panel layout and caused the ReactFlow canvas to misalign.

---

## Dependencies Added

| Package | Version | Purpose |
|---|---|---|
| `html-to-image` | 1.11.13 | DOM-to-PNG export for the flowchart panel |
| `fsevents` | (native) | macOS file system watcher (indirect peer dep) |

---

## Files Changed

| File | Change |
|---|---|
| `src/components/FlowchartPanel/FlowchartPanel.jsx` | Added export PNG handler, fullscreen state + portal, keyboard shortcut for Esc |
| `package.json` | Added `html-to-image` dependency |
| `package-lock.json` | Lockfile updated |
| `dist/` | Rebuilt production bundle |

---

## Upgrade Notes

No breaking changes. No schema format changes. No migration required.

Run `npm install` if pulling locally to pick up the new `html-to-image` package.
