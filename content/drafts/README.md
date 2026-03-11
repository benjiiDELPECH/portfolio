# Drafts - Articles à relire

Ce dossier contient les articles **non publiés** en attente de relecture et validation.

## Workflow de publication

### 1. Écriture (ici dans `/drafts`)
- Rédiger l'article sans pression
- Format markdown avec frontmatter
- Pas besoin d'être parfait

### 2. Relecture (à faire avant publication)
- ✅ Vérifier la cohérence technique
- ✅ Aligner avec le positionnement pro (pas de hors-sujet)
- ✅ Corriger fautes/style
- ✅ Valider les exemples de code
- ✅ Vérifier les tags SEO

### 3. Publication
```bash
# Déplacer l'article validé
mv content/drafts/mon-article.md content/articles/

# Commit et push
git add .
git commit -m "publish: article titre"
git push
```

## Articles en attente

### `dns-guide-dev.md`
**Statut** : À relire  
**Raison** : Bon sujet mais non relu, à valider avant publication

### `nervous-system-recovery-protocol.md`
**Statut** : Hors sujet  
**Raison** : Santé/bien-être ≠ positionnement technique consultant
**Action** : À supprimer ou déplacer vers blog personnel séparé

---

## Stratégie de contenu (objectif : 1 article/jour)

### Semaine 1 - DevOps/Infra (ton expertise principale)
1. **Configuration Drift** : incident K8s + solution IaC ✅ PRIORITÉ
2. **Terraform modules** : refacto monorepo → modules réutilisables
3. **GitOps avec ArgoCD** : déploiement continu sans kubectl apply
4. **Monitoring Prometheus** : alerting intelligent (pas de spam)
5. **Secrets management** : Vault vs SOPS vs sealed-secrets

### Semaine 2 - Architecture/Design
6. **Microservices migration** : monolithe → services (retour d'XP)
7. **Event-driven architecture** : quand l'async est la solution
8. **API versioning** : stratégie breaking changes sans casser les clients
9. **Database migrations** : zero-downtime avec Liquibase/Flyway
10. **Circuit breaker pattern** : resilience en prod

### Semaine 3 - CI/CD/Performance
11. **CI/CD optimization** : 30min → 3min (caching, parallélisation)
12. **Container optimization** : images Docker 500MB → 50MB
13. **Load testing** : k6 + Grafana pour préparer la Black Friday
14. **Debugging prod** : outils pour investiguer sans accès SSH
15. **Observability triad** : logs + metrics + traces (OpenTelemetry)

### Semaine 4 - Stratégie/Leadership Tech
16. **Tech debt management** : prioriser sans bloquer la feature velocity
17. **Post-mortem sans blame** : culture d'amélioration continue
18. **Documentation as Code** : ADR + C4 diagrams dans le repo
19. **Onboarding dev** : 1 jour pour être autonome (checklist)
20. **Code review efficace** : feedback constructif + nitpicks

### Format rapide (1h/article max)
```markdown
1. Hook (incident/problème/question)           → 2-3 phrases
2. Contexte (pourquoi c'est important)         → 1 paragraphe
3. Solution (code/config/process)              → 200-300 mots
4. Résultat (ROI/metrics/apprentissage)        → 1 paragraphe
5. CTA subtil (contact/newsletter/repo GitHub) → 1 ligne
```

**Longueur idéale** : 800-1200 mots (5-7 min de lecture)  
**Ton** : Pragmatique, war stories, pas de bullshit  
**Objectif** : Démontrer expertise + attirer leads qualifiés
