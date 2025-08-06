@echo off
echo ========================================
echo TEST ROLLBACK INTERFACE GAMING
echo ========================================
echo.

echo [1/4] Demarrage du serveur backend...
cd backend
start /B uvicorn main:app --host 127.0.0.1 --port 8000
timeout /t 3 /nobreak >nul

echo [2/4] Ouverture du navigateur...
cd ..
start http://127.0.0.1:8000

echo [3/4] Instructions de test ROLLBACK GAMING:
echo.
echo ✅ ROLLBACK APPLIQUÉ:
echo    - CSS original restauré depuis backup
echo    - HTML original restauré depuis backup
echo    - Interface gaming originale récupérée
echo.
echo 🎯 TESTS DE VALIDATION GAMING:
echo.
echo 1. BOUTONS GAMING MUSICAUX:
echo    - PLAY: Bouton rond vert avec icône play
echo    - EJECT: Bouton rond rouge avec icône eject
echo    - PREV/NEXT: Boutons ronds bleus avec flèches
echo    - Tous les boutons doivent être RONDS et COLORÉS
echo.
echo 2. CARDS GLASSMORPHISM:
echo    - Effet blur et transparence sur les cards
echo    - Background semi-transparent
echo    - Bordures subtiles gaming
echo.
echo 3. COULEURS GAMING:
echo    - Dark blue immersif
echo    - Accents colorés (vert, rouge, bleu)
echo    - Interface musicale BOOMBOX cohérente
echo.
echo 4. MODAL WALLET:
echo    - Effet gaming pause menu
echo    - Interface background floutée
echo    - Modal net et lisible
echo.
echo 5. ANIMATIONS:
echo    - Transitions smooth gaming
echo    - Effets hover sur boutons
echo    - Animations fluides
echo.
echo [4/4] Test en cours...
echo.
echo Appuyez sur une touche pour fermer ce script...
pause >nul 