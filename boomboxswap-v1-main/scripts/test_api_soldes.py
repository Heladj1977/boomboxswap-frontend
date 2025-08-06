#!/usr/bin/env python3
"""
Script de test de l'API des soldes BOOMBOXSWAP
Test direct de l'endpoint /api/v1/data/balances/{address}
"""

import requests
import sys
from typing import Dict, Any


def test_api_soldes(address: str, chain_id: int = 56) -> Dict[str, Any]:
    """
    Test direct de l'API des soldes
    
    Args:
        address: Adresse Ethereum à tester
        chain_id: ID de la chain (56=BSC, 42161=Arbitrum, 8453=Base)
    
    Returns:
        Dict avec le résultat du test
    """
    
    base_url = "http://127.0.0.1:8000"
    endpoint = f"/api/v1/data/balances/{address}"
    params = {"chain_id": chain_id}
    
    print("🎯 TEST API SOLDES: === TEST DIRECT API ===")
    print(f"🎯 TEST API SOLDES: URL: {base_url}{endpoint}")
    print(f"🎯 TEST API SOLDES: Params: {params}")
    print(f"🎯 TEST API SOLDES: Address: {address}")
    print(f"🎯 TEST API SOLDES: Chain ID: {chain_id}")
    
    try:
        # Test 1: Vérifier que le serveur répond
        print("\n🎯 TEST API SOLDES: 1. Test connectivité serveur...")
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
        print("\n🎯 TEST API SOLDES: 2. Appel API des soldes...")
        response = requests.get(
            f"{base_url}{endpoint}",
            params=params,
            timeout=30
        )
        
        print(f"🎯 TEST API SOLDES: Status réponse: {response.status_code}")
        print(f"🎯 TEST API SOLDES: Headers réponse: {dict(response.headers)}")
        
        if response.status_code == 200:
            data = response.json()
            print("✅ Réponse API reçue:")
            print(f"   - BNB: {data.get('BNB', 'N/A')}")
            print(f"   - USDT: {data.get('USDT', 'N/A')}")
            print(f"   - CAKE: {data.get('CAKE', 'N/A')}")
            print(f"   - Total Value: {data.get('totalValue', 'N/A')}")
            
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
    print("🎯 AUDIT FORENSIQUE SOLDES - TEST API DIRECT")
    print("=" * 50)
    
    # Adresses de test
    test_addresses = [
        "0x0000000000000000000000000000000000000000",  # Null address
        "0x1234567890123456789012345678901234567890",  # Adresse de test
    ]
    
    chain_ids = [56, 42161, 8453]  # BSC, Arbitrum, Base
    
    for address in test_addresses:
        for chain_id in chain_ids:
            print(f"\n{'='*60}")
            result = test_api_soldes(address, chain_id)
            
            if result["success"]:
                print(f"✅ TEST RÉUSSI pour {address} sur chain {chain_id}")
            else:
                print(f"❌ TEST ÉCHOUÉ pour {address} sur chain {chain_id}")
                print(f"   Erreur: {result.get('error', 'Inconnue')}")
    
    print(f"\n{'='*60}")
    print("🎯 RÉSUMÉ DES TESTS")
    print("Pour tester avec votre adresse MetaMask:")
    print("python scripts/test_api_soldes.py 0xVOTREADRESSE")
    
    # Test avec adresse fournie en argument
    if len(sys.argv) > 1:
        custom_address = sys.argv[1]
        print(f"\n🎯 TEST AVEC ADRESSE PERSONNALISÉE: {custom_address}")
        result = test_api_soldes(custom_address, 56)  # Test BSC
        if result["success"]:
            print(f"✅ Votre adresse fonctionne sur BSC")
        else:
            print(f"❌ Problème avec votre adresse: {result.get('error')}")

if __name__ == "__main__":
    main() 