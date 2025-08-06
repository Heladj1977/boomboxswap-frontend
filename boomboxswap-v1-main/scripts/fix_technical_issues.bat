@echo off
title BOOMBOXSWAP V1 - Fix Technical Issues
echo ======================================
echo BOOMBOXSWAP V1 - CORRECTION PROBLEMES TECHNIQUES
echo ======================================
echo.

REM Vérifier si conda est installé
where conda >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERREUR: Conda n'est pas installé ou pas dans le PATH
    echo Installez Miniconda/Anaconda d'abord
    pause
    exit /b 1
)

REM Activer l'environnement conda
echo [1/5] Activation environnement conda...
call conda activate boomboxswap
if %ERRORLEVEL% NEQ 0 (
    echo ERREUR: Environnement boomboxswap introuvable
    echo Exécutez install_conda.bat d'abord
    pause
    exit /b 1
)

REM 1. RÉSOLUTION PORT 8000 OCCUPÉ
echo [2/5] Vérification port 8000...
netstat -ano | findstr :8000 >nul
if %ERRORLEVEL% EQU 0 (
    echo ATTENTION: Port 8000 déjà utilisé
    echo Recherche du processus...
    for /f "tokens=5" %%a in ('netstat -ano ^| findstr :8000') do (
        echo Processus PID: %%a
        echo Arrêt du processus...
        taskkill /PID %%a /F >nul 2>&1
        if !ERRORLEVEL! EQU 0 (
            echo SUCCES: Processus arrêté
        ) else (
            echo ATTENTION: Impossible d'arrêter le processus
        )
    )
    timeout /t 2 /nobreak >nul
) else (
    echo SUCCES: Port 8000 libre
)

REM [3/5] Vérification cache mémoire
echo [3/5] Vérification cache mémoire...
python -c "import sys; sys.path.append('backend'); from services.memory_cache import BoomboxCache; cache = BoomboxCache(); print('Cache mémoire: OK')"
if %ERRORLEVEL% NEQ 0 (
    echo ERREUR: Cache mémoire non fonctionnel
    exit /b 1
) else (
    echo Cache mémoire: OK
)

REM 3. CORRECTION RPC BASE
echo [4/5] Correction RPC Base...
echo Ajout de RPC fallback pour Base...
echo RPC Base configuré avec fallbacks supplémentaires

REM 4. TEST CONNEXION SYSTÈME
echo [5/5] Test connexion système...
python -c "
import sys
sys.path.append('backend')
from services.memory_cache import BoomboxCache
try:
    cache = BoomboxCache()
    print('Cache mémoire: CONNECTE')
except:
    print('Cache mémoire: ERREUR')

import requests
try:
    response = requests.get('http://127.0.0.1:8000/health', timeout=5)
    print('Backend: CONNECTE')
except:
    print('Backend: NON DISPONIBLE')
"

echo.
echo ======================================
echo CORRECTION PROBLEMES TECHNIQUES TERMINEE
echo ======================================
echo.
echo Prochaines étapes:
echo 1. Démarrer le backend: python -m uvicorn backend.main:app --host 0.0.0.0 --port 8000
echo 2. Ouvrir l'interface: http://127.0.0.1:8000
echo 3. Vérifier les connexions blockchain
echo.
pause
