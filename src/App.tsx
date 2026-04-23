import { useState, useEffect } from "react";
import { invoke } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import { info, error, warn } from "@tauri-apps/plugin-log";
import { Loader2, Download, Settings, RefreshCw, AlertCircle, CheckCircle2, ChevronDown, ChevronUp } from "lucide-react";

// shadcn/ui components
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

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
            const audioBr = data.audio_bitrates.map((b: number) => String(Math.round(b)));

            setAvailableResolutions(videoRes);
            setAvailableAudioBitrates(audioBr);

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
            <div className="dark min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4 selection:bg-primary/30">
                <div className="flex flex-col items-center space-y-4">
                    <h1 className="text-3xl font-extrabold tracking-tight">YAYDA.</h1>
                    {initError ? (
                        <Alert variant="destructive" className="max-w-sm bg-destructive/10 py-2">
                            <AlertCircle className="h-4 w-4" />
                            <AlertTitle className="text-sm">Initialization Failed</AlertTitle>
                            <AlertDescription className="font-mono text-[10px] mt-1">{initError}</AlertDescription>
                        </Alert>
                    ) : (
                        <div className="flex flex-col items-center space-y-3">
                            <Loader2 className="h-6 w-6 animate-spin text-primary" />
                            <p className="text-xs font-medium text-muted-foreground tracking-widest uppercase">Fetching Tools...</p>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    return (
        <div className="dark min-h-screen bg-background text-foreground p-4 font-sans antialiased selection:bg-primary/30 flex items-center justify-center relative overflow-hidden">
            {/* Subtle background glow effect */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-primary/10 rounded-full blur-[100px] pointer-events-none"></div>

            <Card className="w-full max-w-xl border-border/30 shadow-2xl bg-background/70 backdrop-blur-xl rounded-xl relative z-10">
                <CardHeader className="pb-3 pt-5 px-5">
                    <CardTitle className="text-2xl font-extrabold tracking-tight">yayda</CardTitle>
                    <CardDescription className="text-xs">yet another yt download application</CardDescription>
                </CardHeader>

                <CardContent className="space-y-4 px-5">
                    {/* Toast Notification */}
                    {toast && (
                        <Alert variant={toast.type === "error" ? "destructive" : "default"} className={`rounded-lg py-2 px-3 ${toast.type === "success" ? "border-green-500/30 bg-green-500/10 text-green-500" : ""}`}>
                            {toast.type === "error" ? <AlertCircle className="h-4 w-4" /> : <CheckCircle2 className="h-4 w-4 text-green-500" />}
                            <div className="flex justify-between items-center w-full">
                                <AlertTitle className="mb-0 text-xs font-medium">{toast.msg}</AlertTitle>
                                <Button variant="ghost" size="sm" className="h-6 text-[10px] px-2 hover:bg-transparent" onClick={() => setToast(null)}>Dismiss</Button>
                            </div>
                        </Alert>
                    )}

                    {/* URL Input & Fetch */}
                    <div className="flex gap-2">
                        <Input
                            type="url"
                            className="h-9 text-sm rounded-lg bg-muted/40 border-border/40 focus-visible:ring-1 focus-visible:ring-primary/50"
                            placeholder="Enter Media URL..."
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            disabled={downloading || fetchingInfo}
                        />
                        <Button
                            onClick={handleFetchInfo}
                            disabled={!url || downloading || fetchingInfo}
                            variant="secondary"
                            className="h-9 px-4 rounded-lg font-medium text-xs"
                        >
                            {fetchingInfo ? <Loader2 className="h-4 w-4 animate-spin" /> : <><RefreshCw className="mr-2 h-3 w-3" /> Fetch</>}
                        </Button>
                    </div>

                    {/* Power Mode Toggle */}
                    <div className="flex justify-between items-center">
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setPowerMode(!powerMode)}
                            disabled={downloading}
                            className="h-7 px-2 text-muted-foreground hover:text-foreground text-[10px] uppercase tracking-wider font-semibold rounded-md"
                        >
                            <Settings className="mr-1.5 h-3 w-3" />
                            Power Mode {powerMode ? <ChevronUp className="ml-1 h-3 w-3" /> : <ChevronDown className="ml-1 h-3 w-3" />}
                        </Button>
                    </div>

                    {/* Power Mode Settings */}
                    {powerMode && (
                        <div className="space-y-4 bg-muted/20 p-4 rounded-lg border border-border/30 animate-in slide-in-from-top-1 fade-in duration-150">
                            
                            {/* General Settings */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Media Type</Label>
                                    <Select value={mediaType} onValueChange={setMediaType}>
                                        <SelectTrigger className="h-8 text-xs rounded-md bg-background/40">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="rounded-lg text-xs">
                                            <SelectItem value="video_audio">Video + Audio</SelectItem>
                                            <SelectItem value="video_only">Video Only</SelectItem>
                                            <SelectItem value="audio_only">Audio Only</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className="flex items-center justify-between rounded-md border border-border/30 bg-background/40 px-3 py-1.5">
                                    <div className="space-y-0.5">
                                        <Label className="text-xs font-medium">Allow Playlist</Label>
                                    </div>
                                    <Switch checked={playlist} onCheckedChange={setPlaylist} className="scale-75 origin-right" />
                                </div>
                            </div>

                            {/* Video Settings */}
                            {mediaType !== "audio_only" && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-border/30">
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Video Format</Label>
                                        <Select value={videoFormat} onValueChange={setVideoFormat}>
                                            <SelectTrigger className="h-8 text-xs rounded-md bg-background/40">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-lg text-xs">
                                                <SelectItem value="best">Best Available</SelectItem>
                                                <SelectItem value="mp4">MP4</SelectItem>
                                                <SelectItem value="mkv">MKV</SelectItem>
                                                <SelectItem value="webm">WebM</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Video Quality</Label>
                                        <Select value={videoQuality} onValueChange={setVideoQuality}>
                                            <SelectTrigger className="h-8 text-xs rounded-md bg-background/40">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-lg text-xs max-h-48">
                                                <SelectItem value="best">Best Available</SelectItem>
                                                {availableResolutions.length > 0 ? (
                                                    availableResolutions.map(res => (
                                                        <SelectItem key={res} value={res}>{res}p</SelectItem>
                                                    ))
                                                ) : (
                                                    <>
                                                        <SelectItem value="2160">4K (2160p)</SelectItem>
                                                        <SelectItem value="1440">1440p</SelectItem>
                                                        <SelectItem value="1080">1080p</SelectItem>
                                                        <SelectItem value="720">720p</SelectItem>
                                                        <SelectItem value="480">480p</SelectItem>
                                                        <SelectItem value="360">360p</SelectItem>
                                                    </>
                                                )}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            )}

                            {/* Audio Settings */}
                            {mediaType !== "video_only" && (
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-border/30">
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Audio Format</Label>
                                        <Select value={audioFormat} onValueChange={setAudioFormat}>
                                            <SelectTrigger className="h-8 text-xs rounded-md bg-background/40">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-lg text-xs">
                                                <SelectItem value="best">Best Available</SelectItem>
                                                <SelectItem value="mp3">MP3</SelectItem>
                                                <SelectItem value="m4a">M4A</SelectItem>
                                                <SelectItem value="wav">WAV</SelectItem>
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Audio Quality</Label>
                                        <Select value={audioQuality} onValueChange={setAudioQuality}>
                                            <SelectTrigger className="h-8 text-xs rounded-md bg-background/40">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="rounded-lg text-xs max-h-48">
                                                <SelectItem value="best">Best Available</SelectItem>
                                                {availableAudioBitrates.length > 0 ? (
                                                    availableAudioBitrates.map(bitrate => (
                                                        <SelectItem key={bitrate} value={bitrate}>{bitrate} kbps</SelectItem>
                                                    ))
                                                ) : (
                                                    <>
                                                        <SelectItem value="320">320 kbps</SelectItem>
                                                        <SelectItem value="256">256 kbps</SelectItem>
                                                        <SelectItem value="192">192 kbps</SelectItem>
                                                        <SelectItem value="128">128 kbps</SelectItem>
                                                        <SelectItem value="64">64 kbps</SelectItem>
                                                    </>
                                                )}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                </div>
                            )}

                            {/* Subtitles & Paths */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-border/30">
                                <div className="flex items-center justify-between rounded-md border border-border/30 bg-background/40 px-3 py-1.5">
                                    <div className="space-y-0.5">
                                        <Label className="text-xs font-medium">Download Subtitles</Label>
                                    </div>
                                    <Switch checked={downloadSubtitles} onCheckedChange={setDownloadSubtitles} className="scale-75 origin-right" />
                                </div>
                                {downloadSubtitles && (
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Subtitle Lang</Label>
                                        <Input 
                                            value={subtitleLang} 
                                            onChange={e => setSubtitleLang(e.target.value)} 
                                            placeholder="en, es, all" 
                                            className="h-8 text-xs rounded-md bg-background/40" 
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="space-y-3 pt-3 border-t border-border/30">
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Save Directory</Label>
                                    <Input 
                                        value={saveToPath} 
                                        onChange={e => setSaveToPath(e.target.value)} 
                                        placeholder="Blank for project folder" 
                                        className="h-8 rounded-md bg-background/40 font-mono text-[10px]" 
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Filename Template</Label>
                                    <Input 
                                        value={filenameTemplate} 
                                        onChange={e => setFilenameTemplate(e.target.value)} 
                                        placeholder="%(title)s.%(ext)s" 
                                        className="h-8 rounded-md bg-background/40 font-mono text-[10px]" 
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">yt-dlp Path</Label>
                                        <Input 
                                            value={customYtdlp} 
                                            onChange={e => setCustomYtdlp(e.target.value)} 
                                            placeholder="Absolute path" 
                                            className="h-8 rounded-md bg-background/40 font-mono text-[10px]" 
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">ffmpeg Path</Label>
                                        <Input 
                                            value={customFfmpeg} 
                                            onChange={e => setCustomFfmpeg(e.target.value)} 
                                            placeholder="Absolute path" 
                                            className="h-8 rounded-md bg-background/40 font-mono text-[10px]" 
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </CardContent>

                <CardFooter className="flex flex-col items-stretch space-y-3 pb-5 px-5 pt-2">
                    <Button
                        size="default"
                        className="w-full h-10 text-sm font-bold rounded-lg tracking-wide transition-all shadow-md hover:shadow-lg hover:scale-[1.01] active:scale-[0.99]"
                        disabled={!url || downloading}
                        onClick={handleDownload}
                    >
                        {downloading ? (
                            <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Downloading...</>
                        ) : (
                            <><Download className="mr-2 h-4 w-4" /> Download</>
                        )}
                    </Button>

                    {downloading && progressMsg && (
                        <div className="rounded-md bg-muted/30 p-2 border border-border/40 animate-in fade-in slide-in-from-bottom-1">
                            <p className="font-mono text-[10px] text-muted-foreground truncate" title={progressMsg}>
                                {progressMsg}
                            </p>
                        </div>
                    )}
                </CardFooter>
            </Card>
        </div>
    );
}

export default App;