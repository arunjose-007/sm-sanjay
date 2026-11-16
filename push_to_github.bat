@echo off
setlocal enabledelayedexpansion
title Upload Intelligent Assistant to GitHub
cls

echo ======================================================================
echo    INTELLIGENT ASSISTANT - ONE-CLICK GITHUB UPLOADER
echo ======================================================================
echo.
echo Checking Git status...
cd /d "%~dp0"

where git >nul 2>nul
if %errorlevel% neq 0 (
    echo [ERROR] Git is not installed or not in PATH!
    echo Please install Git from: https://git-scm.com/
    pause
    exit /b 1
)

echo [OK] Git is ready.
echo.

REM Stage all latest files and commit
echo Staging and bundling all project files...
git add .
git status --short

git commit -m "Upload Intelligent Assistant for Livelihood and Road Safety" >nul 2>nul
git branch -M main >nul 2>nul

echo.
REM Check if remote origin already exists
git remote get-url origin >nul 2>nul
if %errorlevel% equ 0 (
    for /f "tokens=*" %%a in ('git remote get-url origin') do set CURRENT_REMOTE=%%a
    echo Found existing GitHub remote: !CURRENT_REMOTE!
    echo.
    set /p USE_EXISTING="Push to this remote? (Y/N): "
    if /i "!USE_EXISTING!"=="Y" (
        goto do_push
    )
    git remote remove origin
)

echo.
echo ======================================================================
echo  STEP: CREATE REPOSITORY ON GITHUB
echo ======================================================================
echo  1. Open: https://github.com/new
echo  2. Enter repository name (e.g. intelligent-assistant)
echo  3. Leave "Initialize with README" UNCHECKED
echo  4. Click "Create repository"
echo ======================================================================
echo.

:ask_url
set /p REPO_URL="Enter your GitHub Repository URL: "
if "%REPO_URL%"=="" (
    echo Repository URL cannot be empty!
    goto ask_url
)

git remote remove origin >nul 2>nul
git remote add origin %REPO_URL%
if %errorlevel% neq 0 (
    echo [ERROR] Failed to set remote URL.
    pause
    exit /b 1
)

:do_push
echo.
echo ======================================================================
echo  Uploading all files to GitHub... Please wait.
echo ======================================================================
echo.
git push -u origin main --force

if %errorlevel% equ 0 (
    echo.
    echo ======================================================================
    echo  SUCCESS! All files uploaded to GitHub successfully!
    echo ======================================================================
    echo  Now go to https://vercel.com to deploy your frontend in 1 click!
    echo ======================================================================
) else (
    echo.
    echo ======================================================================
    echo  [Notice] Push failed or authentication needed.
    echo  If a browser window opened, approve GitHub login there.
    echo ======================================================================
)

echo.
pause
