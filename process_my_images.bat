@echo off
title Ideal Furniture - 3600 Catalog Processor
color 0A
echo ========================================================================
echo   IDEAL FURNITURE - AUTOMATED AI CATALOG PROCESSOR
echo ========================================================================
echo Target Folder: C:\Users\Burhan\Downloads\ImageAssistant_Batch_Image_Downloader\www.pinterest.com\all
echo.
echo Checking for Node.js...
node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed or not in PATH!
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b
)

echo Starting AI image inspection, duplicate removal, and catalog publishing...
node scripts/process_catalog.mjs "C:\Users\Burhan\Downloads\ImageAssistant_Batch_Image_Downloader\www.pinterest.com\all"

echo.
echo ========================================================================
echo   Finished! Press any key to exit.
echo ========================================================================
pause
