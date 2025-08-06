@echo off
echo ========================================
echo TEST CARD 3 COMPLÈTEMENT VIDE
echo ========================================
echo.
echo Verification de la Card 3...
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

echo [3/3] Ouverture interface pour test...
timeout /t 3 /nobreak >nul
start "" "http://127.0.0.1:8000"

echo.
echo ========================================
echo TEST CARD 3 VIDE LANCE
echo ========================================
echo.
echo INSTRUCTIONS TEST:
echo 1. Ouvrir la console du navigateur (F12)
echo 2. Verifier que Card 3 est completement vide
echo 3. Executer: testCard3Vide()
echo 4. Observer les resultats
echo.
echo VERIFICATIONS:
echo - fees-generated: VIDE
echo - cake-rewards: VIDE  
echo - total-gains: VIDE
echo - rebalancing-count: VIDE
echo - autocompound-count: VIDE
echo - break-even: VIDE
echo.
echo Appuyez sur une touche pour fermer...
pause >nul 