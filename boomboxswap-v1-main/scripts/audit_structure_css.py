#!/usr/bin/env python3
"""
AUDIT STRUCTURE CSS - ANALYSE ARCHITECTURALE
Vérification cohérence et organisation CSS
"""

import os
import re
from collections import defaultdict

def analyze_css_file():
    """Analyse du fichier CSS externe"""
    css_path = "frontend/assets/css/boombox.css"
    
    print("=" * 70)
    print("🔍 AUDIT STRUCTURE CSS - ANALYSE ARCHITECTURALE")
    print("=" * 70)
    
    if not os.path.exists(css_path):
        print("❌ FICHIER CSS INTROUVABLE!")
        return None
    
    with open(css_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Statistiques générales
    lines = content.splitlines()
    total_lines = len(lines)
    
    # Règles CSS
    css_rules = re.findall(r'([.#][^{]+)\s*\{[^}]*\}', content, re.DOTALL)
    
    # Sélecteurs par type
    selectors = defaultdict(int)
    for rule in css_rules:
        selector = rule.strip()
        if selector.startswith('.'):
            selectors['classes'] += 1
        elif selector.startswith('#'):
            selectors['ids'] += 1
        elif selector.startswith('@'):
            selectors['at-rules'] += 1
        else:
            selectors['elements'] += 1
    
    print(f"📄 FICHIER CSS EXTERNE (boombox.css):")
    print(f"   Lignes totales: {total_lines}")
    print(f"   Règles CSS: {len(css_rules)}")
    print(f"   Classes: {selectors['classes']}")
    print(f"   IDs: {selectors['ids']}")
    print(f"   At-rules: {selectors['at-rules']}")
    print(f"   Elements: {selectors['elements']}")
    
    return {
        'lines': total_lines,
        'rules': len(css_rules),
        'selectors': selectors,
        'content': content
    }

def analyze_html_css():
    """Analyse du CSS inline dans HTML"""
    html_path = "frontend/index.html"
    
    if not os.path.exists(html_path):
        print("❌ FICHIER HTML INTROUVABLE!")
        return None
    
    with open(html_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Blocs CSS inline
    style_blocks = re.findall(r'<style[^>]*>(.*?)</style>', content, re.DOTALL)
    
    total_inline_css = ""
    for block in style_blocks:
        total_inline_css += block + "\n"
    
    # Règles CSS inline
    inline_rules = re.findall(r'([.#][^{]+)\s*\{[^}]*\}', total_inline_css, re.DOTALL)
    
    # Sélecteurs inline par type
    inline_selectors = defaultdict(int)
    for rule in inline_rules:
        selector = rule.strip()
        if selector.startswith('.'):
            inline_selectors['classes'] += 1
        elif selector.startswith('#'):
            inline_selectors['ids'] += 1
        elif selector.startswith('@'):
            inline_selectors['at-rules'] += 1
        else:
            inline_selectors['elements'] += 1
    
    print(f"\n📄 CSS INLINE (index.html):")
    print(f"   Blocs style: {len(style_blocks)}")
    print(f"   Règles CSS: {len(inline_rules)}")
    print(f"   Classes: {inline_selectors['classes']}")
    print(f"   IDs: {inline_selectors['ids']}")
    print(f"   At-rules: {inline_selectors['at-rules']}")
    print(f"   Elements: {inline_selectors['elements']}")
    
    return {
        'blocks': len(style_blocks),
        'rules': len(inline_rules),
        'selectors': inline_selectors,
        'content': total_inline_css
    }

def find_duplicates(css_data, html_data):
    """Recherche des doublons entre CSS externe et inline"""
    print(f"\n🔍 ANALYSE DOUBLONS ET CONFLITS:")
    
    if not css_data or not html_data:
        return
    
    # Extraire tous les sélecteurs
    css_selectors = set()
    html_selectors = set()
    
    # Sélecteurs CSS externe
    css_rules = re.findall(r'([.#][^{]+)\s*\{[^}]*\}', css_data['content'], re.DOTALL)
    for rule in css_rules:
        selector = rule.strip().split('{')[0].strip()
        css_selectors.add(selector)
    
    # Sélecteurs HTML inline
    html_rules = re.findall(r'([.#][^{]+)\s*\{[^}]*\}', html_data['content'], re.DOTALL)
    for rule in html_rules:
        selector = rule.strip().split('{')[0].strip()
        html_selectors.add(selector)
    
    # Doublons
    duplicates = css_selectors.intersection(html_selectors)
    
    print(f"   Sélecteurs CSS externe: {len(css_selectors)}")
    print(f"   Sélecteurs HTML inline: {len(html_selectors)}")
    print(f"   Doublons identifiés: {len(duplicates)}")
    
    if duplicates:
        print(f"   ⚠️ DOUBLONS TROUVÉS:")
        for dup in sorted(duplicates):
            print(f"      - {dup}")
    else:
        print(f"   ✅ AUCUN DOUBLON")

def analyze_css_organization(css_data, html_data):
    """Analyse de l'organisation CSS"""
    print(f"\n🏗️ ANALYSE ORGANISATION CSS:")
    
    if not css_data or not html_data:
        return
    
    # Types de styles dans chaque fichier
    css_content = css_data['content']
    html_content = html_data['content']
    
    # Catégories de styles
    categories = {
        'layout': ['position', 'display', 'flex', 'grid', 'width', 'height'],
        'spacing': ['margin', 'padding', 'gap'],
        'colors': ['background', 'color', 'border-color'],
        'typography': ['font', 'text', 'line-height'],
        'effects': ['box-shadow', 'backdrop-filter', 'filter', 'transform'],
        'animations': ['transition', 'animation', '@keyframes']
    }
    
    print(f"   📊 RÉPARTITION PAR CATÉGORIE:")
    
    for category, properties in categories.items():
        css_count = sum(1 for prop in properties if prop in css_content)
        html_count = sum(1 for prop in properties if prop in html_content)
        
        print(f"      {category.capitalize():12} - CSS: {css_count:2d} | HTML: {html_count:2d}")

def evaluate_structure_quality(css_data, html_data):
    """Évaluation de la qualité de la structure"""
    print(f"\n📋 ÉVALUATION QUALITÉ STRUCTURE:")
    
    score = 0
    max_score = 100
    issues = []
    
    # Critères d'évaluation
    
    # 1. Répartition équilibrée (30 points)
    if css_data and html_data:
        css_ratio = css_data['rules'] / (css_data['rules'] + html_data['rules'])
        if 0.7 <= css_ratio <= 0.9:  # 70-90% en externe
            score += 30
            print(f"   ✅ Répartition équilibrée: {css_ratio:.1%} externe")
        elif 0.5 <= css_ratio < 0.7:
            score += 20
            print(f"   ⚠️ Répartition acceptable: {css_ratio:.1%} externe")
        else:
            score += 10
            print(f"   ❌ Répartition déséquilibrée: {css_ratio:.1%} externe")
            issues.append("Trop de CSS inline")
    
    # 2. Absence de doublons (25 points)
    if css_data and html_data:
        css_selectors = set(re.findall(r'([.#][^{]+)\s*\{[^}]*\}', css_data['content'], re.DOTALL))
        html_selectors = set(re.findall(r'([.#][^{]+)\s*\{[^}]*\}', html_data['content'], re.DOTALL))
        duplicates = len(css_selectors.intersection(html_selectors))
        
        if duplicates == 0:
            score += 25
            print(f"   ✅ Aucun doublon")
        elif duplicates <= 3:
            score += 15
            print(f"   ⚠️ {duplicates} doublons mineurs")
        else:
            print(f"   ❌ {duplicates} doublons critiques")
            issues.append(f"{duplicates} doublons CSS")
    
    # 3. Organisation logique (25 points)
    if css_data and html_data:
        # Vérifier si CSS externe contient plus de styles complexes
        css_complexity = len(re.findall(r'backdrop-filter|transform|animation|@keyframes', css_data['content']))
        html_complexity = len(re.findall(r'backdrop-filter|transform|animation|@keyframes', html_data['content']))
        
        if css_complexity > html_complexity:
            score += 25
            print(f"   ✅ Styles complexes en externe")
        elif css_complexity == html_complexity:
            score += 15
            print(f"   ⚠️ Répartition mixte des styles complexes")
        else:
            print(f"   ❌ Styles complexes en inline")
            issues.append("Styles complexes en inline")
    
    # 4. Cohérence des conventions (20 points)
    if css_data:
        # Vérifier la cohérence des noms de classes
        class_names = re.findall(r'\.([a-zA-Z-]+)', css_data['content'])
        naming_patterns = {
            'kebab-case': sum(1 for name in class_names if '-' in name),
            'camelCase': sum(1 for name in class_names if any(c.isupper() for c in name) and '-' not in name),
            'snake_case': sum(1 for name in class_names if '_' in name)
        }
        
        dominant_pattern = max(naming_patterns, key=naming_patterns.get)
        if naming_patterns[dominant_pattern] > sum(naming_patterns.values()) * 0.8:
            score += 20
            print(f"   ✅ Conventions cohérentes ({dominant_pattern})")
        else:
            score += 10
            print(f"   ⚠️ Conventions mixtes")
            issues.append("Conventions de nommage mixtes")
    
    # Résultat final
    print(f"\n🎯 SCORE FINAL: {score}/{max_score}")
    
    if score >= 80:
        print(f"   ✅ STRUCTURE COHÉRENTE")
        recommendation = "Garder en l'état"
    elif score >= 60:
        print(f"   ⚠️ STRUCTURE MIXTE")
        recommendation = "Nettoyer partiellement"
    else:
        print(f"   ❌ STRUCTURE BORDÉLIQUE")
        recommendation = "Refactoring complet"
    
    if issues:
        print(f"\n🚨 PROBLÈMES IDENTIFIÉS:")
        for issue in issues:
            print(f"   - {issue}")
    
    print(f"\n💡 RECOMMANDATION: {recommendation}")
    
    return score, recommendation, issues

def main():
    """Fonction principale d'audit"""
    print("🔍 DÉBUT AUDIT STRUCTURE CSS...")
    
    # Analyser CSS externe
    css_data = analyze_css_file()
    
    # Analyser CSS inline
    html_data = analyze_html_css()
    
    # Rechercher doublons
    find_duplicates(css_data, html_data)
    
    # Analyser organisation
    analyze_css_organization(css_data, html_data)
    
    # Évaluer qualité
    score, recommendation, issues = evaluate_structure_quality(css_data, html_data)
    
    print(f"\n" + "=" * 70)
    print("✅ AUDIT STRUCTURE CSS TERMINÉ")
    print("=" * 70)

if __name__ == "__main__":
    main() 