# Index de la Documentation des Tests

Ce fichier sert de point d'entrée centralisé pour toute la documentation des tests de Wings8Note.

---

## 📚 Documentation principale

| Document                               | Description                                          | Public cible               |
| -------------------------------------- | ---------------------------------------------------- | -------------------------- |
| **[README.md](README.md)**             | Vue d'ensemble complète de l'infrastructure de tests | Tous les développeurs      |
| **[CONTRIBUTING.md](CONTRIBUTING.md)** | Guide pour écrire des tests (conventions, exemples)  | Contributeurs              |
| **[DEBUGGING.md](DEBUGGING.md)**       | Guide de débogage des tests                          | Développeurs en difficulté |
| **[CI_CD.md](CI_CD.md)**               | Documentation CI/CD et workflows                     | DevOps, Lead Dev           |

---

## 🗂️ Structure du dossier tests/

```
tests/
├── README.md              # Documentation principale
├── CONTRIBUTING.md        # Guide de contribution
├── DEBUGGING.md          # Guide de débogage
├── CI_CD.md              # Guide CI/CD
├── INDEX.md              # Ce fichier
├── config.ts             # Configuration globale
├── setup.ts              # Setup Vitest
│
├── __mocks__/            # Mocks globaux
│   ├── fileMock.ts
│   ├── localStorage.ts
│   ├── mistral.ts
│   ├── styleMock.ts
│   └── supabase.ts
│
├── utils/                # Utilitaires de test
│   └── test-utils.tsx    # Helpers React Testing Library
│
├── unit/                 # Tests unitaires (50+ tests)
│   ├── hooks/            # Tests des hooks React
│   ├── lib/              # Tests des utilitaires
│   ├── services/         # Tests des services
│   └── types/            # Tests des types
│
├── integration/          # Tests d'intégration (30+ tests)
│   ├── api/              # Tests des API externes
│   ├── mocks/            # Handlers MSW
│   ├── storage/          # Tests de stockage
│   ├── supabase/         # Tests Supabase
│   └── sync/             # Tests de synchronisation
│
├── components/           # Tests de composants (25+ tests)
│   ├── ai/               # Composants IA
│   ├── auth/             # Composants d'authentification
│   ├── command/          # Palette de commandes
│   ├── editor/           # Éditeur Markdown
│   └── layout/           # Layout (Sidebar, Navigation, StatusBar)
│
├── e2e/                  # Tests E2E (40+ tests)
│   ├── fixtures/         # Fixtures Playwright
│   ├── page-objects/     # Pattern Page Object
│   ├── *.spec.ts         # Fichiers de test E2E
│   ├── ai.spec.ts
│   ├── auth.spec.ts
│   ├── command-palette.spec.ts
│   ├── editor.spec.ts
│   ├── graph.spec.ts
│   ├── notes.spec.ts
│   ├── offline.spec.ts
│   └── responsive.spec.ts
│
├── security/             # Tests de sécurité (100+ tests)
│   ├── README.md         # Documentation sécurité
│   ├── auth.spec.ts
│   ├── csp.spec.ts
│   ├── headers.spec.ts
│   ├── injection.spec.ts
│   ├── sanitization.spec.ts
│   ├── storage.spec.ts
│   └── xss.spec.ts
│
├── performance/          # Tests de performance (20+ tests)
│   ├── README.md         # Documentation performance
│   ├── bundle.spec.ts
│   ├── interaction.spec.ts
│   ├── lighthouse.spec.ts
│   ├── memory.spec.ts
│   ├── performance.test.tsx
│   └── rendering.spec.ts
│
├── refactoring/          # Tests de refactoring (15+ tests)
│   ├── README.md         # Documentation refactoring
│   ├── cohesion.spec.ts
│   ├── complexity.spec.ts
│   ├── coupling.spec.ts
│   └── duplication.spec.ts
│
└── regression/           # Tests de régression visuelle
    ├── README.md         # Documentation régression
    ├── regression.test.tsx
    └── visual.spec.ts
```

---

## 🎯 Par où commencer ?

### Je suis nouveau sur le projet

1. Lire **[README.md](README.md)** pour comprendre l'architecture
2. Consulter **[CONTRIBUTING.md](CONTRIBUTING.md)** pour les conventions
3. Exécuter `npm run test` pour vérifier que tout fonctionne

### Je veux écrire un nouveau test

1. Identifier le type de test approprié (voir [README.md#types-de-tests](README.md#types-de-tests))
2. Consulter **[CONTRIBUTING.md](CONTRIBUTING.md)** pour les conventions
3. Utiliser `node scripts/run-tests.js` pour lancer les tests

### J'ai un test qui échoue

1. Consulter **[DEBUGGING.md](DEBUGGING.md)** pour les techniques de débogage
2. Vérifier les logs dans `playwright-report/` ou `coverage/`
3. Essayer en mode debug : `npm run test:e2e:debug`

### Je configure la CI/CD

1. Consulter **[CI_CD.md](CI_CD.md)** pour les workflows
2. Vérifier les variables d'environnement nécessaires
3. Tester localement avec `CI=true npm run test:all`

---

## 📊 Statistiques

| Métrique                 | Valeur         |
| ------------------------ | -------------- |
| **Tests unitaires**      | 50+            |
| **Tests d'intégration**  | 30+            |
| **Tests de composants**  | 25+            |
| **Tests E2E**            | 40+            |
| **Tests de sécurité**    | 100+           |
| **Tests de performance** | 20+            |
| **Tests de refactoring** | 15+            |
| **Total**                | **280+ tests** |

### Couverture de code

| Type       | Seuil | Statut |
| ---------- | ----- | ------ |
| Statements | 70%   | 🟢     |
| Branches   | 60%   | 🟢     |
| Functions  | 70%   | 🟢     |
| Lines      | 70%   | 🟢     |

---

## 🔧 Configuration

### Fichiers de configuration

| Fichier                                           | Description                     |
| ------------------------------------------------- | ------------------------------- |
| [`vitest.config.ts`](../vitest.config.ts)         | Configuration Vitest            |
| [`playwright.config.ts`](../playwright.config.ts) | Configuration Playwright        |
| [`tests/config.ts`](config.ts)                    | Configuration globale des tests |
| [`tests/setup.ts`](setup.ts)                      | Setup global Vitest             |

### Variables d'environnement

| Variable              | Description                   | Défaut                  |
| --------------------- | ----------------------------- | ----------------------- |
| `CI`                  | Mode CI (timeouts plus longs) | `false`                 |
| `DEBUG`               | Mode debug                    | `false`                 |
| `VERBOSE`             | Mode verbose                  | `false`                 |
| `PLAYWRIGHT_BASE_URL` | URL de base pour E2E          | `http://localhost:5173` |

---

## 🚀 Commandes rapides

```bash
# Lancer le script interactif
node scripts/run-tests.js

# Tests unitaires
npm run test
npm run test:watch
npm run test:coverage

# Tests E2E
npm run test:e2e
npm run test:e2e:ui
npm run test:e2e:debug

# Tests spécifiques
npm run test:visual
npm run test:performance
npm run test:security
npm run test:refactoring

# Tous les tests
npm run test:all
```

---

## 📞 Support

- **Documentation** : Consulter les fichiers `.md` dans ce dossier
- **Débogage** : Voir [DEBUGGING.md](DEBUGGING.md)
- **Questions** : Ouvrir une issue sur GitHub
- **Contribution** : Voir [CONTRIBUTING.md](CONTRIBUTING.md)

---

## 📝 Notes

- Cette documentation est maintenue à jour avec le code
- Les exemples de code sont testés et fonctionnels
- Pour toute suggestion d'amélioration, ouvrir une PR

---

<p align="center">
  <strong>Wings8Note Testing Infrastructure</strong><br>
  Fait avec ❤️ par <a href="https://www.wings8.org/">Wings8 Technology</a>
</p>
