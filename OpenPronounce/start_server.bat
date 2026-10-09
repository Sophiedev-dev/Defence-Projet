@echo off
REM ============================================================
REM  OpenPronounce - Lancement du serveur
REM  Ouvre ce fichier depuis le dossier OpenPronounce
REM  puis visite http://localhost:8000
REM ============================================================

set OPENPRONOUNCE_TTS=piper
set OPENPRONOUNCE_TTS_VOICE=en_US-lessac-medium
set HF_HUB_DISABLE_SYMLINKS_WARNING=1
set PHONEMIZER_ESPEAK_PATH=C:\Program Files\eSpeak NG
set PYTHONUTF8=1
set PYTHONIOENCODING=utf-8
set TRANSFORMERS_VERBOSITY=error

REM Chemin explicite vers ffmpeg (évite les problèmes de PATH selon comment le terminal est ouvert)
set FFMPEG_PATH=C:\Users\nandj\AppData\Local\Microsoft\WinGet\Packages\Gyan.FFmpeg_Microsoft.Winget.Source_8wekyb3d8bbwe\ffmpeg-9.0.2-full_build\bin\ffmpeg.exe

echo Demarrage du serveur OpenPronounce sur http://localhost:8000
echo Appuyez sur CTRL+C pour arreter.
echo.

.venv\Scripts\uvicorn.exe server:app --host 0.0.0.0 --port 8000
