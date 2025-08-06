@echo off
echo ========================================
echo AUDIT TIMING FAKE DATA CARD 3
echo ========================================
echo.
echo Audit forensique timing ultra-precis...
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

echo [3/3] Ouverture interface avec audit timing...
timeout /t 3 /nobreak >nul
start "" "http://127.0.0.1:8000"

echo.
echo ========================================
echo AUDIT TIMING FAKE DATA LANCE
echo ========================================
echo.
echo INSTRUCTIONS AUDIT TIMING:
echo 1. Ouvrir la console du navigateur (F12)
echo 2. Chercher les logs "TIMING"
echo 3. Executer: TIMING_DIAGNOSTIC()
echo 4. Observer la timeline chronologique
echo.
echo SURVEILLANCE ACTIVE:
echo - Detection immediate des elements Card 3
echo - Timeline chronologique ultra-precise
echo - Surveillance chargement scripts
echo - Audit storage localStorage/sessionStorage
echo - Stack traces completes avec timestamps
echo.
echo SOURCES SUSPECTES IDENTIFIEES:
echo - HTML hardcode: $2.45, $1.23, $3.68, 3 fois, 12 fois, Atteint
echo - Timing exact de setAllCardsToZero()
echo - Modifications Card 3 en temps reel
echo.
echo Appuyez sur une touche pour fermer...
pause >nul 