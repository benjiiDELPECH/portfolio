---
title: "Pourquoi une SPA ne doit pas gérer son callback Auth sur la landing page"
description: "Retour d'expérience sur un problème de conception classique : mélanger landing marketing, callback OAuth et navigation applicative."
date: 2026-03-24
readingTime: 8
tags: ["Architecture", "Auth0", "OAuth", "SPA", "Vue", "Retour d'expérience", "ADR"]
---

## Le bug qui avait l'air ridicule

Sur le papier, le besoin semblait trivial :

> Un utilisateur clique sur "Accéder à la plateforme", se connecte, puis arrive sur le dashboard.

En pratique, on a perdu des heures sur un comportement absurde :

- l'utilisateur se connecte,
- l'authentification réussit,
- puis il revient sur la landing page au lieu du dashboard.

Le pire, c'est que le bug n'était pas toujours visible de la même façon :

- parfois seulement en prod,
- parfois seulement avec un social login,
- parfois après plusieurs tentatives,
- parfois avec un navigateur "sale" mais pas en navigation privée.

Ça sent le bug front fragile. En réalité, c'était un **problème de conception**.

## Le vrai problème : trop de responsabilités sur `/`

Dans beaucoup de SPA, on laisse le callback OAuth revenir vers la racine du site :

```text
/  = landing page
/  = route d'entrée de l'application
/  = callback OAuth implicite
```

Dit autrement, une seule URL porte trois rôles différents :

1. une page marketing,
2. un point de retour technique après login,
3. un sas de navigation vers l'application.

Tant que tout va bien, ça "a l'air de marcher".

Le jour où quelque chose dérive légèrement, tu te retrouves avec :

- des callbacks absorbés silencieusement,
- des redirections qui retombent sur `/`,
- des races entre SDK d'auth et router SPA,
- des sessions locales corrompues qui rendent le système imprévisible.

## Pourquoi c'est fragile même avec une bonne lib

Le réflexe classique, c'est de blâmer Auth0, Vue Router ou le navigateur.

En réalité, les libs ne sont pas le vrai problème. Le problème, c'est ce qu'on leur demande de faire implicitement.

Une lib SPA d'auth doit jongler avec :

- les paramètres `code` / `state`,
- le stockage temporaire PKCE,
- les retours du provider,
- les états d'erreur,
- la restauration de la target,
- le cycle de vie du framework,
- la navigation du router.

Si en plus le callback arrive sur une page métier ou marketing, on ajoute un couplage évitable.

Autrement dit :

> **Ce n'est pas qu'on utilise une lib fragile. C'est qu'on laisse une zone critique dépendre d'un comportement implicite.**

## Le symptôme trompeur : "on revient juste sur la landing"

Ce symptôme semble bénin.

Mais il dit souvent quelque chose de plus grave :

- la destination post-auth n'est pas owned explicitement,
- le callback n'a pas de route dédiée,
- un fallback par défaut vers `/` existe quelque part,
- la navigation finale dépend du timing SPA.

Le bug visible est "je reviens sur la landing".

Le problème de fond est :

> **personne ne possède vraiment la chaîne callback -> résolution de target -> redirection finale**.

## La règle que j'adopte maintenant

Une SPA ne doit plus gérer son callback auth sur la landing.

À la place :

```text
/               -> landing marketing
/auth/callback  -> route technique dédiée
/app            -> application protégée
```

La route `/auth/callback` ne fait qu'une seule chose :

1. lire `code`, `state`, `error`,
2. appeler `handleRedirectCallback()`,
3. résoudre la destination,
4. faire un `window.location.replace(...)`,
5. afficher une erreur minimale si nécessaire.

Et surtout :

- elle n'affiche pas la landing,
- elle n'affiche pas le dashboard,
- elle n'embarque pas de logique produit,
- elle n'est pas ambiguë.

## Le changement mental important

Avant, je pensais :

> "Le login marche si le SDK finit par me remettre dans l'app."

Maintenant, je pense :

> "Le login marche seulement si l'application possède explicitement le callback et la destination finale."

Ça change tout.

Parce qu'à partir de là, on peut poser de vraies règles :

- callback dédié,
- target stockée à deux endroits,
- hard redirect navigateur sur la fin du flow,
- auto-récupération en cas de state Auth0 corrompu,
- logs explicites,
- E2E auth bloquant en CI.

## Ce que je garderai pour tous mes futurs projets

### 1. Une route technique dédiée dès le début

Ne jamais faire revenir OAuth sur `/`.

### 2. `appState` n'est pas la seule vérité

La target post-login doit aussi être stockée dans `sessionStorage`.

Pourquoi ? Parce que les flux auth échouent rarement de façon propre.

### 3. Navigation critique = browser redirect

Quand il faut terminer un flow auth, `window.location.replace(...)` est souvent plus robuste qu'un `router.push(...)`.

Moins élégant. Plus fiable.

### 4. Le parcours de connexion est un système distribué

Ce n'est pas "du front".

C'est un système multi-couches :

- navigateur,
- provider OAuth,
- SDK,
- router,
- stockage local,
- parfois un provider social intermédiaire.

Le traiter comme un simple bug composant est une erreur.

### 5. Un test E2E auth n'est pas un luxe

Si ton application dépend d'un login pour délivrer sa valeur, le test auth est un test de survie.

Pas un nice-to-have.

## L'ADR que j'aurais aimé écrire plus tôt

La bonne trace n'est pas seulement un patch dans Git.

La bonne trace, c'est une décision d'architecture.

Quelque chose qui dit explicitement :

- pourquoi `/` n'est pas un bon callback,
- pourquoi le callback doit être owned,
- pourquoi il faut une route dédiée,
- pourquoi le flux auth doit être observable et testable.

Parce qu'un incident auth non cadré revient toujours.

Il revient :

- au prochain refactor,
- au prochain changement de provider,
- au prochain changement de domain,
- au prochain "petit fix rapide".

## Conclusion

Le problème n'était pas "on n'arrive pas à faire un redirect correct".

Le problème, c'était qu'on avait accepté un design où le callback OAuth vivait dans une zone ambiguë.

La leçon que je retiens est simple :

> **Quand un flux est critique, il doit être explicite.**

Une landing page doit faire de la landing.  
Un callback OAuth doit faire du callback.  
Et la destination finale doit être décidée sans magie.
