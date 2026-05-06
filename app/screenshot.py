import base64
import os
import subprocess


def extract_screenshot(video_path: str, duration: float) -> str:
    """Extract a frame from the video as a base64-encoded JPEG.

    Picks a frame at ~25% into the video — past any intro titles but
    before the end — to capture a representative cooking moment.

    Args:
        video_path: Path to the local video file.
        duration: Total video duration in seconds.

    Returns:
        Base64-encoded JPEG image string.

    Raises:
        subprocess.CalledProcessError: If ffmpeg fails.
        FileNotFoundError: If the output screenshot is not created.
    """
    timestamp = _pick_timestamp(duration)
    output_path = os.path.splitext(video_path)[0] + "_screenshot.jpg"

    subprocess.run(
        [
            "ffmpeg", "-y",
            "-ss", str(timestamp),
            "-i", video_path,
            "-vframes", "1",
            "-q:v", "2",
            output_path,
        ],
        check=True,
        capture_output=True,
    )

    with open(output_path, "rb") as f:
        return base64.b64encode(f.read()).decode("utf-8")


def _pick_timestamp(duration: float) -> float:
    if duration <= 0:
        return 5.0
    return max(3.0, duration * 0.25)
