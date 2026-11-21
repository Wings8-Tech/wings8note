# Tests de Factorisation et Analyse de Code

Ce dossier contient les tests et outils d'analyse de la qualité du code pour l'application Wings8note PWA.

## 📊 Métriques de Code

### Seuils Recommandés

| Métrique                        | Seuil | Description                          |
| ------------------------------- | ----- | ------------------------------------ |
| **Cyclomatic Complexity**       | < 10  | Complexité cyclomatique par fonction |
| **Cognitive Complexity**        | < 15  | Complexité cognitive par fonction    |
| **Duplication**                 | < 3%  | Pourcentage de code dupliqué         |
| **Lines of Code (par fichier)** | < 300 | Lignes de code par fichier           |
| **Maintainability Index**       | > 80  | Indice de maintenabilité             |
| **Technical Debt Ratio**        | < 5%  | Ratio de dette technique             |

## 🧪 Tests de Factorisation

### [`complexity.spec.ts`](complexity.spec.ts)

Tests de complexité du code :

- Complexité cyclomatique des fonctions
- Complexité cognitive
- Taille des fonctions (lignes)
- Nombre de paramètres
- Profondeur d'imbrication
- Indice de maintenabilité

```bash
npm run test:refactoring:complexity
```

### [`coupling.spec.ts`](coupling.spec.ts)

Tests de couplage entre modules :

- Nombre de dépendances par fichier
- Instabilité des modules (I = Ce / (Ca + Ce))
- Détection des "god modules"
- Détection des dépendances circulaires
- Respect des règles d'architecture (layers)

```bash
npm run test:refactoring:coupling
```

### [`cohesion.spec.ts`](cohesion.spec.ts)

Tests de cohésion des modules :

- Principe de responsabilité unique
- Nombre d'exports par fichier
- Cohésion des composants React
- Cohésion des hooks
- Cohésion des services
- Cohésion des utilitaires
- Cohérence des conventions de nommage

```bash
npm run test:refactoring:cohesion
```

### [`duplication.spec.ts`](duplication.spec.ts)

Tests de duplication de code :

- Pourcentage de duplication global
- Blocs de code dupliqués
- Fonctions identiques
- Patterns de code similaires
- Duplication de gestion d'erreurs
- Duplication de types
- Imports non utilisés

```bash
npm run test:refactoring:duplication
```

## 🔧 Scripts d'Analyse

### [`scripts/complexity-analysis.js`](../../scripts/complexity-analysis.js)

Analyse la complexité du code et génère des rapports HTML/JSON.

```bash
npm run analyze:complexity
```

**Fonctionnalités :**

- Analyse avec `typhonjs-escomplex`
- Calcul de la complexité cyclomatique
- Calcul de la complexité cognitive
- Indice de maintenabilité
- Rapport HTML détaillé

### [`scripts/duplication-check.js`](../../scripts/duplication-check.js)

Détecte la duplication de code avec `jscpd`.

```bash
npm run analyze:duplication
```

**Fonctionnalités :**

- Détection de clones
- Seuil configurable (3%)
- Rapports HTML, JSON, console
- Intégration git blame

### [`scripts/dependency-analysis.js`](../../scripts/dependency-analysis.js)

Analyse les dépendances entre modules.

```bash
npm run analyze:dependencies
```

**Fonctionnalités :**

- Graphe de dépendances
- Détection de cycles
- Calcul du couplage (Ca, Ce, Instabilité)
- Identification des layers
- Vérification des règles d'architecture

### [`scripts/code-metrics.js`](../../scripts/code-metrics.js)

Calcule les métriques de code complètes.

```bash
npm run analyze:metrics
```

**Fonctionnalités :**

- Lines of Code (LOC)
- Complexité cyclomatique
- Complexité cognitive
- Indice de maintenabilité
- Ratio de dette technique
- Ratio de commentaires

## 📈 Configuration des Outils

### SonarQube / SonarCloud

Configuration dans [`sonar-project.properties`](../../sonar-project.properties) :

```properties
sonar.projectKey=wings8note-pwa
sonar.projectName=Wings8note PWA
sonar.sources=src
sonar.tests=tests
sonar.typescript.lcov.reportPaths=coverage/lcov.info
```

**Seuils SonarCloud :**

- Coverage > 80%
- Duplication < 3%
- Critical issues = 0
- Major issues < 10

### Code Climate

Configuration dans [`.codeclimate.yml`](../../.codeclimate.yml) :

```yaml
checks:
  method-complexity:
    config:
      threshold: 10
  file-lines:
    config:
      threshold: 300
  similar-code:
    config:
      threshold: 50
```

### JSCPD (JavaScript Copy/Paste Detector)

Configuration dans [`.jscpd.json`](../../.jscpd.json) :

```json
{
  "threshold": 3,
  "minLines": 5,
  "minTokens": 50,
  "reporters": ["html", "console", "json"]
}
```

## 🔄 CI/CD Integration

Le workflow GitHub Actions [`.github/workflows/code-quality.yml`](../../.github/workflows/code-quality.yml) exécute automatiquement :

1. **SonarCloud Scan** - Analyse qualimétrique
2. **Code Climate** - Analyse alternative
3. **Complexity Check** - Analyse de complexité
4. **Duplication Check** - Détection de clones
5. **Dependency Analysis** - Analyse des dépendances
6. **Code Metrics** - Métriques complètes
7. **Refactoring Tests** - Tests de factorisation

## 📋 Checklist de Revue de Code

### Avant de soumettre une PR :

- [ ] Complexité cyclomatique < 10 par fonction
- [ ] Complexité cognitive < 15 par fonction
- [ ] Pas de duplication de code > 5 lignes
- [ ] Pas de dépendances circulaires
- [ ] Respect des règles d'architecture (layers)
- [ ] Tests de refactoring passent
- [ ] Couverture de tests > 80%

### Revue de Code :

- [ ] Le code suit le principe de responsabilité unique
- [ ] Les fonctions sont courtes et focalisées
- [ ] Les noms sont explicites et cohérents
- [ ] Pas de code mort ou commentaires obsolètes
- [ ] Les imports sont utilisés
- [ ] Pas de dépendances inutiles

## 🔍 Guide de Refactoring

### Quand Refactoriser ?

1. **Complexité élevée** : Fonction avec cyclomatic > 10
2. **Fonction longue** : Plus de 50 lignes
3. **Duplication** : Code copié plus de 2 fois
4. **God module** : Module avec > 10 dépendants
5. **Couplage élevé** : Instabilité > 0.7
6. **Cohésion faible** : Module avec responsabilités multiples

### Techniques de Refactoring

#### Extraire une Fonction

```typescript
// Avant
function processData(data: Data) {
  // 50 lignes de code...
}

// Après
function processData(data: Data) {
  const validated = validateData(data);
  const transformed = transformData(validated);
  return saveData(transformed);
}
```

#### Introduire un Paramètre Object

```typescript
// Avant
function createUser(name: string, email: string, age: number, address: string) {}

// Après
interface UserData {
  name: string;
  email: string;
  age: number;
  address: string;
}
function createUser(data: UserData) {}
```

#### Déplacer une Méthode

```typescript
// Déplacer une méthode vers la classe qui l'utilise le plus
class Order {
  calculateDiscount(customer: Customer) {
    return customer.getDiscount() * this.amount;
  }
}

// Après
class Customer {
  calculateDiscountFor(order: Order) {
    return this.getDiscount() * order.amount;
  }
}
```

## 📚 Ressources

- [Refactoring Guru](https://refactoring.guru/)
- [Clean Code - Robert C. Martin](https://www.amazon.com/Clean-Code-Handbook-Software-Craftsmanship/dp/0132350882)
- [SonarQube Documentation](https://docs.sonarqube.org/)
- [Code Climate Documentation](https://docs.codeclimate.com/)
- [JSCPD Documentation](https://github.com/kucherenko/jscpd)

## 🐛 Dépannage

### Erreurs Courantes

**"Complexity threshold exceeded"**

- Diviser les fonctions complexes en sous-fonctions
- Utiliser des stratégies pour remplacer les switch/case
- Extraire les conditions complexes en fonctions

**"Circular dependency detected"**

- Introduire une abstraction (interface)
- Déplacer le code partagé dans un module commun
- Utiliser l'injection de dépendances

**"Code duplication found"**

- Extraire le code commun dans une fonction utilitaire
- Utiliser des hooks personnalisés pour la logique partagée
- Créer des composants réutilisables

## 📞 Support

Pour toute question concernant l'analyse de code :

- Consulter les rapports générés dans `reports/`
- Vérifier la documentation des outils
- Ouvrir une issue sur le dépôt
