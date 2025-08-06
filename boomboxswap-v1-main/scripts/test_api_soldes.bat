@echo off
echo ========================================
echo TEST API SOLDES DIRECT
echo ========================================
echo.
echo MISSION: Tester directement l'API des soldes
echo pour identifier les problèmes backend
echo.
echo INSTRUCTIONS:
echo 1. Assurez-vous que le backend est lancé (start_all.bat)
echo 2. Ce script va tester l'API /api/v1/data/balances
echo 3. Résultats affichés dans la console
echo.
echo TESTS AUTOMATIQUES:
echo - Adresse null (0x0000...)
echo - Adresse de test (0x1234...)
echo - Votre adresse MetaMask (si fournie)
echo.
echo USAGE AVEC VOTRE ADRESSE:
echo test_api_soldes.bat 0xVOTREADRESSE
echo.
echo ========================================
echo.

if "%1"=="" (
    echo Test avec adresses par défaut...
    python scripts/test_api_soldes.py
) else (
    echo Test avec votre adresse: %1
    python scripts/test_api_soldes.py %1
)

echo.
echo ========================================
echo TEST TERMINÉ
echo ========================================
pause 