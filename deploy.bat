@echo off
cd /d "%~dp0"
echo === Spelling Quest Deploy ===
echo.

git add -A
git commit -m "update: %date% %time%"
git push origin master

echo.
echo === Push complete! ===
echo GitHub Pages will auto-update in 1-2 minutes.
echo Visit https://word.fopusha.com (Ctrl+Shift+R to refresh)
echo.
pause
