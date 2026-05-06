import base64
import os
import subprocess
import urllib.request

from .downloader import VideoData


def get_screenshot(video_data: VideoData) -> str:
    """Return a base64-encoded JPEG screenshot for the video.

    For YouTube, downloads the thumbnail from the CDN (no video needed).
    For other platforms, extracts a frame from the downloaded video file.

    Args:
        video_data: VideoData with either a thumbnail_url or a video_path.

    Returns:
        Base64-encoded JPEG string, or empty string if all sources fail.
    """
    if video_data.thumbnail_url:
        return _fetch_thumbnail(video_data.thumbnail_url)

    if video_data.video_path:
        return _extract_frame(video_data.video_path, video_data.duration)

    return ""


# ------------------------------------------------------------------
# Thumbnail download (YouTube)
# ------------------------------------------------------------------

def _fetch_thumbnail(url: str) -> str:
    """Download a YouTube thumbnail, falling back to lower quality."""
    for quality in ("maxresdefault", "hqdefault", "mqdefault"):
        resolved = url.replace("maxresdefault", quality)
        try:
            with urllib.request.urlopen(resolved, timeout=10) as resp:
                data = resp.read()
            if len(data) > 5_000:  # skip placeholder 1×1 images
                return base64.b64encode(data).decode("utf-8")
        except Exception:
            continue
    return ""


# ------------------------------------------------------------------
# Frame extraction (Instagram / other downloaded videos)
# ------------------------------------------------------------------

def _extract_frame(video_path: str, duration: float) -> str:
    """Extract a frame from a local video file as a base64-encoded JPEG.

    Args:
        video_path: Path to the local video file.
        duration: Total video duration in seconds.

    Returns:
        Base64-encoded JPEG string.

    Raises:
        subprocess.CalledProcessError: If ffmpeg fails.
    """
    timestamp = max(3.0, duration * 0.25) if duration > 0 else 5.0
    output_path = os.path.splitext(video_path)[0] + "_screenshot.jpg"

    subprocess.run(
        ["ffmpeg", "-y", "-ss", str(timestamp), "-i", video_path,
         "-vframes", "1", "-q:v", "2", output_path],
        check=True,
        capture_output=True,
    )

    with open(output_path, "rb") as f:
        return base64.b64encode(f.read()).decode("utf-8")
