@echo off
echo ========================================
echo TEST CALCUL VALEUR TOTALE
echo ========================================
echo.
echo MISSION: Vérifier que le calcul de la valeur totale
echo est correct après correction des prix
echo.
echo CORRECTIONS APPLIQUÉES:
echo - Prix BNB: $650 → $809.55 (prix réel)
echo - Prix CAKE: $2.5 → $2.50 (prix réel)
echo - Calcul détaillé avec logs
echo - Vérification automatique du total
echo.
echo CALCUL ATTENDU:
echo - BNB: quantité × $809.55
echo - USDT: quantité × $1.00
echo - CAKE: quantité × $2.50
echo - Total: somme des trois valeurs
echo.
echo INSTRUCTIONS:
echo 1. Assurez-vous que le backend est lancé (start_all.bat)
echo 2. Ce script va tester le calcul de la valeur totale
echo 3. Résultats affichés dans la console
echo.
echo ========================================
echo.

python scripts/test_calcul_total.py

echo.
echo ========================================
echo TEST TERMINÉ
echo ========================================
pause 