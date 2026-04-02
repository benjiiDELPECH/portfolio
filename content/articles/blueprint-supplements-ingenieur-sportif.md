# Blueprint Suppléments — Ingénieur / Sportif

> *"Le meilleur supplément est celui qui corrige ton déficit réel — tous les autres sont du bruit."*

Ce document applique la **Loi de Liebig** à la biologie humaine pour construire un protocole de supplémentation rationnel, destiné aux profils à haute charge cognitive et activité physique régulière.

---

## Table des matières

1. [Loi de Liebig — cadre analytique](#1-loi-de-liebig--cadre-analytique)
2. [Les 5 axes biologiques](#2-les-5-axes-biologiques)
3. [Le moteur énergétique — cycle de Krebs & chaîne respiratoire](#3-le-moteur-énergétique--cycle-de-krebs--chaîne-respiratoire)
4. [Ce qui dysfonctionne dans le monde moderne](#4-ce-qui-dysfonctionne-dans-le-monde-moderne)
5. [Profil "ingénieur / sportif" — diagnostic terrain](#5-profil-ingénieur--sportif--diagnostic-terrain)
6. [Taxonomie des suppléments par axe métabolique](#6-taxonomie-des-suppléments-par-axe-métabolique)
7. [Stack décisionnel bayésien](#7-stack-décisionnel-bayésien)
8. [Anti-patterns](#8-anti-patterns)
9. [Protocole niveau 2 — dosages & timing](#9-protocole-niveau-2--dosages--timing)
10. [Sources](#10-sources)

---

## 1. Loi de Liebig — cadre analytique

La **Loi du minimum de Liebig** (1840) énonce qu'un système biologique est limité par la ressource la plus déficiente, pas par la moyenne de toutes les ressources.

Transposée au corps humain :

> Ta performance (physique, cognitive, hormonale) est plafonnée par **un seul facteur limitant** — même si tous les autres sont optimaux.

### Raisonnement bayésien appliqué

Avant toute supplémentation :

| Variable | Question |
|---|---|
| **P(déficit \| monde moderne)** | Quelle est la probabilité de carence pour cette molécule dans un mode de vie contemporain ? |
| **P(déficit \| profil perso)** | Ajustement selon ton sport, stress, alimentation |
| **Impact** | Si ce facteur est limitant, quel est l'effet sur la performance globale ? |
| **ROI** | = Impact × Probabilité |

👉 On ne cible que les axes à **fort ROI** : haute probabilité de déficit × fort impact systémique.

---

## 2. Les 5 axes biologiques

Le corps peut être modélisé comme **5 systèmes couplés**. Si un seul s'effondre, tout le système est bridé.

| # | Axe | Fonction | Dépend de | Quand ça casse |
|---|-----|----------|-----------|----------------|
| A | **Énergie cellulaire** | Production d'ATP (mitochondries) | O₂, cofacteurs (B1, B2, B3), CoQ10, fer | Fatigue malgré discipline, cerveau lent, sensation "vide" |
| B | **Système nerveux** | Régulation sympathique / parasympathique, gestion cortisol | Magnésium, B6, oméga-3 | Agitation interne, sommeil dégradé, difficulté à "couper" |
| C | **Hormonal** | Thyroïde (métabolisme), testostérone, cortisol | Vitamine D, zinc, iode, sélénium | Énergie instable, motivation fluctuante, récupération lente |
| D | **Inflammation / immunité** | Inflammation de bas grade | Oméga-3, antioxydants, alimentation | Brouillard mental, récupération moyenne, fatigue chronique |
| E | **Structure** | Muscles, tendons, tissus, réparation | Protéines, vitamine C, collagène | Douleurs, stagnation physique, blessures |

### Interactions clés

```
Stress chronique ──→ ↑ Cortisol ──→ ↓ Testostérone
                                  ──→ ↓ Sommeil
                                  ──→ ↑ Inflammation
                                  ──→ ↓ Énergie mitochondriale

Déficit magnésium ──→ ↑ Excitabilité nerveuse ──→ ↑ Stress perçu
                                                ──→ ↓ Sommeil

Déficit vitamine D ──→ ↓ Immunité
                    ──→ ↓ Testostérone
                    ──→ ↑ Inflammation
```

---

## 3. Le moteur énergétique — cycle de Krebs & chaîne respiratoire

### 3.1 Vue d'ensemble

Le flux énergétique complet :

```
Nutriments (glucose, lipides, protéines)
    │
    ▼
Glycolyse → Pyruvate
    │
    ▼
Pyruvate → Acétyl-CoA          ← nécessite : B1 (thiamine)
    │
    ▼
┌─────────────────────────────────────────┐
│          CYCLE DE KREBS                 │
│                                         │
│  Acétyl-CoA + Oxaloacétate → Citrate    │
│       │                                 │
│       ▼                                 │
│  Citrate → α-cétoglutarate             │
│       │     (─ CO₂, + NADH)            │
│       ▼                                 │
│  α-cétoglutarate → Succinyl-CoA        │
│       │     (─ CO₂, + NADH)            │
│       ▼                                 │
│  Succinyl-CoA → Succinate (+ GTP)      │
│       │                                 │
│       ▼                                 │
│  Succinate → Fumarate (+ FADH₂)        │
│       │                                 │
│       ▼                                 │
│  Fumarate → Malate → Oxaloacétate      │
│                        (+ NADH)         │
│       ↻ (cycle recommence)              │
└─────────────────────────────────────────┘
    │
    ▼  NADH, FADH₂ (= "batteries chargées")
    │
┌─────────────────────────────────────────┐
│     CHAÎNE DE TRANSPORT DES ÉLECTRONS   │
│                                         │
│  NADH → Complexe I → II → III → IV     │
│                                         │
│  Chaque transfert : pompage de H⁺       │
│  → gradient électrochimique             │
│                                         │
│  ATP Synthase : H⁺ reviennent → ATP     │
│                                         │
│  Accepteur final : O₂ + e⁻ + H⁺ → H₂O │
└─────────────────────────────────────────┘
```

### 3.2 Bilan par tour de cycle

| Produit | Quantité (par Acétyl-CoA) | Rôle |
|---------|--------------------------|------|
| NADH | 3 | Transporteur d'électrons → chaîne respiratoire |
| FADH₂ | 1 | Transporteur d'électrons → chaîne respiratoire |
| GTP (≈ ATP) | 1 | Énergie directe |
| CO₂ | 2 | Déchet (expiré) |

### 3.3 Rappel redox

| Terme | Définition | Mnémotechnique |
|-------|-----------|----------------|
| **Oxydation** | Perte d'électrons | « je perds des e⁻ » |
| **Réduction** | Gain d'électrons | « je gagne des e⁻ » |
| NAD⁺ → NADH | Réduction du NAD⁺ | Le citrate est **oxydé**, le NAD⁺ est **réduit** |

### 3.4 Cofacteurs critiques du cycle

| Cofacteur | Étape | Conséquence si déficit |
|-----------|-------|----------------------|
| **Vitamine B1** (thiamine) | Pyruvate → Acétyl-CoA, α-cétoglutarate → Succinyl-CoA | Ralentissement global du cycle [[1]](#ref1) |
| **Vitamine B2** (riboflavine) | FAD-dépendant (succinate déshydrogénase) | Moins de FADH₂ produit [[2]](#ref2) |
| **Vitamine B3** (niacine) | Précurseur du NAD⁺ | Effondrement de la capacité de transport d'électrons [[3]](#ref3) |
| **Magnésium** | Cofacteur de multiples enzymes du cycle | Rendement global diminué [[4]](#ref4) |
| **Fer** | Complexes I, II, III de la chaîne respiratoire | Transport O₂ + chaîne bloquée [[5]](#ref5) |
| **CoQ10** | Navette d'électrons (Complexe I→III) | Goulot dans la chaîne [[6]](#ref6) |

### 3.5 Pourquoi tout s'effondre sans O₂

```
Pas d'O₂
  → électrons bloqués dans la chaîne
  → NADH ne peut plus se "vider"
  → NAD⁺ non régénéré
  → Krebs s'arrête
  → Production ATP chute (~18× moins)
  → Passage en glycolyse anaérobie (lactate)
```

---

## 4. Ce qui dysfonctionne dans le monde moderne

Le corps humain est calibré pour un environnement qui n'existe plus. Voici les **désalignements systémiques** :

| Désalignement | Mécanisme | Axes impactés |
|--------------|-----------|---------------|
| **Lumière artificielle** | Peu de lumière naturelle (travail indoor), écrans le soir → suppression mélatonine | Hormonal, Sommeil [[7]](#ref7) |
| **Stress cognitif constant** | Notifications, décisions permanentes → cortisol chronique | Système nerveux, Hormonal [[8]](#ref8) |
| **Alimentation "calorique mais pauvre"** | Calories OK, micronutriments insuffisants (sols appauvris, ultra-transformé) | Énergie, Hormonal [[9]](#ref9) |
| **Sédentarité déguisée** | Cerveau actif ≠ corps actif → métabolisme ralenti | Inflammation, Énergie [[10]](#ref10) |
| **Excès de contrôle** | Optimisation permanente → charge mentale → suractivation | Système nerveux [[11]](#ref11) |
| **Ratio oméga-6/oméga-3** | Alimentation moderne : ratio ~15:1 (optimal : 2-4:1) | Inflammation [[12]](#ref12) |
| **Latitude + indoor** | Synthèse vitamine D quasi nulle en Europe d'octobre à mars | Hormonal, Immunité [[13]](#ref13) |

---

## 5. Profil "ingénieur / sportif" — diagnostic terrain

### 5.1 Pattern dominant

Ce profil n'est pas "en mauvaise santé". Il est **déséquilibré fonctionnellement** :

> Cerveau sur-optimisé, physiologie sous-régulée.

### 5.2 Axes de défaillance (classés par probabilité)

| Rang | Axe | Probabilité | Symptômes typiques |
|------|-----|-------------|-------------------|
| **#1** | Système nerveux (surcharge) | Très élevée | Fatigue + tension simultanées, difficulté à couper le soir, sommeil moyen malgré discipline |
| **#2** | Sommeil (qualité, pas durée) | Élevée | Sommeil fragmenté, réveil non réparateur, difficulté d'endormissement |
| **#3** | Énergie mitochondriale | Modérée à élevée | Fatigue "propre" inexpliquée, cerveau lent par moments, plateau physique |
| **#4** | Inflammation basse | Modérée | Brouillard mental léger, récupération moyenne, sensation "pas optimal" |

### 5.3 Auto-diagnostic rapide

| Test | Protocole | Si positif → |
|------|-----------|-------------|
| **Coupure soir** | 1 soir sans écran ni stimulation | Agitation, incapacité à rester "vide" → système nerveux saturé |
| **Sevrage café** | 2-3 jours sans caféine | Crash, irritabilité → système déjà sous tension |
| **Post-sport** | Observer la récupération | Fatigue nerveuse > musculaire → surcharge sympathique |
| **Réveil** | Te réveilles-tu frais ou "déjà entamé" ? | Entamé → sommeil non réparateur |

### 5.4 Les 4 profils types

| Profil | Signature | Facteur limitant |
|--------|-----------|-----------------|
| **Surchauffe nerveuse** | Fatigue + tension, cerveau actif le soir, discipline élevée | Système nerveux |
| **Sous-énergie mitochondriale** | Fatigue "propre", motivation OK mais énergie basse | Énergie cellulaire |
| **Inflammation basse** | Lourdeur, brouillard mental, récupération moyenne | Inflammation |
| **Désynchronisation circadienne** | Énergie soir > matin, réveils difficiles, drive variable | Rythmes biologiques |

### 5.5 Bug structurel du profil

```
INPUT élevé : charge mentale + optimisation constante + discipline
MANQUE      : récupération réelle + régulation physiologique

→ Le système nerveux devient le facteur limitant
→ Paradoxe : plus tu optimises, plus tu peux te cramer
```

### 5.6 Erreurs classiques

| Erreur | Pourquoi c'est contre-productif |
|--------|-------------------------------|
| Ajouter du stress "positif" (sport intense, café) | Aggrave la surcharge sympathique |
| Optimiser avant de réguler (nootropiques, hacks) | Inutile si le système est saturé |
| Ignorer les signaux faibles (fatigue légère, irritabilité) | Ce sont déjà des warnings système |
| Supplémenter sans diagnostic | Optimiser un facteur non-limitant → aucun effet |

---

## 6. Taxonomie des suppléments par axe métabolique

> Chaque tableau inclut : voie métabolique exacte, interactions, synergies, liens ontologiques entre molécules, graphe causal, et évaluation critique du niveau de preuve.

### Légende — Niveau de preuve

| Symbole | Signification | Critères |
|---------|--------------|----------|
| ⭐⭐⭐⭐ **Indiscutable** | Consensus scientifique fort | Méta-analyses Cochrane/BMJ, >10 RCTs, n>1000, reproductibilité élevée |
| ⭐⭐⭐ **Solide** | Preuves convergentes | Plusieurs RCTs (n=100-500), revues systématiques, mécanisme biochimique établi |
| ⭐⭐ **Probable** | Preuves émergentes | RCTs petits (n<100), résultats consistants mais corpus limité, pas de méta-analyse robuste |
| ⭐ **Hypothétique** | Mécanisme plausible, preuves faibles | Études observationnelles, modèles animaux, extrapolation mécanistique |

---

### Axe A — Soleil / Hormonal

#### Vitamine D3

| Dimension | Détail |
|-----------|--------|
| **Voie métabolique** | Cholécalciférol → 25(OH)D (foie) → 1,25(OH)₂D (rein) = calcitriol (hormone stéroïde active). Agit via récepteur nucléaire VDR présent dans >200 tissus. |
| **Graphe causal** | `UVB + cholestérol cutané → D3 → 25(OH)D (foie) → 1,25(OH)₂D (rein) → VDR activation → ↑ absorption Ca²⁺ / ↑ immunité innée / ↓ NF-κB (inflammation) / ↑ expression gènes testostérone` |
| **Interactions** | ⚠️ **D3 → ↑ absorption calcium** → sans K2, risque calcification vasculaire. **Magnésium** nécessaire pour conversion hépatique 25(OH)D. |
| **Synergies** | **D3 + K2 (MK-7)** : K2 active ostéocalcine (→ os) + MGP (→ protège artères). **D3 + Mg** : Mg = cofacteur des enzymes de conversion de D3. |
| **Liens ontologiques** | `D3 ←→ K2 ←→ Calcium ←→ Magnésium`. D3 est en amont de l'axe hormonal (testostérone, immunité) et de l'axe inflammation (NF-κB). |
| **P(déficit)** | **Très élevé**. 40% des Européens < 50 nmol/L. 13% < 30 nmol/L (déficit sévère). |
| **Forme** | D3 + K2 (MK-7). Marques : Thorne, Sunday Natural, Nutri&Co |

**Évaluation des preuves :**

| Claim | Preuve | Étude clé | n | Effet | Verdict |
|-------|--------|-----------|---|-------|---------|
| Déficit massif en Europe | ⭐⭐⭐⭐ Indiscutable | Cashman et al. 2016, Am J Clin Nutr | 55 844 | 40.4% < 50 nmol/L, 13% < 30 nmol/L | **Fait établi.** Méta-analyse pan-européenne. |
| D3 → ↑ testostérone | ⭐⭐ Probable | Pilz et al. 2011, Horm Metab Res | 165 | +25.2% testostérone vs placebo (3332 UI/j, 12 mois) | **Prometteur mais un seul RCT.** Besoin réplication. |
| D3 → ↓ mortalité toutes causes | ⭐⭐⭐ Solide | Autier et al. 2014, Lancet Diab Endocrinol | Revue systématique | Association significative D basse ↔ mortalité | **Observationnel fort.** Causalité débattue (reverse causation possible). |
| D3 → ↑ immunité innée | ⭐⭐⭐⭐ Indiscutable | Martineau et al. 2017, BMJ | 10 933 (méta-analyse 25 RCTs) | ↓ 12% infections respiratoires. ↓ 70% si déficit sévère | **Méta-analyse Cochrane-grade.** Indiscutable. |

---

#### Zinc

| Dimension | Détail |
|-----------|--------|
| **Voie métabolique** | Cofacteur de >300 enzymes. Impliqué dans : synthèse testostérone (cellules de Leydig), fonction immunitaire (thymuline), réplication ADN, métabolisme insuline. |
| **Graphe causal** | `Zinc → ↑ 5α-réductase → ↑ DHT. Zinc → ↑ thymuline → ↑ lymphocytes T. Zinc → ↓ aromatase → ↓ conversion testostérone→estradiol` |
| **Interactions** | ⚠️ **Zinc ↔ Cuivre** : compétition absorption (MT induction). Zinc >30 mg/j → déplétion cuivre. ⚠️ **Zinc ↔ Fer** : compétition au niveau DMT1. Séparer de 2h. |
| **Synergies** | **Zinc + D3** : tous deux nécessaires à la synthèse testostérone. **Zinc + B6** : B6 améliore absorption intestinale du zinc. |
| **Liens ontologiques** | `Zinc ←→ Testostérone ←→ D3. Zinc ←→ Cuivre (antagonisme). Zinc ←→ Fer (compétition). Zinc → Thyroïde (cofacteur TSH-récepteur)` |
| **P(déficit)** | **Modéré**. ~15-20% population insuffisante. Plus élevé chez sportifs (pertes sudorales). |
| **Forme** | Bisglycinate. Marques : Thorne, NOW Foods |

**Évaluation des preuves :**

| Claim | Preuve | Étude clé | n | Effet | Verdict |
|-------|--------|-----------|---|-------|---------|
| Zinc → ↑ testostérone (si déficit) | ⭐⭐⭐ Solide | Prasad et al. 1996, Nutrition | 40 | Restriction Zn → ↓ testo 75%. Repletion → restauration. | **Mécanisme clair, mais études petites.** |
| Zinc → ↓ durée rhume | ⭐⭐⭐ Solide | Singh & Das 2013, Cochrane | 1 360 (méta-analyse 18 RCTs) | ↓ durée 1.65 jours (acétate zinc) | **Cochrane. Solide.** Forme-dépendant. |
| Zinc ↔ Cuivre antagonisme | ⭐⭐⭐⭐ Indiscutable | Plum et al. 2010, IJERPH | Revue | Mécanisme MT bien caractérisé | **Biochimie établie.** |

---

#### Iode + Sélénium (couplés — axe thyroïdien)

| Dimension | Détail |
|-----------|--------|
| **Voie métabolique** | **Iode** : substrat de T3/T4 (thyroglobuline + TPO → MIT/DIT → T4). **Sélénium** : cofacteur des déiodinases (DIO1/DIO2) : T4 → T3 (forme active). Aussi cofacteur de glutathion peroxydase (GPx) → protège thyroïde du H₂O₂. |
| **Graphe causal** | `Iode → T4 (pro-hormone) → [Sélénium + DIO2] → T3 (active) → récepteurs nucléaires → ↑ métabolisme basal / ↑ thermogenèse / ↑ cognition` |
| **Interactions** | ⚠️ **Iode sans sélénium** : ↑ H₂O₂ thyroïdien → dommage oxydatif → risque thyroïdite. **Sélénium** protège via GPx. **Toujours coupler.** |
| **Synergies** | **Iode + Sélénium** : obligatoire. **Zinc** : cofacteur du récepteur TSH. Axe complet = Iode + Se + Zn. |
| **Liens ontologiques** | `Iode → T4 → [Sélénium] → T3 → Métabolisme. Sélénium → GPx → protection thyroïde. Zinc → récepteur TSH. Les trois forment un triplet fonctionnel.` |
| **P(déficit)** | **Iode** : variable (dépend sel iodé). **Sélénium** : modéré en Europe (sols pauvres, surtout nord/est). |
| **Forme** | Iode : kelp ou iodure K (faible dose). Sélénium : sélénométhionine. ⚠️ Analyse TSH + anticorps anti-TPO avant. |

**Évaluation des preuves :**

| Claim | Preuve | Étude clé | n | Effet | Verdict |
|-------|--------|-----------|---|-------|---------|
| Se nécessaire pour T4→T3 | ⭐⭐⭐⭐ Indiscutable | Köhrle 2005, Thyroid | Revue | DIO1/DIO2 = sélénoprotéines | **Biochimie fondamentale.** |
| Se → ↓ anticorps anti-TPO | ⭐⭐⭐ Solide | Winther et al. 2015, Eur Thyroid J | Méta 16 RCTs | ↓ anti-TPO significatif à 3-6 mois | **Consistant, mais hétérogénéité.** |
| Iode en excès → thyroïdite | ⭐⭐⭐⭐ Indiscutable | Laurberg et al. 2010, Best Pract Res Clin Endocrinol | Épidémiologie | Effet Wolff-Chaikoff bien documenté | **Ne pas surdoser. Fait médical.** |

---

### Axe B — Système nerveux / Stress

#### Magnésium

| Dimension | Détail |
|-----------|--------|
| **Voie métabolique** | Cofacteur de >600 enzymes. (1) **NMDA** : Mg²⁺ bloque le canal NMDA au repos → empêche excitotoxicité glutamate. (2) **ATP** : tout ATP est en réalité Mg-ATP (complexe). (3) **GABAergique** : potentialise les récepteurs GABA-A. (4) **HPA** : module l'axe hypothalamo-hypophyso-surrénalien (cortisol). |
| **Graphe causal** | `Stress → ↑ cortisol → ↑ excrétion rénale Mg → ↓ Mg intracellulaire → ↓ blocage NMDA → ↑ excitabilité neuronale → ↑ anxiété → ↑ stress (boucle positive)` |
| **Interactions** | **Mg ↔ Calcium** : antagonisme physiologique (Ca²⁺ = excitateur, Mg²⁺ = inhibiteur). ⚠️ **Café** : ↑ excrétion rénale Mg. **Sport** : pertes sudorales + besoins ↑. |
| **Synergies** | **Mg + B6** : B6 (P5P) ↑ transport intracellulaire de Mg via récepteurs TRP. RCT : Mg+B6 > Mg seul sur stress sévère (Pouteau 2018). **Mg + D3** : Mg = cofacteur conversion D3. **Mg + Ashwagandha** : corriger Mg d'abord, adaptogène ensuite. |
| **Liens ontologiques** | `Magnésium ←→ ATP (tout ATP = Mg-ATP). Mg ←→ GABA (potentialisation). Mg ←→ NMDA (blocage). Mg ←→ Cortisol (boucle). Mg ←→ B6 (transport). Mg ←→ D3 (conversion). Mg ←→ Ca²⁺ (antagonisme).` |
| **P(déficit)** | **Très élevé**. ~60% des adultes < AJR. Mg sérique non fiable (1% du Mg total). Mg érythrocytaire = meilleur marqueur. |
| **Forme** | Bisglycinate (haute biodisponibilité, pas d'effet laxatif) ou Malate (énergie). ⚠️ Éviter oxyde (4% absorption). Marques : Thorne, Sunday Natural, Nutri&Co |

**Évaluation des preuves :**

| Claim | Preuve | Étude clé | n | Effet | Verdict |
|-------|--------|-----------|---|-------|---------|
| Mg cofacteur >600 enzymes | ⭐⭐⭐⭐ Indiscutable | de Baaij et al. 2015, Physiol Rev | Revue | Biochimie fondamentale | **Fait établi.** Physiol Rev = gold standard. |
| Mg → ↓ anxiété | ⭐⭐⭐ Solide | Boyle et al. 2017, Nutrients | 18 études (revue syst.) | Effet significatif, surtout si stress élevé ou Mg bas | **Consistant, mais études hétérogènes.** |
| Mg + B6 > Mg seul (stress) | ⭐⭐⭐ Solide | Pouteau et al. 2018, PLoS ONE | 264 | Supériorité Mg+B6 sur stress sévère (PSS) p<0.05 | **RCT bien designé, n correct.** |
| Déficit Mg ~60% adultes | ⭐⭐⭐ Solide | Rosanoff et al. 2012, Nutr Rev | Épidémiologie USA | 56-68% < AJR (NHANES) | **Données pop solides.** Sous-estimé (AJR = minimum, pas optimal). |
| Blocage canal NMDA par Mg²⁺ | ⭐⭐⭐⭐ Indiscutable | Nowak et al. 1984, Nature | Électrophysiologie | Voltage-dependent block | **Neurophysiologie fondamentale. Nature.** |

---

#### Ashwagandha

| Dimension | Détail |
|-----------|--------|
| **Voie métabolique** | Withanolides (withaferin A, withanolide D) agissent sur : (1) **Axe HPA** : ↓ ACTH → ↓ cortisol. (2) **GABAergique** : agoniste partiel GABA-A (effet anxiolytique). (3) **Sérotoninergique** : modulation 5-HT. (4) **Thyroïdien** : ↑ T4 → T3 (stimulation directe). |
| **Graphe causal** | `Ashwagandha → ↓ ACTH hypophysaire → ↓ cortisol surrénalien → ↓ catabolisme musculaire + ↓ inflammation + ↑ sensibilité insuline. Ashwagandha → agonisme GABA-A → ↓ excitabilité neuronale → ↑ sommeil / ↓ anxiété` |
| **Interactions** | ⚠️ **Thyroïde** : ↑ T3/T4 → contre-indiqué si hyperthyroïdie ou Hashimoto actif. ⚠️ **Immunosuppresseurs** : effet immunomodulateur. ⚠️ **Sédatifs** : potentialisation (GABA). |
| **Synergies** | **Ashwagandha + Mg** : agissent sur le même axe (stress/GABA) mais mécanismes différents. **Mg d'abord** (corrige carence), ashwagandha ensuite (régulation). **Ashwagandha + Oméga-3** : anti-inflammatoire + anti-cortisol = double action sur inflammation stress-induite. |
| **Liens ontologiques** | `Ashwagandha → Cortisol ←→ Stress ←→ Magnésium. Ashwagandha → GABA ←→ Magnésium (convergence). Ashwagandha → Thyroïde ←→ Iode + Sélénium. Ashwagandha ≠ substitut de correction Mg/D3 (différent niveau d'intervention).` |
| **P(utilité)** | **Élevé si stress chronique** (profil ingénieur/sportif). Inutile voire négatif si profil "plat" / fatigue sans stress. |
| **Forme** | KSM-66 (racine, le plus étudié) ou Sensoril (racine+feuille, plus sédatif). Marques : Nootropics Depot, Sunday Natural |

**Évaluation des preuves :**

| Claim | Preuve | Étude clé | n | Effet | Verdict |
|-------|--------|-----------|---|-------|---------|
| ↓ cortisol sérique | ⭐⭐⭐ Solide | Chandrasekhar et al. 2012, IJPM | 64 | ↓ 27.9% cortisol vs placebo (KSM-66, 300mg×2/j, 60j) | **RCT double aveugle. Effet size important. Mais n petit.** |
| ↓ stress perçu (PSS) | ⭐⭐⭐ Solide | Salve et al. 2019, Cureus | 60 | ↓ significatif PSS + ↑ qualité sommeil (240mg KSM-66) | **Consistant avec Chandrasekhar. Reproductibilité OK.** |
| ↓ anxiété (HAM-A) | ⭐⭐⭐ Solide | Lopresti et al. 2019, Medicine | 60 | ↓ anxiété + ↓ cortisol matinal significatifs | **3ème RCT indépendant. Pattern cohérent.** |
| ↑ T3/T4 | ⭐⭐ Probable | Sharma et al. 2018, J Altern Compl Med | 50 | ↑ T3 (+18.6%) et T4 (+19.6%) chez hypothyroïdiens subcliniques | **Un seul RCT. Mécanisme plausible mais prudence.** |
| ↑ testostérone | ⭐⭐ Probable | Lopresti et al. 2019 + Wankhede 2015 | 57+57 | ↑ modeste, probablement indirect (via ↓ cortisol) | **Effet indirect. Pas d'action directe sur Leydig prouvée.** |
| **Verdict global** | ⭐⭐⭐ | **Corpus cohérent (5+ RCTs concordants).** Effet réel sur cortisol/stress. Mais : petits échantillons (n=50-64), pas de méta-analyse Cochrane, effet testo = indirect. **Pas indiscutable, mais solide.** |

---

#### Vitamine B6 (P5P)

| Dimension | Détail |
|-----------|--------|
| **Voie métabolique** | Cofacteur de >140 réactions enzymatiques. Clé : (1) **Décarboxylase** : tryptophane → 5-HTP → sérotonine → mélatonine. (2) **Décarboxylase** : L-DOPA → dopamine. (3) **GAD** : glutamate → GABA. (4) **Transamination** : métabolisme acides aminés. |
| **Graphe causal** | `B6 → GAD → glutamate→GABA → ↓ excitabilité. B6 → AADC → ↑ dopamine + ↑ sérotonine → humeur + motivation. B6 → ↓ homocystéine (avec B9+B12) → ↓ risque cardiovasculaire` |
| **Interactions** | **B6 + Mg** : synergie bidirectionnelle (B6 ↑ transport Mg, Mg nécessaire pour activation P5P). **B6 + B9 + B12** : trio méthylation (cycle homocystéine). |
| **Synergies** | **B6 + Mg** (Pouteau 2018). **B6 + B12 + B9** (méthylation). |
| **Liens ontologiques** | `B6 → Dopamine / Sérotonine / GABA / Mélatonine (nœud central neurotransmetteurs). B6 ←→ Mg (transport bidirectionnel). B6 → Homocystéine ←→ B12 + B9.` |
| **P(déficit)** | **Modéré**. 10-15% population insuffisante. Plus élevé sous contraceptifs oraux. |
| **Forme** | Pyridoxal-5-phosphate (P5P, forme active). Marques : Thorne, Life Extension |

**Évaluation des preuves :**

| Claim | Preuve | Étude clé | n | Effet | Verdict |
|-------|--------|-----------|---|-------|---------|
| B6 cofacteur synthèse neurotransmetteurs | ⭐⭐⭐⭐ Indiscutable | Dakshinamurti et al. 1990, Ann NY Acad Sci | Biochimie | GAD, AADC = PLP-dépendants | **Biochimie fondamentale.** |
| B6 + Mg > Mg seul | ⭐⭐⭐ Solide | Pouteau et al. 2018, PLoS ONE | 264 | Supériorité sur stress sévère | **Voir section Mg.** |

---

### Axe C — Inflammation / Cerveau

#### Oméga-3 (EPA/DHA)

| Dimension | Détail |
|-----------|--------|
| **Voie métabolique** | (1) **EPA** → résolvines série E + prostaglandines série 3 (anti-inflammatoires). Inhibe COX-2 et LOX-5 (même cibles que l'ibuprofène). (2) **DHA** → 60% des acides gras des membranes neuronales. Fluidité membranaire → transduction signal. → Neuroprotectines (NPD1) + marésines. (3) **Compétition ω6** : EPA/DHA déplacent l'acide arachidonique (ω6) des membranes → ↓ production prostaglandines inflammatoires (PGE2, LTB4). |
| **Graphe causal** | `Alimentation moderne → ↑ ω6 (huiles végétales) → ↑ acide arachidonique membranaire → ↑ PGE2 + LTB4 → inflammation chronique bas grade → brouillard mental + récupération lente + ↑ risque CV. Oméga-3 → déplace ω6 → ↓ PGE2 → ↑ résolvines → résolution inflammation.` |
| **Interactions** | **ω3 ↔ ω6** : compétition pour les mêmes enzymes (Δ5/Δ6 désaturases, COX, LOX). Le ratio ω6:ω3 est plus important que la dose absolue. ⚠️ **Anticoagulants** : EPA à haute dose → effet antiagrégant. |
| **Synergies** | **ω3 + D3** : D3 = anti-inflammatoire (↓ NF-κB) + ω3 = anti-inflammatoire (↓ COX-2). Double action. **ω3 + Mg** : Mg ↓ excitabilité neuronale + DHA = structure membranaire. **ω3 + Ashwagandha** : ↓ inflammation + ↓ cortisol = couverture complète du stress chronique. |
| **Liens ontologiques** | `Oméga-3 ←→ Oméga-6 (compétition enzymatique). EPA → Résolvines → Résolution inflammation. DHA → Membranes neuronales → Cognition. ω3 ←→ D3 (convergence anti-inflammatoire). ω3 ←→ Cortisol (via ↓ inflammation → ↓ activation HPA).` |
| **P(déficit)** | **Très élevé**. Ratio ω6:ω3 actuel ~15:1 (optimal 2-4:1). >70% population occidentale insuffisante en EPA+DHA. |
| **Forme** | ≥ 1 g EPA+DHA / jour. Triglycérides re-estérifiés (rTG) > ethyl esters (EE). Marques : Nordic Naturals, Minami, Nutri&Co |

**Évaluation des preuves :**

| Claim | Preuve | Étude clé | n | Effet | Verdict |
|-------|--------|-----------|---|-------|---------|
| Ratio ω6:ω3 = 15:1 (pathologique) | ⭐⭐⭐⭐ Indiscutable | Simopoulos 2002, Biomed Pharmacother | Revue | Ratio ancestral 1:1, actuel 15-20:1 | **Épidémiologie massive. Indiscutable.** |
| ω3 → ↓ inflammation (CRP, IL-6) | ⭐⭐⭐⭐ Indiscutable | Calder 2017, Ann Nutr Metab | Revue systématique | ↓ CRP, IL-6, TNF-α. Mécanisme COX/LOX bien caractérisé | **Biochimie + méta-analyses. Indiscutable.** |
| DHA → structure neuronale | ⭐⭐⭐⭐ Indiscutable | Dyall 2015, Front Aging Neurosci | Revue | 60% AG membranaires cérébraux = DHA | **Biochimie fondamentale.** |
| ω3 → ↓ risque CV | ⭐⭐⭐ Solide | VITAL 2019 + REDUCE-IT 2019 | 25 871 + 8 179 | VITAL : effet modeste. REDUCE-IT (EPA haute dose) : ↓ 25% événements CV | **Résultats mixtes. Dose-dépendant. REDUCE-IT très fort mais EPA seul à 4g/j.** |
| ω3 → ↑ cognition chez sains | ⭐⭐ Probable | Stonehouse et al. 2013, Am J Clin Nutr | 176 | ↑ mémoire épisodique (DHA 1.16g/j, 6 mois) | **RCT positif mais effet modeste chez sujets sains.** |

---

### Axe D — Énergie mitochondriale

#### Vitamine B1 (Thiamine)

| Dimension | Détail |
|-----------|--------|
| **Voie métabolique** | Thiamine pyrophosphate (TPP) = cofacteur de : (1) **Pyruvate déshydrogénase** : pyruvate → Acétyl-CoA (entrée du Krebs). (2) **α-cétoglutarate déshydrogénase** : étape limitante du Krebs. (3) **Transcétolase** : voie des pentoses phosphates (NADPH + ribose). |
| **Graphe causal** | `Stress + café + glucides raffinés → ↑ consommation B1 → ↓ TPP → ↓ PDH → ↓ Acétyl-CoA → Krebs ralentit → ↓ NADH → ↓ ATP → fatigue cognitive + "cerveau lent"` |
| **Interactions** | **B1 + Mg** : Mg = cofacteur de TPP kinase (active B1). Sans Mg, B1 inutilisable. **B1 + B2 + B3** : chaîne couplée (Krebs → chaîne respiratoire). |
| **Synergies** | **B1 + Mg** : fondamental (même patient). **B1 + α-ALA** (acide alpha-lipoïque) : cofacteur commun de PDH. **Complexe B** logique si fatigue mitochondriale. |
| **Liens ontologiques** | `B1 → PDH → Acétyl-CoA → Krebs → NADH → Chaîne resp → ATP. B1 ←→ Mg (activation TPP). B1 ←→ B2 (FAD dans Krebs). B1 ←→ B3 (NAD⁺ dans Krebs). Nœud critique : B1 = gardien de l'entrée du Krebs.` |
| **P(déficit)** | **Modéré à élevé**. Déficit subclinique sous-diagnostiqué. Populations à risque : stress chronique, alcool, régime riche en glucides raffinés, café. |
| **Forme** | Benfotiamine (liposoluble, meilleure biodisponibilité) ou thiamine HCl. Marques : Thorne, NOW Foods |

**Évaluation des preuves :**

| Claim | Preuve | Étude clé | n | Effet | Verdict |
|-------|--------|-----------|---|-------|---------|
| B1 = cofacteur PDH + α-KGDH | ⭐⭐⭐⭐ Indiscutable | Lonsdale 2006, ECAM | Revue | Biochimie fondamentale (1930s+) | **Fait établi depuis ~90 ans.** |
| Déficit subclinique fréquent | ⭐⭐ Probable | Lonsdale 2015, Med Hypotheses | Revue narrative | Thèse B1+Mg = duo sous-diagnostiqué | **Hypothèse cohérente mais pas de grande épidémiologie.** Manque données pop. |
| Benfotiamine > thiamine HCl | ⭐⭐⭐ Solide | Raj et al. 2018, J Clin Pharmacol | Pharmacocinétique | Biodisponibilité ~5× supérieure | **Pharmacocinétique solide.** |
| **Verdict global B1** | ⭐⭐½ | **Biochimie indiscutable. Épidémiologie du déficit subclinique = insuffisante.** On sait que c'est critique si absent, mais la prévalence exacte du déficit modéré chez l'adulte sain reste mal quantifiée. Approche prudente : faible coût, pas de toxicité → risque/bénéfice favorable. |

---

#### CoQ10

| Dimension | Détail |
|-----------|--------|
| **Voie métabolique** | Ubiquinone / ubiquinol. Navette d'électrons entre Complexe I/II → Complexe III de la chaîne respiratoire mitochondriale. Aussi : antioxydant liposoluble majeur (régénère vitamine E). |
| **Graphe causal** | `Âge + statines → ↓ CoQ10 endogène → goulot chaîne respiratoire → ↓ ATP. CoQ10 exogène → restaure navette → ↑ rendement ATP + ↓ stress oxydatif mitochondrial` |
| **Interactions** | ⚠️ **Statines** : inhibent HMG-CoA réductase → ↓ synthèse CoQ10 (même voie que cholestérol). **Vitamine E** : CoQ10 régénère vit E oxydée. |
| **Synergies** | **CoQ10 + B1 + B2 + B3** : couverture complète Krebs + chaîne. **CoQ10 + Mg** : Mg-ATP + CoQ10 = les deux faces de la production d'énergie. |
| **Liens ontologiques** | `CoQ10 ←→ Chaîne respiratoire (navette e⁻). CoQ10 ←→ Statines (déplétion). CoQ10 ←→ Vitamine E (régénération). CoQ10 ←→ Âge (↓ synthèse endogène après 35-40 ans).` |
| **P(déficit)** | **Modéré (fonctionnel)**. Production endogène ↓ avec l'âge. Élevé si statines. |
| **Forme** | Ubiquinol (forme réduite, mieux absorbée que ubiquinone). Marques : Kaneka QH (via Thorne, Doctor's Best) |

**Évaluation des preuves :**

| Claim | Preuve | Étude clé | n | Effet | Verdict |
|-------|--------|-----------|---|-------|---------|
| CoQ10 = navette chaîne resp | ⭐⭐⭐⭐ Indiscutable | Littarru & Tiano 2007, Mol Biotechnol | Revue | Biochimie mitochondriale | **Fondamental.** |
| Statines → ↓ CoQ10 | ⭐⭐⭐⭐ Indiscutable | Littarru & Langsjoen 2007, BioFactors | Revue | Même voie mévalonate | **Biochimie + clinique.** |
| CoQ10 → ↑ énergie subjective (sains) | ⭐⭐ Probable | Mizuno et al. 2008, Nutrition | 17 | ↓ fatigue après exercice | **Très petit n. Tendance positive.** |
| CoQ10 → ↓ mortalité (insuffisance cardiaque) | ⭐⭐⭐ Solide | Q-SYMBIO 2014, JACC Heart Failure | 420 | ↓ 43% mortalité CV (CoQ10 300mg/j, 2 ans) | **RCT impressionnant mais un seul essai majeur.** |

---

#### Fer

| Dimension | Détail |
|-----------|--------|
| **Voie métabolique** | (1) **Hémoglobine** : transport O₂ (poumons → tissus). (2) **Myoglobine** : stockage O₂ musculaire. (3) **Cytochromes** : Complexes I, II, III de la chaîne respiratoire (centres fer-soufre). (4) **Catalase/peroxydase** : défense antioxydante. |
| **Graphe causal** | `Fer bas → ↓ hémoglobine → ↓ O₂ tissus → ↓ chaîne respiratoire → ↓ ATP. MAIS : Fer en excès → réaction de Fenton → Fe²⁺ + H₂O₂ → OH• (radical hydroxyle) → dommage oxydatif` |
| **Interactions** | ⚠️ **Fe ↔ Zn** : compétition DMT1. ⚠️ **Fe ↔ Ca²⁺** : inhibition absorption. **Vitamine C** : ↑ absorption fer non-hémique (réduction Fe³⁺ → Fe²⁺). |
| **Synergies** | **Fe + Vitamine C** (absorption). **Fe + B12 + B9** (érythropoïèse complète). |
| **Liens ontologiques** | `Fer → O₂ → Chaîne resp → ATP. Fer ↔ Zinc (compétition). Fer → Fenton (toxicité si excès). Fer ←→ Vitamine C (absorption). Fer ←→ Ferritine (stockage, marqueur).` |
| **P(déficit)** | **Variable**. Hommes : modéré (si sport intense). Femmes préménopausées : élevé. ⚠️ **TOUJOURS MESURER** (ferritine). |
| **Forme** | Bisglycinate (tolérance GI supérieure). Marques : Thorne, Solgar. ⚠️ Uniquement sur analyse. |

**Évaluation des preuves :**

| Claim | Preuve | Étude clé | n | Effet | Verdict |
|-------|--------|-----------|---|-------|---------|
| Fe → transport O₂ / ATP | ⭐⭐⭐⭐ Indiscutable | Haas & Brownlie 2001, J Nutr | Revue | Physiologie fondamentale | **Indiscutable.** |
| Fe excès → stress oxydatif | ⭐⭐⭐⭐ Indiscutable | Galaris et al. 2019, BBA Mol Cell Res | Revue | Réaction de Fenton | **Biochimie. Ne pas supplémenter à l'aveugle.** |
| Vit C → ↑ absorption Fe | ⭐⭐⭐⭐ Indiscutable | Hallberg et al. 1989, Am J Clin Nutr | Multiples études | Réduction Fe³⁺→Fe²⁺ | **Classique.** |

---

### Axe E — Structure / Réparation

#### Vitamine C + B12

| Molécule | Voie métabolique | Interactions | Synergies | P(déficit) | Preuve |
|----------|-----------------|-------------|-----------|------------|--------|
| **Vitamine C** | Cofacteur prolyl/lysyl hydroxylase → synthèse collagène. Antioxydant (régénère vit E). ↑ absorption fer non-hémique. | Fe (↑ absorption). Vit E (régénération). | C + Fe (absorption). C + collagène (structure). | Faible à modéré | ⭐⭐⭐⭐ Biochimie indiscutable (scorbut). Supplémentation chez non-carencé = bénéfice marginal. |
| **Vitamine B12** | Cofacteur méthionine synthase (cycle méthylation : homocystéine → méthionine). Cofacteur methylmalonyl-CoA mutase (métabolisme AG impairs). | B9 + B6 (cycle méthylation). Metformine (↓ absorption B12). | B12 + B9 + B6 (trio méthylation → ↓ homocystéine). | Modéré (si peu de viande, >50 ans, metformine) | ⭐⭐⭐⭐ Biochimie indiscutable. Déficit = anémie mégaloblastique + neuropathie. |

---

### 6.bis — Graphe causal global (ontologie des interactions)

```
                    ┌─────────────────────────────────────────┐
                    │         LUMIÈRE SOLAIRE (UVB)            │
                    └──────────────┬──────────────────────────┘
                                   │
                                   ▼
                    ┌──────────────────────────┐
                    │     VITAMINE D3           │
                    │  (hormone stéroïde)       │
                    └──┬───────┬────────┬───────┘
                       │       │        │
              ↓NF-κB   │  ↑Ca²⁺│   ↑Immunité
           (anti-infl) │  absorp│   innée
                       │       │        │
                       │       ▼        │
                       │   ┌───────┐    │
                       │   │  K2   │────┘
                       │   │(MK-7) │ dirige Ca→os
                       │   └───────┘    (pas artères)
                       │
          ┌────────────┴─────────────────────────────────────┐
          │                                                   │
          ▼                                                   ▼
  ┌───────────────┐                                ┌──────────────────┐
  │  TESTOSTÉRONE  │                                │  INFLAMMATION    │
  │               │◄──── Zinc ──────────────┐      │  (bas grade)     │
  │               │                          │      │                  │
  └───────────────┘                          │      │   ω6:ω3 ratio   │
                                             │      │       │          │
                                             │      │       ▼          │
                     ┌───────────────────┐   │      │  ┌──────────┐   │
                     │    THYROÏDE       │   │      │  │ OMÉGA-3  │   │
                     │  T4 →[Se]→ T3    │◄──┘      │  │ EPA/DHA  │───┘
                     │                   │◄─ Iode   │  └──────────┘
                     └───────────────────┘          │   ↓ COX-2
                            ↑                       │   ↓ PGE2
                       Ashwagandha                  │   ↑ résolvines
                       (↑T3/T4)                     │
                            │                       └──────────────────┐
                            │                                          │
                            ▼                                          ▼
                    ┌───────────────┐                        ┌─────────────────┐
                    │   AXE HPA     │                        │   CERVEAU        │
                    │  (stress)     │                        │                  │
                    │               │                        │  DHA = 60% AG    │
                    │  ACTH→Cortisol│                        │  membranaires    │
                    └──┬────────────┘                        └─────────────────┘
                       │
          ┌────────────┼─────────────────┐
          │            │                 │
          ▼            ▼                 ▼
  ┌────────────┐ ┌──────────┐  ┌──────────────────┐
  │ MAGNÉSIUM  │ │ASHWAGANDHA│  │     GABA          │
  │            │ │           │  │                    │
  │ ↓ NMDA    │ │ ↓ ACTH    │  │  ← Mg (potentie)  │
  │ ↑ GABA    │ │ ↓ cortisol│  │  ← B6 (synthèse)  │
  │ cofact 600│ │ ↑ GABA-A  │  │  ← Ashwa (agonist) │
  └──────┬─────┘ └──────────┘  └──────────────────┘
         │
         │  cofacteur conversion D3
         │  cofacteur activation B1 (TPP kinase)
         │  antagoniste Ca²⁺
         │
         ▼
  ┌─────────────────────────────────────────────────┐
  │              ÉNERGIE (ATP)                       │
  │                                                  │
  │  Glucose → [B1/TPP] → Acétyl-CoA → KREBS       │
  │                                                  │
  │  Krebs :  B1 (PDH, α-KGDH)                     │
  │           B2 (FAD → succinate DH)               │
  │           B3 (NAD⁺)                             │
  │           Mg (cofacteur enzymes)                │
  │                                                  │
  │  Chaîne resp : Fe (centres Fe-S)                │
  │                CoQ10 (navette e⁻)               │
  │                O₂ (accepteur final)             │
  │                                                  │
  │  Résultat : Mg-ATP                              │
  └─────────────────────────────────────────────────┘
```

### 6.ter — Matrice d'interactions (lecture rapide)

| | D3 | Mg | ω3 | B1 | Ashwa | Zn | Fe | Se | B6 | CoQ10 | K2 |
|---|---|---|---|---|---|---|---|---|---|---|---|
| **D3** | — | 🟢 Mg active D3 | 🟢 convergence anti-infl | · | · | 🟢 co-testo | · | · | · | · | 🟢 **obligatoire** (Ca routing) |
| **Mg** | 🟢 | — | 🟢 neuro+anti-infl | 🟢 **active TPP** | 🟢 même axe stress | · | · | · | 🟢 **bidirectionnel** | 🟢 Mg-ATP | · |
| **ω3** | 🟢 | 🟢 | — | · | 🟢 anti-infl+anti-cortisol | · | · | · | · | · | · |
| **B1** | · | 🟢 | · | — | · | · | · | · | · | 🟢 Krebs couplé | · |
| **Ashwa** | · | 🟢 corriger Mg avant | 🟢 | · | — | · | · | ⚠️ ↑T3/T4 | · | · | · |
| **Zn** | 🟢 | · | · | · | · | — | 🔴 **compétition** | · | 🟢 absorption | · | · |
| **Fe** | · | · | · | · | · | 🔴 | — | · | · | · | · |
| **Se** | · | · | · | · | ⚠️ thyroïde | · | · | — | · | · | · |
| **B6** | · | 🟢 | · | · | · | 🟢 | · | · | — | · | · |
| **CoQ10** | · | 🟢 | · | 🟢 | · | · | · | · | · | — | · |
| **K2** | 🟢 | · | · | · | · | · | · | · | · | · | — |

**Légende** : 🟢 synergie — 🔴 antagonisme — ⚠️ prudence — · pas d'interaction directe significative

---

## 7. Stack décisionnel bayésien

### 7.1 Tier 1 — Quasi universel (corrige des déficits massifs)

> 80% du ROI. Probabilité de déficit élevée chez tout profil moderne.

| Supplément | Dosage indicatif | Timing |
|------------|-----------------|--------|
| **Vitamine D3 + K2** | 1 000 – 2 000 UI/jour (ajuster avec prise de sang) | Matin, avec un repas gras |
| **Magnésium bisglycinate** | 200 – 400 mg Mg élémentaire / jour | Soir (effet relaxant) |
| **Oméga-3** | ≥ 1 g EPA+DHA / jour | Avec un repas |

### 7.2 Tier 2 — Conditionnel (selon profil)

| Situation détectée | Supplément | Dosage indicatif |
|-------------------|------------|-----------------|
| Stress chronique élevé | **Ashwagandha** (KSM-66) | 300 – 600 mg/jour |
| Fatigue persistante malgré discipline | **B1** (thiamine / benfotiamine) | 50 – 100 mg/jour |
| Fatigue + >35 ans + sport | **CoQ10** (ubiquinol) | 100 – 200 mg/jour |
| Suspicion hormonale | **Zinc** bisglycinate | 15 – 30 mg/jour |
| Énergie basse chronique | **Sélénium** + **Iode** (prudence) | Se 200 µg + I 150 µg/jour |
| Fatigue nerveuse, irritabilité | **B6** (P5P) | 25 – 50 mg/jour |

### 7.3 Tier 3 — Niveau expert (guidé par analyses)

| Analyse sanguine | Valeur cible | Action si déficit |
|-----------------|-------------|-------------------|
| **25-OH Vitamine D** | 40 – 60 ng/mL (100 – 150 nmol/L) | Ajuster dose D3 |
| **Ferritine** | 40 – 100 ng/mL (hommes) | Bisglycinate de fer si bas |
| **B12** | > 400 pg/mL | Méthylcobalamine |
| **TSH** | 0.5 – 2.5 mUI/L (optimal fonctionnel) | Explorer thyroïde (iode, sélénium) |
| **Magnésium érythrocytaire** | > 2.0 mmol/L (intra-cellulaire) | ⚠️ Le Mg sérique est peu fiable |
| **Homocystéine** | < 10 µmol/L | Complexe B (B6 + B9 + B12) |
| **CRP ultrasensible** | < 1 mg/L | Oméga-3, anti-inflammatoire alimentaire |
| **Zinc sérique** | 80 – 120 µg/dL | Bisglycinate de zinc |

---

## 8. Anti-patterns

| ❌ Pattern | Pourquoi c'est inefficace |
|-----------|--------------------------|
| **Multivitamine générique** | Dilue tout, ne corrige aucun déficit critique. Liebig : un peu de tout ≠ assez de ce qui manque. |
| **10+ suppléments** | Aucun ciblage. Coût élevé, interactions mal maîtrisées, compliance qui chute. |
| **Nootropiques sans bases corrigées** | Prendre des stimulants cognitifs avec un déficit magnésium / sommeil dégradé = inutile. |
| **Ashwagandha pour compenser un magnésium bas** | Mauvais ordre : corriger la carence physiologique d'abord, adaptogène ensuite. |
| **Fer sans analyse** | Le fer en excès est toxique (stress oxydatif). Toujours mesurer la ferritine. |
| **Iode à forte dose** | Peut aggraver une thyroïdite auto-immune. Prudence, analyse TSH + anticorps. |
| **Supplémenter un facteur non-limitant** | Aucun effet perceptible. Revient à arroser une plante qui manque de soleil. |

---

## 9. Protocole niveau 2 — dosages & timing

### 9.1 Timing optimal

| Moment | Suppléments | Raison |
|--------|------------|--------|
| **Matin (avec petit-déjeuner gras)** | Vitamine D3 + K2, Oméga-3, CoQ10 | Liposolubles → absorption avec gras. D3 le matin pour rythme circadien. |
| **Midi (avec repas)** | Zinc, B1, B6, B12, Fer (si applicable) | Vitamines B = énergie → éviter le soir. Zinc loin du calcium. |
| **Soir (30 min avant coucher)** | Magnésium bisglycinate, Ashwagandha | Effet relaxant, transition parasympathique. |

### 9.2 Interactions à connaître

| Interaction | Détail |
|------------|--------|
| **Zinc ↔ Cuivre** | Zinc en excès dépléte le cuivre. Si zinc > 30 mg/jour sur > 8 semaines → ajouter 1-2 mg cuivre [[14]](#ref14) |
| **Fer ↔ Zinc / Calcium** | Ne pas prendre ensemble (compétition d'absorption). Séparer de 2h [[15]](#ref15) |
| **D3 → K2** | K2 (MK-7) dirige le calcium absorbé grâce à D3 vers les os, pas les artères [[16]](#ref16) |
| **Magnésium → B6** | B6 améliore le transport intracellulaire du magnésium. Synergie [[17]](#ref17) |
| **Ashwagandha → thyroïde** | Peut augmenter T3/T4. Prudence si hyperthyroïdie ou Hashimoto [[18]](#ref18) |

### 9.3 Cyclage recommandé

| Supplément | Cyclage | Raison |
|------------|---------|--------|
| Ashwagandha | 8 semaines ON / 2 semaines OFF | Éviter désensibilisation des récepteurs cortisol |
| Zinc | Continu si dosage ≤ 15 mg, cyclé si > 25 mg | Risque déplétion cuivre |
| Tous les autres (D3, Mg, Oméga-3, B) | Continu | Correction de déficits chroniques |

---

## 10. Sources

<a id="ref1"></a>**[1]** Lonsdale, D. (2006). *A Review of the Biochemistry, Metabolism and Clinical Benefits of Thiamin(e) and Its Derivatives.* Evidence-Based Complementary and Alternative Medicine, 3(1), 49–59. [doi:10.1093/ecam/nek009](https://doi.org/10.1093/ecam/nek009)

<a id="ref2"></a>**[2]** Powers, H.J. (2003). *Riboflavin (vitamin B-2) and health.* American Journal of Clinical Nutrition, 77(6), 1352–1360. [doi:10.1093/ajcn/77.6.1352](https://doi.org/10.1093/ajcn/77.6.1352)

<a id="ref3"></a>**[3]** Bogan, K.L. & Brenner, C. (2008). *Nicotinic acid, nicotinamide, and nicotinamide riboside: a molecular evaluation of NAD+ precursor vitamins in human nutrition.* Annual Review of Nutrition, 28, 115–130. [doi:10.1146/annurev.nutr.28.061807.155443](https://doi.org/10.1146/annurev.nutr.28.061807.155443)

<a id="ref4"></a>**[4]** de Baaij, J.H.F., Hoenderop, J.G.J. & Bindels, R.J.M. (2015). *Magnesium in Man: Implications for Health and Disease.* Physiological Reviews, 95(1), 1–46. [doi:10.1152/physrev.00012.2014](https://doi.org/10.1152/physrev.00012.2014)

<a id="ref5"></a>**[5]** Haas, J.D. & Brownlie, T. (2001). *Iron Deficiency and Reduced Work Capacity: A Critical Review of the Research to Determine a Causal Relationship.* Journal of Nutrition, 131(2), 676S–690S. [doi:10.1093/jn/131.2.676S](https://doi.org/10.1093/jn/131.2.676S)

<a id="ref6"></a>**[6]** Littarru, G.P. & Tiano, L. (2007). *Bioenergetic and Antioxidant Properties of Coenzyme Q10: Recent Developments.* Molecular Biotechnology, 37(1), 31–37. [doi:10.1007/s12033-007-0052-y](https://doi.org/10.1007/s12033-007-0052-y)

<a id="ref7"></a>**[7]** Gooley, J.J. et al. (2011). *Exposure to Room Light before Bedtime Suppresses Melatonin Onset and Shortens Melatonin Duration in Humans.* Journal of Clinical Endocrinology & Metabolism, 96(3), E463–E472. [doi:10.1210/jc.2010-2098](https://doi.org/10.1210/jc.2010-2098)

<a id="ref8"></a>**[8]** McEwen, B.S. (2008). *Central effects of stress hormones in health and disease: Understanding the protective and damaging effects of stress and stress mediators.* European Journal of Pharmacology, 583(2-3), 174–185. [doi:10.1016/j.ejphar.2007.11.071](https://doi.org/10.1016/j.ejphar.2007.11.071)

<a id="ref9"></a>**[9]** Thomas, D. (2007). *The mineral depletion of foods available to us as a nation (1940–2002).* Nutrition and Health, 19(1-2), 21–55. [doi:10.1177/026010600701900205](https://doi.org/10.1177/026010600701900205)

<a id="ref10"></a>**[10]** Pedersen, B.K. (2019). *Physical activity and muscle–brain crosstalk.* Nature Reviews Endocrinology, 15, 383–392. [doi:10.1038/s41574-019-0174-x](https://doi.org/10.1038/s41574-019-0174-x)

<a id="ref11"></a>**[11]** Sapolsky, R.M. (2004). *Why Zebras Don't Get Ulcers.* 3rd ed. Henry Holt and Company. ISBN 978-0-8050-7369-0.

<a id="ref12"></a>**[12]** Simopoulos, A.P. (2002). *The importance of the ratio of omega-6/omega-3 essential fatty acids.* Biomedicine & Pharmacotherapy, 56(8), 365–379. [doi:10.1016/S0753-3322(02)00253-6](https://doi.org/10.1016/S0753-3322(02)00253-6)

<a id="ref13"></a>**[13]** Cashman, K.D. et al. (2016). *Vitamin D deficiency in Europe: pandemic?* American Journal of Clinical Nutrition, 103(4), 1033–1044. [doi:10.3945/ajcn.115.120873](https://doi.org/10.3945/ajcn.115.120873)

<a id="ref14"></a>**[14]** Plum, L.M., Rink, L. & Haase, H. (2010). *The Essential Toxin: Impact of Zinc on Human Health.* International Journal of Environmental Research and Public Health, 7(4), 1342–1365. [doi:10.3390/ijerph7041342](https://doi.org/10.3390/ijerph7041342)

<a id="ref15"></a>**[15]** Sandström, B. (2001). *Micronutrient interactions: effects on absorption and bioavailability.* British Journal of Nutrition, 85(S2), S181–S185. [doi:10.1079/BJN2000312](https://doi.org/10.1079/BJN2000312)

<a id="ref16"></a>**[16]** Maresz, K. (2015). *Proper Calcium Use: Vitamin K2 as a Promoter of Bone and Cardiovascular Health.* Integrative Medicine, 14(1), 34–39. [PMID: 26770129](https://pubmed.ncbi.nlm.nih.gov/26770129/)

<a id="ref17"></a>**[17]** Pouteau, E. et al. (2018). *Superiority of magnesium and vitamin B6 over magnesium alone on severe stress in healthy adults.* PLoS ONE, 13(12), e0208454. [doi:10.1371/journal.pone.0208454](https://doi.org/10.1371/journal.pone.0208454)

<a id="ref18"></a>**[18]** Sharma, A.K., Basu, I. & Singh, S. (2018). *Efficacy and Safety of Ashwagandha Root Extract in Subclinical Hypothyroid Patients.* Journal of Alternative and Complementary Medicine, 24(3), 243–248. [doi:10.1089/acm.2017.0183](https://doi.org/10.1089/acm.2017.0183)

### Méta-analyses et revues complémentaires

- Chandrasekhar, K., Kapoor, J. & Anishetty, S. (2012). *A Prospective, Randomized Double-Blind, Placebo-Controlled Study of Safety and Efficacy of a High-Concentration Full-Spectrum Extract of Ashwagandha Root.* Indian J Psychol Med, 34(3), 255–262. [doi:10.4103/0253-7176.106022](https://doi.org/10.4103/0253-7176.106022)

- Tardy, A.L. et al. (2020). *Vitamins and Minerals for Energy, Fatigue and Cognition: A Narrative Review.* Nutrients, 12(1), 228. [doi:10.3390/nu12010228](https://doi.org/10.3390/nu12010228)

- Volpe, S.L. (2013). *Magnesium in Disease Prevention and Overall Health.* Advances in Nutrition, 4(3), 378S–383S. [doi:10.3945/an.112.003483](https://doi.org/10.3945/an.112.003483)

- Swanson, D., Block, R. & Mousa, S.A. (2012). *Omega-3 Fatty Acids EPA and DHA: Health Benefits Throughout Life.* Advances in Nutrition, 3(1), 1–7. [doi:10.3945/an.111.000893](https://doi.org/10.3945/an.111.000893)

---

> **Modèle mental final** : *"Je ne prends pas des suppléments, je corrige un goulot d'étranglement biologique."*
