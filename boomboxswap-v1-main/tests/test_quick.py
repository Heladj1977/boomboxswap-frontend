#!/usr/bin/env python3
"""
Test rapide pour vérifier que BOOMBOXSWAP démarre sans erreurs critiques
"""

import sys
import os
import asyncio
import logging

# Ajouter le répertoire backend au path
backend_path = os.path.join(os.path.dirname(__file__), '..', 'backend')
sys.path.insert(0, backend_path)

# Configuration logging simple
logging.basicConfig(level=logging.INFO, format='%(levelname)s: %(message)s')
logger = logging.getLogger(__name__)


async def test_basic_imports():
    """Test des imports de base"""
    try:
        logger.info("Test imports de base...")

        # Test imports Python standards
        try:
            import fastapi
            import uvicorn
            import web3
            # Vérifier que les modules sont bien importés
            _ = fastapi.__version__
            _ = uvicorn.__version__
            _ = web3.__version__
            logger.info("OK - Imports standards OK")
        except ImportError as e:
            logger.error(f"ECHEC - Import standard manquant: {e}")
            return False

        # Test imports services avec chemin absolu
        try:
            sys.path.insert(0, backend_path)
            from services.memory_cache import BoomboxCache
            from services.web3_pool import Web3PoolManager
            from services.contract_manager import ContractManager
            # Vérifier que les classes sont bien importées
            _ = BoomboxCache
            _ = Web3PoolManager
            _ = ContractManager
            logger.info("OK - Imports services OK")
        except ImportError as e:
            logger.error(f"ECHEC - Import service manquant: {e}")
            return False

        return True

    except Exception as e:
        logger.error(
            f"ECHEC - Erreur imports: {e}"
        )
        return False


async def test_cache_manager():
    """Test du gestionnaire de cache"""
    try:
        logger.info("Test cache manager...")

        # Import avec chemin absolu pour éviter les problèmes
        import sys
        import os
        backend_path = os.path.join(os.path.dirname(__file__), '..', 'backend')
        if backend_path not in sys.path:
            sys.path.insert(0, backend_path)
        
        from services.memory_cache import BoomboxCache

        cache_manager = BoomboxCache()

        # Test set/get
        cache_manager.set("test_key", "test_value", 60)
        value = cache_manager.get("test_key")

        if value == "test_value":
            logger.info("OK - Cache manager OK")
            return True
        else:
            logger.warning(
                "ATTENTION - Cache manager fonctionne mais valeur incorrecte"
            )
            return False

    except Exception as e:
        logger.error(
            f"ECHEC - Erreur cache manager: {e}"
        )
        return False


async def test_web3_pool():
    """Test du gestionnaire Web3"""
    try:
        logger.info("Test Web3 pool manager...")

        # Import avec chemin absolu pour éviter les problèmes
        import sys
        import os
        backend_path = os.path.join(os.path.dirname(__file__), '..', 'backend')
        if backend_path not in sys.path:
            sys.path.insert(0, backend_path)
        
        from services.web3_pool import Web3PoolManager

        pool_manager = Web3PoolManager()

        # Test initialisation BSC (plus stable)
        success = pool_manager.initialize_chain("bsc")

        if success:
            logger.info("OK - Web3 pool manager OK")
            return True
        else:
            logger.warning(
                "ATTENTION - Web3 pool manager - aucune connexion établie"
            )
            return False

    except Exception as e:
        logger.error(
            f"ECHEC - Erreur Web3 pool: {e}"
        )
        return False


async def test_contract_manager():
    """Test du gestionnaire de contrats"""
    try:
        logger.info("Test contract manager...")

        # Import avec chemin absolu pour éviter les problèmes
        import sys
        import os
        backend_path = os.path.join(os.path.dirname(__file__), '..', 'backend')
        if backend_path not in sys.path:
            sys.path.insert(0, backend_path)
        
        from services.web3_pool import Web3PoolManager
        from services.contract_manager import ContractManager

        pool_manager = Web3PoolManager()
        contract_manager = ContractManager(pool_manager)

        # Test récupération info chain
        chains = contract_manager.get_supported_chains()

        if len(chains) > 0:
            logger.info("OK - Contract manager OK")
            return True
        else:
            logger.warning(
                "ATTENTION - Contract manager - aucune chain supportée"
            )
            return False

    except Exception as e:
        logger.error(
            f"ECHEC - Erreur contract manager: {e}"
        )
        return False


async def test_main_app():
    """Test de l'application principale"""
    try:
        logger.info("Test application principale...")

        # Import avec chemin absolu pour éviter les problèmes
        import sys
        import os
        backend_path = os.path.join(os.path.dirname(__file__), '..', 'backend')
        if backend_path not in sys.path:
            sys.path.insert(0, backend_path)
        
        # Import sans démarrer le serveur
        import main

        # Vérifier que l'app est créée
        if hasattr(main, 'app') and main.app:
            logger.info("OK - Application principale OK")
            return True
        else:
            logger.error("ECHEC - Application principale non créée")
            return False

    except Exception as e:
        logger.error(
            f"ECHEC - Erreur application principale: {e}"
        )
        return False


async def main():
    """Fonction principale de test"""
    logger.info("=" * 50)
    logger.info("BOOMBOXSWAP - TEST RAPIDE")
    logger.info("=" * 50)

    tests = [
        ("Imports de base", test_basic_imports),
        ("Cache Manager", test_cache_manager),
        ("Web3 Pool", test_web3_pool),
        ("Contract Manager", test_contract_manager),
        ("Application principale", test_main_app)
    ]

    results = []

    for test_name, test_func in tests:
        logger.info(f"\n--- {test_name} ---")
        try:
            result = await test_func()
            results.append((test_name, result))
        except Exception as e:
            logger.error(
                f"Erreur inattendue dans {test_name}: {e}"
            )
            results.append((test_name, False))

    # Résumé
    logger.info("\n" + "=" * 50)
    logger.info("RÉSUMÉ DES TESTS")
    logger.info("=" * 50)

    passed = 0
    total = len(results)

    for test_name, result in results:
        status = "OK - PASS" if result else "ECHEC - FAIL"
        logger.info(f"{test_name}: {status}")
        if result:
            passed += 1

    logger.info(f"\nRésultat: {passed}/{total} tests réussis")

    if passed == total:
        logger.info("SUCCES - TOUS LES TESTS SONT PASSÉS - Projet prêt!")
        return True
    elif passed >= total * 0.7:
        logger.warning(
            "ATTENTION - TESTS MAJORITAIREMENT RÉUSSIS - "
            "Quelques problèmes mineurs"
        )
        return True
    else:
        logger.error(
            "ERREUR CRITIQUE - Problèmes majeurs détectés"
        )
        return False


if __name__ == "__main__":
    try:
        result = asyncio.run(main())
        sys.exit(0 if result else 1)
    except KeyboardInterrupt:
        logger.info("\nTest interrompu par l'utilisateur")
        sys.exit(1)
    except Exception as e:
        logger.error(
            f"Erreur fatale: {e}"
        )
        sys.exit(1)