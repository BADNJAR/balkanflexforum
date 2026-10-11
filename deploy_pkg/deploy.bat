@echo off
chcp 65001 >nul
title Balkan Flex - Netlify deploy
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js nije instaliran. Skini ga s https://nodejs.org ^(LTS^), instaliraj i pokreni ovu skriptu ponovo.
  pause
  exit /b 1
)

echo.
echo [1/3] Prijava na Netlify ^(otvorit ce se preglednik, klikni Authorize^)
call npx -y netlify-cli login

echo.
echo [2/3] Povezivanje sa siteom balkanflexforum
call npx -y netlify-cli link --name balkanflexforum

echo.
echo [3/3] Objava stranice
call npx -y netlify-cli deploy --prod --dir=public --functions=netlify/functions

echo.
echo Gotovo. Otvori: https://balkanflexforum.netlify.app
pause
