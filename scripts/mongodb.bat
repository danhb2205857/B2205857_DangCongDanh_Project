@echo off
REM MongoDB management script for QuanLyMuonSach (Windows)

if "%1"=="start" goto start
if "%1"=="stop" goto stop
if "%1"=="restart" goto restart
if "%1"=="logs" goto logs
if "%1"=="status" goto status
if "%1"=="admin" goto admin
goto usage

:start
echo 🚀 Starting MongoDB...
docker-compose up -d mongodb
echo ✅ MongoDB started successfully!
echo 📊 MongoDB Admin: http://localhost:8081
goto end

:stop
echo 🛑 Stopping MongoDB...
docker-compose down
echo ✅ MongoDB stopped successfully!
goto end

:restart
echo 🔄 Restarting MongoDB...
docker-compose restart mongodb
echo ✅ MongoDB restarted successfully!
goto end

:logs
echo 📋 MongoDB logs:
docker-compose logs -f mongodb
goto end

:status
echo 📊 MongoDB status:
docker-compose ps mongodb
goto end

:admin
echo 🌐 Starting MongoDB Admin interface...
docker-compose up -d mongo-express
echo ✅ MongoDB Admin available at: http://localhost:8081
goto end

:usage
echo Usage: %0 {start^|stop^|restart^|logs^|status^|admin}
echo.
echo Commands:
echo   start   - Start MongoDB container
echo   stop    - Stop all containers
echo   restart - Restart MongoDB container
echo   logs    - Show MongoDB logs
echo   status  - Show container status
echo   admin   - Start MongoDB Admin interface

:end