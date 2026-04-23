import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { info, error, warn } from "@tauri-apps/plugin-log";
import "./App.css";

type DownloadOptions = {
    url: string;
    playlist: boolean;
    custom_ytdlp: string | null;
    custom_ffmpeg: string | null;
    save_to_path: string | null;
    filename_template: string | null;
    media_type: string;
    video_format: string;
    video_quality: string;
    audio_format: string;
    audio_quality: string;
    download_subtitles: boolean;
    subtitle_lang: string | null;
};

function App() {
    const [loading, setLoading] = useState(true);
    const [initError, setInitError] = useState("");

    const [url, setUrl] = useState("");
    const [powerMode, setPowerMode] = useState(false);

    // Power Mode Options
    const [playlist, setPlaylist] = useState(false);
    const [saveToPath, setSaveToPath] = useState("");
    const [filenameTemplate, setFilenameTemplate] = useState("");
    const [mediaType, setMediaType] = useState("video_audio");
    const [videoFormat, setVideoFormat] = useState("best");
    const [videoQuality, setVideoQuality] = useState("best");
    const [audioFormat, setAudioFormat] = useState("best");
    const [audioQuality, setAudioQuality] = useState("best");
    const [downloadSubtitles, setDownloadSubtitles] = useState(false);
    const [subtitleLang, setSubtitleLang] = useState("en");
    const [customYtdlp, setCustomYtdlp] = useState("");
    const [customFfmpeg, setCustomFfmpeg] = useState("");

    const [downloading, setDownloading] = useState(false);
    const [progressMsg, setProgressMsg] = useState("");
    const [toast, setToast] = useState<{ msg: string, type: "error" | "success" } | null>(null);

    // Fetch the video
    const [availableResolutions, setAvailableResolutions] = useState<string[]>([]);
    const [fetchingInfo, setFetchingInfo] = useState(false);
    const [availableAudioBitrates, setAvailableAudioBitrates] = useState<string[]>([]);

    useEffect(() => {
        const unlistenPromise = listen<string>("download_progress", (event) => {
            setProgressMsg(event.payload);
        });

        async function init() {
            try {
                await invoke("check_and_download_tools");
                setLoading(false);
            } catch (e: any) {
                setInitError("Failed to download tools: " + e);
            }
        }
        init();

        return () => {
            unlistenPromise.then(f => f());
        };
    }, []);

    const isValidUrl = (s: string) => {
        try {
            new URL(s);
            return true;
        } catch {
            return false;
        }
    };

    const handleDownload = async () => {
        if (!isValidUrl(url)) {
            warn(`User invalid URL: ${url}`);
            setToast({ msg: "Please enter a valid HTTP URL", type: "error" });
            return;
        }
        info(`Download URL: ${url} | Format: ${videoFormat} | Quality: ${videoQuality}`);
        setDownloading(true);
        setProgressMsg("Starting download...");
        setToast(null);

        const options: DownloadOptions = {
            url,
            playlist,
            custom_ytdlp: customYtdlp.trim() || null,
            custom_ffmpeg: customFfmpeg.trim() || null,
            save_to_path: saveToPath.trim() || null,
            filename_template: filenameTemplate.trim() || null,
            media_type: mediaType,
            video_format: videoFormat,
            video_quality: videoQuality,
            audio_format: audioFormat,
            audio_quality: audioQuality,
            download_subtitles: downloadSubtitles,
            subtitle_lang: subtitleLang.trim() || null,
        };

        try {
            const response = await invoke<string>("download_video", { options });
            info(`Download successful: ${response}`);
            setToast({ msg: response, type: "success" });
            setProgressMsg("");
            setUrl("");
        } catch (e: any) {
            error(`Download failed with exception: ${e}`);
            setToast({ msg: `Error: ${e}`, type: "error" });
            setProgressMsg("");
        } finally {
            setDownloading(false);
        }
    };

    const handleFetchInfo = async () => {
        if (!isValidUrl(url)) {
            warn(`User invalid URL: ${url}`);
            setToast({ msg: "Please enter a valid HTTP URL", type: "error" });
            return;
        }
        info(`Fetching format metadata for URL: ${url}`);
        setFetchingInfo(true);
        setProgressMsg("Extracting format data...");
        setToast(null);
    
        try {
            const jsonStr = await invoke<string>("fetch_formats", { 
                url, 
                customYtdlp: customYtdlp.trim() || null 
            });
            
            info(`Format metadata found for URL: ${url}`);
            const data = JSON.parse(jsonStr);
            
            const videoRes = data.video_resolutions.map(String);
            // Round bitrates to integers for cleaner UI display (e.g., 129.5 -> 130)
            const audioBr = data.audio_bitrates.map((b: number) => String(Math.round(b)));
            
            setAvailableResolutions(videoRes);
            setAvailableAudioBitrates(audioBr);
            
            // Automatically select the highest available qualities
            if (videoRes.length > 0) setVideoQuality(videoRes[0]);
            if (audioBr.length > 0) setAudioQuality(audioBr[0]);
            
            setToast({ msg: "Format parameters synchronized.", type: "success" });
        } catch (e: any) {
            error(`Failed to extract format metadata: ${e}`);
            setToast({ msg: `Extraction Error: ${e}`, type: "error" });
        } finally {
            setFetchingInfo(false);
            setProgressMsg("");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-4">
                <h1 className="font-display text-4xl font-bold mb-4 tracking-tighter">YAYDA.</h1>
                {initError ? (
                    <div className="border border-error bg-surface p-4 text-error">
                        <p className="font-display">Initialization Failed</p>
                        <p className="text-sm font-mono mt-2">{initError}</p>
                    </div>
                ) : (
                    <div className="flex flex-col items-center">
                        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                        <p className="mt-4 font-mono text-sm tracking-widest text-primary">WAKING UP / FETCHING TOOLS...</p>
                    </div>
                )}
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-black text-white p-4 font-sans">
            <div className="max-w-2xl mx-auto mt-10 border border-gray-800 bg-surface p-6 shadow-2xl relative">
                <h1 className="font-display text-5xl font-bold mb-8 tracking-tighter">YAYDA.</h1>

                {toast && (
                    <div className={`p-4 mb-6 border font-mono text-sm ${toast.type === "error" ? "border-error text-error bg-opacity-10 bg-error" : "border-primary text-primary"}`}>
                        {toast.msg}
                        <button className="float-right underline hover:text-white" onClick={() => setToast(null)}>dismiss</button>
                    </div>
                )}

                <div className="flex flex-col gap-6">
                    <div className="flex gap-2">
                        <input
                            type="url"
                            className="w-full bg-black border border-gray-600 p-4 font-mono focus:border-white focus:outline-none transition-colors"
                            placeholder="ENTER VIDEO URL"
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            disabled={downloading || fetchingInfo}
                        />
                        <button 
                            onClick={handleFetchInfo}
                            disabled={!url || downloading || fetchingInfo}
                            className="bg-white text-black px-6 font-display font-bold hover:bg-gray-200 transition-colors disabled:opacity-50"
                        >
                            {fetchingInfo ? "..." : "FETCH"}
                        </button>
                    </div>

                    <div className="flex justify-between items-center text-sm font-mono tracking-widest text-gray-500">
                        <button
                            onClick={() => setPowerMode(!powerMode)}
                            className="hover:text-primary transition-colors flex items-center gap-2"
                            disabled={downloading}
                        >
                            POWER MODE {powerMode ? "[-]" : "[+]"}
                        </button>
                    </div>

                    {powerMode && (
                        <div className="border border-gray-800 p-4 flex flex-col gap-4 bg-black/40 text-sm">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-2">
                                    <label className="font-mono text-xs text-gray-500">MEDIA TYPE</label>
                                    <select value={mediaType} onChange={e => setMediaType(e.target.value)} className="bg-black border border-gray-600 p-2 font-mono text-gray-300 focus:border-white outline-none">
                                        <option value="video_audio">Video + Audio</option>
                                        <option value="video_only">Video Only</option>
                                        <option value="audio_only">Audio Only</option>
                                    </select>
                                </div>
                                <div className="flex flex-col gap-2">
                                    <label className="font-mono text-xs text-gray-500">PLAYLIST</label>
                                    <label className="flex items-center gap-2 font-mono mt-2 cursor-pointer select-none text-gray-300">
                                        <input type="checkbox" checked={playlist} onChange={e => setPlaylist(e.target.checked)} className="w-4 h-4 accent-primary bg-black border-gray-600" />
                                        ALLOW PLAYLIST
                                    </label>
                                </div>
                            </div>

                            {mediaType !== "audio_only" && (
                                <div className="grid grid-cols-2 gap-4 border-t border-gray-800 pt-4">
                                    <div className="flex flex-col gap-2">
                                        <label className="font-mono text-xs text-gray-500">VIDEO FORMAT</label>
                                        <select value={videoFormat} onChange={e => setVideoFormat(e.target.value)} className="bg-black border border-gray-600 p-2 font-mono text-gray-300 outline-none">
                                            <option value="best">Best Available</option>
                                            <option value="mp4">MP4</option>
                                            <option value="mkv">MKV</option>
                                            <option value="webm">WebM</option>
                                        </select>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="font-mono text-xs text-gray-500">VIDEO QUALITY</label>
                                        <select value={videoQuality} onChange={e => setVideoQuality(e.target.value)} className="bg-black border border-gray-600 p-2 font-mono text-gray-300 outline-none">
                                            <option value="best">Best Available</option>
                                            {availableResolutions.length > 0 ? (
                                                availableResolutions.map(res => (
                                                    <option key={res} value={res}>{res}p</option>
                                                ))
                                            ) : (
                                                <>
                                                    <option value="2160">4K (2160p)</option>
                                                    <option value="1440">1440p</option>
                                                    <option value="1080">1080p</option>
                                                    <option value="720">720p</option>
                                                    <option value="480">480p</option>
                                                    <option value="360">360p</option>
                                                    <option value="240">240p</option>
                                                    <option value="144">144p</option>
                                                </>
                                            )}
                                        </select>
                                    </div>
                                </div>
                            )}

                            {mediaType !== "video_only" && (
                                <div className="grid grid-cols-2 gap-4 border-t border-gray-800 pt-4">
                                    <div className="flex flex-col gap-2">
                                        <label className="font-mono text-xs text-gray-500">AUDIO FORMAT</label>
                                        <select value={audioFormat} onChange={e => setAudioFormat(e.target.value)} className="bg-black border border-gray-600 p-2 font-mono text-gray-300 outline-none">
                                            <option value="best">Best Available</option>
                                            <option value="mp3">MP3</option>
                                            <option value="m4a">M4A</option>
                                            <option value="wav">WAV</option>
                                        </select>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="font-mono text-xs text-gray-500">AUDIO QUALITY</label>
                                        <select value={audioQuality} onChange={e => setAudioQuality(e.target.value)} className="bg-black border border-gray-600 p-2 font-mono text-gray-300 outline-none">
                                            <option value="best">Best Available</option>
                                            {availableAudioBitrates.length > 0 ? (
                                                availableAudioBitrates.map(bitrate => (
                                                    <option key={bitrate} value={bitrate}>{bitrate} kbps</option>
                                                ))
                                            ) : (
                                                <>
                                                    <option value="320">320 kbps</option>
                                                    <option value="256">256 kbps</option>
                                                    <option value="192">192 kbps</option>
                                                    <option value="128">128 kbps</option>
                                                    <option value="64">64 kbps</option>
                                                </>
                                            )}
                                        </select>
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-4 border-t border-gray-800 pt-4">
                                <div className="flex flex-col gap-2">
                                    <label className="font-mono text-xs text-gray-500">SUBTITLES</label>
                                    <label className="flex items-center gap-2 font-mono mt-2 cursor-pointer select-none text-gray-300">
                                        <input type="checkbox" checked={downloadSubtitles} onChange={e => setDownloadSubtitles(e.target.checked)} className="w-4 h-4 accent-primary bg-black border-gray-600" />
                                        DOWNLOAD SUBS
                                    </label>
                                </div>
                                {downloadSubtitles && (
                                    <div className="flex flex-col gap-2">
                                        <label className="font-mono text-xs text-gray-500">SUBTITLE LANG. (DEFAULT: EN)</label>
                                        <input type="text" value={subtitleLang} onChange={e => setSubtitleLang(e.target.value)} placeholder="en, es, all" className="bg-black border border-gray-600 p-2 font-mono text-gray-300 outline-none" />
                                    </div>
                                )}
                            </div>

                            <div className="flex flex-col gap-3 border-t border-gray-800 pt-4 mt-2">
                                <div className="flex flex-col gap-1">
                                    <span className="font-mono text-xs text-gray-500">SAVE DIRECTORY (BLANK FOR PROJECT FOLDER)</span>
                                    <input type="text" value={saveToPath} onChange={e => setSaveToPath(e.target.value)} placeholder="Wait for user input e.g. C:\Videos" className="bg-black border border-gray-800 p-2 font-mono text-xs text-gray-300 w-full focus:border-gray-500 outline-none" />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="font-mono text-xs text-gray-500">FILENAME TEMPLATE (BLANK FOR YT-DLP DEFAULT)</span>
                                    <input type="text" value={filenameTemplate} onChange={e => setFilenameTemplate(e.target.value)} placeholder="%(title)s.%(ext)s" className="bg-black border border-gray-800 p-2 font-mono text-xs text-gray-300 w-full focus:border-gray-500 outline-none" />
                                </div>
                                <div className="flex flex-col gap-1">
                                    <span className="font-mono text-xs text-gray-500">CUSTOM BINARIES (YT-DLP & FFMPEG)</span>
                                    <div className="flex gap-2">
                                        <input type="text" value={customYtdlp} onChange={e => setCustomYtdlp(e.target.value)} placeholder="yt-dlp absolute path" className="bg-black border border-gray-800 p-2 font-mono text-xs text-gray-300 w-full focus:border-gray-500 outline-none" />
                                        <input type="text" value={customFfmpeg} onChange={e => setCustomFfmpeg(e.target.value)} placeholder="ffmpeg absolute path" className="bg-black border border-gray-800 p-2 font-mono text-xs text-gray-300 w-full focus:border-gray-500 outline-none" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    <button
                        className="w-full text-black bg-white font-display font-bold tracking-widest p-4 hover:bg-primary-container hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed text-lg mt-2 uppercase"
                        disabled={!url || downloading}
                        onClick={handleDownload}
                    >
                        {downloading ? "DOWNLOADING..." : "DOWNLOAD"}
                    </button>

                    {downloading && progressMsg && (
                        <div className="border border-primary/30 p-3 mt-4 overflow-hidden bg-black/50">
                            <p className="font-mono text-xs text-primary truncate" title={progressMsg}>
                                {progressMsg}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default App;
