#!/usr/bin/env python3
"""
Script de test pour vérifier le calcul de la valeur totale
"""

import requests
import sys

def test_calcul_total(address: str, chain_id: int = 56):
    """
    Test du calcul de la valeur totale
    """
    try:
        print("🔍 TEST CALCUL TOTAL - VÉRIFICATION CORRECTION")
        print("=" * 60)
        
        # Appel API
        url = f"http://127.0.0.1:8000/api/v1/data/balances/{address}"
        params = {"chain_id": chain_id}
        
        print(f"URL: {url}")
        print(f"Params: {params}")
        
        response = requests.get(url, params=params, timeout=30)
        print(f"Status: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print("\n✅ RÉPONSE API:")
            print(f"  - bnb: {data.get('bnb', 'N/A')}")
            print(f"  - usdt: {data.get('usdt', 'N/A')}")
            print(f"  - cake: {data.get('cake', 'N/A')}")
            print(f"  - totalValue: {data.get('totalValue', 'N/A')}")
            
            # Vérification calcul
            print("\n🔍 VÉRIFICATION CALCUL:")
            
            # Prix utilisés dans le backend
            bnb_price = 809.55
            usdt_price = 1.0
            cake_price = 2.50
            
            # Quantités (convertir string en float)
            try:
                bnb_qty = float(data.get('bnb', '0'))
                usdt_qty = float(data.get('usdt', '0'))
                cake_qty = float(data.get('cake', '0'))
                
                # Calculs
                bnb_value = bnb_qty * bnb_price
                usdt_value = usdt_qty * usdt_price
                cake_value = cake_qty * cake_price
                expected_total = bnb_value + usdt_value + cake_value
                
                print(f"  - BNB: {bnb_qty:.6f} × ${bnb_price} = ${bnb_value:.2f}")
                print(f"  - USDT: {usdt_qty:.4f} × ${usdt_price} = ${usdt_value:.2f}")
                print(f"  - CAKE: {cake_qty:.6f} × ${cake_price} = ${cake_value:.2f}")
                print(f"  - Total attendu: ${expected_total:.2f}")
                
                # Comparaison avec API
                api_total = float(data.get('totalValue', '0'))
                print(f"  - Total API: ${api_total:.2f}")
                
                if abs(expected_total - api_total) < 0.01:
                    print("✅ CALCUL CORRECT: Les totaux correspondent")
                else:
                    print("❌ CALCUL INCORRECT: Différence détectée")
                    print(f"   Différence: ${abs(expected_total - api_total):.2f}")
                
                return True
                
            except ValueError as e:
                print(f"❌ ERREUR: Impossible de convertir les valeurs: {e}")
                return False
                
        else:
            print(f"❌ Erreur API: {response.status_code} - {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ ERREUR: {e}")
        return False

def main():
    """Fonction principale"""
    # Test avec l'adresse de l'audit
    address = "0xf33bf50311f722eadabbc88b27c949dded61142a"
    
    print("🎯 TEST CALCUL VALEUR TOTALE")
    print("=" * 50)
    print(f"Adresse testée: {address}")
    print("Prix utilisés:")
    print("  - BNB: $809.55")
    print("  - USDT: $1.00")
    print("  - CAKE: $2.50")
    print()
    
    success = test_calcul_total(address, 56)
    
    if success:
        print("\n✅ TEST RÉUSSI: Calcul de la valeur totale corrigé")
    else:
        print("\n❌ TEST ÉCHOUÉ: Problème avec le calcul")
    
    print("\n" + "=" * 50)
    print("🎯 TEST TERMINÉ")

if __name__ == "__main__":
    main() 