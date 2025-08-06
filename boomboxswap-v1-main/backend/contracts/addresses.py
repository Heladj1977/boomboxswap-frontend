# BOOMBOXSWAP - Adresses de contrats multi-chain
# Configuration des adresses PancakeSwap V3 et tokens par chain

from typing import Dict, Any

# Configuration multi-chain
CHAINS = {
    "bsc": {
        "chain_id": 56,
        "name": "Binance Smart Chain",
        "rpc_urls": [
            "https://bsc-dataseed1.binance.org/",
            "https://bsc-dataseed2.binance.org/",
            "https://bsc-dataseed3.binance.org/",
            "https://bsc-dataseed4.binance.org/"
        ],
        "explorer": "https://bscscan.com",
        "native_token": "BNB"
    },
    "arbitrum": {
        "chain_id": 42161,
        "name": "Arbitrum One",
        "rpc_urls": [
            "https://arb1.arbitrum.io/rpc",
            "https://arbitrum-one.publicnode.com"
        ],
        "explorer": "https://arbiscan.io",
        "native_token": "ETH"
    },
    "base": {
        "chain_id": 8453,
        "name": "Base",
        "rpc_urls": [
            "https://mainnet.base.org",
            "https://base.blockpi.network/v1/rpc/public"
        ],
        "explorer": "https://basescan.org",
        "native_token": "ETH"
    }
}

# Adresses PancakeSwap V3 Factory par chain
PANCAKESWAP_V3_FACTORY = {
    "bsc": "0x0BFbCF9fa4f9C56B0F40a671Ad40E0805A091865",
    # PancakeSwap V3 sur Arbitrum
    "arbitrum": "0x0BFbCF9fa4f9C56B0F40a671Ad40E0805A091865",
    # PancakeSwap V3 sur Base
    "base": "0x0BFbCF9fa4f9C56B0F40a671Ad40E0805A091865"
}

# Adresses Multicall par chain
MULTICALL_ADDRESSES = {
    "bsc": "0xfF6FD90A470Aaa0c1B8A54681746b07AcdFedc9B",
    "arbitrum": "0x80C7DD17B01855a6D2347444a0FCC36136a314de",
    "base": "0x091e99cb1C49331a94dD62755D168E941AbD0693"
}

# Adresses Position Manager par chain
POSITION_MANAGER_ADDRESSES = {
    "bsc": "0x46A15B0b27311cedF172AB29E4f4766fbE7F4364",
    "arbitrum": "0x46A15B0b27311cedF172AB29E4f4766fbE7F4364",
    "base": "0x46A15B0b27311cedF172AB29E4f4766fbE7F4364"
}

# Adresses des tokens par chain
TOKENS = {
    "bsc": {
        "BNB": {
            # Native token
            "address": "0x0000000000000000000000000000000000000000",
            "symbol": "BNB",
            "name": "BNB",
            "decimals": 18,
            "logo": "assets/images/tokens/bnb.svg"
        },
        "USDT": {
            "address": "0x55d398326f99059fF775485246999027B3197955",
            "symbol": "USDT",
            "name": "Tether USD",
            "decimals": 18,
            "logo": "assets/images/tokens/usdt.svg"
        },
        "CAKE": {
            "address": "0x0E09FaBB73Bd3Ade0a17ECC321fD13a19e81cE82",
            "symbol": "CAKE",
            "name": "PancakeSwap Token",
            "decimals": 18,
            "logo": "assets/images/tokens/cake.svg"
        }
    },
    "arbitrum": {
        "ETH": {
            # Native token
            "address": "0x0000000000000000000000000000000000000000",
            "symbol": "ETH",
            "name": "Ethereum",
            "decimals": 18,
            "logo": "assets/images/tokens/eth.svg"
        },
        "USDT": {
            "address": "0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9",
            "symbol": "USDT",
            "name": "Tether USD",
            "decimals": 6,
            "logo": "assets/images/tokens/usdt.svg"
        },
        "CAKE": {
            "address": "0x2C9Fc60878751a0C9C63853bbB5AcE9fA2C085d8",
            "symbol": "CAKE",
            "name": "PancakeSwap Token",
            "decimals": 18,
            "logo": "assets/images/tokens/cake.svg"
        }
    },
    "base": {
        "ETH": {
            # Native token
            "address": "0x0000000000000000000000000000000000000000",
            "symbol": "ETH",
            "name": "Ethereum",
            "decimals": 18,
            "logo": "assets/images/tokens/eth.svg"
        },
        "USDT": {
            "address": "0x50c5725949A6F0c72E6C4a641F24049A917DB0Cb",
            "symbol": "USDT",
            "name": "Tether USD",
            "decimals": 6,
            "logo": "assets/images/tokens/usdt.svg"
        },
        "CAKE": {
            "address": "0x2C9Fc60878751a0C9C63853bbB5AcE9fA2C085d8",
            "symbol": "CAKE",
            "name": "PancakeSwap Token",
            "decimals": 18,
            "logo": "assets/images/tokens/cake.svg"
        }
    }
}

# Pools PancakeSwap V3 par défaut (fee tiers)
DEFAULT_POOLS = {
    "bsc": {
        "BNB/USDT": {
            "token0": "BNB",
            "token1": "USDT",
            "fee": 500,  # 0.05%
            "pool_address": None  # Sera récupéré via Factory
        },
        "USDT/CAKE": {
            "token0": "USDT",
            "token1": "CAKE",
            "fee": 500,
            "pool_address": None
        },
        "CAKE/BNB": {
            "token0": "CAKE",
            "token1": "BNB",
            "fee": 500,
            "pool_address": None
        }
    },
    "arbitrum": {
        "ETH/USDT": {
            "token0": "ETH",
            "token1": "USDT",
            "fee": 500,
            "pool_address": None
        },
        "USDT/CAKE": {
            "token0": "USDT",
            "token1": "CAKE",
            "fee": 500,
            "pool_address": None
        },
        "CAKE/ETH": {
            "token0": "CAKE",
            "token1": "ETH",
            "fee": 500,
            "pool_address": None
        }
    },
    "base": {
        "ETH/USDT": {
            "token0": "ETH",
            "token1": "USDT",
            "fee": 500,
            "pool_address": None
        },
        "USDT/CAKE": {
            "token0": "USDT",
            "token1": "CAKE",
            "fee": 500,
            "pool_address": None
        },
        "CAKE/ETH": {
            "token0": "CAKE",
            "token1": "ETH",
            "fee": 500,
            "pool_address": None
        }
    }
}


def get_chain_config(chain_id: str) -> Dict[str, Any]:
    """Récupère la configuration d'une chain"""
    return CHAINS.get(chain_id, {})


def get_token_address(chain_id: str, symbol: str) -> str:
    """Récupère l'adresse d'un token sur une chain"""
    return TOKENS.get(chain_id, {}).get(symbol, {}).get("address", "")


def get_factory_address(chain_id: str) -> str:
    """Récupère l'adresse de la Factory PancakeSwap V3"""
    return PANCAKESWAP_V3_FACTORY.get(chain_id, "")


def get_multicall_address(chain_id: str) -> str:
    """Récupère l'adresse du contrat Multicall"""
    return MULTICALL_ADDRESSES.get(chain_id, "")


def get_position_manager_address(chain_id: str) -> str:
    """Récupère l'adresse du Position Manager"""
    return POSITION_MANAGER_ADDRESSES.get(chain_id, "")


def get_default_pools(chain_id: str) -> Dict[str, Any]:
    """Récupère les pools par défaut d'une chain"""
    return DEFAULT_POOLS.get(chain_id, {})


def get_native_token(chain_id: str) -> str:
    """Récupère le token natif d'une chain"""
    return CHAINS.get(chain_id, {}).get("native_token", "")
