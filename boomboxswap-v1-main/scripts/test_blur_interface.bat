@echo off
echo ========================================
echo TEST BLUR INTERFACE - EFFET GAMING
echo ========================================
echo.

echo [1/4] Demarrage du serveur backend...
cd backend
start /B uvicorn main:app --host 127.0.0.1 --port 8000
timeout /t 3 /nobreak >nul

echo [2/4] Ouverture du navigateur...
cd ..
start http://127.0.0.1:8000

echo [3/4] Instructions de test BLUR INTERFACE:
echo.
echo ✅ NOUVELLE APPROCHE APPLIQUEE:
echo    - Interface principale floutée (4px) quand modal ouvert
echo    - Modal wallet net et au premier plan
echo    - Animation smooth ouverture/fermeture
echo    - Effet gaming comme menu pause
echo.
echo 🎯 OBJECTIF VISUEL:
echo    - Interface reconnaissable mais floutée en arrière-plan
echo    - Modal wallet parfaitement net et focalisé
echo    - Transition smooth entre les états
echo    - Effet moderne et immersif
echo.
echo 1. Cliquez sur "CONNECTER WALLET"
echo 2. Observez l'interface qui devient floutée
echo 3. Le modal reste net et focalisé
echo 4. Fermez le modal pour voir l'interface redevenir nette
echo.
echo [4/4] Test en cours...
echo.
echo Appuyez sur une touche pour fermer ce script...
pause >nul 