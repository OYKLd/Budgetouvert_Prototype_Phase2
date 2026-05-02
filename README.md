# BudgetOuvert - Prototype Phase 2

## Description

BudgetOuvert est une solution de transparence budgétaire blockchain pour les communes ivoiriennes. Cette plateforme permet aux agents comptables de saisir les transactions financières municipales qui sont ensuite gravées de manière permanente et vérifiable sur la blockchain Polygon Amoy Testnet.

### Objectif

Rendre la gestion budgétaire des communes 100% transparente et accessible aux citoyens grâce à la technologie blockchain.

## Technologies Utilisées

- **Frontend** : HTML5, CSS3, JavaScript (ES6+)
- **Blockchain** : Polygon Amoy Testnet
- **Smart Contract** : Solidity (déployé sur Polygon)
- **Web3** : Ethers.js v6.7.0
- **Charts** : Chart.js v4.4.0
- **Wallet** : MetaMask integration
- **Design** : UI moderne avec animations CSS

## Fonctionnalités Principales

### Interface Agent Comptable
- **Saisie de transactions** : Dépenses et recettes avec descriptions détaillées
- **Catégorisation** : Infrastructure, Éducation, Santé, Administration, Marchés
- **Validation blockchain** : Signature et gravure immédiate sur Polygon
- **Suivi en temps réel** : Statut des transactions et numéros de bloc

### Dashboard Citoyen
- **Indicateurs KPI** : Budget voté, dépenses engagées, recettes perçues
- **Progression budgétaire** : Visualisation de l'exécution du budget
- **Graphiques analytiques** : Évolution mensuelle et répartition par catégorie
- **Historique filtrable** : Toutes les transactions avec filtres dynamiques

### Transparence Blockchain
- **Hash de transaction** : Lien direct vers Polygonscan
- **Vérification publique** : N'importe qui peut vérifier l'authenticité
- **Immutabilité** : Données impossibles à modifier une fois gravées

## Installation et Utilisation

### Prérequis
- Navigateur web moderne (Chrome, Firefox, Safari, Edge)
- MetaMask

### Installation Locale

1. **Cloner le dépôt**
   ```bash
   git clone https://github.com/OYKLd/Budgetouvert_Prototype_Phase2.git
   cd Budgetouvert_Prototype_Phase2
   ```

2. **Lancer l'application**
   ```bash
   # Ouvrir index.html dans le navigateur
   # Ou utiliser un serveur local
   python -m http.server 8000
   # Puis accéder à http://localhost:8000
   ```

### Utilisation

1. Installer MetaMask sur votre navigateur
2. Ajouter le réseau Polygon Amoy Testnet :
   - **Nom** : Polygon Amoy Testnet
   - **Chain ID** : 80002 (0x13882)
   - **RPC URL** : https://rpc-amoy.polygon.technology/
3. Obtenir des tokens MATIC testnet depuis un faucet
4. Cliquer sur "Connecter MetaMask"
5. Signer les transactions pour les graver sur la blockchain

## Architecture Technique

### Structure des Fichiers
```
Budgetouvert_Prototype_Phase2/
├── index.html          # Interface principale
├── styles.css          # Styles et animations
├── script.js           # Logique JavaScript
└── README.md           # Documentation
```

### Flux de Données
1. **Saisie** → Formulaire agent comptable
2. **Validation** → Signature MetaMask et vérification blockchain
3. **Gravure** → Smart Contract Polygon Amoy
4. **Affichage** → Dashboard citoyen en temps réel

### Smart Contract
```solidity
// Interface simplifiée
interface BudgetContract {
    function enregistrer(string memory data) public;
    event TransactionEnregistree(address sender, string data, uint256 timestamp);
}
```

## Déploiement

### Version Démo
- **URL** : https://oykld.github.io/Budgetouvert_Prototype_Phase2/
- **Accès** : Public et anonyme

### Réseau Blockchain
- **Testnet** : Polygon Amoy (Chain ID: 80002)
- **Contract** : 0x...
- **Explorer** : https://amoy.polygonscan.com/

## Communes Supportées (Prototype)

- **Abobo** : Budget 4,2 milliards FCFA
- **Yopougon** : Budget 6,8 milliards FCFA  
- **Bouaké** : Budget 3,1 milliards FCFA
- **Yamoussoukro** : Budget 2,4 milliards FCFA
- **Cocody** : Budget 5,5 milliards FCFA

## Configuration Avancée

### Variables d'Environnement
```javascript
// script.js - Configuration principale
const CONTRACT_ADDRESS = "0x...";
const POLYGON_AMOY_CHAIN_ID = 80002;
const RPC_URL = "https://rpc-amoy.polygon.technology/";
```

### Personnalisation
- **Communes** : Modifier l'objet `COMMUNES` dans `script.js`
- **Catégories** : Adapter le tableau `CATEGORIES`
- **Styles** : Personnaliser les variables CSS dans `styles.css`

## Dépannage

### Problèmes Communs
1. **MetaMask non détecté** : Installer l'extension MetaMask
2. **Réseau incorrect** : Ajouter manuellement Polygon Amoy Testnet
3. **Tokens insuffisants** : Utiliser un faucet MATIC testnet
4. **Transaction échouée** : Vérifier la connexion et le solde

## Contribuer

### Pour les Développeurs
1. Fork du projet
2. Créer une branche de fonctionnalité
3. Soumettre une Pull Request

### Améliorations Possibles
- Ajout de nouvelles communes
- Export PDF des rapports
- Mobile app native
- Intégration avec les systèmes comptables réels

## Licence

Ce projet est un prototype de démonstration. Code source disponible sous licence MIT.

## Contact

- **Dépôt** : https://github.com/OYKLd/Budgetouvert_Prototype_Phase2
- **Démo** : https://oykld.github.io/Budgetouvert_Prototype_Phase2/
- **Issues** : Signaler les problèmes sur GitHub

---

Note : Ce prototype utilise le testnet Polygon Amoy pour les démonstrations. Pour une production réelle, une migration vers le mainnet Polygon serait nécessaire avec des considérations de sécurité supplémentaires.
