@echo off
echo ========================================
echo TEST CORRECTION MODAL BLUR
echo ========================================
echo.

echo [1/4] Demarrage du serveur backend...
cd backend
start /B uvicorn main:app --host 127.0.0.1 --port 8000
timeout /t 3 /nobreak >nul

echo [2/4] Ouverture du navigateur...
cd ..
start http://127.0.0.1:8000

echo [3/4] Instructions de test CORRECTION:
echo.
echo ✅ CORRECTION APPLIQUEE:
echo    - Opacité réduite de 92%% à 75%%
echo    - Blur augmenté de 15px à 20px
echo    - Fallback pour navigateurs non compatibles
echo.
echo 1. Cliquez sur "CONNECTER WALLET" dans l'interface
echo 2. Le modal devrait maintenant avoir un effet blur visible
echo 3. Le background derrière devrait être flou et semi-transparent
echo 4. Si pas d'effet blur, vérifiez la compatibilité navigateur
echo.
echo [4/4] Test en cours...
echo.
echo Appuyez sur une touche pour fermer ce script...
pause >nul 