@echo off
echo ========================================
echo INVESTIGATION APPELS MULTIPLES METAMASK
echo ========================================
echo.
echo Lancement de l'investigation...
echo.
echo 1. Vérification anti-emoji...
python scripts/check_no_emoji.py
echo.
echo 2. Lancement du projet avec investigation...
echo.
echo INSTRUCTIONS INVESTIGATION:
echo - Ouvrir la console du navigateur (F12)
echo - Observer les logs INVESTIGATION
echo - Cliquer sur "Connecter Wallet" puis "MetaMask"
echo - Vérifier les appels multiples eth_requestAccounts
echo - Utiliser window.INVESTIGATION_DIAGNOSTIC() pour diagnostic
echo.
echo TESTS À EFFECTUER:
echo 1. Hook global capture tous les appels
echo 2. Vérification event listeners doubles
echo 3. Test délai artificiel (2 secondes)
echo 4. Isolation WalletConnect désactivé
echo.
echo Appuyez sur une touche pour lancer start_all.bat...
pause > nul
start_all.bat 