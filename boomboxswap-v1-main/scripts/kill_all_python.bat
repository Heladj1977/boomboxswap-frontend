@echo off
REM Script pour tuer tous les processus Python et Uvicorn (Windows)
echo ===============================
echo  ARRET FORCÉ PYTHON/UVICORN   
echo ===============================
taskkill /F /IM python.exe >nul 2>&1
taskkill /F /IM uvicorn.exe >nul 2>&1
echo Tous les processus python.exe et uvicorn.exe ont été arrêtés.
echo Vous pouvez maintenant relancer un terminal propre. 