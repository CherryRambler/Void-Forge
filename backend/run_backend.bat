@echo off
cd /d "%~dp0"
echo Starting Creature Generator Backend...
"..\.venv\Scripts\python.exe" main.py
pause
