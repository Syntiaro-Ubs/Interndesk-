@echo off
echo ================================================
echo   InternDesk Database Setup
echo ================================================
echo.

set /p DB_USER="Enter MySQL username (default: root): "
if "%DB_USER%"=="" set DB_USER=root

set /p DB_NAME="Enter database name (default: interndesk): "
if "%DB_NAME%"=="" set DB_NAME=interndesk

echo.
echo Creating database if not exists...
mysql -u %DB_USER% -p -e "CREATE DATABASE IF NOT EXISTS %DB_NAME%;"

echo.
echo Importing interndesk.sql...
mysql -u %DB_USER% -p %DB_NAME% < server\interndesk.sql

if %ERRORLEVEL% EQU 0 (
    echo.
    echo SUCCESS! Database imported successfully.
    echo.
    echo Database: %DB_NAME%
    echo Tables: 7 tables created
    echo Admin account: admin@interndesk.in
    echo.
) else (
    echo.
    echo ERROR: Database import failed!
    echo.
)

pause
