@echo off
echo ========================================
echo TEST BLUR RENFORCE - GLASSMORPHISM
echo ========================================
echo.

echo [1/4] Demarrage du serveur backend...
cd backend
start /B uvicorn main:app --host 127.0.0.1 --port 8000
timeout /t 3 /nobreak >nul

echo [2/4] Ouverture du navigateur...
cd ..
start http://127.0.0.1:8000

echo [3/4] Instructions de test BLUR RENFORCE:
echo.
echo ✅ RENFORCEMENT APPLIQUE:
echo    - Opacité: 75%% → 45%% (fortement réduite)
echo    - Blur: 20px → 30px (très renforcé)
echo    - Fallback: 95%% → 85%% (compensé)
echo.
echo 🎯 OBJECTIF VISUEL:
echo    - Interface BOOMBOXSWAP clairement visible en arrière-plan
echo    - Cards, boutons, prix BNB/USDT distinguables
echo    - Effet glassmorphism très prononcé
echo    - Modal wallet toujours lisible
echo.
echo 1. Cliquez sur "CONNECTER WALLET"
echo 2. Observez l'interface en arrière-plan flouté
echo 3. Vérifiez que les éléments sont visibles
echo 4. Testez la lisibilité du modal
echo.
echo [4/4] Test en cours...
echo.
echo Appuyez sur une touche pour fermer ce script...
pause >nul 