# GUIDE D'INSTALLATION CONDA - BOOMBOXSWAP

## ÉTAPE 1 : INSTALLATION MINICONDA

### Option A : Installation automatique (recommandée)
1. Téléchargez Miniconda pour Windows :
   - **64-bit** : https://repo.anaconda.com/miniconda/Miniconda3-latest-Windows-x86_64.exe
   - **32-bit** : https://repo.anaconda.com/miniconda/Miniconda3-latest-Windows-x86.exe

2. Exécutez le fichier .exe téléchargé
3. Suivez l'assistant d'installation
4. **IMPORTANT** : Cochez "Add Miniconda3 to PATH"

### Option B : Installation manuelle
1. Ouvrez PowerShell en tant qu'administrateur
2. Exécutez :
```powershell
winget install Anaconda.Miniconda3
```

## ÉTAPE 2 : VÉRIFICATION INSTALLATION

1. Fermez et rouvrez votre terminal
2. Vérifiez l'installation :
```cmd
conda --version
```

3. Si conda n'est pas reconnu, ajoutez manuellement au PATH :
   - Ouvrez "Variables d'environnement système"
   - Ajoutez à PATH : `C:\Users\[VotreNom]\miniconda3\Scripts`

## ÉTAPE 3 : CRÉATION ENVIRONNEMENT BOOMBOXSWAP

Une fois Conda installé, exécutez :

```cmd
# Créer l'environnement
conda env create -f environment.yml

# Activer l'environnement
conda activate boomboxswap

# Vérifier l'installation
python --version
pip list
```

## ÉTAPE 4 : LANCEMENT DÉVELOPPEMENT

```cmd
# Activer l'environnement
conda activate boomboxswap

# Lancer le serveur
python -m uvicorn main:app --reload
```

## DÉPANNAGE

### Erreur "conda n'est pas reconnu"
- Redémarrez le terminal
- Vérifiez que Conda est dans le PATH
- Utilisez le chemin complet : `C:\Users\[VotreNom]\miniconda3\Scripts\conda.exe`

### Erreur lors de la création d'environnement
- Vérifiez votre connexion internet
- Essayez : `conda clean --all` puis relancez

### Problèmes de permissions
- Exécutez le terminal en tant qu'administrateur
- Vérifiez les antivirus qui pourraient bloquer l'installation

## SUPPORT

Si vous rencontrez des problèmes :
1. Vérifiez que vous avez les droits administrateur
2. Désactivez temporairement l'antivirus
3. Utilisez un terminal propre (pas d'environnement virtuel actif)
