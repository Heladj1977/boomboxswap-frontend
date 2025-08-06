#!/usr/bin/env python3
"""
DIAGNOSTIC LOGOS MODAL WALLET
Vérification des chemins d'images et structure HTML
"""

from pathlib import Path


def check_image_paths():
    """Vérifier que les images des logos existent"""
    print("🎯 DIAGNOSTIC: Vérification chemins images logos")
    
    # Chemins relatifs depuis frontend/
    image_paths = [
        "assets/images/icons/metamask.svg",
        "assets/images/icons/walletconnect.svg"
    ]
    
    frontend_dir = Path("frontend")
    
    for img_path in image_paths:
        full_path = frontend_dir / img_path
        exists = full_path.exists()
        size = full_path.stat().st_size if exists else 0
        
        print(f"  📁 {img_path}:")
        print(f"    - Existe: {'✅' if exists else '❌'}")
        print(f"    - Taille: {size} bytes")
        print(f"    - Chemin complet: {full_path.absolute()}")
        
        if exists:
            # Vérifier le contenu SVG
            try:
                with open(full_path, 'r', encoding='utf-8') as f:
                    content = f.read()
                    if '<svg' in content:
                        print("    - Format: ✅ SVG valide")
                    else:
                        print("    - Format: ❌ Pas un SVG valide")
            except Exception as e:
                print(f"    - Erreur lecture: {e}")
        print()


def check_html_structure():
    """Vérifier la structure HTML de la modal"""
    print("🎯 DIAGNOSTIC: Vérification structure HTML modal")
    
    html_file = Path("frontend/index.html")
    if not html_file.exists():
        print("❌ Fichier index.html non trouvé")
        return
    
    try:
        with open(html_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Chercher la modal wallet
        if 'walletModal' in content:
            print("✅ Élément walletModal trouvé dans HTML")
            
            # Chercher les boutons de connexion
            if 'connect-metamask' in content:
                print("✅ Bouton connect-metamask trouvé")
            else:
                print("❌ Bouton connect-metamask manquant")
                
            if 'connect-walletconnect' in content:
                print("✅ Bouton connect-walletconnect trouvé")
            else:
                print("❌ Bouton connect-walletconnect manquant")
            
            # Chercher les images
            if 'metamask.svg' in content:
                print("✅ Référence metamask.svg trouvée")
            else:
                print("❌ Référence metamask.svg manquante")
                
            if 'walletconnect.svg' in content:
                print("✅ Référence walletconnect.svg trouvée")
            else:
                print("❌ Référence walletconnect.svg manquante")
                
        else:
            print("❌ Élément walletModal non trouvé dans HTML")
            
    except Exception as e:
        print(f"❌ Erreur lecture HTML: {e}")


def check_css_styles():
    """Vérifier les styles CSS pour les logos"""
    print("🎯 DIAGNOSTIC: Vérification styles CSS logos")
    
    css_file = Path("frontend/assets/css/boombox.css")
    if not css_file.exists():
        print("❌ Fichier CSS non trouvé")
        return
    
    try:
        with open(css_file, 'r', encoding='utf-8') as f:
            content = f.read()
        
        # Chercher les styles pour les logos
        if '.wallet-logo' in content:
            print("✅ Style .wallet-logo trouvé")
        else:
            print("❌ Style .wallet-logo manquant")
            
        if '.wallet-option' in content:
            print("✅ Style .wallet-option trouvé")
        else:
            print("❌ Style .wallet-option manquant")
            
        if '.wallet-label' in content:
            print("✅ Style .wallet-label trouvé")
        else:
            print("❌ Style .wallet-label manquant")
            
    except Exception as e:
        print(f"❌ Erreur lecture CSS: {e}")


def main():
    """Diagnostic complet"""
    print("=" * 60)
    print("DIAGNOSTIC LOGOS MODAL WALLET")
    print("=" * 60)
    print()
    
    # Vérifier qu'on est dans le bon répertoire
    if not Path("frontend").exists():
        print("❌ Répertoire frontend/ non trouvé")
        print("   Exécutez ce script depuis la racine du projet")
        return
    
    check_image_paths()
    check_html_structure()
    check_css_styles()
    
    print("=" * 60)
    print("DIAGNOSTIC TERMINÉ")
    print("=" * 60)
    print()
    print("PROCHAINES ÉTAPES:")
    print("1. Lancer audit_auto_connexion_logos.bat")
    print("2. Ouvrir Console DevTools (F12)")
    print("3. Recharger la page et observer les logs")
    print("4. Cliquer sur le bouton wallet pour tester la modal")


if __name__ == "__main__":
    main() 