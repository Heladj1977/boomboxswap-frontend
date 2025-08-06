#!/usr/bin/env python3
"""
Script de test de l'API des soldes après correction
Test direct de l'endpoint /api/v1/data/balances/{address}
"""

import requests
import sys
from typing import Dict, Any


def test_api_balances_fix(address: str, chain_id: int = 56) -> Dict[str, Any]:
    """
    Test direct de l'API des soldes après correction
    
    Args:
        address: Adresse Ethereum à tester
        chain_id: ID de la chain (56=BSC, 42161=Arbitrum, 8453=Base)
    
    Returns:
        Dict avec le résultat du test
    """
    
    base_url = "http://127.0.0.1:8000"
    endpoint = f"/api/v1/data/balances/{address}"
    params = {"chain_id": chain_id}
    
    print("🎯 TEST API BALANCES FIX: === TEST DIRECT API ===")
    print(f"🎯 TEST API BALANCES FIX: URL: {base_url}{endpoint}")
    print(f"🎯 TEST API BALANCES FIX: Params: {params}")
    print(f"🎯 TEST API BALANCES FIX: Address: {address}")
    print(f"🎯 TEST API BALANCES FIX: Chain ID: {chain_id}")
    
    try:
        # Test 1: Vérifier que le serveur répond
        print("\n🎯 TEST API BALANCES FIX: 1. Test connectivité serveur...")
        health_response = requests.get(f"{base_url}/health", timeout=5)
        if health_response.status_code == 200:
            status = health_response.status_code
            print(f"✅ Serveur accessible - Status: {status}")
            health_data = health_response.json()
            services = health_data.get('services', {})
            print(f"✅ Services: {services}")
        else:
            status = health_response.status_code
            print(f"❌ Serveur inaccessible - Status: {status}")
            return {"success": False, "error": "Serveur inaccessible"}
        
        # Test 2: Appel API des soldes
        print("\n🎯 TEST API BALANCES FIX: 2. Appel API des soldes...")
        response = requests.get(
            f"{base_url}{endpoint}",
            params=params,
            timeout=30
        )
        
        print(f"🎯 TEST API BALANCES FIX: Status réponse: {response.status_code}")
        print(f"🎯 TEST API BALANCES FIX: Headers réponse: {dict(response.headers)}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Réponse API reçue:")
            print(f"   - bnb: {data.get('bnb', 'N/A')}")
            print(f"   - usdt: {data.get('usdt', 'N/A')}")
            print(f"   - cake: {data.get('cake', 'N/A')}")
            print(f"   - totalValue: {data.get('totalValue', 'N/A')}")
            
            # Vérifier que les valeurs ne sont pas undefined
            if data.get('bnb') == 'undefined' or data.get('usdt') == 'undefined' or data.get('cake') == 'undefined':
                print("❌ PROBLÈME: Valeurs undefined détectées")
                return {
                    "success": False,
                    "status_code": response.status_code,
                    "error": "Valeurs undefined dans la réponse"
                }
            
            # Vérifier que les clés sont en minuscules
            expected_keys = ['bnb', 'usdt', 'cake', 'totalValue']
            missing_keys = [key for key in expected_keys if key not in data]
            if missing_keys:
                print(f"❌ PROBLÈME: Clés manquantes: {missing_keys}")
                return {
                    "success": False,
                    "status_code": response.status_code,
                    "error": f"Clés manquantes: {missing_keys}"
                }
            
            print("✅ CORRECTION RÉUSSIE: API retourne des valeurs valides")
            
            return {
                "success": True,
                "status_code": response.status_code,
                "data": data,
                "response_time": response.elapsed.total_seconds()
            }
        else:
            error_text = response.text
            print(f"❌ Erreur API - Status: {response.status_code}")
            print(f"❌ Erreur détail: {error_text}")
            
            return {
                "success": False,
                "status_code": response.status_code,
                "error": error_text
            }
            
    except requests.exceptions.ConnectionError:
        print("❌ ERREUR: Impossible de se connecter au serveur")
        print("❌ Vérifiez que le backend est lancé avec: start_all.bat")
        return {"success": False, "error": "Connexion impossible"}
        
    except requests.exceptions.Timeout:
        print("❌ ERREUR: Timeout de la requête")
        return {"success": False, "error": "Timeout"}
        
    except Exception as e:
        print(f"❌ ERREUR: {str(e)}")
        return {"success": False, "error": str(e)}


def main():
    """Fonction principale"""
    print("🎯 TEST API BALANCES FIX - VÉRIFICATION CORRECTION")
    print("=" * 60)
    
    # Adresses de test
    test_addresses = [
        "0x0000000000000000000000000000000000000000",  # Null address
        "0x1234567890123456789012345678901234567890",  # Adresse de test
    ]
    
    chain_ids = [56, 42161, 8453]  # BSC, Arbitrum, Base
    
    for address in test_addresses:
        for chain_id in chain_ids:
            print(f"\n{'='*80}")
            result = test_api_balances_fix(address, chain_id)
            
            if result["success"]:
                print(f"✅ TEST RÉUSSI pour {address} sur chain {chain_id}")
                print(f"   - bnb: {result['data'].get('bnb', 'N/A')}")
                print(f"   - usdt: {result['data'].get('usdt', 'N/A')}")
                print(f"   - cake: {result['data'].get('cake', 'N/A')}")
                print(f"   - totalValue: {result['data'].get('totalValue', 'N/A')}")
            else:
                print(f"❌ TEST ÉCHOUÉ pour {address} sur chain {chain_id}")
                print(f"   Erreur: {result.get('error', 'Inconnue')}")
    
    print(f"\n{'='*80}")
    print("🎯 RÉSUMÉ DES TESTS")
    print("Pour tester avec votre adresse MetaMask:")
    print("python scripts/test_api_balances_fix.py 0xVOTREADRESSE")
    
    # Test avec adresse fournie en argument
    if len(sys.argv) > 1:
        custom_address = sys.argv[1]
        print(f"\n🎯 TEST AVEC ADRESSE PERSONNALISÉE: {custom_address}")
        result = test_api_balances_fix(custom_address, 56)  # Test BSC
        if result["success"]:
            print(f"✅ Votre adresse fonctionne sur BSC")
            print(f"   Soldes récupérés avec succès")
        else:
            print(f"❌ Problème avec votre adresse: {result.get('error')}")


if __name__ == "__main__":
    main() 