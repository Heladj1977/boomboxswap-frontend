@echo off
echo ========================================
echo AUDIT FORENSIQUE UI MODAL WALLET
echo ========================================
echo.
echo Ce script lance l'audit forensique pour identifier
echo les causes de corruption de l'UI modal wallet.
echo.
echo PROBLEMES AUDITES:
echo 1. Logos remplacés par texte pendant connexion
echo 2. Bouton wallet non-réactif après déconnexion  
echo 3. Logo MetaMask disparu remplacé par "Base MetaMask"
echo.
echo INSTRUCTIONS:
echo 1. Ouvrir la console du navigateur (F12)
echo 2. Lancer l'application
echo 3. Tester les connexions/déconnexions
echo 4. Exécuter FORENSIC_DIAGNOSTIC() dans la console
echo 5. Analyser les logs forensiques
echo.
echo ========================================
echo.

cd /d "%~dp0.."
echo Répertoire de travail: %CD%

echo.
echo Lancement de l'application...
echo.
echo SURVEILLANCE FORENSIQUE ACTIVE:
echo - Toutes les modifications DOM du modal sont tracées
echo - Les changements de contenu des boutons sont surveillés
echo - Les modifications d'images et logos sont enregistrées
echo - Les event listeners sont interceptés
echo - Les changements de style sont monitorés
echo.
echo TIMELINE UI disponible via: window.UI_TIMELINE
echo DIAGNOSTIC disponible via: window.FORENSIC_DIAGNOSTIC()
echo.

start_all.bat

echo.
echo ========================================
echo AUDIT FORENSIQUE LANCÉ
echo ========================================
echo.
echo PROCHAINES ÉTAPES:
echo 1. Ouvrir http://localhost:8000 dans le navigateur
echo 2. Ouvrir la console (F12)
echo 3. Tester la connexion MetaMask
echo 4. Observer les logs forensiques
echo 5. Exécuter FORENSIC_DIAGNOSTIC() pour analyse
echo.
echo RAPPORT ATTENDU:
echo - Fonction exacte qui modifie le contenu des boutons
echo - Moment précis où les logos sont remplacés
echo - Origine du texte "Base MetaMask"
echo - Problèmes de réactivité du bouton principal
echo.
pause 