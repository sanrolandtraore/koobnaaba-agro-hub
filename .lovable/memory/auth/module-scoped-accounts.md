---
name: Comptes séparés par module
description: Chaque module (Agriculteur, Éleveur, Coop, Expert, Partenaire) a son propre compte, identifié par un préfixe de rôle
type: feature
---
- Le sélecteur de module est visible en mode connexion, inscription et réinitialisation.
- Identifiant interne téléphone : `${role}.${phone}@koobnaaba.local`.
- Identifiant interne email : plus-addressing `local+koobnaaba_${role}@domain`.
- Rôles autorisés : `agriculteur`, `eleveur`, `cooperative`, `partenaire`, `agent_technique` (label UI « Expert agronome »).
- `handle_new_user` accepte `agent_technique` ; `reset-password` accepte un paramètre `role` pour cibler le bon compte quand plusieurs profils partagent le même numéro.
