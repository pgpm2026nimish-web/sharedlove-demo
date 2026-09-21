@echo off
where ollama >nul 2>nul
if errorlevel 1 (
  echo Ollama isn't installed, or isn't on your PATH.
  echo Download it from https://ollama.com, install it, then run this again.
  echo.
  pause
  exit /b
)

echo Starting local LLM (Ollama)...
echo This lets AI grading, descriptions, price suggestions, and the Sprout
echo support chat all run fully on this machine, free, no internet needed.

rem OLLAMA_ORIGINS=* so the browser (a different origin) is allowed to call
rem it; without this, requests get silently blocked by CORS.
set OLLAMA_ORIGINS=*
start "Local LLM (Ollama)" cmd /k "ollama serve"

timeout /t 3 /nobreak >nul

echo.
echo Ollama should now be running at http://localhost:11434
echo.
echo In SharedLove: log in with email "admin" to reach Admin settings, set
echo the grading provider to "Local vision model (Ollama)", and make sure
echo the model shown is one you've already pulled. If you haven't pulled
echo one yet, open a terminal and run:
echo     ollama pull llava
echo.
echo If you're demoing on a phone over wifi (not just this laptop), also
echo set the Ollama endpoint in Admin to this laptop's network address,
echo e.g. http://192.168.1.5:11434, not "localhost".
echo.
echo Close the other window (or press Ctrl+C in it) to stop the local LLM.
echo You can close this window now.
pause
