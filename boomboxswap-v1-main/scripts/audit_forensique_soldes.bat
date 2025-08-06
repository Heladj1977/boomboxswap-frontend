@echo off
echo ========================================
echo AUDIT FORENSIQUE SOLDES CARD 1
echo ========================================
echo.
echo MISSION: Identifier pourquoi les soldes n'apparaissent pas
echo après connexion MetaMask
echo.
echo SURVEILLANCE INSTALLÉE:
echo - Timeline complète du workflow soldes
echo - Interception appels API getBalances
echo - Surveillance modifications DOM Card 1
echo - Diagnostic automatique disponible
echo.
echo INSTRUCTIONS:
echo 1. Lancer start_all.bat
echo 2. Se connecter avec MetaMask
echo 3. Observer les logs dans la console
echo 4. Exécuter SOLDES_DIAGNOSTIC() dans la console
echo.
echo DIAGNOSTIC DISPONIBLE:
echo - window.SOLDES_TIMELINE (timeline complète)
echo - window.SOLDES_DIAGNOSTIC() (analyse automatique)
echo.
echo POINTS D'INVESTIGATION:
echo - Connexion MetaMask déclenche-t-elle getBalances ?
echo - L'API /api/v1/data/balances répond-elle ?
echo - Les données sont-elles au bon format ?
echo - Les sélecteurs DOM Card 1 sont-ils corrects ?
echo.
pause 