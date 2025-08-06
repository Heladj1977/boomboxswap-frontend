#!/usr/bin/env python3
"""
Workflow GitHub Automatisé pour BOOMBOXSWAP V1
Surveillance automatique des modifications et commit/push vers GitHub
"""

import os
import time
import subprocess
import logging
from datetime import datetime
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler

# Configuration logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


class GitAutoCommit(FileSystemEventHandler):
    """Gestionnaire d'événements pour surveillance et commit automatique"""
    
    def __init__(self):
        self.last_commit = 0
        self.cooldown = 10  # 10 secondes entre chaque commit
        self.modified_files = set()
        self.project_root = os.path.dirname(os.path.dirname(__file__))
        
        logger.info("SURVEILLANCE GIT BOOMBOXSWAP INITIALISEE")
        logger.info(f"Répertoire projet: {self.project_root}")
        logger.info(f"Cooldown entre commits: {self.cooldown} secondes")

    def on_modified(self, event):
        """Appelé quand un fichier est modifié"""
        if event.is_directory:
            return
        
        # Ignorer les fichiers temporaires et logs
        ignored_extensions = ('.tmp', '.log', '.pyc', '.pyo', '__pycache__')
        if any(event.src_path.endswith(ext) for ext in ignored_extensions):
            return
        
        # Ignorer les fichiers .git
        if '.git' in event.src_path:
            return
            
        # Ne surveiller que les fichiers critiques du projet
        critical_paths = ['backend', 'frontend', 'scripts', 'tests']
        if any(path in event.src_path for path in critical_paths):
            current_time = time.time()
            
            # Ajouter le fichier à la liste des modifications
            self.modified_files.add(event.src_path)
            
            logger.info(f"FICHIER MODIFIE: {os.path.basename(event.src_path)}")
            
            # Vérifier le cooldown avant de commiter
            if current_time - self.last_commit > self.cooldown:
                self.commit_changes()

    def commit_changes(self):
        """Effectue le commit et push des modifications"""
        try:
            logger.info("DEBUT PROCESSUS COMMIT AUTOMATIQUE")
            
            # Vérifier si Git est initialisé
            if not self.is_git_repo():
                logger.error("ERREUR: Pas un repository Git")
                return
            
            # Vérifier si les tests passent
            logger.info("VERIFICATION TESTS RAPIDES...")
            if not self.run_quick_tests():
                logger.error("ECHEC: Tests rapides échoués - pas de commit")
                return
            
            # Ajouter les fichiers modifiés
            for file_path in self.modified_files:
                try:
                    subprocess.run(
                        ['git', 'add', file_path],
                        cwd=self.project_root,
                        check=True,
                        capture_output=True
                    )
                    logger.info(f"AJOUTE: {os.path.basename(file_path)}")
                except subprocess.CalledProcessError as e:
                    logger.error(f"ERREUR ajout {file_path}: {e}")
            
            # Vérifier s'il y a des changements à commiter
            if not self.has_changes_to_commit():
                logger.info("AUCUN CHANGEMENT A COMMITER")
                self.modified_files.clear()
                return
            
            # Créer le message de commit
            commit_msg = self.generate_commit_message()
            
            # Effectuer le commit
            logger.info("EXECUTION COMMIT...")
            result = subprocess.run(
                ['git', 'commit', '-m', commit_msg],
                cwd=self.project_root,
                capture_output=True,
                text=True
            )
            
            if result.returncode == 0:
                logger.info("SUCCES: Commit effectué")
                
                # Pousser vers GitHub
                logger.info("PUSH VERS GITHUB...")
                push_result = subprocess.run(
                    ['git', 'push', 'origin', 'main'],
                    cwd=self.project_root,
                    capture_output=True,
                    text=True
                )
                
                if push_result.returncode == 0:
                    logger.info("SUCCES: Push vers GitHub effectué")
                    self.last_commit = time.time()
                    self.modified_files.clear()
                else:
                    logger.error(f"ECHEC Push: {push_result.stderr}")
            else:
                logger.error(f"ECHEC Commit: {result.stderr}")
                
        except Exception as e:
            logger.error(f"ERREUR CRITIQUE commit_changes: {e}")

    def is_git_repo(self):
        """Vérifie si le répertoire est un repository Git"""
        try:
            result = subprocess.run(
                ['git', 'rev-parse', '--git-dir'],
                cwd=self.project_root,
                capture_output=True
            )
            return result.returncode == 0
        except Exception:
            return False

    def run_quick_tests(self):
        """Exécute les tests rapides"""
        try:
            test_script = os.path.join(self.project_root, 'tests', 'test_quick.py')
            if not os.path.exists(test_script):
                logger.warning("FICHIER TEST RAPIDE NON TROUVE")
                return True  # Continuer même sans tests
            
            result = subprocess.run(
                [sys.executable, test_script],
                cwd=self.project_root,
                capture_output=True,
                text=True,
                timeout=30  # Timeout 30 secondes
            )
            
            if result.returncode == 0:
                logger.info("SUCCES: Tests rapides passés")
                return True
            else:
                logger.error(f"ECHEC Tests: {result.stderr}")
                return False
                
        except subprocess.TimeoutExpired:
            logger.error("ECHEC: Tests rapides timeout")
            return False
        except Exception as e:
            logger.error(f"ERREUR exécution tests: {e}")
            return False

    def has_changes_to_commit(self):
        """Vérifie s'il y a des changements à commiter"""
        try:
            result = subprocess.run(
                ['git', 'diff', '--cached', '--quiet'],
                cwd=self.project_root,
                capture_output=True
            )
            return result.returncode != 0  # 0 = pas de changements
        except Exception:
            return False

    def generate_commit_message(self):
        """Génère un message de commit clair"""
        timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        files_list = [os.path.basename(f) for f in self.modified_files]
        
        if len(files_list) == 1:
            file_desc = files_list[0]
        else:
            file_desc = f"{len(files_list)} fichiers"
        
        return f"AUTO: Mise à jour {file_desc} - {timestamp}"


def main():
    """Fonction principale"""
    print("=== WORKFLOW GITHUB AUTOMATISE BOOMBOXSWAP V1 ===")
    print("Surveillance des modifications de code...")
    print("Commit automatique après validation des tests")
    print("Push vers GitHub si tests OK")
    print("================================================")
    
    # Vérifier que watchdog est installé
    try:
        import watchdog.observers
        import watchdog.events
    except ImportError:
        print("ERREUR: Module 'watchdog' non installé")
        print("Installation: pip install watchdog")
        return
    
    # Créer le gestionnaire d'événements
    event_handler = GitAutoCommit()
    observer = Observer()
    
    # Configurer la surveillance récursive du projet
    project_root = os.path.dirname(os.path.dirname(__file__))
    observer.schedule(event_handler, path=project_root, recursive=True)
    
    # Démarrer la surveillance
    observer.start()
    print("SURVEILLANCE GIT ACTIVEE - En attente de modifications...")
    print("Appuyez sur Ctrl+C pour arrêter")
    
    try:
        while True:
            time.sleep(1)
    except KeyboardInterrupt:
        print("\nARRET SURVEILLANCE GIT...")
        observer.stop()
    
    observer.join()
    print("SURVEILLANCE GIT ARRETEE")


if __name__ == "__main__":
    import sys
    main() 