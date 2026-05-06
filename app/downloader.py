import json
import os
import urllib.parse
import urllib.request
from dataclasses import dataclass, field

import yt_dlp

_MAX_DURATION_SECONDS = 600  # 10 minutes


@dataclass
class VideoData:
    title: str
    description: str
    platform: str
    video_path: str | None = None          # None for YouTube (no download)
    duration: float = 0.0
    thumbnail_url: str | None = None       # YouTube thumbnail CDN URL


def download_video(url: str, output_dir: str) -> VideoData:
    """Get video metadata and content, downloading only when necessary.

    YouTube videos are never downloaded — we use the thumbnail and
    captions instead to avoid datacenter IP bot-detection blocks.
    Instagram and other platforms are downloaded at low quality.

    Args:
        url: URL of the YouTube or Instagram video.
        output_dir: Directory for downloaded files (used for non-YouTube).

    Returns:
        VideoData with metadata and either a local path or thumbnail URL.

    Raises:
        ValueError: If the video exceeds the maximum allowed duration.
    """
    platform = _detect_platform(url)

    if platform == "youtube":
        return _get_youtube_metadata(url)

    return _download_full_video(url, output_dir, platform)


# ------------------------------------------------------------------
# YouTube — no download, use thumbnail + oEmbed + yt-dlp description
# ------------------------------------------------------------------

def _get_youtube_metadata(url: str) -> VideoData:
    video_id = _extract_youtube_id(url)
    title = _fetch_oembed_title(url)
    description = _fetch_description_safe(url)
    thumbnail_url = _best_thumbnail_url(video_id)

    return VideoData(
        title=title,
        description=description,
        platform="youtube",
        video_path=None,
        thumbnail_url=thumbnail_url,
    )


def _fetch_oembed_title(url: str) -> str:
    """Fetch video title via YouTube oEmbed — no auth, no bot detection."""
    try:
        oembed = f"https://www.youtube.com/oembed?url={urllib.parse.quote(url)}&format=json"
        with urllib.request.urlopen(oembed, timeout=10) as resp:
            return json.loads(resp.read()).get("title") or ""
    except Exception:
        return ""


def _fetch_description_safe(url: str) -> str:
    """Try to get the video description via yt-dlp metadata.

    May fail on cloud IPs due to bot detection — returns empty string
    as a safe fallback so extraction can continue with captions alone.
    """
    try:
        opts = {"quiet": True, "no_warnings": True, "skip_download": True}
        with yt_dlp.YoutubeDL(opts) as ydl:
            info = ydl.extract_info(url, download=False)
            return info.get("description") or ""
    except Exception:
        return ""


def _best_thumbnail_url(video_id: str | None) -> str | None:
    if not video_id:
        return None
    # maxresdefault may not exist for all videos; screenshot.py handles fallback
    return f"https://img.youtube.com/vi/{video_id}/maxresdefault.jpg"


def _extract_youtube_id(url: str) -> str | None:
    from urllib.parse import urlparse, parse_qs
    parsed = urlparse(url)
    if "youtu.be" in parsed.netloc:
        return parsed.path.lstrip("/").split("/")[0]
    if "youtube.com" in parsed.netloc:
        if "/shorts/" in parsed.path:
            return parsed.path.split("/shorts/")[1].split("/")[0]
        qs = parse_qs(parsed.query)
        if "v" in qs:
            return qs["v"][0]
    return None


# ------------------------------------------------------------------
# Instagram / other — full download at low quality
# ------------------------------------------------------------------

def _download_full_video(url: str, output_dir: str, platform: str) -> VideoData:
    # Check duration before downloading
    try:
        meta_opts = {"quiet": True, "no_warnings": True, "skip_download": True}
        with yt_dlp.YoutubeDL(meta_opts) as ydl:
            info = ydl.extract_info(url, download=False)
        duration = float(info.get("duration") or 0)
        if duration > _MAX_DURATION_SECONDS:
            raise ValueError(
                f"Video is {int(duration / 60)} min — only videos up to "
                f"{_MAX_DURATION_SECONDS // 60} min are supported."
            )
        title = info.get("title") or ""
        description = info.get("description") or ""
    except ValueError:
        raise
    except Exception:
        title, description, duration = "", "", 0.0

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
        title=title,
        description=description,
        platform=platform,
        video_path=video_path,
        duration=duration,
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
