# 🧠 Tamenly - Plateforme de Psychologie Clinical Support (V3.1)

Tamenly (طمئن) est une plateforme de gestion et de consultation psychologique premium, spécialisée dans les approches **TCC (Cognitive Behavioral)**, **Dynamique de l'Attachement** et **Équilibre Systémique**. Elle est optimisée pour une communication sécurisée via WhatsApp et une gestion clinique rigoureuse.

## 🌟 Nouvelles Fonctionnalités & Améliorations (V3.1)

### 🏥 Approche Clinique Spécialisée
- **Intervention Cognitivo-Comportementale (CBT)** : Séances axées sur la résilience et les stratégies d'adaptation.
- **Dynamique de l'Attachement** : Analyse des liens émotionnels et traitement de la rigidité relationnelle.
- **Équilibre et Régulation Systémique** : Travail sur les frontières familiales et la correction des rôles au sein du système.

### 📋 Gestion Avancée des Ordonnances
- **Ordre Clinique Optimisé** : Les ordonnances suivent désormais un flux logique : **Exercices 🏃** -> **PDF 📄** -> **Médicaments 💊**.
- **Générateur PDF Premium** : Création d'ordonnances professionnelles avec signatures et tampons numériques.
- **Consignes Localisées** : Messages d'invitation WhatsApp traduits automatiquement en Arabe, Français ou Anglais.

### 💎 Design & Expérience Utilisateur
- **Icônes Cliniques Premium** : Intégration de FontAwesome Pro pour une apparence médicale haut de gamme.
- **Support Multilingue Complet** : Arabe (RTL), Français et Anglais avec détection automatique.

---

## 🚀 Installation & Démarrage Rapide

Suivez ces étapes pour installer et lancer le projet sur votre environnement local ou serveur :

### 1️⃣ Prérequis
- **Node.js** (v18.x recommandé)
- **MySQL** (v8.0+)
- **Git**

### 2️⃣ Clonage & Installation
```bash
# Cloner le dépôt
git clone https://github.com/yassinekadrii/tamenly.git
cd tamenly

# Installer les dépendances
npm install
```

### 3️⃣ Configuration de la Base de Données
1. Créez une base de données MySQL nommée `xwqgvsdy_tummin_db` (ou votre nom local).
2. Importez le schéma initial :
```bash
mysql -u votre_user -p xwqgvsdy_tummin_db < db/schema.sql
```

### 4️⃣ Configuration des Variables d'Environnement
Créez un fichier `.env` à la racine et configurez vos accès (voir `.env.example` ou utilisez les valeurs fournies pour la production) :
```env
PORT=3001
MYSQL_HOST=127.0.0.1
MYSQL_USER=votre_user
MYSQL_PASS=votre_password
MYSQL_DB=xwqgvsdy_tummin_db
JWT_SECRET=votre_secret_key
```

### 5️⃣ Lancement de l'Application
```bash
# Lancer en mode production
node server.js

# OU lancer en mode développement (avec redémarrage automatique)
npm run dev
```

### 6️⃣ Initialisation des Comptes
Pour créer l'administrateur et les comptes de test par défaut :
```bash
node scripts/seedAdmin.js
```

---

## 🛡️ Architecture & Sécurité
- **Backend** : Node.js / Express avec protection Helmet et Rate-limiting.
- **Base de données** : MySQL optimisé pour les hébergements mutualisés et cPanel.
- **Authentification** : JWT (JSON Web Tokens) sécurisés pour les rôles Docteur, Patient et Admin.

---

**Tamenly** - *Votre bien-être mental, notre priorité* 💜

*Propulsé par Antigravity AI | Yassine Kadri (Protium Agency)*
