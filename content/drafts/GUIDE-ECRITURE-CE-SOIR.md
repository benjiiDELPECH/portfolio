# Guide Écriture Configuration Drift (ce soir)

## Objectif : 1h max pour un brouillon solide

### Phase 1 : Préparation (10 min)

**Choisis TON incident :**
- [ ] Fouille dans delpech-infra (commits, PRs, messages Slack/Discord)
- [ ] Identifie 1 moment où tu as galéré avec des envs divergents
- [ ] Note le coût (temps perdu, stress, impact business)

**Si tu n'as pas d'incident perso :**
- [ ] Prends un exemple hypothétique mais CRÉDIBLE de ton infra
- [ ] Utilise tes compétences Terraform/K8s pour l'imaginer
- [ ] Reste cohérent avec ton stack (pas d'invention technique)

---

### Phase 2 : Rédaction (40 min)

**Timer 10 min par section** (force-toi à ne pas relire) :

#### ✅ Section 1 : Hook + Problème (10 min)
**Challenge :**
- Commence par le moment de merde : "3h du matin, PagerDuty..."
- 1 chiffre dramatique : "6h de prod perdues" ou "3 devs bloqués pendant 2 jours"
- La phrase qui vend : "Voilà comment on a résolu ça définitivement"

#### ✅ Section 2 : Contexte + Root Cause (10 min)
**Challenge :**
- Décris ton infra en 3 bullets max (K8s + Terraform + ArgoCD ?)
- Avoue l'erreur honnêtement : "On faisait des kubectl apply à la main"
- Montre que t'es lucide sur les causes (process, humain, tooling)

#### ✅ Section 3 : Solution (10 min)
**Challenge :**
- 1 code snippet minimum (config Terraform, pipeline CI, script Bash)
- Explique en 2 phrases ce que fait le code
- Pas besoin d'être exhaustif : l'idée suffit

#### ✅ Section 4 : Résultat + Leçons (10 min)
**Challenge :**
- Avant/Après en chiffres (même approximatifs)
- 3 leçons apprises (pas de bullshit générique)
- CTA naturel : "Si tu galères avec ça, contacte-moi"

---

### Phase 3 : Relecture rapide (10 min)

**Checklist validation** (coche mentalement) :
- [ ] Ça se lit vite (pas de pavés de 10 lignes)
- [ ] Y'a au moins 1 code snippet
- [ ] Le ton est direct ("je", "on", pas "il convient de")
- [ ] Un CTO comprendrait le ROI business
- [ ] Ça démontre ton expertise sans être pompeux

**Si 5/5 cochés** → Move to `/articles` et commit 🚀

---

## Astuces anti-blocage

### "J'ai pas d'incident précis"
→ **Prends un pattern classique** :
- Hotfix manuel qui crée du drift
- Variables d'env non versionnées Git
- Deux personnes qui déploient différemment
- Cluster staging qui diverge après 6 mois sans update

### "Je sais pas quoi mettre en code"
→ **3 options rapides** :
```bash
# Option 1 : Détection simple
terraform plan -no-color | grep "will be"

# Option 2 : Diff K8s
kubectl diff -f manifests/

# Option 3 : Script maison
#!/bin/bash
# Compare prod vs staging
diff <(kubectl get all -n prod) <(kubectl get all -n staging)
```

### "Ça fait trop technique"
→ **Ajoute 1 phrase business après chaque bloc technique** :
- "Ce script nous a économisé 2h/semaine de debug"
- "Maintenant on déploie en confiance, même le vendredi"
- "Plus besoin de réveiller le Lead DevOps à 3h du mat"

---

## Timeline ce soir

| Temps | Action | Validation |
|-------|--------|-----------|
| 19h-19h10 | Choix incident + notes rapides | ✅ J'ai mon histoire |
| 19h10-19h20 | Hook + Problème | ✅ Ça donne envie de lire |
| 19h20-19h30 | Contexte + Root cause | ✅ C'est crédible |
| 19h30-19h40 | Solution + Code | ✅ On voit l'expertise |
| 19h40-19h50 | Résultat + Leçons | ✅ Y'a du ROI |
| 19h50-20h00 | Relecture 5 points | ✅ Prêt à publier |

**Total : 1h max**

---

## Après l'écriture (demain matin)

```bash
# 1. Relis à froid (5 min)
# 2. Corrige les fautes flagrantes
# 3. Valide que ça reste aligné avec ton positionnement

# 4. Si OK → publication
mv content/drafts/configuration-drift.md content/articles/
git add .
git commit -m "publish: Configuration Drift - retour d'expérience DevOps"
git push

# → Article principal de la semaine ✅
```

---

**Tu vas bloquer ?** Ping-moi, je te challenge en live pour débloquer. Mais l'article doit rester TON histoire, pas la mienne. 💪
