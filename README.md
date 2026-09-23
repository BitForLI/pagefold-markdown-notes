# Pagefold

Pagefold is a small Windows Markdown editor. Its main rule is that my notes should still make sense without Pagefold: every note is an ordinary `.md` file inside a folder I choose.

[Download the Windows installer](https://github.com/BitForLI/pagefold-markdown-notes/releases/latest)

I started this project because I like the portability of Markdown but not the experience of writing directly in a large folder tree. Pagefold adds tabs, preview, search, links, attachments, and drag-and-drop organisation without moving the writing into a private database or requiring an account.

## The awkward case that shaped the app

Local files can be changed by more than one program. A sync tool may update a note while it is still open in Pagefold, and silently choosing either version risks losing work.

Pagefold watches the selected library and compares the expected disk content before saving. If an external change conflicts with unsaved text, it first tries to write the local version to a `-local-conflict` file and then loads the changed disk version. Saves are serialized per file so an older async completion cannot report a newer edit as saved.

This handles common conflicts, but it is not an atomic compare-and-swap and it is not a promise that every filesystem race is impossible. That is also why the packaged smoke check should be run against a test library.

## Everyday use

- create, rename, move, and organise Markdown notes and folders
- edit with Markdown preview, GFM tables, maths, links, and attachments
- search the library and follow wiki-style links and backlinks
- reopen previous tabs and restore display settings
- use a OneDrive, Dropbox, or Syncthing folder if desired; Pagefold does not provide its own cloud sync
- create a dated backup of notes and attachments in a separate folder

The default Windows library is `%APPDATA%\pagefold\vault`. A different folder can be selected in **Settings > Library location**. Changing libraries never moves or deletes the previous folder automatically.

Backups are manual rather than scheduled. Pagefold saves open notes before copying the library, but the copy is not an atomic snapshot if another program is changing files at the same time.

## Where the main ideas live

- [`src/main/index.ts`](src/main/index.ts) handles filesystem operations and library watching in the Electron main process.
- [`src/preload/index.ts`](src/preload/index.ts) exposes a typed API to the React renderer without enabling Node integration there.
- [`src/renderer/src/components/EditorPane.tsx`](src/renderer/src/components/EditorPane.tsx) contains the editing and preview experience.
- [`src/renderer/src/App.tsx`](src/renderer/src/App.tsx) coordinates open tabs, saves, and external-change reconciliation.
- [`src/main/libraryBackup.ts`](src/main/libraryBackup.ts) implements the separate library backup.

Markdown tests exercise link handling and source locations. The packaged smoke script checks selected file, IPC, and interface paths. Neither is presented as exhaustive proof against data loss.

## Development

```powershell
npm install
npm run dev
```

Run the checks and create the Windows installer with:

```powershell
npm test
npm run build
npm run dist:win
```

The installer is written to `release/Pagefold-Setup-<version>.exe`.

Built with Electron, React, TypeScript, Vite, Vitest, and electron-builder.
