@echo off
echo ========================================
echo INSTALLATION MINICONDA - BOOMBOXSWAP
echo ========================================
echo.

echo [1/3] Verification winget...
winget --version >nul 2>&1
if errorlevel 1 (
    echo ERREUR: winget non disponible
    echo Veuillez installer Miniconda manuellement depuis:
    echo https://repo.anaconda.com/miniconda/Miniconda3-latest-Windows-x86_64.exe
    pause
    exit /b 1
)
echo OK: winget disponible

echo.
echo [2/3] Installation Miniconda...
winget install Anaconda.Miniconda3 --accept-source-agreements --accept-package-agreements
if errorlevel 1 (
    echo ERREUR: Echec installation Miniconda
    echo Veuillez installer manuellement
    pause
    exit /b 1
)
echo OK: Miniconda installe

echo.
echo [3/3] Instructions finales...
echo.
echo INSTALLATION TERMINEE
echo ====================
echo.
echo 1. Fermez ce terminal
echo 2. Ouvrez un nouveau terminal
echo 3. Verifiez: conda --version
echo 4. Lancez: install_conda.bat
echo.
echo Si conda n'est pas reconnu:
echo - Redemarrez votre ordinateur
echo - Ou ajoutez manuellement au PATH
echo.
pause
