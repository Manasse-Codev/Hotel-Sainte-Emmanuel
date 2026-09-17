# Hôtel Sainte Emmanuelle — Application Web & Plateforme de Gestion

Application web complète pour le prestigieux **Hôtel Sainte Emmanuelle**, alliant l'esthétique luxueuse de la maquette Stitch et une architecture technique réactive connectée à une base de données réelle.

---

## 🏛️ Architecture du Projet

Le projet est divisé en deux parties complémentaires :

1. **Frontend (React + Vite)**
   - Réplique exacte au pixel près de la maquette Stitch (typographies Bodoni Moda / Plus Jakarta Sans, palette terracotta/or/ardoise, micro-animations, glassmorphism).
   - Navigation fluide : Site public vitrine, tunnel de réservation avec vérification de disponibilité en temps réel et préservation du contexte sans perte de données, Espace Client modal (8 onglets connectés), et Espace d'Administration dédié (`/admin`).
   - Authentification JWT avec gestion des rôles (`client` / `admin`).

2. **Backend (Python FastAPI + SQLAlchemy + SQLite)**
   - API REST structurée et documentée (Swagger UI).
   - Base de données relationnelle SQLite autonome (`backend/hotel.db`).
   - Sécurité : hachage de mots de passe bcrypt, tokens JWT sécurisés, protection RBAC.
   - Validation stricte des réservations avec détection préventive des chevauchements de dates.

---

## 🚀 Démarrage Rapide

### 1. Prérequis
- **Node.js** (v18+)
- **Python** (v3.10+) ou gestionnaire `uv`

---

### 2. Lancer le Backend (FastAPI + SQLite)

```bash
cd backend

# 1. Créer l'environnement virtuel (avec python venv ou uv)
python -m venv .venv
source .venv/bin/activate

# 2. Installer les dépendances
pip install -r requirements.txt

# 3. Démarrer le serveur API FastAPI (initialise automatiquement hotel.db et les seeds)
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```

- **API REST** : [http://127.0.0.1:8000](http://127.0.0.1:8000)
- **Swagger Documentation** : [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **Base de données SQLite** : `backend/hotel.db`

---

### 3. Lancer le Frontend (React + Vite)

Dans un second terminal :

```bash
# À la racine du projet
npm install
npm run dev
```

- **Application Web** : [http://localhost:5173/](http://localhost:5173/)
- **Espace Administrateur** : [http://localhost:5173/admin](http://localhost:5173/admin)

---

## 🔐 Identifiants de Démonstration (Seeds)

| Rôle | Adresse Email | Mot de passe | Accès |
|---|---|---|---|
| **Administrateur** | `admin@hotel-sainte-emmanuelle.ci` | `admin1234` | Espace Admin (`/admin`), modération, KPIs, réservations, chambres, journal, paramètres |
| **Client Démo** | `client@hotel-sainte-emmanuelle.ci` | `client1234` | Site public, réservations en direct, 8 onglets de l'Espace Client |

*Note : Vous pouvez également créer un nouveau compte client à tout moment via le bouton **"Espace Client" -> "Créer un compte"**.*

---

## 🧪 Tests et Validation E2E

Un script de test automatisé complet vérifie l'ensemble du cycle de vie des données (création de compte, calcul de disponibilité, collision de dates, enregistrement de paiement, modération d'avis, KPIs admin, et permissions RBAC) :

```bash
backend/.venv/bin/python backend/test_e2e_flow.py
```

Résultat attendu :
```
=== STARTING FULL E2E VALIDATION ===
✓ 1. Backend health check passed
✓ 2. Public rooms retrieved
✓ 3. Public reviews retrieved
✓ 4. Client registered successfully
✓ 5. Client /me profile retrieved
✓ 6. Room availability check passed
✓ 7. Reservation created successfully
✓ 8. Availability overlap detection confirmed
✓ 9. Client Space tabs verified (Reservations, Notifications, Activities)
✓ 10. Client payment recorded and validated
✓ 11. Client review submitted for moderation
✓ 12. Security verified: Client rejected with 403 from Admin API
✓ 13. Admin authentication successful
✓ 14. Admin KPIs retrieved
✓ 15. Admin updated reservation status
✓ 16. Admin approved review
✓ 17. Admin updated hotel settings in SQLite
🎉 ALL 17 E2E TESTS PASSED FLAWLESSLY AGAINST LIVE SQLITE!
```

---

## 📁 Structure des Fichiers

```
HSE/
├── backend/
│   ├── app/
│   │   ├── core/           # Sécurité (bcrypt, JWT), Dépendances auth
│   │   ├── models/         # Modèles SQLAlchemy (User, Room, Reservation, Payment, Review, Notification, Activity, Setting)
│   │   ├── routers/        # Routes API (auth, users, rooms, reservations, payments, reviews, notifications, activities, admin)
│   │   ├── schemas/        # Schémas Pydantic de validation E/S
│   │   ├── config.py       # Configuration & variables d'environnement
│   │   ├── database.py     # Connexion SQLite & SessionLocal
│   │   ├── main.py         # Point d'entrée FastAPI & cycle de vie
│   │   └── seed.py         # Peuplement initial automatique
│   ├── hotel.db            # Base de données SQLite
│   ├── requirements.txt    # Dépendances Python
│   └── test_e2e_flow.py    # Suite de tests E2E
├── src/
│   ├── components/
│   │   ├── admin/          # Espace d'administration complet (KPIs, Réservations, Chambres, Clients, etc.)
│   │   └── public/         # Vitrine publique (Hero, Chambres, Restaurant, Spa, Événements, etc.)
│   │       └── client/     # Espace Client modal avec ses 8 onglets connectés
│   ├── contexts/           # AuthContext (état utilisateur, token JWT, rôles)
│   ├── services/           # api.js (Client API centralisé connecté au backend)
│   └── App.jsx             # Routage public / admin
├── vite.config.js          # Configuration Vite & proxy API vers FastAPI
└── README.md
```
