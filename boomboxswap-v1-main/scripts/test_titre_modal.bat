@echo off
echo ========================================
echo TEST TITRE MODAL WALLET
echo ========================================
echo.

echo [1/4] Demarrage du serveur backend...
cd backend
start /B uvicorn main:app --host 127.0.0.1 --port 8000
timeout /t 3 /nobreak >nul

echo [2/4] Ouverture du navigateur...
cd ..
start http://127.0.0.1:8000

echo [3/4] Instructions de test TITRE MODAL:
echo.
echo ✅ CORRECTION APPLIQUEE:
echo    - Titre: "SÉLECTION CHAÎNE AUDIO" → "SÉLECTION DU WALLET"
echo    - Sous-titre: "Branchez votre équipement :" (conservé)
echo    - Effet blur gaming: Préservé et fonctionnel
echo.
echo 🎯 OBJECTIF VISUEL:
echo    - Titre plus direct et clair
echo    - Sous-titre garde l'univers BOOMBOX
echo    - Modal parfaitement net avec interface floutée
echo    - Logique de connexion préservée
echo.
echo 1. Cliquez sur "CONNECTER WALLET"
echo 2. Vérifiez le nouveau titre "SÉLECTION DU WALLET"
echo 3. Confirmez le sous-titre "Branchez votre équipement :"
echo 4. Testez l'effet blur gaming
echo.
echo [4/4] Test en cours...
echo.
echo Appuyez sur une touche pour fermer ce script...
pause >nul 