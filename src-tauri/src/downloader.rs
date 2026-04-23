use std::fs::File;
use std::io::Write;
use std::path::PathBuf;
use tauri::AppHandle;

pub async fn download_file(url: &str, dest: PathBuf) -> Result<(), String> {
    let response = reqwest::get(url).await.map_err(|e| e.to_string())?;
    let mut file = File::create(&dest).map_err(|e| e.to_string())?;
    let content = response.bytes().await.map_err(|e| e.to_string())?;
    file.write_all(&content).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
pub async fn check_and_download_tools(_app: AppHandle) -> Result<bool, String> {
    let current_exe = std::env::current_exe().unwrap();
    let bin_dir = current_exe.parent().unwrap().join("bin");

    if !bin_dir.exists() {
        std::fs::create_dir_all(&bin_dir).map_err(|e| e.to_string())?;
    }

    let ytdlp_path = bin_dir.join("yt-dlp.exe");
    let ffmpeg_path = bin_dir.join("ffmpeg.exe");
    let ffprobe_path = bin_dir.join("ffprobe.exe");

    if !ytdlp_path.exists() {
        download_file(
            "https://github.com/yt-dlp/yt-dlp/releases/latest/download/yt-dlp.exe",
            ytdlp_path,
        )
        .await?;
    }

    if !ffmpeg_path.exists() || !ffprobe_path.exists() {
        let zip_path = bin_dir.join("ffmpeg.zip");
        download_file("https://github.com/BtbN/FFmpeg-Builds/releases/download/latest/ffmpeg-master-latest-win64-gpl.zip", zip_path.clone()).await?;

        let mut cmd = std::process::Command::new("tar");
        cmd.arg("-xf").arg(&zip_path).arg("-C").arg(&bin_dir);

        #[cfg(target_os = "windows")]
        {
            use std::os::windows::process::CommandExt;
            cmd.creation_flags(0x08000000);
        }

        let status = cmd.status().map_err(|e| e.to_string())?;

        if status.success() {
            let extracted_bin = bin_dir.join("ffmpeg-master-latest-win64-gpl").join("bin");
            let _ = std::fs::rename(extracted_bin.join("ffmpeg.exe"), &ffmpeg_path);
            let _ = std::fs::rename(extracted_bin.join("ffprobe.exe"), &ffprobe_path);
            let _ = std::fs::remove_dir_all(bin_dir.join("ffmpeg-master-latest-win64-gpl"));
        }

        let _ = std::fs::remove_file(zip_path);
    }

    Ok(true)
}
