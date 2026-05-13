# 🧠 Tamenly - Flask Version (Clinical Support V3.1)

Cette version de Tamenly est implémentée avec **Flask (Python)**. Elle partage la même base de données MySQL et le même frontend que la version Node.js.

## 🚀 Installation & Démarrage (Flask)

### 1️⃣ Prérequis
- **Python 3.9+**
- **pip** (Gestionnaire de paquets Python)
- **MySQL** (v8.0+)

### 2️⃣ Création de l'Environnement Virtuel
```bash
# Aller dans le dossier du projet
cd tamenly-flask

# Créer un environnement virtuel
python -m venv venv

# Activer l'environnement
# Sur Windows :
venv\Scripts\activate
# Sur Linux/Mac :
source venv/bin/activate
```

### 3️⃣ Installation des Dépendances
```bash
pip install -r requirements.txt
```

### 4️⃣ Configuration
Le fichier `.env` a déjà été pré-configuré avec les accès de production. Modifiez-le si nécessaire pour votre environnement local.

### 5️⃣ Lancement du Serveur
```bash
python app.py
```

Le serveur sera accessible sur `http://localhost:3001` (par défaut).

---

## 🛠️ Structure du Projet
- `app.py` : Point d'entrée principal et configuration.
- `db.py` : Gestion du pool de connexions MySQL.
- `blueprints/` : Logique modulaire pour les différentes API (Auth, Connections, Prescriptions, etc.).
- `static/` : Contient l'interface frontend (HTML/JS/CSS).

---

**Tamenly** - *Votre bien-être mental, notre priorité* 💜
