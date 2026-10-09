"""Audio loading, conversion and reference-speech generation."""

import hashlib
import logging
import os
import shutil
import subprocess
import tempfile

import librosa
import numpy as np
import soundfile as sf

from openpronounce import tts

logger = logging.getLogger(__name__)

TARGET_SR = 16000

CACHE_DIR = os.environ.get(
    "OPENPRONOUNCE_CACHE_DIR",
    os.path.join(tempfile.gettempdir(), "openpronounce"),
)


def _find_ffmpeg():
    """Locate the ffmpeg executable.

    Checks (in order):
    1. The ``FFMPEG_PATH`` environment variable (path to the *executable* or to its *directory*).
    2. ``shutil.which`` against the current PATH.
    3. A set of common Windows installation directories (winget, choco, scoop, …).
    """
    env_path = os.environ.get("FFMPEG_PATH", "")
    if env_path:
        # Accept either the full path to the binary or just the directory.
        candidate = env_path if env_path.endswith(".exe") else os.path.join(env_path, "ffmpeg.exe")
        if os.path.isfile(candidate):
            return candidate

    found = shutil.which("ffmpeg")
    if found:
        return found

    # Common Windows locations (winget installs under AppData, choco under C:\ProgramData, etc.)
    import glob
    winget_base = os.path.join(os.environ.get("LOCALAPPDATA", ""), "Microsoft", "WinGet", "Packages")
    winget_dirs = []
    if os.path.isdir(winget_base):
        for d in os.listdir(winget_base):
            if d.startswith("Gyan.FFmpeg") and os.path.isdir(os.path.join(winget_base, d)):
                winget_dirs.append(os.path.join(winget_base, d, "**", "bin"))
    fallback_patterns = winget_dirs + [
        r"C:\ProgramData\chocolatey\bin\ffmpeg.exe",
        r"C:\ffmpeg\bin\ffmpeg.exe",
        r"C:\tools\ffmpeg\bin\ffmpeg.exe",
    ]
    for pattern in fallback_patterns:
        for candidate in glob.glob(pattern, recursive=True):
            exe = os.path.join(candidate, "ffmpeg.exe") if os.path.isdir(candidate) else candidate
            if os.path.isfile(exe):
                return exe

    return None


def _decode_with_ffmpeg(file_path, sr):
    """Decode any container/codec ffmpeg knows (webm/opus, m4a, ...) to a mono float32 waveform."""
    ffmpeg = _find_ffmpeg()
    if ffmpeg is None:
        raise RuntimeError("ffmpeg is not installed")
    result = subprocess.run(
        [ffmpeg, "-v", "error", "-i", file_path, "-f", "f32le", "-acodec", "pcm_f32le", "-ac", "1", "-ar", str(sr), "-"],
        capture_output=True,
        check=False,
    )
    if result.returncode != 0:
        raise RuntimeError(result.stderr.decode("utf-8", "replace").strip() or f"ffmpeg failed on {file_path!r}")
    return np.frombuffer(result.stdout, dtype=np.float32).copy()


def load(file_path, sr=TARGET_SR):
    """Load any audio file (wav, mp3, flac, ogg, webm, m4a...) as a mono float32 waveform at ``sr`` Hz.

    libsndfile (through librosa) handles wav/flac/ogg/mp3; anything it cannot open
    (browser webm/opus recordings, m4a...) is decoded with ffmpeg.
    """
    try:
        waveform, _ = librosa.load(file_path, sr=sr, mono=True)
        return waveform
    except Exception as e:  # noqa: BLE001 - libsndfile cannot read this format, try ffmpeg
        libsndfile_error = e
    try:
        return _decode_with_ffmpeg(file_path, sr)
    except Exception as e:  # noqa: BLE001
        raise RuntimeError(
            f"Unable to decode {file_path!r} (libsndfile: {libsndfile_error}; ffmpeg: {e}). "
            "Make sure ffmpeg is installed."
        ) from e


def webm2wav(file_path):
    """Convert a browser-recorded file (webm/ogg/wav/...) to a 16 kHz mono ``*.16k.wav`` file next to it."""
    output_path = os.path.splitext(file_path)[0] + ".16k.wav"
    waveform = load(file_path)
    sf.write(output_path, waveform, TARGET_SR)
    return output_path


# Backward-compatible alias (the original name was a typo)
webp2wav = webm2wav


def text2speech(text, lang="en", filename=None, target_sr=TARGET_SR, *, backend=None, voice=None):
    """Generate a reference pronunciation of ``text`` as a 16 kHz mono wav file and return its path.

    The synthesizer is chosen with ``backend`` (``gtts``, ``piper`` or ``kokoro``), falling
    back to the ``OPENPRONOUNCE_TTS`` environment variable, then to gTTS; the voice with
    ``voice`` / ``OPENPRONOUNCE_TTS_VOICE``, then to a per-language default. See
    :mod:`openpronounce.tts`. Results are cached in ``CACHE_DIR`` keyed by
    ``(backend, voice, lang, text)`` so that repeated comparisons against the same
    sentence are free.
    """
    backend, voice = tts.resolve(lang, backend=backend, voice=voice)
    if filename is None:
        os.makedirs(CACHE_DIR, exist_ok=True)
        key = hashlib.sha1(
            f"{backend}\x00{voice}\x00{lang}\x00{target_sr}\x00{text}".encode("utf-8")
        ).hexdigest()
        filename = os.path.join(CACHE_DIR, f"tts-{key}.wav")
        if os.path.exists(filename):
            return filename

    logger.info("Synthesizing reference with %s (voice %s, lang %s)", backend, voice, lang)
    waveform, sr = tts.synthesize(text, lang, backend, voice)
    if sr != target_sr:
        waveform = librosa.resample(waveform, orig_sr=sr, target_sr=target_sr)
    sf.write(filename, waveform, target_sr)
    return filename
