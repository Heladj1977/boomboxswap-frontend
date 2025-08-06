#!/usr/bin/env python3
"""
REFACTORING CSS PHASE 2 - CONSOLIDATION
Déplacement des styles uniques vers CSS externe
"""

import os
import re
import shutil
from datetime import datetime

def backup_original_files():
    """Sauvegarder les fichiers originaux"""
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    
    # Backup CSS externe
    css_path = "frontend/assets/css/boombox.css"
    css_backup = f"frontend/assets/css/boombox_backup_{timestamp}.css"
    if os.path.exists(css_path):
        shutil.copy2(css_path, css_backup)
        print(f"✅ Backup CSS: {css_backup}")
    
    # Backup HTML
    html_path = "frontend/index.html"
    html_backup = f"frontend/index_backup_{timestamp}.html"
    if os.path.exists(html_path):
        shutil.copy2(html_path, html_backup)
        print(f"✅ Backup HTML: {html_backup}")
    
    return css_backup, html_backup

def extract_unique_styles_from_html():
    """Extraire les styles uniques du HTML"""
    html_path = "frontend/index.html"
    
    print("=" * 70)
    print("🔧 REFACTORING CSS PHASE 2 - CONSOLIDATION")
    print("=" * 70)
    
    with open(html_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Extraire tous les blocs CSS inline
    style_blocks = re.findall(r'<style[^>]*>(.*?)</style>', content, re.DOTALL)
    
    all_inline_css = ""
    for block in style_blocks:
        all_inline_css += block + "\n"
    
    # Lire CSS externe pour identifier les doublons
    css_path = "frontend/assets/css/boombox.css"
    with open(css_path, 'r', encoding='utf-8') as f:
        external_css = f.read()
    
    # Extraire sélecteurs externes
    external_rules = re.findall(r'([.#][^{]+)\s*\{[^}]*\}', external_css, re.DOTALL)
    external_selectors = {rule.strip().split('{')[0].strip() for rule in external_rules}
    
    # Extraire règles inline
    inline_rules = re.findall(r'([.#][^{]+)\s*\{([^}]*)\}', all_inline_css, re.DOTALL)
    
    # Filtrer les styles uniques (non présents en externe)
    unique_styles = []
    for selector, properties in inline_rules:
        selector_clean = selector.strip()
        if selector_clean not in external_selectors:
            unique_styles.append((selector_clean, properties.strip()))
    
    print(f"📊 STYLES UNIQUES À DÉPLACER: {len(unique_styles)}")
    
    return unique_styles, all_inline_css

def organize_styles_by_category(unique_styles):
    """Organiser les styles par catégorie"""
    categories = {
        'variables': [],
        'layout': [],
        'header': [],
        'cards': [],
        'buttons': [],
        'animations': [],
        'utilities': []
    }
    
    for selector, properties in unique_styles:
        # Catégorisation
        if selector.startswith(':root') or '--' in properties:
            categories['variables'].append((selector, properties))
        elif 'header' in selector or 'navigation' in selector:
            categories['header'].append((selector, properties))
        elif 'card' in selector or 'smart-card' in selector:
            categories['cards'].append((selector, properties))
        elif 'btn' in selector or 'button' in selector:
            categories['buttons'].append((selector, properties))
        elif 'animation' in properties or '@keyframes' in properties:
            categories['animations'].append((selector, properties))
        elif 'position' in properties or 'display' in properties or 'flex' in properties:
            categories['layout'].append((selector, properties))
        else:
            categories['utilities'].append((selector, properties))
    
    return categories

def create_consolidated_css(categories):
    """Créer le CSS consolidé"""
    consolidated = []
    
    # Structure organisée
    consolidated.append("/* ===== BOOMBOXSWAP V1 - CSS CONSOLIDÉ =====")
    consolidated.append("/* Généré automatiquement - Refactoring Phase 2 */")
    consolidated.append("/* Date: " + datetime.now().strftime("%Y-%m-%d %H:%M:%S") + " */")
    consolidated.append("")
    
    # 1. Variables CSS
    if categories['variables']:
        consolidated.append("/* ===== 1. VARIABLES CSS =====")
        for selector, properties in categories['variables']:
            consolidated.append(f"{selector} {{")
            consolidated.append(f"    {properties}")
            consolidated.append("}")
            consolidated.append("")
    
    # 2. Layout global
    if categories['layout']:
        consolidated.append("/* ===== 2. LAYOUT GLOBAL =====")
        for selector, properties in categories['layout']:
            consolidated.append(f"{selector} {{")
            consolidated.append(f"    {properties}")
            consolidated.append("}")
            consolidated.append("")
    
    # 3. Header et navigation
    if categories['header']:
        consolidated.append("/* ===== 3. HEADER & NAVIGATION =====")
        for selector, properties in categories['header']:
            consolidated.append(f"{selector} {{")
            consolidated.append(f"    {properties}")
            consolidated.append("}")
            consolidated.append("")
    
    # 4. Cards et composants
    if categories['cards']:
        consolidated.append("/* ===== 4. CARDS & COMPOSANTS =====")
        for selector, properties in categories['cards']:
            consolidated.append(f"{selector} {{")
            consolidated.append(f"    {properties}")
            consolidated.append("}")
            consolidated.append("")
    
    # 5. Boutons et interactions
    if categories['buttons']:
        consolidated.append("/* ===== 5. BOUTONS & INTERACTIONS =====")
        for selector, properties in categories['buttons']:
            consolidated.append(f"{selector} {{")
            consolidated.append(f"    {properties}")
            consolidated.append("}")
            consolidated.append("")
    
    # 6. Animations
    if categories['animations']:
        consolidated.append("/* ===== 6. ANIMATIONS =====")
        for selector, properties in categories['animations']:
            consolidated.append(f"{selector} {{")
            consolidated.append(f"    {properties}")
            consolidated.append("}")
            consolidated.append("")
    
    # 7. Utilitaires
    if categories['utilities']:
        consolidated.append("/* ===== 7. UTILITAIRES =====")
        for selector, properties in categories['utilities']:
            consolidated.append(f"{selector} {{")
            consolidated.append(f"    {properties}")
            consolidated.append("}")
            consolidated.append("")
    
    return "\n".join(consolidated)

def merge_with_existing_css(consolidated_css):
    """Fusionner avec le CSS existant"""
    css_path = "frontend/assets/css/boombox.css"
    
    with open(css_path, 'r', encoding='utf-8') as f:
        existing_css = f.read()
    
    # Ajouter le CSS consolidé au début
    merged_css = consolidated_css + "\n\n" + existing_css
    
    # Sauvegarder
    with open(css_path, 'w', encoding='utf-8') as f:
        f.write(merged_css)
    
    print(f"✅ CSS CONSOLIDÉ FUSIONNÉ: {css_path}")

def remove_duplicates_from_html():
    """Supprimer les doublons du HTML"""
    html_path = "frontend/index.html"
    
    with open(html_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Lire CSS externe pour identifier les doublons
    css_path = "frontend/assets/css/boombox.css"
    with open(css_path, 'r', encoding='utf-8') as f:
        external_css = f.read()
    
    # Extraire sélecteurs externes
    external_rules = re.findall(r'([.#][^{]+)\s*\{[^}]*\}', external_css, re.DOTALL)
    external_selectors = {rule.strip().split('{')[0].strip() for rule in external_rules}
    
    # Traiter chaque bloc style
    style_blocks = re.findall(r'<style[^>]*>(.*?)</style>', content, re.DOTALL)
    
    cleaned_blocks = []
    for block in style_blocks:
        # Extraire règles du bloc
        rules = re.findall(r'([.#][^{]+)\s*\{([^}]*)\}', block, re.DOTALL)
        
        # Garder seulement les règles non présentes en externe
        kept_rules = []
        for selector, properties in rules:
            selector_clean = selector.strip()
            if selector_clean not in external_selectors:
                kept_rules.append(f"{selector_clean} {{\n    {properties.strip()}\n}}")
        
        if kept_rules:
            cleaned_block = "\n".join(kept_rules)
            cleaned_blocks.append(cleaned_block)
    
    # Remplacer les blocs style
    if cleaned_blocks:
        new_styles = "\n".join([f"<style>\n{block}\n</style>" for block in cleaned_blocks])
        content = re.sub(r'<style[^>]*>.*?</style>', new_styles, content, flags=re.DOTALL)
    else:
        # Supprimer tous les blocs style si vide
        content = re.sub(r'<style[^>]*>.*?</style>', '', content, flags=re.DOTALL)
    
    # Sauvegarder
    with open(html_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"✅ HTML NETTOYÉ: {html_path}")

def main():
    """Fonction principale Phase 2"""
    print("🚀 DÉBUT REFACTORING CSS PHASE 2...")
    
    # Backup des fichiers originaux
    css_backup, html_backup = backup_original_files()
    
    # Extraire styles uniques
    unique_styles, all_inline_css = extract_unique_styles_from_html()
    
    if not unique_styles:
        print("✅ AUCUN STYLE UNIQUE À DÉPLACER")
        return
    
    # Organiser par catégorie
    categories = organize_styles_by_category(unique_styles)
    
    # Afficher répartition
    print(f"\n📋 RÉPARTITION PAR CATÉGORIE:")
    for category, styles in categories.items():
        print(f"   {category.capitalize():12}: {len(styles):3d} règles")
    
    # Créer CSS consolidé
    consolidated_css = create_consolidated_css(categories)
    
    # Fusionner avec CSS existant
    merge_with_existing_css(consolidated_css)
    
    # Nettoyer HTML
    remove_duplicates_from_html()
    
    print(f"\n" + "=" * 70)
    print("✅ PHASE 2 TERMINÉE - CONSOLIDATION RÉUSSIE")
    print("=" * 70)
    print(f"📄 Backups: {css_backup}, {html_backup}")

if __name__ == "__main__":
    main() 