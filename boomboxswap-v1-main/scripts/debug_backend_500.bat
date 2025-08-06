@echo off
echo ========================================
echo DEBUG BACKEND 500
echo ========================================
echo.
echo MISSION: Identifier l'erreur 500 du backend
echo qui empêche l'API des soldes de fonctionner
echo.
echo CORRECTIONS APPLIQUÉES:
echo - Format de retour API corrigé
echo - Clés API standardisées en minuscules
echo - TestClient remplacé par prix fixes
echo - Gestion des valeurs None améliorée
echo.
echo INSTRUCTIONS:
echo 1. Assurez-vous que le backend est lancé (start_all.bat)
echo 2. Ce script va diagnostiquer l'erreur 500
echo 3. Résultats affichés dans la console
echo.
echo ========================================
echo.

python scripts/debug_backend_500.py

echo.
echo ========================================
echo DEBUG TERMINÉ
echo ========================================
pause 