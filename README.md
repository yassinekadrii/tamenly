# PsyConnect - Plateforme de Psychologie (V3.0)

PsyConnect est une plateforme de gestion et de consultation psychologique moderne, optimisée pour une communication fluide via WhatsApp et une gestion rigoureuse des prescriptions médicales.

## 🌟 Nouvelles Fonctionnalités (V3.0)

### 📞 Communication Intégrée (WhatsApp)
- **Contact Direct** : Redirection instantanée vers WhatsApp pour le chat et les appels vidéo/audio.
- **Bouton WhatsApp en Chat** : Les patients et médecins peuvent basculer vers WhatsApp d'un simple clic depuis l'interface de discussion.
- **Google Meet (Optionnel)** : Support pour la génération de liens de réunion externes (Meet/Zoom).

### 📋 Gestion des Ordonnances
- **Générateur PDF** : Création d'ordonnances professionnelles incluant médicaments, exercices thérapeutiques et consignes.
- **Pièces Jointes** : Possibilité d'attacher des fichiers PDF externes aux ordonnances.
- **Consultation Patient** : Espace dédié permettant aux patients de visualiser, télécharger et imprimer leurs ordonnances.

### 🌍 Internationalisation (i18n)
- **Support Multilingue** : Interface disponible en **Français**, **Anglais** et **Arabe**.
- **Support RTL** : Mise en page adaptée dynamiquement pour l'arabe (Right-to-Left).

### 🛡️ Sécurité & Performance
- **Polling Database** : Transition vers un modèle de synchronisation basé sur le polling (10s). Ce choix technique permet d'éliminer les coûts élevés liés à la maintenance de serveurs WebSocket/WebRTC dédiés, tout en garantissant une compatibilité totale avec les hébergements mutualisés standards.
- **WhatsApp Integration** : Utilisation de l'infrastructure WhatsApp pour les appels et le chat instantané afin de réduire la complexité et les coûts d'infrastructure serveur.
- **Protection des Données** : Authentification JWT, hachage Bcrypt et protection contre les injections SQL.

---

## ⚠️ Note sur l'Hébergement & Production

Le projet actuel constitue le **socle fonctionnel de base** de la plateforme. Pour un lancement en production complet, il est recommandé de :
- **Hébergement Dédié** : Passer à un environnement **VPS ou Cloud** (AWS, DigitalOcean, Azure) pour une meilleure scalabilité.
- **Séparation des Services** : Héberger séparément la base de données (MySQL managé), l'API (Node.js) et le frontend (Static storage/CDN) pour optimiser les performances et la sécurité.
- **SSL/TLS** : Assurer une configuration HTTPS complète sur tous les points d'accès.

---

## 🚀 Installation & Démarrage

### Prérequis
- Node.js (v14+)
- MySQL (v8.0+)

### Commandes
```bash
npm install
npm run dev
```

---

**PsyConnect** - Votre bien-être mental, notre priorité 💜

---
*Made with ❤️ by **Yassine Kadri***
