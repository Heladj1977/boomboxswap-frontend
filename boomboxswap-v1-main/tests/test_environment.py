#!/usr/bin/env python3
"""
Script de test pour verifier l'environnement BOOMBOXSWAP
"""

import sys
import importlib

def test_imports():
    """Teste l'importation des packages principaux"""
    packages = [
        'fastapi',
        'uvicorn',
        'web3',
        'pydantic',
        'httpx',
        'aiohttp'
    ]


def test_memory_cache():
    """Vérifie que le cache mémoire est fonctionnel"""
    try:
        import sys
        import os
        sys.path.append(os.path.join(os.path.dirname(__file__), '..', 'backend'))
        from services.memory_cache import BoomboxCache
        cache = BoomboxCache()
        # Test simple d'écriture/lecture
        cache.set("test_key", "test_value", 60)
        assert cache.get("test_key") == "test_value"
        print("OK: Cache mémoire fonctionnel")
        return True
    except Exception as e:
        print(f"ERREUR: Cache mémoire - {e}")
        return False

    print("VERIFICATION ENVIRONNEMENT BOOMBOXSWAP")
    print("=" * 40)
    print()

    success_count = 0
    for package in packages:
        try:
            importlib.import_module(package)
            print(f"OK: {package}")
            success_count += 1
        except ImportError as e:
            print(f"ECHEC: {package} - {e}")

    print()
    print(f"RESULTAT: {success_count}/{len(packages)} packages installes")

    if success_count == len(packages):
        print("SUCCES: Environnement completement fonctionnel")
        return True
    else:
        print("ATTENTION: Certains packages manquent")
        return False

def test_python_version():
    """Verifie la version de Python"""
    version = sys.version_info
    print(f"Python {version.major}.{version.minor}.{version.micro}")

    if version.major == 3 and version.minor >= 11:
        print("OK: Version Python compatible")
        return True
    else:
        print("ATTENTION: Version Python non optimale")
        return False

if __name__ == "__main__":
    print("TEST ENVIRONNEMENT CONDITION")
    print("=" * 30)
    print()

    version_ok = test_python_version()
    print()
    imports_ok = test_imports()
    print()
    cache_ok = test_memory_cache()

    print()
    if version_ok and imports_ok and cache_ok:
        print("ENVIRONNEMENT PRET POUR LE DEVELOPPEMENT")
        print("Vous pouvez maintenant lancer: python -m uvicorn main:app --reload")
    else:
        print("PROBLEMES DETECTES - Verifiez l'installation")
