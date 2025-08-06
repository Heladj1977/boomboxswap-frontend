import threading
import time
from typing import Any, Dict, Optional
import logging


logger = logging.getLogger(__name__)


class BoomboxCache:
    """Cache mémoire optimisé pour BOOMBOXSWAP gaming UX"""
    def __init__(self):
        self.cache_config = {
            'prices': 60,        # 1min pour prix temps réel
            'pools': 300,        # 5min pour données pools
            'positions': 30,     # 30sec pour positions utilisateur
            'health': 120        # 2min pour health monitoring
        }
        self._cache: Dict[str, Any] = {}
        self._expirations: Dict[str, float] = {}
        self._lock = threading.RLock()
        self._start_cleanup_thread()
        logger.info("CACHE GAMING OPERATIONNEL - MISSION CACHE ACTIVE")
        logger.info(
            "PERFORMANCE CACHE: prix(1min) pools(5min) positions(30sec)"
        )

    def set(self, key: str, value: Any, ttl: Optional[int] = None):
        with self._lock:
            self._cache[key] = value
            expire = time.time() + (ttl if ttl is not None else 60)
            self._expirations[key] = expire

    def get(self, key: str) -> Optional[Any]:
        with self._lock:
            if key in self._cache and self._expirations.get(key, 0) > time.time():
                return self._cache[key]
            self._cache.pop(key, None)
            self._expirations.pop(key, None)
            return None

    def delete(self, key: str):
        with self._lock:
            self._cache.pop(key, None)
            self._expirations.pop(key, None)

    def clear(self):
        with self._lock:
            self._cache.clear()
            self._expirations.clear()

    def _start_cleanup_thread(self):
        def cleanup():
            while True:
                now = time.time()
                with self._lock:
                    expired = [
                        k for k, exp in self._expirations.items() if exp < now
                    ]
                    for k in expired:
                        self._cache.pop(k, None)
                        self._expirations.pop(k, None)
                time.sleep(5)
        t = threading.Thread(target=cleanup, daemon=True)
        t.start()

    def get_gaming_stats(self) -> Dict[str, Any]:
        with self._lock:
            return {
                'total_keys': len(self._cache),
                'keys': list(self._cache.keys()),
            } 