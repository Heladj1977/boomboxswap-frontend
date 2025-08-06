@echo off
REM ========================================
REM BOOMBOXSWAP V1 - SURVEILLANCE GIT MANUELLE
REM ========================================

echo =========================================
echo BOOMBOXSWAP V1 - SURVEILLANCE GIT
echo =========================================
echo.

REM Vérification environnement
call conda activate boomswap-v1
if %ERRORLEVEL% NEQ 0 (
    echo ERREUR: Environnement boomswap-v1 non trouve
    pause
    exit /b 1
)

echo [1/2] VERIFICATION ENVIRONNEMENT... OK

REM Vérification script auto-commit
if not exist scripts\auto-commit.py (
    echo ERREUR: auto-commit.py introuvable
    pause
    exit /b 1
)
echo [2/2] VERIFICATION SCRIPT... OK

echo =========================================
echo DEMARRAGE SURVEILLANCE GIT...
echo =========================================
echo Surveillance automatique des modifications...
echo Commit et push vers GitHub après validation tests
echo =========================================

REM Démarrer la surveillance Git
start "Auto-Commit" python scripts\auto-commit.py

echo =========================================
echo SURVEILLANCE GIT ACTIVEE !
echo =========================================
echo Le script auto-commit.py est maintenant en cours d'exécution
echo Il surveillera les modifications et fera des commits automatiques
echo.
echo Pour arrêter: Fermer la fenêtre "Auto-Commit" ou CTRL+C
echo =========================================
pause 