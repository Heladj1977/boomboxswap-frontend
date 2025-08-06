#!/usr/bin/env python3
"""
Script de diagnostic pour le modal wallet blur effect
"""

import re
from pathlib import Path


def check_css_file():
    """Vérifie le fichier CSS pour les styles du modal"""
    css_file = Path("frontend/assets/css/boombox.css")
    
    if not css_file.exists():
        print("❌ Fichier CSS non trouvé:", css_file)
        return False
    
    print("✅ Fichier CSS trouvé:", css_file)
    
    with open(css_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Recherche des styles du modal
    modal_pattern = r'\.wallet-modal\s*\{[^}]*\}'
    modal_matches = re.findall(modal_pattern, content, re.DOTALL)
    
    if not modal_matches:
        print("❌ Styles .wallet-modal non trouvés")
        return False
    
    print(f"✅ {len(modal_matches)} définition(s) .wallet-modal trouvée(s)")
    
    # Vérification backdrop-filter
    backdrop_pattern = r'backdrop-filter:\s*blur\([^)]+\)'
    backdrop_matches = re.findall(backdrop_pattern, content)
    
    print(f"✅ {len(backdrop_matches)} backdrop-filter trouvé(s):")
    for i, match in enumerate(backdrop_matches, 1):
        print(f"   {i}. {match}")
    
    # Vérification spécifique du modal
    modal_content = modal_matches[0]
    if 'backdrop-filter: blur(15px)' in modal_content:
        print("✅ Modal wallet a backdrop-filter: blur(15px)")
    else:
        print("❌ Modal wallet N'A PAS backdrop-filter: blur(15px)")
        print("   Contenu du modal:", modal_content)
    
    return True


def check_html_structure():
    """Vérifie la structure HTML du modal"""
    html_file = Path("frontend/index.html")
    
    if not html_file.exists():
        print("❌ Fichier HTML non trouvé:", html_file)
        return False
    
    print("✅ Fichier HTML trouvé:", html_file)
    
    with open(html_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Recherche du modal
    modal_pattern = r'<div[^>]*id=["\']walletModal["\'][^>]*>'
    modal_matches = re.findall(modal_pattern, content)
    
    if not modal_matches:
        print("❌ Modal wallet non trouvé dans HTML")
        return False
    
    print(f"✅ Modal wallet trouvé dans HTML: {modal_matches[0]}")
    
    # Vérification display:none
    if 'style="display:none;"' in modal_matches[0]:
        print("✅ Modal a display:none par défaut (correct)")
    else:
        print("⚠️ Modal n'a pas display:none par défaut")
    
    return True


def check_javascript():
    """Vérifie le JavaScript pour la gestion du modal"""
    js_file = Path("frontend/js/main.js")
    
    if not js_file.exists():
        print("❌ Fichier JavaScript non trouvé:", js_file)
        return False
    
    print("✅ Fichier JavaScript trouvé:", js_file)
    
    with open(js_file, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Recherche des fonctions modal
    show_pattern = r'showWalletModal\s*\(\s*\)'
    hide_pattern = r'hideWalletModal\s*\(\s*\)'
    
    show_matches = re.findall(show_pattern, content)
    hide_matches = re.findall(hide_pattern, content)
    
    print(f"✅ {len(show_matches)} fonction(s) showWalletModal trouvée(s)")
    print(f"✅ {len(hide_matches)} fonction(s) hideWalletModal trouvée(s)")
    
    # Vérification de l'affichage du modal
    display_pattern = r'style\.display\s*=\s*[\'"]flex[\'"]'
    display_matches = re.findall(display_pattern, content)
    
    if display_matches:
        print(f"✅ {len(display_matches)} référence(s) à display='flex' trouvée(s)")
    else:
        print("❌ Aucune référence à display='flex' trouvée")
    
    return True

def main():
    """Fonction principale de diagnostic"""
    print("🔍 DIAGNOSTIC MODAL WALLET BLUR EFFECT")
    print("=" * 50)
    print()
    
    # Vérification des fichiers
    css_ok = check_css_file()
    html_ok = check_html_structure()
    js_ok = check_javascript()
    
    print()
    print("📊 RÉSUMÉ DU DIAGNOSTIC:")
    print("=" * 30)
    print(f"CSS: {'✅' if css_ok else '❌'}")
    print(f"HTML: {'✅' if html_ok else '❌'}")
    print(f"JavaScript: {'✅' if js_ok else '❌'}")
    
    if css_ok and html_ok and js_ok:
        print()
        print("🎯 HYPOTHÈSES POSSIBLES:")
        print("1. Le modal ne s'affiche pas (problème JavaScript)")
        print("2. L'effet blur est masqué par d'autres éléments")
        print("3. Problème de compatibilité navigateur")
        print("4. CSS non chargé correctement")
        print()
        print("🔧 SOLUTIONS À TESTER:")
        print("1. Ouvrir les outils de développement (F12)")
        print("2. Vérifier si #walletModal existe dans le DOM")
        print("3. Vérifier les styles calculés du modal")
        print("4. Tester sur différents navigateurs")
    else:
        print()
        print("❌ PROBLÈMES IDENTIFIÉS - CORRECTION REQUISE")

if __name__ == "__main__":
    main() 