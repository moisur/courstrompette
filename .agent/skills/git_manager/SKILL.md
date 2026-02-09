---
name: git_manager
description: Outils pour automatiser les tâches Git courantes (add, commit, push).
---

# Git Manager Skill

Ce skill fournit des scripts pour simplifier la gestion de version avec Git.

## Scripts

### `push.ps1`
Ajoute tous les fichiers modifiés, crée un commit avec un message donné, et pousse vers le dépôt distant.

**Usage:**
```powershell
./.agent/skills/git_manager/scripts/push.ps1 -Message "refactor: update user profile component"
```

### `sync.ps1`
Récupère les changements distants (pull) et pousse les changements locaux.

**Usage:**
```powershell
./.agent/skills/git_manager/scripts/sync.ps1
```
