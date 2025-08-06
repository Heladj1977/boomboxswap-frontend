@echo off
REM ===================================================================
REM BOOMBOXSWAP V1 - RESTART AUTOMATIQUE SURVEILLANCE GIT
REM Garantit que le workflow GitHub automatisé reste actif en continu
REM ===================================================================

:loop
echo.
echo [%date% %time%] REDEMARRAGE SURVEILLANCE GIT...
echo [1/3] Verification environnement Conda...
call conda activate boomswap-v1
if %ERRORLEVEL% NEQ 0 (
    echo ERREUR: Impossible d'activer l'environnement Conda
    echo Verifie que Conda est installe et dans le PATH
    timeout /t 10
    goto loop
)

echo [2/3] Demarrage surveillance Git automatisee...
echo [INFO] Surveillance active - Ctrl+C pour arreter
python scripts/auto-commit.py

REM Si le script s'arrete, attend 5 secondes et redemarre
echo [%date% %time%] ATTENTION: Surveillance Git arretee - Redemarrage dans 5 secondes...
timeout /t 5 >nul
goto loop 