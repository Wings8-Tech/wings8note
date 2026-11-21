#!/usr/bin/env node

/**
 * Script de lancement interactif des tests
 *
 * Usage:
 *   node scripts/run-tests.js [options]
 *
 * Options:
 *   --type=<type>    Type de test à lancer (unit, integration, component, e2e, visual, performance, security, refactoring, all)
 *   --watch          Mode watch (pour les tests unitaires)
 *   --coverage       Avec rapport de couverture
 *   --ui             Mode UI (pour Playwright)
 *   --debug          Mode debug
 *   --update         Mettre à jour les snapshots
 *
 * Exemples:
 *   node scripts/run-tests.js --type=unit --watch
 *   node scripts/run-tests.js --type=e2e --ui
 *   node scripts/run-tests.js --type=all --coverage
 */

import { spawn } from 'node:child_process';
import readline from 'node:readline';
import process from 'node:process';

// Configuration des types de tests
const TEST_TYPES = {
  unit: {
    name: '🧪 Tests Unitaires',
    description: 'Tests rapides pour les fonctions, hooks et utilitaires',
    command: 'vitest',
    args: ['run', 'tests/unit/'],
    watchArgs: ['tests/unit/'],
    coverageArgs: ['run', '--coverage', 'tests/unit/'],
  },
  integration: {
    name: "🔗 Tests d'Intégration",
    description: 'Tests des interactions entre modules et API',
    command: 'vitest',
    args: ['run', 'tests/integration/'],
    watchArgs: ['tests/integration/'],
    coverageArgs: ['run', '--coverage', 'tests/integration/'],
  },
  component: {
    name: '🧩 Tests de Composants',
    description: 'Tests des composants React avec interactions',
    command: 'vitest',
    args: ['run', 'tests/components/'],
    watchArgs: ['tests/components/'],
    coverageArgs: ['run', '--coverage', 'tests/components/'],
  },
  e2e: {
    name: '🎭 Tests E2E',
    description: 'Tests de bout en bout avec Playwright',
    command: 'playwright',
    args: ['test', 'tests/e2e/'],
    uiArgs: ['test', '--ui', 'tests/e2e/'],
    debugArgs: ['test', '--debug', 'tests/e2e/'],
  },
  visual: {
    name: '📸 Tests Visuels',
    description: 'Tests de régression visuelle',
    command: 'playwright',
    args: ['test', 'tests/regression/visual.spec.ts'],
    updateArgs: ['test', '--update-snapshots', 'tests/regression/visual.spec.ts'],
  },
  performance: {
    name: '⚡ Tests de Performance',
    description: 'Tests Lighthouse et de performance',
    command: 'playwright',
    args: ['test', 'tests/performance/', '--project=chromium'],
    uiArgs: ['test', 'tests/performance/', '--ui'],
  },
  security: {
    name: '🔒 Tests de Sécurité',
    description: 'Tests XSS, CSP, injection, headers',
    command: 'playwright',
    args: ['test', 'tests/security/', '--project=chromium'],
    allArgs: null, // Commande spéciale
  },
  refactoring: {
    name: '📝 Tests de Refactoring',
    description: 'Analyse de complexité et duplication',
    command: 'vitest',
    args: ['run', 'tests/refactoring/'],
  },
  lint: {
    name: '🔍 Lint',
    description: 'Vérification ESLint',
    command: 'eslint',
    args: ['.', '--max-warnings=0'],
    fixArgs: ['.', '--fix'],
  },
  typecheck: {
    name: '📘 Type Check',
    description: 'Vérification TypeScript',
    command: 'tsc',
    args: ['--noEmit'],
  },
  format: {
    name: '✨ Format Check',
    description: 'Vérification Prettier',
    command: 'prettier',
    args: ['--check', '.'],
    fixArgs: ['--write', '.'],
  },
  all: {
    name: '🚀 Tous les Tests',
    description: 'Lance tous les tests qualité',
    command: null, // Commande spéciale
    args: [],
  },
};

// Couleurs pour le terminal
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
};

// Helper pour afficher avec couleurs
function color(colorName, text) {
  return `${colors[colorName]}${text}${colors.reset}`;
}

// Afficher le logo
function printBanner() {
  console.log(
    color(
      'cyan',
      `
╔══════════════════════════════════════════════════════════════╗
║                                                              ║
║           🧪 WINGS8NOTE TEST RUNNER 🧪                         ║
║                                                              ║
║   Infrastructure de tests complète pour Wings8Note PWA        ║
║                                                              ║
╚══════════════════════════════════════════════════════════════╝
`
    )
  );
}

// Afficher le menu interactif
function printMenu() {
  console.log(color('bright', '\n📋 Types de tests disponibles :\n'));

  const entries = Object.entries(TEST_TYPES);
  entries.forEach(([key, value], index) => {
    const num = color('yellow', `${index + 1}.`);
    const name = color('bright', value.name);
    const desc = color('dim', value.description);
    console.log(`${num} ${name}`);
    console.log(`   ${desc}\n`);
  });

  console.log(color('yellow', '0.'), color('bright', '❌ Quitter\n'));
}

// Parser les arguments de ligne de commande
function parseArgs() {
  const args = process.argv.slice(2);
  const options = {
    type: null,
    watch: false,
    coverage: false,
    ui: false,
    debug: false,
    update: false,
    fix: false,
  };

  args.forEach(arg => {
    if (arg.startsWith('--type=')) {
      options.type = arg.split('=')[1];
    } else if (arg === '--watch' || arg === '-w') {
      options.watch = true;
    } else if (arg === '--coverage' || arg === '-c') {
      options.coverage = true;
    } else if (arg === '--ui' || arg === '-u') {
      options.ui = true;
    } else if (arg === '--debug' || arg === '-d') {
      options.debug = true;
    } else if (arg === '--update') {
      options.update = true;
    } else if (arg === '--fix' || arg === '-f') {
      options.fix = true;
    } else if (arg === '--help' || arg === '-h') {
      printHelp();
      process.exit(0);
    }
  });

  return options;
}

// Afficher l'aide
function printHelp() {
  console.log(color('bright', '\n📖 Usage :\n'));
  console.log('  node scripts/run-tests.js [options]\n');
  console.log(color('bright', 'Options :\n'));
  console.log(
    '  --type=<type>    Type de test (unit, integration, component, e2e, visual, performance, security, refactoring, all)'
  );
  console.log('  --watch, -w      Mode watch');
  console.log('  --coverage, -c   Avec rapport de couverture');
  console.log('  --ui, -u         Mode UI (Playwright)');
  console.log('  --debug, -d      Mode debug');
  console.log('  --update         Mettre à jour les snapshots');
  console.log('  --fix, -f        Auto-fix (lint/format)');
  console.log('  --help, -h       Afficher cette aide\n');
  console.log(color('bright', 'Exemples :\n'));
  console.log('  node scripts/run-tests.js --type=unit --watch');
  console.log('  node scripts/run-tests.js --type=e2e --ui');
  console.log('  node scripts/run-tests.js --type=all --coverage');
  console.log('  node scripts/run-tests.js --type=lint --fix\n');
}

// Exécuter une commande
function runCommand(command, args, options = {}) {
  return new Promise((resolve, reject) => {
    const { cwd = process.cwd(), env = process.env } = options;

    console.log(color('dim', `\n> ${command} ${args.join(' ')}\n`));

    const child = spawn(command, args, { // NOSONAR
      cwd,
      env,
      stdio: 'inherit',
      shell: true,
    });

    child.on('close', code => {
      if (code === 0) {
        resolve(code);
      } else {
        reject(new Error(`Command failed with code ${code}`));
      }
    });

    child.on('error', err => {
      reject(err);
    });
  });
}

// Lancer les tests de sécurité complets
async function runSecurityTests(options) {
  console.log(color('cyan', '\n🔒 Lancement des tests de sécurité complets...\n'));

  try {
    // Audit des dépendances
    console.log(color('yellow', '\n📦 1. Audit des dépendances...\n'));
    await runCommand('npm', ['audit', '--audit-level=moderate']);

    // Audit de sécurité custom
    console.log(color('yellow', '\n🔍 2. Audit de sécurité custom...\n'));
    await runCommand('node', ['scripts/security-audit.js']);

    // Vérification CSP
    console.log(color('yellow', '\n🛡️ 3. Vérification CSP...\n'));
    await runCommand('node', ['scripts/csp-check.js']);

    // Tests Playwright de sécurité
    console.log(color('yellow', '\n🧪 4. Tests Playwright de sécurité...\n'));
    await runCommand('npx', ['playwright', 'test', 'tests/security/', '--project=chromium']);

    console.log(color('green', '\n✅ Tous les tests de sécurité ont passé !\n'));
  } catch (error) {
    console.log(color('red', '\n❌ Certains tests de sécurité ont échoué.\n'));
    throw error;
  }
}

// Lancer tous les tests
async function runAllTests(options) {
  console.log(color('cyan', '\n🚀 Lancement de tous les tests...\n'));

  const steps = [
    { name: 'Type Check', fn: () => runType('typecheck', options) },
    { name: 'Lint', fn: () => runType('lint', options) },
    { name: 'Format Check', fn: () => runType('format', options) },
    { name: 'Unit Tests', fn: () => runType('unit', { ...options, coverage: true }) },
    { name: 'Integration Tests', fn: () => runType('integration', options) },
    { name: 'Component Tests', fn: () => runType('component', options) },
  ];

  let hasErrors = false;

  for (const step of steps) {
    console.log(color('yellow', `\n▶️  ${step.name}...\n`));
    try {
      await step.fn();
      console.log(color('green', `✅ ${step.name} passé`));
    } catch {
      console.log(color('red', `❌ ${step.name} échoué`));
      hasErrors = true;
    }
  }

  if (hasErrors) {
    console.log(color('red', '\n❌ Certains tests ont échoué.\n'));
    process.exit(1);
  } else {
    console.log(color('green', '\n✅ Tous les tests ont passé !\n'));
  }
}

// Lancer un type de test spécifique
async function runType(type, options) {
  const testConfig = TEST_TYPES[type];

  if (!testConfig) {
    console.error(color('red', `\n❌ Type de test inconnu : ${type}\n`));
    console.log(color('yellow', 'Types disponibles :'), Object.keys(TEST_TYPES).join(', '));
    process.exit(1);
  }

  // Cas spéciaux
  if (type === 'all') {
    return runAllTests(options);
  }

  if (type === 'security' && !options.type) {
    return runSecurityTests(options);
  }

  console.log(color('cyan', `\n${testConfig.name}`));
  console.log(color('dim', `${testConfig.description}\n`));

  let command = testConfig.command;

  // Resolve args based on options
  const optionToArgs = {
    watch: 'watchArgs',
    coverage: 'coverageArgs',
    ui: 'uiArgs',
    debug: 'debugArgs',
    update: 'updateArgs',
    fix: 'fixArgs',
  };
  let args = [...testConfig.args];
  for (const [opt, argsKey] of Object.entries(optionToArgs)) {
    if (options[opt] && testConfig[argsKey]) {
      args = [...testConfig[argsKey]];
      break;
    }
  }

  // Utiliser npx pour les commandes npm
  if (['vitest', 'playwright', 'eslint', 'tsc', 'prettier'].includes(command)) {
    command = 'npx';
    args = [testConfig.command, ...args];
  }

  try {
    await runCommand(command, args);
    console.log(color('green', `\n✅ ${testConfig.name} terminé avec succès !\n`));
  } catch (error) {
    console.log(color('red', `\n❌ ${testConfig.name} a échoué.\n`));
    throw error;
  }
}

// Mode interactif
async function interactiveMode() {
  printBanner();
  printMenu();

  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  const askQuestion = query => new Promise(resolve => rl.question(query, resolve));

  try {
    const answer = await askQuestion(color('cyan', 'Choisissez un type de test (0-11) : '));
    const choice = Number.parseInt(answer.trim());

    if (choice === 0) {
      console.log(color('yellow', '\n👋 Au revoir !\n'));
      rl.close();
      process.exit(0);
    }

    const types = Object.keys(TEST_TYPES);
    if (choice < 1 || choice > types.length) {
      console.log(color('red', '\n❌ Choix invalide.\n'));
      rl.close();
      process.exit(1);
    }

    const selectedType = types[choice - 1];

    // Options supplémentaires pour certains types
    const options = {};

    if (['unit', 'integration', 'component'].includes(selectedType)) {
      const watchAnswer = await askQuestion(color('cyan', 'Mode watch ? (o/n) : '));
      options.watch = watchAnswer.toLowerCase() === 'o';

      if (!options.watch) {
        const coverageAnswer = await askQuestion(color('cyan', 'Avec couverture ? (o/n) : '));
        options.coverage = coverageAnswer.toLowerCase() === 'o';
      }
    }

    if (['e2e', 'performance'].includes(selectedType)) {
      const uiAnswer = await askQuestion(color('cyan', 'Mode UI ? (o/n) : '));
      options.ui = uiAnswer.toLowerCase() === 'o';
    }

    rl.close();

    await runType(selectedType, options);
  } catch (error) {
    console.error(color('red', '\n❌ Erreur :'), error.message);
    rl.close();
    process.exit(1);
  }
}

// Fonction principale
async function main() {
  const options = parseArgs();

  // Si un type est spécifié en ligne de commande
  if (options.type) {
    try {
      await runType(options.type, options);
      process.exit(0);
    } catch {
      process.exit(1);
    }
  } else {
    // Mode interactif
    await interactiveMode();
  }
}

// Lancer le script
await main().catch(error => {
  console.error(color('red', '\n❌ Erreur fatale :'), error);
  process.exit(1);
});
