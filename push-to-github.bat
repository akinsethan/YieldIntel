@echo off
setlocal
cd /d "%~dp0"

echo ==========================================
echo  YieldIntel - GitHub Initial Push
echo ==========================================
echo.
echo Working folder: %CD%
echo Target repo:    https://github.com/akinsethan/YieldIntel.git
echo.

REM --- Check git is installed ---
where git >nul 2>nul
if errorlevel 1 (
    echo ERROR: Git is not installed or not on PATH.
    echo Install Git for Windows from https://git-scm.com/download/win
    echo Then close this window and double-click this script again.
    echo.
    pause
    exit /b 1
)

REM --- Check if already a git repo ---
if exist ".git" (
    echo This folder is ALREADY a git repository.
    echo If you want to start over, delete the .git folder and re-run.
    echo Otherwise, run "git push -u origin main" manually.
    echo.
    pause
    exit /b 1
)

echo [1/7] Initializing git repository...
git init
if errorlevel 1 goto :err

echo.
echo [2/7] Setting local commit identity...
git config user.name "Ethan Akins"
git config user.email "ethan.drake.akins@gmail.com"

echo.
echo [3/7] Renaming default branch to main...
git branch -M main

echo.
echo [4/7] Staging all files (respecting .gitignore)...
git add .

echo.
echo --- Files staged for commit ---
git status --short
echo --------------------------------
echo.

REM --- Sanity check: warn if any .env files are staged ---
git diff --cached --name-only | findstr /B ".env" >nul
if not errorlevel 1 (
    echo.
    echo *** WARNING ***
    echo A .env file appears to be staged. This may contain secrets/API keys.
    echo Press Ctrl+C NOW to abort, or any key to continue anyway.
    pause
)

echo [5/7] Creating initial commit...
git commit -m "Initial commit"
if errorlevel 1 goto :err

echo.
echo [6/7] Adding GitHub remote...
git remote add origin https://github.com/akinsethan/YieldIntel.git
if errorlevel 1 goto :err

echo.
echo [7/7] Pushing to GitHub...
echo A browser window may pop up asking you to sign in to GitHub. Approve it.
echo.
git push -u origin main
if errorlevel 1 goto :err

echo.
echo ==========================================
echo  SUCCESS! Your code is on GitHub:
echo  https://github.com/akinsethan/YieldIntel
echo ==========================================
echo.
pause
exit /b 0

:err
echo.
echo *** Something went wrong. See the error message above. ***
echo.
pause
exit /b 1
