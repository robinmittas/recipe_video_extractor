import os
from dataclasses import dataclass

import yt_dlp


@dataclass
class VideoData:
    title: str
    description: str
    video_path: str
    duration: float
    platform: str


def download_video(url: str, output_dir: str) -> VideoData:
    """Download a video and return its metadata and local path.

    Args:
        url: URL of the YouTube or Instagram video.
        output_dir: Directory to save the downloaded file.

    Returns:
        VideoData containing metadata and local file path.

    Raises:
        yt_dlp.utils.DownloadError: If the video cannot be downloaded.
        FileNotFoundError: If no video file is found after download.
    """
    ydl_opts = {
        "format": "best[height<=480][ext=mp4]/best[height<=480]/worst",
        "outtmpl": os.path.join(output_dir, "video.%(ext)s"),
        "quiet": True,
        "no_warnings": True,
    }

    with yt_dlp.YoutubeDL(ydl_opts) as ydl:
        info = ydl.extract_info(url, download=True)

    video_path = _find_video_file(output_dir)

    return VideoData(
        title=info.get("title") or "",
        description=info.get("description") or "",
        video_path=video_path,
        duration=float(info.get("duration") or 0),
        platform=_detect_platform(url),
    )


# ------------------------------------------------------------------
# Helpers
# ------------------------------------------------------------------

_VIDEO_EXTENSIONS = {".mp4", ".mkv", ".webm", ".mov", ".avi"}


def _find_video_file(output_dir: str) -> str:
    for filename in os.listdir(output_dir):
        if os.path.splitext(filename)[1].lower() in _VIDEO_EXTENSIONS:
            return os.path.join(output_dir, filename)
    raise FileNotFoundError(f"No video file found in {output_dir}")


def _detect_platform(url: str) -> str:
    if "youtube.com" in url or "youtu.be" in url:
        return "youtube"
    if "instagram.com" in url:
        return "instagram"
    return "unknown"
