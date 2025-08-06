#!/usr/bin/env python3
"""
Vérification des dépendances critiques du backend BOOMBOXSWAP
Ce script doit être lancé dans l'environnement Conda du projet.
"""

import sys
import importlib

# Dépendances critiques et versions minimales
DEPENDANCES = {
    "fastapi": "0.104.1",
    "uvicorn": "0.24.0",
    "web3": "6.11.3",

    "python_dotenv": "1.0.0",
    "pydantic": "2.5.0",
    "httpx": "0.25.2",
    "aiohttp": "3.9.1",
    "asyncio_mqtt": "0.16.1",
    "python_multipart": "0.0.6",
    "jinja2": "3.1.2",
    "python_jose": "3.3.0",
    "passlib": "1.7.4",
    "python_decouple": "3.8",
    "requests": "2.31.0",
    "websockets": "12.0",
    "aiofiles": "23.2.1",
    "psutil": "5.9.6"
}

# Mapping nom import -> nom package PyPI
IMPORTS = {
    "fastapi": "fastapi",
    "uvicorn": "uvicorn",
    "web3": "web3",

    "python_dotenv": "dotenv",
    "pydantic": "pydantic",
    "httpx": "httpx",
    "aiohttp": "aiohttp",
    "asyncio_mqtt": "asyncio_mqtt",
    "python_multipart": "multipart",
    "jinja2": "jinja2",
    "python_jose": "jose",
    "passlib": "passlib",
    "python_decouple": "decouple",
    "requests": "requests",
    "websockets": "websockets",
    "aiofiles": "aiofiles",
    "psutil": "psutil"
}


def version_tuple(v):
    return tuple(map(int, (v.split(".")[:3])))


def check_module(nom_import, version_min, nom_pypi):
    try:
        module = importlib.import_module(nom_import)
        version = getattr(module, "__version__", None)
        if version is None:
            print(
                f"ATTENTION: Impossible de déterminer la version de {nom_pypi} "
                f"(module {nom_import})"
            )
            return True
        if version_tuple(version) < version_tuple(version_min):
            print(
                f"ERREUR: {nom_pypi} version {version} détectée, "
                f"mais {version_min} minimum requise."
            )
            return False
        print(f"OK: {nom_pypi} version {version} détectée.")
        return True
    except ImportError:
        print(
            f"ERREUR: {nom_pypi} (module {nom_import}) n'est pas installé."
        )
        return False


def check_memory_cache():
    try:
        import sys
        import os
        backend_path = os.path.join(
            os.path.dirname(__file__), '..', 'backend'
        )
        sys.path.append(backend_path)
        from services.memory_cache import BoomboxCache
        _ = BoomboxCache()  # Test d'initialisation
        print("OK: Cache mémoire BoomboxCache disponible.")
        return True
    except ImportError:
        print(
            "ERREUR: Cache mémoire BoomboxCache non disponible. "
            "Vérifiez services/memory_cache.py."
        )
        return False


def main():
    print("Vérification des dépendances backend critiques...")
    tout_ok = True
    for nom, version_min in DEPENDANCES.items():
        nom_import = IMPORTS[nom]
        ok = check_module(nom_import, version_min, nom)
        if not ok:
            tout_ok = False
    # Vérification spéciale pour cache mémoire
    if not check_memory_cache():
        tout_ok = False
    if tout_ok:
        print("\nSUCCES: Toutes les dépendances critiques sont présentes et à jour.")
        sys.exit(0)
    else:
        print(
            "\nECHEC: Certaines dépendances sont manquantes ou obsolètes. "
            "Corrigez avant de lancer le backend."
        )
        sys.exit(1)


if __name__ == "__main__":
    main() 