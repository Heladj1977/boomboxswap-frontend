@echo off
echo ========================================
echo AUDIT FORENSIQUE CARD 3 RENDEMENTS
echo ========================================
echo.
echo Ce script lance l'audit forensique pour identifier
echo l'origine des fake data dans la Card 3 "Rendements".
echo.
echo PROBLÈME AUDITÉ:
echo - Card 3 affiche des fausses données au démarrage
echo - Valeurs "$0.00" et "0 fois" affichées
echo - Origine des fake data à identifier
echo.
echo ========================================
echo.

cd /d "%~dp0.."
echo Répertoire de travail: %CD%

echo.
echo Lancement de l'application...
echo.
echo SURVEILLANCE FORENSIQUE ACTIVE:
echo - Toutes les modifications de la Card 3 sont tracées
echo - Initialisation au démarrage surveillée
echo - Fonction setAllCardsToZero() instrumentée
echo - Timeline Card 3 complète
echo.
echo TIMELINE CARD3 disponible via: window.CARD3_TIMELINE
echo AUDIT CARD3 disponible via: window.AUDIT_CARD3()
echo.

start_all.bat

echo.
echo ========================================
echo AUDIT FORENSIQUE CARD 3 LANCÉ
echo ========================================
echo.
echo PROCHAINES ÉTAPES:
echo 1. Ouvrir http://localhost:8000 dans le navigateur
echo 2. Ouvrir la console (F12)
echo 3. Observer les logs d'audit Card 3
echo 4. Exécuter AUDIT_CARD3() pour analyse complète
echo 5. Analyser la timeline Card 3
echo.
echo RAPPORT ATTENDU:
echo - Source exacte des fake data (fichier + ligne)
echo - Valeurs fake affichées vs valeurs attendues
echo - Workflow complet d'initialisation Card 3
echo - Recommandations pour correction
echo.
pause 