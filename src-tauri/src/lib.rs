mod downloader;
mod runner;

use chrono::Local;
use tauri_plugin_log::{Target, TargetKind};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let log_filename = Local::now().format("%d-%m-%y_%H-%M-%S.log").to_string();
    tauri::Builder::default()
        .plugin(tauri_plugin_log::Builder::new()
            .targets([
                Target::new(TargetKind::Stdout),
                Target::new(TargetKind::Webview),
                Target::new(TargetKind::Folder {
                    path: std::path::PathBuf::from("logs"),
                    file_name: Some(log_filename),
                }),
            ])
            .build())
        .plugin(tauri_plugin_fs::init())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_opener::init())
        .invoke_handler(tauri::generate_handler![
            downloader::check_and_download_tools,
            runner::download_video,
            runner::fetch_formats
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
