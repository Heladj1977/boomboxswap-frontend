#!/usr/bin/env python3
"""
REFACTORING CSS PHASE 1 - AUDIT & EXTRACTION
Analyse complète des CSS inline pour extraction vers externe
"""

import os
import re
from collections import defaultdict

def extract_inline_css():
    """Extraction et analyse des CSS inline"""
    html_path = "frontend/index.html"
    
    print("=" * 70)
    print("🔧 REFACTORING CSS PHASE 1 - AUDIT & EXTRACTION")
    print("=" * 70)
    
    if not os.path.exists(html_path):
        print("❌ FICHIER HTML INTROUVABLE!")
        return None
    
    with open(html_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Extraire tous les blocs CSS inline
    style_blocks = re.findall(r'<style[^>]*>(.*?)</style>', content, re.DOTALL)
    
    print(f"📄 BLOCS CSS INLINE TROUVÉS: {len(style_blocks)}")
    
    all_inline_css = ""
    for i, block in enumerate(style_blocks, 1):
        all_inline_css += f"/* BLOC {i} */\n{block}\n\n"
    
    # Analyser les règles CSS inline
    css_rules = re.findall(r'([.#][^{]+)\s*\{([^}]*)\}', all_inline_css, re.DOTALL)
    
    print(f"📊 RÈGLES CSS INLINE: {len(css_rules)}")
    
    # Catégoriser les règles par composant
    categories = {
        'variables': [],
        'layout': [],
        'header': [],
        'cards': [],
        'wallet': [],
        'buttons': [],
        'animations': [],
        'responsive': [],
        'utilities': []
    }
    
    for selector, properties in css_rules:
        selector = selector.strip()
        properties = properties.strip()
        
        # Catégorisation automatique
        if selector.startswith(':root') or '--' in properties:
            categories['variables'].append((selector, properties))
        elif 'header' in selector or 'navigation' in selector:
            categories['header'].append((selector, properties))
        elif 'card' in selector or 'smart-card' in selector:
            categories['cards'].append((selector, properties))
        elif 'wallet' in selector or 'modal' in selector:
            categories['wallet'].append((selector, properties))
        elif 'btn' in selector or 'button' in selector:
            categories['buttons'].append((selector, properties))
        elif 'animation' in properties or '@keyframes' in properties:
            categories['animations'].append((selector, properties))
        elif '@media' in selector:
            categories['responsive'].append((selector, properties))
        elif 'position' in properties or 'display' in properties or 'flex' in properties:
            categories['layout'].append((selector, properties))
        else:
            categories['utilities'].append((selector, properties))
    
    # Afficher la répartition
    print(f"\n📋 RÉPARTITION PAR CATÉGORIE:")
    for category, rules in categories.items():
        print(f"   {category.capitalize():12}: {len(rules):3d} règles")
    
    return {
        'all_css': all_inline_css,
        'rules': css_rules,
        'categories': categories
    }

def find_duplicates_with_external():
    """Identifier les doublons avec le CSS externe"""
    print(f"\n🔍 ANALYSE DOUBLONS AVEC CSS EXTERNE:")
    
    # Lire CSS externe
    css_path = "frontend/assets/css/boombox.css"
    if not os.path.exists(css_path):
        print("❌ FICHIER CSS EXTERNE INTROUVABLE!")
        return {}
    
    with open(css_path, 'r', encoding='utf-8') as f:
        external_css = f.read()
    
    # Extraire sélecteurs externes
    external_rules = re.findall(r'([.#][^{]+)\s*\{[^}]*\}', external_css, re.DOTALL)
    external_selectors = {rule.strip().split('{')[0].strip() for rule in external_rules}
    
    # Extraire sélecteurs inline
    html_path = "frontend/index.html"
    with open(html_path, 'r', encoding='utf-8') as f:
        html_content = f.read()
    
    style_blocks = re.findall(r'<style[^>]*>(.*?)</style>', html_content, re.DOTALL)
    inline_css = "".join(style_blocks)
    inline_rules = re.findall(r'([.#][^{]+)\s*\{[^}]*\}', inline_css, re.DOTALL)
    inline_selectors = {rule.strip().split('{')[0].strip() for rule in inline_rules}
    
    # Trouver doublons
    duplicates = external_selectors.intersection(inline_selectors)
    
    print(f"   Sélecteurs externes: {len(external_selectors)}")
    print(f"   Sélecteurs inline: {len(inline_selectors)}")
    print(f"   Doublons identifiés: {len(duplicates)}")
    
    # Analyser chaque doublon
    duplicate_analysis = {}
    for dup in sorted(duplicates):
        # Trouver les propriétés dans chaque version
        external_match = re.search(rf'{re.escape(dup)}\s*{{([^}}]*)}}', external_css, re.DOTALL)
        inline_match = re.search(rf'{re.escape(dup)}\s*{{([^}}]*)}}', inline_css, re.DOTALL)
        
        external_props = external_match.group(1).strip() if external_match else ""
        inline_props = inline_match.group(1).strip() if inline_match else ""
        
        duplicate_analysis[dup] = {
            'external': external_props,
            'inline': inline_props,
            'identical': external_props == inline_props,
            'external_longer': len(external_props) > len(inline_props),
            'inline_longer': len(inline_props) > len(external_props)
        }
    
    return duplicate_analysis

def generate_extraction_plan(inline_data, duplicates):
    """Générer le plan d'extraction"""
    print(f"\n📋 PLAN D'EXTRACTION VERS CSS EXTERNE:")
    
    extraction_plan = {
        'move_to_external': [],
        'keep_inline': [],
        'merge_duplicates': [],
        'remove_duplicates': []
    }
    
    # Analyser chaque règle inline
    for selector, properties in inline_data['rules']:
        selector_clean = selector.strip()
        
        if selector_clean in duplicates:
            dup_info = duplicates[selector_clean]
            
            if dup_info['identical']:
                # Doublon identique - supprimer inline
                extraction_plan['remove_duplicates'].append(selector_clean)
            elif dup_info['external_longer']:
                # Version externe plus complète - supprimer inline
                extraction_plan['remove_duplicates'].append(selector_clean)
            elif dup_info['inline_longer']:
                # Version inline plus complète - fusionner
                extraction_plan['merge_duplicates'].append(selector_clean)
            else:
                # Versions différentes - analyser manuellement
                extraction_plan['keep_inline'].append(selector_clean)
        else:
            # Sélecteur unique - déplacer vers externe
            extraction_plan['move_to_external'].append(selector_clean)
    
    # Afficher le plan
    print(f"   📤 À DÉPLACER VERS EXTERNE: {len(extraction_plan['move_to_external'])}")
    print(f"   🔄 À FUSIONNER: {len(extraction_plan['merge_duplicates'])}")
    print(f"   🗑️ À SUPPRIMER (doublons): {len(extraction_plan['remove_duplicates'])}")
    print(f"   📌 À GARDER EN INLINE: {len(extraction_plan['keep_inline'])}")
    
    return extraction_plan

def save_extraction_report(inline_data, duplicates, plan):
    """Sauvegarder le rapport d'extraction"""
    report_path = "scripts/rapport_extraction_css_phase1.md"
    
    with open(report_path, 'w', encoding='utf-8') as f:
        f.write("# RAPPORT EXTRACTION CSS PHASE 1\n\n")
        f.write("## 📊 STATISTIQUES GÉNÉRALES\n\n")
        f.write(f"- **Règles CSS inline totales**: {len(inline_data['rules'])}\n")
        f.write(f"- **Doublons identifiés**: {len(duplicates)}\n")
        f.write(f"- **Sélecteurs uniques**: {len(plan['move_to_external'])}\n\n")
        
        f.write("## 📋 PLAN D'EXTRACTION\n\n")
        f.write("### 📤 À DÉPLACER VERS EXTERNE\n")
        for selector in plan['move_to_external']:
            f.write(f"- `{selector}`\n")
        f.write("\n")
        
        f.write("### 🔄 À FUSIONNER\n")
        for selector in plan['merge_duplicates']:
            f.write(f"- `{selector}`\n")
        f.write("\n")
        
        f.write("### 🗑️ À SUPPRIMER (DOUBLONS)\n")
        for selector in plan['remove_duplicates']:
            f.write(f"- `{selector}`\n")
        f.write("\n")
        
        f.write("### 📌 À GARDER EN INLINE\n")
        for selector in plan['keep_inline']:
            f.write(f"- `{selector}`\n")
        f.write("\n")
        
        f.write("## 🎯 OBJECTIFS PHASE 2\n\n")
        f.write("1. **Déplacer** tous les sélecteurs uniques vers `boombox.css`\n")
        f.write("2. **Fusionner** les doublons avec version la plus complète\n")
        f.write("3. **Supprimer** les doublons redondants\n")
        f.write("4. **Valider** que toutes les fonctionnalités sont préservées\n")
    
    print(f"📄 RAPPORT SAUVEGARDÉ: {report_path}")

def main():
    """Fonction principale Phase 1"""
    print("🚀 DÉBUT REFACTORING CSS PHASE 1...")
    
    # Extraction CSS inline
    inline_data = extract_inline_css()
    if not inline_data:
        return
    
    # Analyse doublons
    duplicates = find_duplicates_with_external()
    
    # Générer plan d'extraction
    plan = generate_extraction_plan(inline_data, duplicates)
    
    # Sauvegarder rapport
    save_extraction_report(inline_data, duplicates, plan)
    
    print(f"\n" + "=" * 70)
    print("✅ PHASE 1 TERMINÉE - PRÊT POUR PHASE 2")
    print("=" * 70)
    print("📄 Rapport détaillé: scripts/rapport_extraction_css_phase1.md")

if __name__ == "__main__":
    main() 