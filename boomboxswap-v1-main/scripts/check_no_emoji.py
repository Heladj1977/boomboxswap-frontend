#!/usr/bin/env python3
"""
Script de vérification anti-emoji pour BOOMBOXSWAP
Vérifie qu'aucun emoji n'est présent dans les fichiers Python
"""

import os
import re
import sys


def detect_emojis(text):
    """Détecte les emojis dans le texte"""
    # Pattern pour détecter les emojis Unicode
    emoji_pattern = re.compile(
        "["
        "\U0001F600-\U0001F64F"  # Emoticons
        "\U0001F300-\U0001F5FF"  # Symboles et pictogrammes
        "\U0001F680-\U0001F6FF"  # Transport et symboles
        "\U0001F1E0-\U0001F1FF"  # Drapeaux
        "\U00002702-\U000027B0"  # Symboles décoratifs
        "\U000024C2-\U0001F251"  # Symboles encadrés
        "]+", flags=re.UNICODE
    )
    return emoji_pattern.findall(text)


def check_file(file_path):
    """Vérifie un fichier pour la présence d'emojis"""
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            content = f.read()

        emojis = detect_emojis(content)
        if emojis:
            print(f"ERREUR: Emojis detectes dans {file_path}:")
            for emoji in set(emojis):
                print(f"  - {emoji}")
            return False
        return True
    except Exception as e:
        print(f"ATTENTION: Impossible de lire {file_path}: {e}")
        return True


def main():
    """Fonction principale"""
    print("VERIFICATION ANTI-EMOJI BOOMBOXSWAP")
    print("=" * 40)

    # Dossiers à vérifier
    directories = ['backend', 'frontend', 'scripts', 'tests']
    python_files = []

    # Collecter tous les fichiers Python
    for directory in directories:
        if os.path.exists(directory):
            for root, dirs, files in os.walk(directory):
                for file in files:
                    if file.endswith('.py'):
                        python_files.append(os.path.join(root, file))

    # Vérifier les fichiers Python à la racine
    for file in os.listdir('.'):
        if file.endswith('.py'):
            python_files.append(file)

    if not python_files:
        print("AUCUN fichier Python trouve")
        return

    print(f"Verification de {len(python_files)} fichiers Python...")
    print()

    errors_found = False
    for file_path in python_files:
        if not check_file(file_path):
            errors_found = True

    print()
    if errors_found:
        print("ECHEC: Emojis detectes dans certains fichiers")
        print("Veuillez les remplacer par du texte professionnel")
        sys.exit(1)
    else:
        print("SUCCES: Aucun emoji detecte")
        print("Conformite anti-emoji respectee")


if __name__ == "__main__":
    main()
