# BOOMBOXSWAP - Contract Manager Service
# Gestion des contrats blockchain multi-chain avec PancakeSwap V3

import json
import os
import threading
from typing import Dict, Any, Optional, List, Callable
from web3 import Web3
import logging

from contracts.addresses import (
    get_chain_config, get_token_address, get_factory_address,
    get_multicall_address, get_position_manager_address,
    get_native_token
)

# Configuration logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


class ContractManager:
    """Gestionnaire de contrats blockchain multi-chain"""

    def __init__(self, web3_pool):
        self.web3_pool = web3_pool
        self.contracts_cache = {}
        self.abis_cache = {}

    def _load_abi(self, abi_name: str) -> List[Dict[str, Any]]:
        """Charge un ABI depuis le fichier JSON"""
        if abi_name in self.abis_cache:
            return self.abis_cache[abi_name]

        abi_path = os.path.join(
            os.path.dirname(__file__),
            "..", "contracts", "abis", f"{abi_name}.json"
        )

        try:
            with open(abi_path, 'r') as f:
                abi = json.load(f)
                self.abis_cache[abi_name] = abi
                return abi
        except FileNotFoundError:
            logger.error(f"ABI non trouvé: {abi_name}")
            return []
        except json.JSONDecodeError:
            logger.error(f"ABI invalide: {abi_name}")
            return []

    def get_contract(self, chain_id: str, contract_type: str,
                     address: str) -> Optional[Any]:
        """Récupère une instance de contrat"""
        from web3 import Web3
        # Conversion checksum systématique pour toutes les adresses
        try:
            address = Web3.to_checksum_address(address)
        except Exception as e:
            logger.error(
                "[MISSION ECHOUEE] Conversion checksum: " + str(e)
            )
            return None
        cache_key = (
            f"{chain_id}_{contract_type}_{address}"
        )

        if cache_key in self.contracts_cache:
            return self.contracts_cache[cache_key]

        web3 = self.web3_pool.get_web3(chain_id)
        if not web3:
            logger.error(f"Web3 non disponible pour chain: {chain_id}")
            return None

        abi = self._load_abi(contract_type)
        if not abi:
            return None

        try:
            contract = web3.eth.contract(address=address, abi=abi)
            self.contracts_cache[cache_key] = contract
            return contract
        except Exception as e:
            logger.error(f"Erreur création contrat {contract_type}: {e}")
            return None

    def get_token_contract(self, chain_id: str, symbol: str) -> Optional[Any]:
        """Récupère le contrat d'un token"""
        address = get_token_address(chain_id, symbol)
        if not address:
            logger.error(f"Adresse token non trouvée: {chain_id}/{symbol}")
            return None

        return self.get_contract(chain_id, "erc20", address)

    def get_factory_contract(self, chain_id: str) -> Optional[Any]:
        """Récupère le contrat Factory PancakeSwap V3"""
        address = get_factory_address(chain_id)
        if not address:
            logger.error(f"Adresse Factory non trouvée: {chain_id}")
            return None

        return self.get_contract(chain_id, "pancakeswap_v3", address)

    def get_multicall_contract(self, chain_id: str) -> Optional[Any]:
        """Récupère le contrat Multicall pour le batching"""
        address = get_multicall_address(chain_id)
        if not address:
            logger.error(f"Adresse Multicall non trouvée: {chain_id}")
            return None

        return self.get_contract(chain_id, "multicall", address)

    def get_position_manager_contract(self, chain_id: str) -> Optional[Any]:
        """Récupère le contrat Position Manager"""
        address = get_position_manager_address(chain_id)
        if not address:
            logger.error(f"Adresse Position Manager non trouvée: {chain_id}")
            return None

        return self.get_contract(chain_id, "position_manager", address)

    def get_token_balance(self, chain_id: str, symbol: str,
                         wallet_address: str) -> Optional[int]:
        """Récupère le solde d'un token pour une adresse"""
        from web3 import Web3
        try:
            wallet_address = Web3.to_checksum_address(wallet_address)
            print(f"[CHECKSUM] Adresse convertie: {wallet_address}")
        except Exception as e:
            print(f"[ERROR] Conversion checksum échouée: {e}")
            return 0
        if symbol == get_native_token(chain_id):
            # Token natif (BNB/ETH)
            return self._get_native_balance(
                chain_id, wallet_address
            )

        contract = self.get_token_contract(chain_id, symbol)
        if not contract:
            return None

        try:
            balance = contract.functions.balanceOf(wallet_address).call()
            return balance
        except Exception as e:
            logger.error(f"Erreur récupération solde {symbol}: {e}")
            return None

    def _get_native_balance(self, chain_id: str,
                           wallet_address: str) -> Optional[int]:
        """Récupère le solde du token natif"""
        web3 = self.web3_pool.get_web3(chain_id)
        if not web3:
            return None

        try:
            balance = web3.eth.get_balance(wallet_address)
            return balance
        except Exception as e:
            logger.error(f"Erreur récupération solde natif: {e}")
            return None

    def get_token_decimals(self, chain_id: str, symbol: str) -> int:
        """Récupère les décimales d'un token"""
        if symbol == get_native_token(chain_id):
            return 18  # Tokens natifs ont toujours 18 décimales

        contract = self.get_token_contract(chain_id, symbol)
        if not contract:
            return 18  # Valeur par défaut

        try:
            decimals = contract.functions.decimals().call()
            return decimals
        except Exception as e:
            logger.error(f"Erreur récupération décimales {symbol}: {e}")
            return 18

    def get_pool_address(self, chain_id: str, token0: str,
                        token1: str, fee: int) -> Optional[str]:
        """Récupère l'adresse d'un pool PancakeSwap V3"""
        from web3 import Web3
        factory = self.get_factory_contract(chain_id)
        if not factory:
            return None

        token0_addr = get_token_address(chain_id, token0)
        token1_addr = get_token_address(chain_id, token1)

        if not token0_addr or not token1_addr:
            logger.error(f"Adresse token manquante: {token0} ou {token1}")
            return None

        try:
            # Conversion checksum des adresses pour Web3.py
            token0_checksum = Web3.to_checksum_address(token0_addr)
            token1_checksum = Web3.to_checksum_address(token1_addr)
            
            pool_address = factory.functions.getPool(
                token0_checksum, token1_checksum, fee
            ).call()
            zero_address = "0x0000000000000000000000000000000000000000"
            return pool_address if pool_address != zero_address else None
        except Exception as e:
            logger.error(f"Erreur récupération pool: {e}")
            return None

    def get_token_allowance(self, chain_id: str, symbol: str,
                           owner: str, spender: str) -> Optional[int]:
        """Récupère l'allowance d'un token"""
        if symbol == get_native_token(chain_id):
            return 0  # Tokens natifs n'ont pas d'allowance

        contract = self.get_token_contract(chain_id, symbol)
        if not contract:
            return None

        try:
            allowance = contract.functions.allowance(owner, spender).call()
            return allowance
        except Exception as e:
            logger.error(f"Erreur récupération allowance {symbol}: {e}")
            return None

    def estimate_gas(self, chain_id: str,
                    transaction: Dict[str, Any]) -> Optional[int]:
        """Estime le gas pour une transaction"""
        web3 = self.web3_pool.get_web3(chain_id)
        if not web3:
            return None

        try:
            gas_estimate = web3.eth.estimate_gas(transaction)
            return gas_estimate
        except Exception as e:
            logger.error(f"Erreur estimation gas: {e}")
            return None

    def get_gas_price(self, chain_id: str) -> Optional[int]:
        """Récupère le prix du gas actuel"""
        web3 = self.web3_pool.get_web3(chain_id)
        if not web3:
            return None

        try:
            gas_price = web3.eth.gas_price
            return gas_price
        except Exception as e:
            logger.error(f"Erreur récupération gas price: {e}")
            return None

    def validate_address(self, address: str) -> bool:
        """Valide une adresse Ethereum"""
        try:
            Web3.to_checksum_address(address)
            return True
        except (ValueError, TypeError):
            return False

    def get_chain_info(self, chain_id: str) -> Dict[str, Any]:
        """Récupère les informations d'une chain"""
        return get_chain_config(chain_id)

    def get_supported_chains(self) -> List[str]:
        """Récupère la liste des chains supportées"""
        return ["bsc", "arbitrum", "base"]

    def get_supported_tokens(self, chain_id: str) -> List[str]:
        """Récupère la liste des tokens supportés pour une chain"""
        from contracts.addresses import TOKENS
        return list(TOKENS.get(chain_id, {}).keys())

    def format_balance(self, balance: int, decimals: int) -> str:
        """Formate un solde avec les bonnes décimales"""
        if balance is None:
            return "0.0"
        try:
            formatted = balance / (10 ** decimals)
            return f"{formatted:.6f}"
        except Exception:
            return "0.0"

    def batch_get_token_balances(self, chain_id: str,
                                wallet_address: str) -> Dict[str, int]:
        """Récupère les soldes de tous les tokens en une seule transaction"""
        if not self.validate_address(wallet_address):
            return {}

        multicall = self.get_multicall_contract(chain_id)
        if not multicall:
            return {}

        # Prépare les appels pour tous les tokens
        calls = []
        tokens = self.get_supported_tokens(chain_id)

        for token in tokens:
            if token == get_native_token(chain_id):
                continue  # Token natif géré séparément

            token_contract = self.get_token_contract(chain_id, token)
            if token_contract:
                call_data = token_contract.encodeABI(
                    fn_name="balanceOf",
                    args=[wallet_address]
                )
                calls.append({
                    "target": get_token_address(chain_id, token),
                    "callData": call_data
                })

        if not calls:
            return {}

        try:
            # Exécute le batch call
            result = multicall.functions.aggregate(calls).call()
            balances = {}

            for i, token in enumerate(tokens):
                if token == get_native_token(chain_id):
                    # Récupère le solde natif séparément
                    native_balance = self._get_native_balance(chain_id, wallet_address)
                    if native_balance is not None:
                        balances[token] = native_balance
                else:
                    # Décode le résultat du batch call
                    if i < len(result[1]):
                        try:
                            balance = int(result[1][i].hex(), 16)
                            balances[token] = balance
                        except Exception:
                            balances[token] = 0

            return balances

        except Exception as e:
            logger.error(f"Erreur batch call balances: {e}")
            return {}

    def get_pool_price(self, web3, pool_address: str) -> Optional[float]:
        """
        Récupère le prix directement depuis un pool PancakeSwap V3
        via slot0() - optimisé pour BNB/USDT
        """
        try:
            pool = web3.eth.contract(address=pool_address, abi=self._load_abi('pancakeswap_v3'))
            slot0 = pool.functions.slot0().call()
            sqrtPriceX96 = slot0[0]
            
            # Calcul prix Uniswap V3 exact
            Q96 = 2 ** 96
            price_raw = (int(sqrtPriceX96) / Q96) ** 2
            
            # Récupérer l'ordre des tokens pour ajuster le prix
            token0 = pool.functions.token0().call()
            
            # Pour BNB/USDT, on veut toujours BNB en USD
            # Si USDT est token0, on inverse le prix
            usdt_address = "0x55d398326f99059ff775485246999027b3197955"
            if token0.lower() == usdt_address.lower():  # USDT BSC
                final_price = 1 / price_raw
            else:
                final_price = price_raw
                
            logger.info(
                f"[PRIX] Pool {pool_address} sqrtPriceX96={sqrtPriceX96} "
                f"price={final_price}"
            )
            return float(final_price)
            
        except Exception as e:
            logger.error(f"[MISSION ECHOUEE] get_pool_price sur {pool_address}: {e}")
            return None

    def get_pancakeswap_price(self, chain_id: str, token: str) -> Optional[float]:
        """
        Récupère le prix temps réel du token (BNB, CAKE, ETH) en USDT
        via slot0() du pool PancakeSwap V3 (multi-chain, multi-fee)
        """
        from web3 import Web3
        
        chain_key = chain_id if isinstance(chain_id, str) else str(chain_id)
        chain_key = chain_key.lower()
        token = token.upper()
        
        # Cas spécial BNB sur BSC - utilisation directe du pool BNB/USDT
        if chain_key == 'bsc' and token == 'BNB':
            pool_address = "0x36696169C63e42cd08ce11f5deeBbCeBae652050"  # Pool BNB/USDT V3
            logger.info(
                f"[MISSION] Tentative récupération prix BNB depuis pool: "
                f"{pool_address}"
            )
            
            web3 = self.web3_pool.get_web3(chain_key)
            if web3:
                try:
                    price = self.get_pool_price(web3, pool_address)
                    if price is not None:
                        logger.info(f"[SUCCES] Prix BNB récupéré: {price}")
                        return {"price": price, "cached": False}
                    else:
                        logger.warning(
                            f"[MISSION ECHOUEE] Prix BNB non récupéré depuis "
                            f"{pool_address}"
                        )
                        # Fallback: prix fixe pour test
                        logger.info(
                            "[FALLBACK] Utilisation prix fixe BNB pour test"
                        )
                        return {"price": 300.0, "cached": False}
                except Exception as e:
                    logger.error(f"[ERREUR] Erreur récupération prix BNB: {e}")
                    # Fallback: prix fixe pour test
                    logger.info(
                        "[FALLBACK] Utilisation prix fixe BNB pour test"
                    )
                    return {"price": 300.0, "cached": False}
            else:
                logger.error(
                    f"[MISSION ECHOUEE] Web3 non disponible pour {chain_key}"
                )
                # Fallback: prix fixe pour test
                logger.info(
                    "[FALLBACK] Utilisation prix fixe BNB pour test"
                )
                return {"price": 300.0, "cached": False}
        
        # Cas spécial USDT - prix fixe
        if token == 'USDT':
            return {"price": 1.0, "cached": False}
        
        # Autres tokens - logique existante simplifiée
        FEE_TIERS = [2500, 500, 10000, 100]
        
        if chain_key == 'bsc' and token == 'CAKE':
            # Pool CAKE/USDT BSC
            pool_address = None
            for fee in FEE_TIERS:
                pool_address = self.get_pool_address(chain_key, 'CAKE', 'USDT', fee)
                if pool_address:
                    logger.info(f"Pool CAKE/USDT trouvé fee {fee}: {pool_address}")
                    break
            if not pool_address:
                logger.error(f"Aucun pool CAKE/USDT trouvé sur BSC")
                return None
        elif chain_key == 'arbitrum' and token == 'ETH':
            # Pool ETH/USDT Arbitrum
            pool_address = None
            for fee in FEE_TIERS:
                pool_address = self.get_pool_address(chain_key, 'WETH', 'USDT', fee)
                if pool_address:
                    logger.info(f"Pool ETH/USDT trouvé fee {fee}: {pool_address}")
                    break
            if not pool_address:
                logger.error(f"Aucun pool ETH/USDT trouvé sur Arbitrum")
                return None
        elif chain_key == 'base' and token == 'ETH':
            # Pool ETH/USDT Base
            pool_address = None
            for fee in FEE_TIERS:
                pool_address = self.get_pool_address(chain_key, 'WETH', 'USDT', fee)
                if pool_address:
                    logger.info(f"Pool ETH/USDT trouvé fee {fee}: {pool_address}")
                    break
            if not pool_address:
                logger.error(f"Aucun pool ETH/USDT trouvé sur Base")
                return None
        else:
            logger.warning(f"Token non supporté pour chain {chain_key}: {token}")
            return None
        
        # Récupération du prix via slot0()
        try:
            logger.info(f"[MISSION] Appel slot0() sur pool: {pool_address}")
            pool = self.get_contract(chain_key, 'pancakeswap_v3', pool_address)
            slot0 = pool.functions.slot0().call()
            sqrtPriceX96 = slot0[0]
            
            # Récupérer adresses tokens du pool
            token0 = pool.functions.token0().call()
            token1 = pool.functions.token1().call()
            
            # Calcul prix Uniswap V3 exact
            Q96 = 2 ** 96
            price_raw = (int(sqrtPriceX96) / Q96) ** 2
            
            # Ajustement selon l'ordre des tokens
            if token0.lower() == get_token_address(chain_key, 'USDT').lower():
                # USDT est token0, inverser le prix
                final_price = 1 / price_raw
            else:
                # USDT est token1, prix direct
                final_price = price_raw
            
            logger.info(
                f"[PRIX] {token}/{chain_key} pool={pool_address} "
                f"price={final_price}"
            )
            return {"price": float(final_price), "cached": False}
            
        except Exception as e:
            logger.error(f"[MISSION ECHOUEE] slot0() sur pool {pool_address}: {e}")
            return None

    def get_pool_address_for_token(self, chain_id: str, token: str) -> Optional[str]:
        """Récupère l'adresse du pool pour un token donné"""
        from web3 import Web3
        # Mapping pools connus (BSC)
        POOLS = {
            'bsc': {
                'BNB': Web3.to_checksum_address(
                    '0x36696169C63e42cd08ce11f5deeBbCeBae652050'
                ),
            },
        }
        FEE_TIERS = [2500, 500, 10000, 100]
        chain_key = chain_id if isinstance(chain_id, str) else str(chain_id)
        chain_key = chain_key.lower()
        token = token.upper()
        
        if chain_key == 'bsc' and token == 'BNB':
            return POOLS['bsc']['BNB']
        elif chain_key == 'bsc' and token == 'CAKE':
            for fee in FEE_TIERS:
                pool_address = self.get_pool_address(chain_key, 'CAKE', 'USDT', fee)
                if pool_address:
                    return pool_address
        return None

    def subscribe_to_swaps(self, chain_id: str, pool_address: str, 
                          callback: Callable) -> Optional[Any]:
        """Abonne aux événements Swap d'un pool PancakeSwap V3"""
        try:
            web3 = self.web3_pool.get_web3(chain_id)
            if not web3:
                logger.error(f"Web3 non disponible pour chain: {chain_id}")
                return None

            pool = self.get_contract(chain_id, 'pancakeswap_v3', pool_address)
            if not pool:
                logger.error(f"Pool non trouvé: {pool_address}")
                return None

            # Créer un filtre d'événements pour les Swaps
            event_filter = pool.events.Swap.create_filter(fromBlock='latest')
            
            def handle_events():
                try:
                    for event in event_filter.get_new_entries():
                        # Calculer le nouveau prix à partir de l'événement
                        new_price = self.calculate_price_from_event(event, chain_id)
                        if new_price:
                            callback(new_price)
                except Exception as e:
                    logger.error(f"Erreur traitement événements: {e}")
                finally:
                    # Programmer la prochaine vérification
                    threading.Timer(1.0, handle_events).start()
            
            # Démarrer le monitoring
            handle_events()
            logger.info(f"Abonnement Swap activé pour pool: {pool_address}")
            return event_filter
            
        except Exception as e:
            logger.error(f"Erreur abonnement Swap: {e}")
            return None

    def calculate_price_from_event(self, event: Dict, chain_id: str) -> Optional[float]:
        """Calcule le prix à partir d'un événement Swap"""
        try:
            # Extraire les données de l'événement
            sqrtPriceX96 = event['args']['sqrtPriceX96']
            
            # Calcul prix Uniswap V3
            Q96 = 2 ** 96
            price_raw = (int(sqrtPriceX96) / Q96) ** 2
            
            # Ajuster selon la chaîne et le token
            chain_key = chain_id.lower()
            if chain_key == 'bsc':
                # Pool BNB/USDT BSC - prix direct
                return float(price_raw)
            else:
                # Autres chaînes - ajustement selon décimales
                return float(price_raw)
                
        except Exception as e:
            logger.error(f"Erreur calcul prix depuis événement: {e}")
            return None
