import os
import subprocess
from urllib.parse import parse_qs, urlparse

import whisper
from youtube_transcript_api import YouTubeTranscriptApi

from .downloader import VideoData

_whisper_model: whisper.Whisper | None = None


def _get_whisper_model() -> whisper.Whisper:
    global _whisper_model
    if _whisper_model is None:
        _whisper_model = whisper.load_model("base")
    return _whisper_model


def get_transcript(video_data: VideoData, url: str) -> str:
    """Get a text transcript from a video, preferring native captions.

    For YouTube, tries to fetch auto-generated or manual captions first
    (free, instant). Falls back to Whisper audio transcription, which is
    also the only option for Instagram.

    Args:
        video_data: Downloaded video metadata and local path.
        url: Original video URL for YouTube caption lookup.

    Returns:
        Transcript text, or empty string if none is available.
    """
    if video_data.platform == "youtube":
        captions = _fetch_youtube_captions(url)
        if captions:
            return captions

    return _transcribe_with_whisper(video_data.video_path)


# ------------------------------------------------------------------
# YouTube captions
# ------------------------------------------------------------------

def _fetch_youtube_captions(url: str) -> str | None:
    video_id = _extract_youtube_id(url)
    if not video_id:
        return None

    # youtube-transcript-api >=0.6 uses instance method; <0.6 uses class method
    try:
        fetched = YouTubeTranscriptApi().fetch(video_id)
        return " ".join(s.text for s in fetched)
    except Exception:
        pass

    try:
        entries = YouTubeTranscriptApi.get_transcript(video_id)
        return " ".join(e["text"] for e in entries)
    except Exception:
        return None


def _extract_youtube_id(url: str) -> str | None:
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
# Whisper fallback (local, no API key needed)
# ------------------------------------------------------------------

def _transcribe_with_whisper(video_path: str) -> str:
    audio_path = _extract_audio(video_path)
    try:
        model = _get_whisper_model()
        result = model.transcribe(audio_path)
        return result["text"]
    except Exception:
        return ""
    finally:
        if os.path.exists(audio_path):
            os.remove(audio_path)


def _extract_audio(video_path: str) -> str:
    audio_path = os.path.splitext(video_path)[0] + ".mp3"
    subprocess.run(
        ["ffmpeg", "-y", "-i", video_path, "-vn", "-acodec", "mp3", "-ab", "128k", audio_path],
        check=True,
        capture_output=True,
    )
    return audio_path
