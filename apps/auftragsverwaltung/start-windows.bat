@echo off
title Malermeister-Auftragsverwaltung
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
  echo Node.js ist nicht installiert. Bitte einmalig von https://nodejs.org herunterladen und installieren.
  pause
  exit /b 1
)
node server.js
pause
