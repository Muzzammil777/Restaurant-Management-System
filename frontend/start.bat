@echo off
REM Start frontend dev server for MoviCloud RMS (Windows)
pushd "%~dp0"
if not exist node_modules (
  echo Installing dependencies...
  npm install
) else (
  echo Dependencies found, skipping install.
)
echo Starting frontend dev server...
REM Check Node.js and npm availability
node -v >nul 2>&1 || (
  echo Node.js is not installed or not in PATH.
  echo Install Node.js from https://nodejs.org/ and re-run this script.
  popd
  exit /b 1
)
npm -v >nul 2>&1 || (
  echo npm is not available. Ensure Node.js installation includes npm.
  popd
  exit /b 1
)

REM Install dependencies if missing; prefer npm ci when lockfile present
if not exist node_modules (
  echo Installing dependencies...
  if exist package-lock.json (
    npm ci || (
      echo "npm ci" failed. Trying "npm install"...
      npm install || (
        echo Dependency installation failed.
        popd
        exit /b 1
      )
    )
  ) else (
    npm install || (
      echo Dependency installation failed.
      popd
      exit /b 1
    )
  )
) else (
  echo Dependencies found, skipping install.
)

REM Allow optional script name argument: default to "dev"
set "SCRIPT_NAME=dev"
if not "%~1"=="" set "SCRIPT_NAME=%~1"

echo Starting frontend dev server (npm run %SCRIPT_NAME%)...
call npm run %SCRIPT_NAME%
popd
