@echo off
echo ========================================
echo TEST CORRECTION CSS INLINE CONFLICTUEL
echo ========================================
echo.

echo [1/4] Demarrage du serveur backend...
cd backend
start /B uvicorn main:app --host 127.0.0.1 --port 8000
timeout /t 3 /nobreak >nul

echo [2/4] Ouverture du navigateur...
cd ..
start http://127.0.0.1:8000

echo [3/4] Instructions de test CORRECTION CSS INLINE:
echo.
echo ✅ CORRECTIONS APPLIQUEES:
echo    - SUPPRIME: backdrop-filter: blur(10px) de .glass-header (ligne 49)
echo    - SUPPRIME: backdrop-filter: blur(10px) de .smart-card (ligne 180)
echo    - SUPPRIME: backdrop-filter: blur(10px) de .smart-card.top-row:nth-child(3)
echo    - SUPPRIME: backdrop-filter: blur(10px) de .chain-options (ligne 1243)
echo    - RESULTAT: 0 backdrop-filter inline restant
echo.
echo 🎯 OBJECTIF VISUEL:
echo    - Modal wallet: Parfaitement net et lisible
echo    - Interface background: Floutée atmospheric
echo    - Aucun conflit CSS inline/externe
echo    - Effet gaming pause menu restauré
echo.
echo 1. Cliquez sur "CONNECTER WALLET"
echo 2. Vérifiez que le modal est parfaitement net
echo 3. Confirmez que l'interface est floutée en arrière-plan
echo 4. Testez la lisibilité du titre et des options
echo 5. Vérifiez que l'effet gaming fonctionne
echo.
echo [4/4] Test en cours...
echo.
echo Appuyez sur une touche pour fermer ce script...
pause >nul 