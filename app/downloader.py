import os
from dataclasses import dataclass

import yt_dlp

# Reject videos longer than this — protects against large file downloads
# on memory-constrained hosts (Render free tier: 512 MB RAM)
_MAX_DURATION_SECONDS = 600  # 10 minutes


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
        ValueError: If the video exceeds the maximum allowed duration.
        yt_dlp.utils.DownloadError: If the video cannot be downloaded.
        FileNotFoundError: If no video file is found after download.
    """
    # ------------------------------------------------------------------
    # Step 1 — fetch metadata only (no download yet) to check duration
    # ------------------------------------------------------------------
    meta_opts = {"quiet": True, "no_warnings": True, "skip_download": True}
    with yt_dlp.YoutubeDL(meta_opts) as ydl:
        info = ydl.extract_info(url, download=False)

    duration = float(info.get("duration") or 0)
    if duration > _MAX_DURATION_SECONDS:
        raise ValueError(
            f"Video is {int(duration / 60)} min long — only videos up to "
            f"{_MAX_DURATION_SECONDS // 60} min are supported."
        )

    # ------------------------------------------------------------------
    # Step 2 — download lowest viable quality to save memory/disk
    # ------------------------------------------------------------------
    dl_opts = {
        "format": "best[height<=480][ext=mp4]/best[height<=480]/worst",
        "outtmpl": os.path.join(output_dir, "video.%(ext)s"),
        "quiet": True,
        "no_warnings": True,
    }
    with yt_dlp.YoutubeDL(dl_opts) as ydl:
        ydl.download([url])

    video_path = _find_video_file(output_dir)

    return VideoData(
        title=info.get("title") or "",
        description=info.get("description") or "",
        video_path=video_path,
        duration=duration,
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
