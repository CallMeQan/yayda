# yayda (Yet Another Youtube Downloader application)

## Getting Start

Download at [release tab](https://github.com/CallMeQan/yayda/releases/latest/)

or you can build it yourself

## Development

1. `git clone https://github.com/CallMeQan/yayda`
2. `cd yayda`
3. `pnpm install`
4. `pnpm tauri dev`

To build project, run `pnpm tauri build --no-bundle`, this will took a while, the build version is in `.\src-tauri\target\release\yayda-tauri.exe`. Default to Windows only, edit build config at [tauri.conf.json](./src-tauri/tauri.conf.json)
