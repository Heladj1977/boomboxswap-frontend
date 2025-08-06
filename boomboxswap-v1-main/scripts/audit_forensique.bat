@echo off
echo ========================================
echo AUDIT FORENSIQUE BOOMBOXSWAP V1
echo ========================================
echo.
echo Lancement de l'audit forensique...
echo.
echo 1. Vérification anti-emoji...
python scripts/check_no_emoji.py
echo.
echo 2. Lancement du projet avec logs détaillés...
echo.
echo INSTRUCTIONS AUDIT:
echo - Ouvrir la console du navigateur (F12)
echo - Cliquer sur "Connecter Wallet"
echo - Observer les logs AUDIT avec timestamps
echo - Identifier où le workflow se casse
echo.
echo Appuyez sur une touche pour lancer start_all.bat...
pause > nul
start_all.bat 