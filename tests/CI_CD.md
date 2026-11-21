# Guide CI/CD - Tests

Ce document décrit l'intégration des tests dans la pipeline CI/CD de Wings8Note.

---

## 📋 Table des matières

- [Vue d'ensemble](#vue-densemble)
- [Workflows GitHub Actions](#workflows-github-actions)
- [Quand les tests s'exécutent](#quand-les-tests-sexécutent)
- [Interprétation des résultats](#interprétation-des-résultats)
- [Gestion des échecs](#gestion-des-échecs)
- [Configuration locale vs CI](#configuration-locale-vs-ci)

---

## 🎯 Vue d'ensemble

Notre pipeline CI/CD utilise **GitHub Actions** pour automatiser l'exécution des tests à chaque changement de code. L'objectif est de détecter les problèmes le plus tôt possible et maintenir une qualité constante.

### Architecture de la pipeline

```
Push/PR
    │
    ├──► Quality Checks (Lint + Type Check + Format)
    │
    ├──► Unit Tests (Vitest + Coverage)
    │
    ├──► E2E Tests (Playwright)
    │
    ├──► Security Checks (Audit + CodeQL + CSP)
    │
    ├──► Performance Tests (Lighthouse + Bundle)
    │
    └──► Visual Regression (Playwright Screenshots)
```

---

## 🔧 Workflows GitHub Actions

### 1. Quality Checks ([`.github/workflows/quality.yml`](../.github/workflows/quality.yml))

**Déclencheurs :**

- Push sur `main` ou `develop`
- Pull requests sur `main` ou `develop`

**Jobs :**

| Job             | Description                     | Temps estimé |
| --------------- | ------------------------------- | ------------ |
| `lint-and-type` | ESLint + TypeScript + Prettier  | ~2 min       |
| `unit-tests`    | Tests unitaires avec couverture | ~5 min       |
| `e2e-tests`     | Tests E2E avec Playwright       | ~10 min      |

**Configuration :**

```yaml
name: Quality Checks

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-on-progress: true # Annule les runs précédents
```

### 2. Security Checks ([`.github/workflows/security.yml`](../.github/workflows/security.yml))

**Déclencheurs :**

- Push sur `main` ou `develop`
- Pull requests sur `main` ou `develop`
- **Planification quotidienne** (2h00 UTC)

**Jobs :**

| Job                | Description                  | Outil                     |
| ------------------ | ---------------------------- | ------------------------- |
| `dependency-audit` | Audit des dépendances        | npm audit + script custom |
| `codeql`           | Analyse statique de sécurité | GitHub CodeQL             |
| `csp-check`        | Vérification CSP et headers  | Script custom             |

**Planification :**

```yaml
on:
  schedule:
    - cron: '0 2 * * *' # Tous les jours à 2h00 UTC
```

### 3. Performance Tests ([`.github/workflows/performance.yml`](../.github/workflows/performance.yml))

**Déclencheurs :**

- Push sur `main` ou `develop`
- Pull requests sur `main` ou `develop`
- **Planification quotidienne** (2h00 UTC)

**Jobs :**

| Job             | Description            | Seuils                        |
| --------------- | ---------------------- | ----------------------------- |
| `lighthouse-ci` | Audits Lighthouse      | Performance > 80              |
| `bundle-size`   | Analyse taille bundle  | Voir `bundlesize.config.json` |
| `memory-tests`  | Tests de fuite mémoire | Pas de fuite détectée         |

### 4. Visual Regression ([`.github/workflows/visual.yml`](../.github/workflows/visual.yml))

**Déclencheurs :**

- Push sur `main` ou `develop` (si fichiers concernés)
- Pull requests sur `main` ou `develop` (si fichiers concernés)
- **Manuel** (avec option de mise à jour des baselines)

**Filtres de chemins :**

```yaml
on:
  push:
    paths:
      - 'src/**'
      - 'tests/regression/**'
      - '.storybook/**'
```

### 5. Code Quality Analysis ([`.github/workflows/code-quality.yml`](../.github/workflows/code-quality.yml))

**Jobs :**

| Job           | Description                        | Service externe |
| ------------- | ---------------------------------- | --------------- |
| `sonarcloud`  | Analyse qualité et couverture      | SonarCloud      |
| `codeclimate` | Analyse de complexité              | Code Climate    |
| `complexity`  | Analyse de complexité cyclomatique | Script custom   |

---

## ⏰ Quand les tests s'exécutent

### Tableau récapitulatif

| Type de test      | Push | PR   | Schedule   | Manuel |
| ----------------- | ---- | ---- | ---------- | ------ |
| Lint + Type Check | ✅   | ✅   | ❌         | ❌     |
| Unit Tests        | ✅   | ✅   | ❌         | ❌     |
| E2E Tests         | ✅   | ✅   | ❌         | ❌     |
| Security Audit    | ✅   | ✅   | ✅ (daily) | ❌     |
| CodeQL            | ✅   | ✅   | ❌         | ❌     |
| CSP Check         | ✅   | ✅   | ❌         | ❌     |
| Lighthouse        | ✅   | ✅   | ✅ (daily) | ❌     |
| Bundle Size       | ✅   | ✅   | ❌         | ❌     |
| Visual Regression | ✅\* | ✅\* | ❌         | ✅     |
| SonarCloud        | ❌   | ✅   | ❌         | ❌     |

\*Seulement si les fichiers concernés sont modifiés

### Optimisations

**Concurrency :**

```yaml
concurrency:
  group: ${{ github.workflow }}-${{ github.ref }}
  cancel-in-progress: true
```

Cela annule les runs précédents si un nouveau push arrive, économisant des ressources.

**Caching :**

```yaml
- uses: actions/setup-node@v4
  with:
    cache: 'npm' # Cache node_modules
```

---

## 📊 Interprétation des résultats

### Status checks

Dans une Pull Request, vous verrez :

```
✅ Quality Checks / Lint & Type Check (pass)
✅ Quality Checks / Unit Tests (pass)
✅ Quality Checks / E2E Tests (pass)
✅ Security Checks / Dependency Security Audit (pass)
✅ Performance Tests / Lighthouse CI Audit (pass)
```

### Rapports générés

#### 1. Couverture de code (Codecov)

Après les tests unitaires, le rapport est envoyé à Codecov :

```yaml
- uses: codecov/codecov-action@v3
  with:
    files: ./coverage/lcov.info
    flags: unittests
```

**Interprétation :**

- 🟢 **> 70%** : Couverture acceptable
- 🟡 **50-70%** : Couverture à améliorer
- 🔴 **< 50%** : Couverture insuffisante

#### 2. Rapport Playwright

Accessible via l'onglet "Summary" du workflow ou en téléchargeant l'artifact :

```
test-results/
├── playwright-report/
│   └── index.html       # Rapport HTML interactif
├── *.png                # Screenshots des échecs
└── *.webm               # Vidéos des échecs
```

Pour voir le rapport localement :

```bash
npx playwright show-report
```

#### 3. Lighthouse CI

Les résultats sont stockés dans `.lighthouseci/` :

```json
{
  "performance": 85,
  "accessibility": 95,
  "best-practices": 90,
  "seo": 100,
  "pwa": 80
}
```

#### 4. Security Audit

Rapport JSON généré : `security-audit-report.json`

```json
{
  "summary": {
    "high": 0,
    "moderate": 2,
    "low": 5
  },
  "vulnerabilities": [...]
}
```

### Analyse des échecs

#### Échec de tests unitaires

```
FAIL tests/unit/hooks/useAuth.test.ts > useAuth > should return user data
AssertionError: expected null to deeply equal { id: '123', ... }
```

**Actions :**

1. Vérifier le test localement : `npm run test -- useAuth`
2. Consulter le détail dans l'onglet "Annotations"
3. Vérifier si c'est un flaky test

#### Échec de tests E2E

```
Error: expect(received).toBeVisible()
Call log:
  - waiting for locator('text=Welcome')
  -   locator resolved to <div>Welcome</div>
  -   unexpected value "false"
```

**Actions :**

1. Télécharger l'artifact `playwright-report`
2. Ouvrir `index.html` dans un navigateur
3. Voir les screenshots et traces

#### Échec de Lighthouse

```
Assertion failed: Performance score (75) is below threshold (80)
```

**Actions :**

1. Consulter le rapport complet dans les artifacts
2. Identifier les métriques problématiques (LCP, FID, CLS)
3. Optimiser le code correspondant

---

## 🔧 Gestion des échecs

### Stratégies de retry

**Tests E2E :**

```typescript
// playwright.config.ts
export default defineConfig({
  retries: process.env.CI ? 2 : 0, // 2 retries en CI
});
```

**Tests unitaires :**

```bash
# Pas de retry par défaut, mais possibilité de relancer
npm run test -- --retry=2
```

### Tests flaky

Un test "flaky" passe parfois et échoue parfois. Pour les gérer :

1. **Identifier** : Consulter l'historique dans l'onglet "Actions"
2. **Stabiliser** : Ajouter des attentes explicites
3. **Quarantaine** : Déplacer dans un fichier séparé

```typescript
// tests/e2e/flaky/auth-flaky.spec.ts
test.describe('Flaky Auth Tests', () => {
  test.fixme('should handle race condition', async () => {
    // Test temporairement désactivé
  });
});
```

### Bypass temporaire

En cas d'urgence, il est possible de bypasser certains checks :

```bash
# Merge avec checks échoués (admin uniquement)
# Sur la PR : Settings > Merge button > Enable "Allow merge with failed checks"
```

⚠️ **À utiliser avec précaution et documenter la raison !**

### Notification des échecs

Configurez des notifications dans `.github/workflows/` :

```yaml
- name: Notify on failure
  if: failure()
  uses: slackapi/slack-github-action@v1
  with:
    payload: |
      {
        "text": "❌ Tests failed on ${{ github.ref }}"
      }
```

---

## ⚙️ Configuration locale vs CI

### Variables d'environnement

| Variable              | Local                   | CI                      |
| --------------------- | ----------------------- | ----------------------- |
| `CI`                  | undefined               | `true`                  |
| `NODE_ENV`            | `development`           | `production`            |
| `PLAYWRIGHT_BASE_URL` | `http://localhost:5173` | `http://localhost:4173` |

### Différences de comportement

**Timeouts :**

```typescript
// vitest.config.ts
testTimeout: process.env.CI ? 30000 : 10000;

// playwright.config.ts
timeout: process.env.CI ? 60000 : 30000;
```

**Workers :**

```typescript
// playwright.config.ts
workers: process.env.CI ? 1 : undefined; // 1 worker en CI pour stabilité
```

**Retries :**

```typescript
// playwright.config.ts
retries: process.env.CI ? 2 : 0;
```

### Simuler l'environnement CI localement

```bash
# Exporter la variable CI
export CI=true

# Lancer les tests comme en CI
npm run test:all
```

### Debugging des échecs CI

1. **Reproduire localement :**

   ```bash
   export CI=true
   npm run test:e2e
   ```

2. **Utiliser act pour tester localement :**

   ```bash
   # Installer act
   brew install act

   # Lancer un workflow
   act -j unit-tests
   ```

3. **Activer le mode debug :**
   ```yaml
   - name: Debug
     run: |
       echo "Current directory: $(pwd)"
       ls -la
       env
   ```

---

## 📈 Métriques et monitoring

### Dashboards recommandés

1. **GitHub Insights** > Actions
   - Temps d'exécution moyen
   - Taux de succès
   - Utilisation des minutes

2. **Codecov**
   - Évolution de la couverture
   - Diff de couverture sur les PR

3. **SonarCloud**
   - Dette technique
   - Bugs et vulnérabilités
   - Code smells

### Alertes

Configurez des alertes pour :

- Taux de succès < 90%
- Couverture < 70%
- Temps d'exécution > 30 min
- Nouvelles vulnérabilités critiques

---

## 🔒 Sécurité dans la CI

### Secrets utilisés

| Secret                   | Utilisation        |
| ------------------------ | ------------------ |
| `VITE_SUPABASE_URL`      | Build et tests E2E |
| `VITE_SUPABASE_ANON_KEY` | Build et tests E2E |
| `SONAR_TOKEN`            | Analyse SonarCloud |
| `LHCI_GITHUB_APP_TOKEN`  | Lighthouse CI      |
| `CHROMATIC_TOKEN`        | Tests visuels      |

### Bonnes pratiques

1. **Ne jamais** committer de secrets
2. Utiliser `secrets.*` dans les workflows
3. Rotater les secrets régulièrement
4. Auditer l'accès aux secrets

---

## 📚 Ressources

- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Playwright CI Guide](https://playwright.dev/docs/ci)
- [Vitest CI Guide](https://vitest.dev/guide/ci.html)
- [Lighthouse CI Configuration](https://github.com/GoogleChrome/lighthouse-ci/blob/main/docs/configuration.md)

---

<p align="center">
  Pour toute question sur la CI/CD, contacter l'équipe DevOps ou ouvrir une issue.
</p>
