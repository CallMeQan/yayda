use tauri::{AppHandle, Emitter};
use tauri_plugin_shell::{ShellExt, process::CommandEvent};

#[derive(serde::Deserialize)]
pub struct DownloadOptions {
    pub url: String,
    pub playlist: bool,
    pub custom_ytdlp: Option<String>,
    pub custom_ffmpeg: Option<String>,
    pub save_to_path: Option<String>,
    pub filename_template: Option<String>,
    pub media_type: String, // "video_audio", "video_only", "audio_only"
    pub video_format: String, // "best", "mp4", "mkv", "webm"
    pub video_quality: String, // "best", "2160", "1080", "720", "480"
    pub audio_format: String, // "best", "mp3", "m4a", "wav"
    pub audio_quality: String, // "best", "320", "192", "128"
    pub download_subtitles: bool,
    pub subtitle_lang: Option<String>,
}

#[tauri::command]
pub async fn download_video(app: AppHandle, options: DownloadOptions) -> Result<String, String> {
    let current_exe = std::env::current_exe().unwrap();
    let bin_dir = current_exe.parent().unwrap().join("bin");
    
    let ytdlp_bin = options.custom_ytdlp.filter(|s| !s.is_empty()).unwrap_or_else(|| bin_dir.join("yt-dlp.exe").to_string_lossy().to_string());
    let ffmpeg_bin = options.custom_ffmpeg.filter(|s| !s.is_empty()).unwrap_or_else(|| bin_dir.join("ffmpeg.exe").to_string_lossy().to_string());

    let mut args = vec![
        options.url.clone(),
        "--ffmpeg-location".to_string(), ffmpeg_bin,
    ];

    if options.media_type == "audio_only" {
        args.push("-x".to_string());
        if options.audio_format != "best" {
            args.push("--audio-format".to_string());
            args.push(options.audio_format.clone());
        }
        if options.audio_quality != "best" {
            args.push("--audio-quality".to_string());
            args.push(options.audio_quality.clone());
        }
    } else {
        let mut v_sel = "bestvideo".to_string();
        if options.video_format != "best" {
            v_sel.push_str(&format!("[ext={}]", options.video_format));
        }
        if options.video_quality != "best" {
            v_sel.push_str(&format!("[height<={}]", options.video_quality));
        }

        let mut a_sel = "bestaudio".to_string();
        if options.audio_format != "best" {
            a_sel.push_str(&format!("[ext={}]", options.audio_format));
        }

        if options.media_type == "video_only" {
            args.push("-f".to_string());
            args.push(v_sel);
        } else {
            args.push("-f".to_string());
            args.push(format!("{}+{}/best", v_sel, a_sel));
        }
    }

    if !options.playlist {
        args.push("--no-playlist".to_string());
    }

    if options.download_subtitles {
        args.push("--write-auto-subs".to_string());
        args.push("--write-subs".to_string());
        if let Some(lang) = options.subtitle_lang.filter(|s| !s.is_empty()) {
            args.push("--sub-langs".to_string());
            args.push(lang);
        }
    }

    let out_dir = options.save_to_path.filter(|s| !s.is_empty())
        .map(std::path::PathBuf::from)
        .unwrap_or_else(|| current_exe.parent().unwrap().join("downloads"));

    if !out_dir.exists() {
        let _ = std::fs::create_dir_all(&out_dir);
    }
    
    let template = options.filename_template.filter(|s| !s.is_empty()).unwrap_or_else(|| "%(title)s.%(ext)s".to_string());
    args.push("-o".to_string());
    args.push(out_dir.join(template).to_string_lossy().to_string());

    let (mut rx, _child) = app.shell().command(ytdlp_bin).args(args).spawn().map_err(|e| e.to_string())?;

    while let Some(event) = rx.recv().await {
        if let CommandEvent::Stdout(line) = event {
            let text = String::from_utf8_lossy(&line).to_string();
            app.emit("download_progress", text).unwrap_or(());
        }
    }

    Ok("Download Complete".to_string())
}
