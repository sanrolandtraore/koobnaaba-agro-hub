---
name: Comptes séparés par module
description: Chaque module (Expert Agronome, Éleveur, Coop, Partenaire) a son propre compte, identifié par un préfixe de rôle
type: feature
---
- Le sélecteur de module est visible en mode connexion, inscription et réinitialisation.
- Identifiant interne téléphone : `${role}.${phone}@koobnaaba.local`.
- Identifiant interne email : plus-addressing `local+koobnaaba_${role}@domain`.
- Rôles proposés à l'inscription : `agriculteur` (label « Expert Agronome »), `eleveur`, `cooperative`, `partenaire`.
- Le module Expert agronome a été **fusionné** dans le module Agriculture : les outils experts (diagnostic IA, calculatrice, ordonnances, fiches techniques, scouting, cartographie GPS, clients) figurent dans la navigation agriculteur. Le rôle `agent_technique` n'est plus proposé à l'inscription mais reste accepté pour les comptes historiques (même navigation et mêmes pages que `agriculteur`).
- `handle_new_user` accepte `agent_technique` ; `reset-password` accepte un paramètre `role`.
