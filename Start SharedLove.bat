@echo off
cd /d "%~dp0"

if not exist node_modules (
  echo Installing dependencies for the first time, please wait...
  call npm install
)

echo Starting SharedLove...
echo (--host makes it reachable from other devices on the same wifi/hotspot)
start "SharedLove" cmd /k "npm run dev -- --host"

timeout /t 4 /nobreak >nul

rem Auto-detect this laptop's LAN IPv4 address instead of opening
rem "localhost" — opening localhost here was the actual cause of the
rem Share button's QR code failing (a QR built from "localhost" means
rem "this device" to whichever phone scans it, not this laptop, so it can
rem never connect). Opening the real network address instead means Share
rem just works without anyone touching Admin or a terminal during a demo.
set LANIP=
for /f "usebackq delims=" %%i in (`powershell -NoProfile -Command "(Get-NetIPAddress -AddressFamily IPv4 | Where-Object { $_.IPAddress -notlike '127.*' -and $_.IPAddress -notlike '169.254.*' } | Select-Object -First 1 -ExpandProperty IPAddress)" 2^>nul`) do set LANIP=%%i

if defined LANIP (
  echo Opening on this laptop's network address: http://%LANIP%:5173
  start "" http://%LANIP%:5173
) else (
  echo Could not auto-detect a network IP, opening localhost instead.
  echo The Share button's QR code and link won't work from this window
  echo until you open the "Network:" address shown in the other window.
  start "" http://localhost:5173
)

echo.
echo SharedLove is running in the other window.
echo That same http://%LANIP%:5173 address is what you open on your PHONE
echo too (both devices must be on the same wifi, or your phone's hotspot).
echo.
echo If the phone shows a blank page:
echo  - Double check it says http:// not https:// (iPhone Safari can
echo    auto-upgrade to https, which breaks this - Settings, Safari,
echo    Advanced, turn off "Automatically Upgrade to HTTPS")
echo  - Make sure Windows Firewall allowed Node.js when it first prompted
echo  - Try the phone's own hotspot instead of shared wifi (some venue/
echo    guest wifi blocks devices from seeing each other)
echo.
echo Close that other window (or press Ctrl+C in it) to stop the app.
echo You can close this window now.
pause
