@echo off
echo ========================================
echo INSTALLATION ENVIRONNEMENT BOOMBOXSWAP
echo ========================================
echo.

echo [1/4] Verification Conda...
conda --version >nul 2>&1
if errorlevel 1 (
    echo ERREUR: Conda non installe. Veuillez installer Anaconda ou Miniconda.
    echo Telechargez depuis: https://docs.conda.io/en/latest/miniconda.html
    pause
    exit /b 1
)
echo OK: Conda detecte

echo.
echo [2/4] Creation environnement boomboxswap...
conda env create -f environment.yml
if errorlevel 1 (
    echo ERREUR: Echec creation environnement
    pause
    exit /b 1
)
echo OK: Environnement cree

echo.
echo [3/4] Activation environnement...
call conda activate boomboxswap
if errorlevel 1 (
    echo ERREUR: Echec activation environnement
    pause
    exit /b 1
)
echo OK: Environnement active

echo.
echo [4/4] Verification installation...
python --version
pip list | findstr fastapi
echo.
echo ========================================
echo INSTALLATION TERMINEE AVEC SUCCES
echo ========================================
echo.
echo Pour activer l'environnement:
echo   conda activate boomboxswap
echo.
echo Pour lancer le serveur de developpement:
echo   python -m uvicorn main:app --reload
echo.
pause
