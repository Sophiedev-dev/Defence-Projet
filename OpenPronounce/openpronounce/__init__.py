"""OpenPronounce: open-source, phoneme-level pronunciation assessment (English by default).

Typical usage::

    from openpronounce import load_audio, compare_audio_with_text

    sound = load_audio("recording.wav")
    result = compare_audio_with_text(sound, "Hello, I am a developer")
    print(result["score"], result["differences"]["errors"])

    result = compare_audio_with_text(load_audio("bonjour.wav"), "Bonjour le monde", lang="fr")
"""

import os as _os
import glob as _glob


def _find_espeak_library():
    """Locate the espeak-ng shared library on Windows when it is not on the system PATH.

    Checks (in order):
    1. ``PHONEMIZER_ESPEAK_LIBRARY`` env var (already set → phonemizer picks it up directly).
    2. ``PHONEMIZER_ESPEAK_PATH`` env var (directory containing the DLL).
    3. Common Windows installation paths (winget / default installer).
    """
    if _os.environ.get("PHONEMIZER_ESPEAK_LIBRARY"):
        return  # already configured, nothing to do

    candidates = []

    espeak_path = _os.environ.get("PHONEMIZER_ESPEAK_PATH", "")
    if espeak_path:
        candidates.append(_os.path.join(espeak_path, "libespeak-ng.dll"))

    # Default eSpeak NG installer path on Windows
    candidates += [
        r"C:\Program Files\eSpeak NG\libespeak-ng.dll",
        r"C:\Program Files (x86)\eSpeak NG\libespeak-ng.dll",
    ]

    for path in candidates:
        if _os.path.isfile(path):
            _os.environ["PHONEMIZER_ESPEAK_LIBRARY"] = path
            try:
                from phonemizer.backend.espeak.wrapper import EspeakWrapper
                EspeakWrapper.set_library(path)
            except Exception:
                pass
            return


_find_espeak_library()

from .audio import load as load_audio, text2speech
from .languages import LANGUAGES, get_language
from .phones import compare_phones, recognize_phones, transcribe_phones
from .speech import (
    compare_audio_with_text,
    compare_transcriptions,
    get_phonemes,
    get_phonemes_with_word_mapping,
    transcribe,
)

__version__ = "0.3.0"

__all__ = [
    "__version__",
    "load_audio",
    "text2speech",
    "LANGUAGES",
    "get_language",
    "compare_audio_with_text",
    "compare_transcriptions",
    "compare_phones",
    "recognize_phones",
    "transcribe_phones",
    "get_phonemes",
    "get_phonemes_with_word_mapping",
    "transcribe",
]
