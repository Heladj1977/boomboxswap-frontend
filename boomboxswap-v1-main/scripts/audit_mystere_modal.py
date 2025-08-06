#!/usr/bin/env python3
"""
AUDIT MYSTÈRE MODAL - DIAGNOSTIC NIVEAU 2
Vérification approfondie du CSS et des conflits
"""

import os
import re
from datetime import datetime

def audit_css_file():
    """Audit complet du fichier CSS"""
    css_path = "frontend/assets/css/boombox.css"
    
    print("=" * 60)
    print("🔍 AUDIT MYSTÈRE MODAL - NIVEAU 2")
    print("=" * 60)
    
    # Vérification fichier
    if not os.path.exists(css_path):
        print("❌ FICHIER CSS INTROUVABLE!")
        return
    
    # Horodatage
    mtime = os.path.getmtime(css_path)
    mtime_str = datetime.fromtimestamp(mtime).strftime('%Y-%m-%d %H:%M:%S')
    print(f"📅 Horodatage CSS: {mtime_str}")
    
    # Taille fichier
    size = os.path.getsize(css_path)
    print(f"📏 Taille CSS: {size} octets")
    
    # Lecture contenu
    with open(css_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    print(f"📄 Lignes CSS: {len(content.splitlines())}")
    
    # Recherche backdrop-filter
    backdrop_filters = re.findall(r'backdrop-filter:\s*blur\([^)]+\)', content)
    print(f"\n🎯 BACKDROP-FILTER TROUVÉS: {len(backdrop_filters)}")
    
    for i, filter_rule in enumerate(backdrop_filters, 1):
        print(f"  {i}. {filter_rule}")
    
    # Vérification spécifique modal
    print(f"\n🔍 VÉRIFICATION MODAL WALLET:")
    
    # .wallet-modal
    wallet_modal_matches = re.findall(r'\.wallet-modal\s*\{[^}]*\}', content, re.DOTALL)
    print(f"  .wallet-modal règles: {len(wallet_modal_matches)}")
    
    # .wallet-modal-content
    wallet_content_matches = re.findall(r'\.wallet-modal-content\s*\{[^}]*\}', content, re.DOTALL)
    print(f"  .wallet-modal-content règles: {len(wallet_content_matches)}")
    
    # .wallet-option
    wallet_option_matches = re.findall(r'\.wallet-option\s*\{[^}]*\}', content, re.DOTALL)
    print(f"  .wallet-option règles: {len(wallet_option_matches)}")
    
    # .close-btn
    close_btn_matches = re.findall(r'\.close-btn\s*\{[^}]*\}', content, re.DOTALL)
    print(f"  .close-btn règles: {len(close_btn_matches)}")
    
    # Vérification body.modal-open
    body_modal_matches = re.findall(r'body\.modal-open\s*\{[^}]*\}', content, re.DOTALL)
    print(f"  body.modal-open règles: {len(body_modal_matches)}")
    
    # Détail des règles modal
    print(f"\n📋 DÉTAIL RÈGLES MODAL:")
    
    for match in wallet_modal_matches:
        print(f"  .wallet-modal: {match[:100]}...")
    
    for match in wallet_content_matches:
        print(f"  .wallet-modal-content: {match[:100]}...")
    
    for match in wallet_option_matches:
        print(f"  .wallet-option: {match[:100]}...")
    
    for match in close_btn_matches:
        print(f"  .close-btn: {match[:100]}...")
    
    for match in body_modal_matches:
        print(f"  body.modal-open: {match[:100]}...")

def audit_html_conflicts():
    """Audit des conflits dans le HTML"""
    html_path = "frontend/index.html"
    
    print(f"\n" + "=" * 60)
    print("🔍 AUDIT CONFLITS HTML")
    print("=" * 60)
    
    if not os.path.exists(html_path):
        print("❌ FICHIER HTML INTROUVABLE!")
        return
    
    with open(html_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # CSS inline
    inline_css = re.findall(r'<style[^>]*>(.*?)</style>', content, re.DOTALL)
    print(f"📄 Blocs CSS inline: {len(inline_css)}")
    
    # backdrop-filter inline
    inline_backdrop = re.findall(r'backdrop-filter:\s*blur\([^)]+\)', content)
    print(f"🎯 backdrop-filter inline: {len(inline_backdrop)}")
    
    for i, filter_rule in enumerate(inline_backdrop, 1):
        print(f"  {i}. {filter_rule}")
    
    # wallet-modal dans HTML
    wallet_modal_html = re.findall(r'id="walletModal"[^>]*', content)
    print(f"🔍 walletModal dans HTML: {len(wallet_modal_html)}")
    
    for match in wallet_modal_html:
        print(f"  {match}")

def audit_js_styles():
    """Audit des styles appliqués en JavaScript"""
    js_path = "frontend/js/main.js"
    
    print(f"\n" + "=" * 60)
    print("🔍 AUDIT STYLES JAVASCRIPT")
    print("=" * 60)
    
    if not os.path.exists(js_path):
        print("❌ FICHIER JS INTROUVABLE!")
        return
    
    with open(js_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Styles appliqués en JS
    style_applications = re.findall(r'\.style\.[^=]+=', content)
    print(f"🎨 Styles appliqués en JS: {len(style_applications)}")
    
    for style in style_applications:
        print(f"  {style}")
    
    # backdrop-filter en JS
    js_backdrop = re.findall(r'backdrop-filter', content)
    print(f"🎯 backdrop-filter en JS: {len(js_backdrop)}")

def generate_test_instructions():
    """Instructions de test pour l'utilisateur"""
    print(f"\n" + "=" * 60)
    print("🧪 INSTRUCTIONS DE TEST UTILISATEUR")
    print("=" * 60)
    
    print("""
1. Ouvrir DevTools (F12)
2. Aller dans l'onglet Elements
3. Chercher l'élément #walletModal
4. Vérifier dans l'onglet Styles:
   - Quelles règles CSS s'appliquent ?
   - Y a-t-il backdrop-filter sur .wallet-modal-content ?
   - Y a-t-il backdrop-filter sur .wallet-option ?
   - Y a-t-il backdrop-filter sur .close-btn ?
   - body.modal-open a-t-il filter: blur(4px) ?

5. Dans l'onglet Sources:
   - Vérifier quel boombox.css est chargé
   - Horodatage du fichier dans DevTools

6. Hard refresh (Ctrl+F5) et retester

7. Redémarrer backend et retester
""")

if __name__ == "__main__":
    audit_css_file()
    audit_html_conflicts()
    audit_js_styles()
    generate_test_instructions()
    
    print(f"\n" + "=" * 60)
    print("✅ AUDIT MYSTÈRE MODAL TERMINÉ")
    print("=" * 60) 