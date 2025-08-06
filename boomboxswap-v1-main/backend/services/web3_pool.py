# BOOMBOXSWAP - Web3 Pool Manager
# Gestion des connexions Web3 multi-chain avec fallback et connection pooling

import time
from typing import Dict, Optional, List, Any
from web3 import Web3
import logging
import threading

from contracts.addresses import get_chain_config

# Configuration logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class Web3PoolManager:
    """Gestionnaire de pool de connexions Web3 multi-chain"""

    def __init__(self):
        self.connections = {}
        self.health_status = {}
        self.lock = threading.Lock()
        self.last_health_check = {}

    def initialize_chain(self, chain_id: str) -> bool:
        """Initialise les connexions pour une chain"""
        chain_config = get_chain_config(chain_id)
        if not chain_config:
            logger.error(f"Configuration chain non trouvée: {chain_id}")
            return False

        rpc_urls = chain_config.get("rpc_urls", [])
        if not rpc_urls:
            logger.error(f"Aucun RPC URL pour chain: {chain_id}")
            return False

        with self.lock:
            self.connections[chain_id] = []
            self.health_status[chain_id] = {}
            self.last_health_check[chain_id] = {}

            for i, rpc_url in enumerate(rpc_urls):
                try:
                    # Configuration avec timeout
                    provider = Web3.HTTPProvider(
                        rpc_url,
                        request_kwargs={'timeout': 10}
                    )
                    web3 = Web3(provider)
                    if web3.is_connected():
                        self.connections[chain_id].append({
                            "web3": web3,
                            "url": rpc_url,
                            "index": i,
                            "last_used": time.time(),
                            "error_count": 0
                        })
                        self.health_status[chain_id][i] = True
                        self.last_health_check[chain_id][i] = time.time()
                        logger.info(f"Connexion {chain_id} RPC {i} OK: {rpc_url}")
                    else:
                        logger.warning(f"Connexion {chain_id} RPC {i} échouée: {rpc_url}")
                        self.health_status[chain_id][i] = False
                except Exception as e:
                    logger.error(f"Erreur connexion {chain_id} RPC {i}: {e}")
                    self.health_status[chain_id][i] = False

        return len(self.connections.get(chain_id, [])) > 0

    def get_web3(self, chain_id: str) -> Optional[Web3]:
        """Récupère une connexion Web3 disponible pour une chain"""
        if chain_id not in self.connections:
            if not self.initialize_chain(chain_id):
                return None

        with self.lock:
            connections = self.connections.get(chain_id, [])
            if not connections:
                return None

            # Trouve la connexion la plus récente et saine
            best_connection = None
            for conn in connections:
                if self.health_status[chain_id].get(conn["index"], False):
                    if best_connection is None or conn["last_used"] < best_connection["last_used"]:
                        best_connection = conn

            if best_connection:
                best_connection["last_used"] = time.time()
                return best_connection["web3"]

        return None

    def get_all_web3(self, chain_id: str) -> List[Web3]:
        """Récupère toutes les connexions Web3 saines pour une chain"""
        if chain_id not in self.connections:
            if not self.initialize_chain(chain_id):
                return []

        with self.lock:
            connections = self.connections.get(chain_id, [])
            healthy_connections = []

            for conn in connections:
                if self.health_status[chain_id].get(conn["index"], False):
                    healthy_connections.append(conn["web3"])

        return healthy_connections

    def check_connection_health(self, chain_id: str, connection_index: int) -> bool:
        """Vérifie la santé d'une connexion spécifique"""
        if chain_id not in self.connections:
            return False

        connections = self.connections.get(chain_id, [])
        if connection_index >= len(connections):
            return False

        connection = connections[connection_index]
        web3 = connection["web3"]

        try:
            # Test simple de connexion
            block_number = web3.eth.block_number
            if block_number > 0:
                self.health_status[chain_id][connection_index] = True
                self.last_health_check[chain_id][connection_index] = time.time()
                connection["error_count"] = 0
                return True
            else:
                self.health_status[chain_id][connection_index] = False
                connection["error_count"] += 1
                return False
        except Exception as e:
            logger.warning(f"Health check échoué {chain_id} RPC {connection_index}: {e}")
            self.health_status[chain_id][connection_index] = False
            connection["error_count"] += 1
            return False

    def health_check_all(self, chain_id: str) -> Dict[str, bool]:
        """Vérifie la santé de toutes les connexions d'une chain"""
        if chain_id not in self.connections:
            return {}

        results = {}
        with self.lock:
            connections = self.connections.get(chain_id, [])

            for i, conn in enumerate(connections):
                is_healthy = self.check_connection_health(chain_id, i)
                results[f"rpc_{i}"] = is_healthy

        return results

    def health_check_all_chains(self) -> Dict[str, Dict[str, bool]]:
        """Vérifie la santé de toutes les connexions de toutes les chains"""
        results = {}
        for chain_id in self.connections.keys():
            results[chain_id] = self.health_check_all(chain_id)
        return results

    def get_connection_stats(self, chain_id: str) -> Dict[str, Any]:
        """Récupère les statistiques des connexions d'une chain"""
        if chain_id not in self.connections:
            return {}

        with self.lock:
            connections = self.connections.get(chain_id, [])
            stats = {
                "total_connections": len(connections),
                "healthy_connections": 0,
                "connections": []
            }

            for i, conn in enumerate(connections):
                is_healthy = self.health_status[chain_id].get(i, False)
                if is_healthy:
                    stats["healthy_connections"] += 1

                stats["connections"].append({
                    "index": i,
                    "url": conn["url"],
                    "healthy": is_healthy,
                    "last_used": conn["last_used"],
                    "error_count": conn["error_count"],
                    "last_health_check": self.last_health_check[chain_id].get(i, 0)
                })

        return stats

    def get_all_stats(self) -> Dict[str, Dict[str, Any]]:
        """Récupère les statistiques de toutes les chains"""
        stats = {}
        for chain_id in self.connections.keys():
            stats[chain_id] = self.get_connection_stats(chain_id)
        return stats

    def reset_connection(self, chain_id: str, connection_index: int) -> bool:
        """Réinitialise une connexion spécifique"""
        if chain_id not in self.connections:
            return False

        connections = self.connections.get(chain_id, [])
        if connection_index >= len(connections):
            return False

        connection = connections[connection_index]
        rpc_url = connection["url"]

        try:
            # Crée une nouvelle connexion
            new_web3 = Web3(Web3.HTTPProvider(rpc_url))
            if new_web3.is_connected():
                with self.lock:
                    connection["web3"] = new_web3
                    connection["last_used"] = time.time()
                    connection["error_count"] = 0
                    self.health_status[chain_id][connection_index] = True
                    self.last_health_check[chain_id][connection_index] = time.time()
                logger.info(f"Connexion {chain_id} RPC {connection_index} réinitialisée")
                return True
            else:
                logger.error(f"Réinitialisation échouée {chain_id} RPC {connection_index}")
                return False
        except Exception as e:
            logger.error(f"Erreur réinitialisation {chain_id} RPC {connection_index}: {e}")
            return False

    def get_chain_info(self, chain_id: str) -> Dict[str, Any]:
        """Récupère les informations d'une chain"""
        return get_chain_config(chain_id)

    def get_supported_chains(self) -> List[str]:
        """Récupère la liste des chains supportées"""
        return ["bsc", "arbitrum", "base"]

    def is_chain_available(self, chain_id: str) -> bool:
        """Vérifie si une chain a au moins une connexion saine"""
        if chain_id not in self.connections:
            return False

        with self.lock:
            connections = self.connections.get(chain_id, [])
            for i, conn in enumerate(connections):
                if self.health_status[chain_id].get(i, False):
                    return True
        return False
