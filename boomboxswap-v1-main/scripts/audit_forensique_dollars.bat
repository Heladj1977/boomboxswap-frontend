@echo off
echo ========================================
echo AUDIT FORENSIQUE DOLLARS FAKE CARD 3
echo ========================================
echo.
echo Lancement de l'audit forensique...
echo.

cd /d "%~dp0.."

echo [1/3] Verification environnement...
call conda activate boomswap-v1
if errorlevel 1 (
    echo ERREUR: Environnement Conda non disponible
    pause
    exit /b 1
)

echo [2/3] Demarrage backend...
start /B cmd /c "cd backend && uvicorn main:app --host 127.0.0.1 --port 8000"

echo [3/3] Ouverture interface avec audit...
timeout /t 3 /nobreak >nul
start "" "http://127.0.0.1:8000"

echo.
echo ========================================
echo AUDIT FORENSIQUE LANCE
echo ========================================
echo.
echo INSTRUCTIONS AUDIT:
echo 1. Ouvrir la console du navigateur (F12)
echo 2. Chercher les logs "AUDIT DOLLARS"
echo 3. Executer: AUDIT_DOLLARS_DIAGNOSTIC()
echo 4. Observer la timeline: window.DOLLARS_TIMELINE
echo.
echo SURVEILLANCE ACTIVE:
echo - Modifications DOM Card 3
echo - Appels API avec valeurs $
echo - Storage localStorage/sessionStorage
echo - Stack traces completes
echo.
echo Appuyez sur une touche pour fermer...
pause >nul 