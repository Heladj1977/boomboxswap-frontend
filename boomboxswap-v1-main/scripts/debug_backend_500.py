#!/usr/bin/env python3
"""
Script de debug pour identifier l'erreur 500 du backend
"""

import requests
import sys
import traceback

def test_backend_health():
    """Test de base du backend"""
    try:
        print("🔍 TEST 1: Vérification santé backend...")
        response = requests.get("http://127.0.0.1:8000/health", timeout=5)
        print(f"✅ Status: {response.status_code}")
        print(f"✅ Réponse: {response.json()}")
        return True
    except requests.exceptions.ConnectionError:
        print("❌ ERREUR: Backend non accessible")
        print("❌ Vérifiez que start_all.bat est lancé")
        return False
    except Exception as e:
        print(f"❌ ERREUR: {e}")
        return False

def test_balances_api():
    """Test de l'API des soldes"""
    try:
        print("\n🔍 TEST 2: Test API balances...")
        address = "0xf33bf50311f722eadabbc88b27c949dded61142a"
        url = f"http://127.0.0.1:8000/api/v1/data/balances/{address}"
        params = {"chain_id": 56}
        
        print(f"URL: {url}")
        print(f"Params: {params}")
        
        response = requests.get(url, params=params, timeout=30)
        print(f"Status: {response.status_code}")
        print(f"Headers: {dict(response.headers)}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Réponse: {data}")
            return True
        else:
            print(f"❌ Erreur {response.status_code}: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ ERREUR: {e}")
        traceback.print_exc()
        return False

def test_null_address():
    """Test avec adresse null"""
    try:
        print("\n🔍 TEST 3: Test adresse null...")
        address = "0x0000000000000000000000000000000000000000"
        url = f"http://127.0.0.1:8000/api/v1/data/balances/{address}"
        params = {"chain_id": 56}
        
        response = requests.get(url, params=params, timeout=30)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"✅ Réponse: {data}")
            return True
        else:
            print(f"❌ Erreur {response.status_code}: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ ERREUR: {e}")
        return False

def main():
    """Fonction principale"""
    print("🔧 DEBUG BACKEND 500 - DIAGNOSTIC COMPLET")
    print("=" * 50)
    
    # Test 1: Santé backend
    if not test_backend_health():
        print("\n❌ BACKEND NON ACCESSIBLE")
        print("Lancez start_all.bat pour démarrer le backend")
        return
    
    # Test 2: API balances
    if not test_balances_api():
        print("\n❌ ERREUR 500 DÉTECTÉE")
        print("Vérifiez les logs du backend pour l'erreur exacte")
    
    # Test 3: Adresse null
    test_null_address()
    
    print("\n" + "=" * 50)
    print("🔧 DIAGNOSTIC TERMINÉ")

if __name__ == "__main__":
    main() 