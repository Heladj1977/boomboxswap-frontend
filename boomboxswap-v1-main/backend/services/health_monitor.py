"""
BOOMBOXSWAP - Health Monitor Service
Surveillance de la santé des services et connexions
"""

import logging
from typing import Dict, Any

logger = logging.getLogger(__name__)


class HealthMonitor:
    """Health monitoring BOOMBOXSWAP (cache mémoire + web3_pool_manager)"""
    def __init__(self, cache_memoire=None, web3_pool_manager=None):
        self.cache_memoire = cache_memoire
        self.web3_pool_manager = web3_pool_manager

    async def get_health_report(self) -> Dict[str, Any]:
        services = {}
        # Cache mémoire
        if self.cache_memoire:
            services["cache_memoire"] = {
                "status": "ACTIF",
                "stats": self.cache_memoire.get_gaming_stats()
            }
        else:
            services["cache_memoire"] = {"status": "NON DISPONIBLE"}
        # Web3 Pool
        if self.web3_pool_manager:
            services["web3_pool_manager"] = "ACTIF"
        else:
            services["web3_pool_manager"] = "NON DISPONIBLE"
        return {
            "mission": "BOOMBOXSWAP V1",
            "status": "OPERATIONNEL",
            "services": services
        }