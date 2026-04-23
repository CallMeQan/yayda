# Yayda MVP Plan

## 1. Understanding Summary

- **What build**: Yayda desktop video downloader (Tauri, React, Rust).
- **Why build**: Easy to download, but flexible for power person.
- **For Who**: Both normal person (Easy Mode) and power person (Power Mode).
- **Constraints**: "Monolith Dark" design (black, sharp corners, Space Grotesk font). Keep everything local. Use Tauri, React, Rust, pnpm.
- **Scope**: Build Easy Mode AND Power Mode. App auto-downloads `yt-dlp` and `ffmpeg`, but user can put custom paths in Power Mode if they want BYOT (bring your own tools).

## 2. Assumptions (NFR)

- **Performance**: App open fast; download fast as internet allow. First-time setup may take slightly longer to fetch tools.
- **Privacy**: All files stay on user computer.
- **Portability**: App store `config.json` next to app file so it is portable. No system trail.
- **Reliability**: Rust run real download and send progress to React (Tauri events).

## 3. Decision Log

1. **Target Audience**: Support both simple and power users via a toggle switch, to keep UI minimal by default.
2. **UI Approach**: "The Expanding Box" over a Wizard layout for power options.
3. **Architecture**: Single React page communicating with a Rust backend function via Tauri commands.
4. **Configuration Storage**: Store `config.json` relative to the program for transparent portability.
5. **Auto-Download Strategy**: Picked "Rust-Managed Auto-Download". Rust checks dependencies on startup and downloads them if missing, before turning off the UI loading spinner.
    - _Why_: Keeps frontend simple; backend completely owns file/dependency logic.

## 4. Final Design

### Architecture & Data Flow

- **Frontend (React + Tailwind via pnpm)**: Single page, Monolith Dark theme.
- **Backend (Rust via Tauri)**: Owns file downloading and dependency management.

**Start Flow**:

1. App Open. React show simple "Waking up..." spinner.
2. Rust read `config.json`. If user put custom paths, use them.
3. If no custom paths, Rust check `./bin` folder for `yt-dlp` and `ffmpeg`.
4. If missing, Rust download them auto from web.
5. Rust tell React "Ready", React hide spinner and show URL input.

**Download Flow**:

1. User paste URL, set Power options if needed.
2. User click "Download".
3. React pass URL and extra flags (format, playlist, speed limit) to Rust.
4. Rust runs `yt-dlp` process, monitors text stream, sends progress to React to update progress bar.

### UI Components

- `MainApp`: Strict black box. 1px border.
- `UrlInput`: Big box. React disable it when download run.
- `PowerModeToggle`: Small button to expand power options.
- `OptionsPanel`: Show Audio only toggle, Playlist toggle, Custom Binaries path inputs.
- `ProgressBar`: Violet line that fill up when download `yt-dlp` or downloading video.

### Error Handling & Edge Cases

- **Bad URL**: React disabled button until regex pass.
- **No Internet at Start**: Rust fails tool fetch, sends network fail event. React shows red error Toast.
- **Download Fail**: `yt-dlp` crashes mid-download. Rust catches crash, sends error message to React to display in red Toast (#ffb4ab).
