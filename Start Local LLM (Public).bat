@echo off
where ollama >nul 2>nul
if errorlevel 1 (
  echo Ollama isn't installed, or isn't on your PATH.
  echo Download it from https://ollama.com, install it, then run this again.
  echo.
  pause
  exit /b
)

where cloudflared >nul 2>nul
if errorlevel 1 (
  echo cloudflared isn't installed, or isn't on your PATH.
  echo Download "cloudflared-windows-amd64.exe" from:
  echo   https://github.com/cloudflare/cloudflared/releases/latest
  echo Rename it to cloudflared.exe and place it somewhere on your PATH
  echo ^(e.g. C:\Windows\System32^), then run this again.
  echo.
  pause
  exit /b
)

echo Starting local LLM ^(Ollama^) and a public tunnel to it...
echo This is for connecting an ONLINE-hosted SharedLove site to this
echo laptop's local LLM. If everyone's on the same wifi as this laptop,
echo you don't need this, use "Start Local LLM.bat" instead.

set OLLAMA_ORIGINS=*
start "Local LLM (Ollama)" cmd /k "ollama serve"

timeout /t 3 /nobreak >nul

start "Public Tunnel (Cloudflare)" cmd /k "cloudflared tunnel --url http://localhost:11434"

echo.
echo Two windows just opened.
echo.
echo In the "Public Tunnel" window, wait a few seconds and look for a line
echo containing a URL like:
echo     https://random-words-here.trycloudflare.com
echo.
echo Copy that exact URL. On your ONLINE (hosted) SharedLove site:
echo   1. Log in with email "admin" and your admin password.
echo   2. Paste that URL into "Ollama endpoint URL".
echo   3. Make sure the model shown is one you've pulled (ollama pull llava).
echo   4. Flip the "Local LLM connection" switch to ON.
echo   5. Press "Test connection" to confirm it's live.
echo.
echo That tunnel URL is temporary, it changes every time you run this, so
echo you'll re-paste it if you restart this script.
echo.
echo Keep both windows open and this laptop awake (plugged in, sleep set to
echo Never) for as long as you want the online site connected to your
echo local LLM. If you close them or this laptop sleeps, the online site
echo automatically falls back to Simulated grading on its own, nothing
echo breaks, it just stops using your laptop.
echo.
echo Close both windows (or press Ctrl+C in each) when you're done, then
echo flip the toggle back to OFF in Admin.
pause
