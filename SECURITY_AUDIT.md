# Rapport d'Audit de Sécurité Full-Stack — Hôtel Sainte Emmanuelle

**Projet :** Hôtel Sainte Emmanuelle (HSE)  
**Type d'application :** Plateforme hôtelière de luxe (Site public vitrine, moteur de réservation temps réel, Espace Client authentifié, Console d'Administration isolée)  
**Stack technologique :** Frontend React 19 + Tailwind CSS + Vite 8 | Backend FastAPI + SQLAlchemy 2 + SQLite (`hotel.db`)  
**Statut de la maquette :** Verrouillée — Aucun impact visuel, conformité design Stitch 100% préservée.  
**Auditeur :** Équipe d'Ingénierie de Sécurité & AppSec  
**Date :** 17 Septembre 2026  

---

## Résumé

L'audit de sécurité approfondi réalisé sur la solution logicielle de l'Hôtel Sainte Emmanuelle a couvert l'ensemble de la surface d'attaque full-stack, du navigateur client jusqu'au stockage physique SQLite.

Une inspection rigoureuse a permis d'identifier et de remédier immédiatement à **plusieurs vulnérabilités réelles**, dont une vulnérabilité critique d'exposition directe de la base de données via le serveur de prévisualisation, une fuite de données personnelles sur l'API publique des avis, une permissivité CORS avec credentials, une absence de contrôle serveur sur le montant exact des règlements (price tampering) et une absence de limitation de débit (rate limiting) sur les points de terminaison d'authentification.

Toutes les vulnérabilités identifiées ont fait l'objet d'une **remédiation directe dans le code source**, validée par une suite de **26 tests automatisés de sécurité dédiés** (`test_security_suite.py`) ainsi que par les tests de non-régression de l'application (`test_client_admin_sync.py`, `test_e2e_flow.py`, `npm run build`), avec un taux de réussite de **100%**.

---

## Architecture analysée

```text
                                [ CLIENT / VISITEUR ]
                                          │
                                          ▼
                   ┌──────────────────────────────────────────────┐
                   │               FRONTEND REACT 19              │
                   │  - Single Page Application (Vite 8)          │
                   │  - Port 5173 / Proxy API /api               │
                   │  - Composants Publics & Espace Client        │
                   │  - Console d'Administration (/admin)         │
                   │  - Gestion JWT (AuthContext & api.js)        │
                   └──────────────────────┬───────────────────────┘
                                          │ Requêtes REST (JSON / Bearer JWT)
                                          ▼
                   ┌──────────────────────────────────────────────┐
                   │               BACKEND FASTAPI                │
                   │  - Port 8000                                 │
                   │  - Middleware En-têtes de Sécurité           │
                   │  - Middleware CORS restreint                 │
                   │  - Rate Limiter Sliding Window (In-Memory)   │
                   │  - Dépendances RBAC (Client vs Admin)        │
                   │  - Schémas Pydantic typés & bornés           │
                   └──────────────────────┬───────────────────────┘
                                          │ ORM Requêtes Typées
                                          ▼
                   ┌──────────────────────────────────────────────┐
                   │             SQLAlchemy 2.0 ORM               │
                   │  - Requêtes paramétrées (Anti-SQLi)          │
                   │  - Relations cascade & contraintes           │
                   └──────────────────────┬───────────────────────┘
                                          │ Fichier Local Isolé
                                          ▼
                   ┌──────────────────────────────────────────────┐
                   │          SQLITE DATABASE (hotel.db)          │
                   │  - Emplacement : backend/hotel.db (non servi)│
                   │  - Mots de passe chiffrés en Bcrypt          │
                   │  - Migrations automatiques au démarrage      │
                   └──────────────────────────────────────────────┘
```

---

## Frontend

### Secrets et variables d'environnement
- **Résultat :** Aucun mot de passe, secret API, clé privée ou credential d'administration n'est écrit en dur dans le code source React.
- Les variables d'environnement sont gérées via `import.meta.env.VITE_API_URL` avec repli propre sur `/api`.
- Aucun secret backend n'est injecté dans le bundle client lors de la compilation Vite (`dist/`).

### Prévention des injections XSS
- **Audit JSX :** 0 utilisation de `dangerouslySetInnerHTML`, 0 utilisation de `eval()` ou du constructeur `Function()`.
- Le moteur de réconciliation de React échappe nativement tout texte injecté dans le DOM virtuel.
- Les données saisies par les utilisateurs (nom, prénom, avis, téléphone, demandes particulières) ne peuvent pas exécuter de JavaScript malveillant.

### Authentification & Sessions côté client
- Le token JWT est stocké dans le `localStorage` sous la clé `hse_token` et les informations utilisateur sous `hse_user`.
- En cas de réponse 401 Unauthorized émise par l'API, le token invalide ou expiré est automatiquement purgé et l'utilisateur est redirigé vers l'état déconnecté.
- Les composants protégés vérifient l'état d'authentification avant affichage, et la véritable protection d'accès est strictement assurée côté serveur par l'API FastAPI.

---

## Backend

### Structure et routage
- Les points de terminaison sont organisés par domaine : `/api/auth`, `/api/users`, `/api/rooms`, `/api/reservations`, `/api/payments`, `/api/reviews`, `/api/notifications`, `/api/activities`, `/api/admin`.
- Toutes les routes sensibles exploitent l'injection de dépendances FastAPI pour exiger l'authentification (`get_current_user`) et le rôle administrateur (`get_current_admin`).

### Gestion des erreurs
- Un gestionnaire d'exception global intercepte toutes les erreurs inattendues pour renvoyer un statut HTTP 500 JSON neutre (`{"detail": "Une erreur interne est survenue..."}`), empêchant toute divulgation de trace d'exécution Python, de chemins système ou de requêtes SQL internes.

### En-têtes HTTP de sécurité
Un middleware injecte sur chaque réponse HTTP :
- `X-Content-Type-Options: nosniff` : Empêche le reniflage de type MIME.
- `X-Frame-Options: DENY` : Empêche le clickjacking en interdisant l'intégration en `<iframe>`.
- `X-XSS-Protection: 1; mode=block` : Active la protection anti-XSS des navigateurs hérités.
- `Referrer-Policy: strict-origin-when-cross-origin` : Protège la fuite de chemins d'URL dans les en-têtes Referer.

---

## API

### Contrôle d'accès et méthodes HTTP
- Les opérations de création utilisent `POST`, les consultations `GET`, les mises à jour partielles `PATCH`, et les modifications complètes `PUT`.
- L'envoi de verbes HTTP non autorisés sur une ressource renvoie systématiquement `405 Method Not Allowed`.

### Validation des données & Mass Assignment
- Les modèles Pydantic v2 définissent strictement chaque champ accepté avec des bornes de longueur (`min_length`, `max_length`), des vérifications de format d'email (`EmailStr`) et des expressions régulières sur les statuts énumérés.
- Toute tentative de soumettre un champ non autorisé tel que `"role": "admin"` lors de l'inscription (`RegisterRequest`) ou de la mise à jour de profil (`UserUpdateProfile`) est ignorée ou refusée par le validateur Pydantic. Le rôle est fixé explicitement par la logique métier backend.

---

## Authentification

- **Hachage des mots de passe :** Utilisation de l'algorithme robuste **Bcrypt** avec sel aléatoire généré automatiquement par mot de passe (`bcrypt.gensalt()`). Aucun mot de passe n'est stocké en clair.
- **Politique de complexité :** Longueur minimale de 6 caractères imposée au niveau des schémas Pydantic.
- **Tokens JWT :** Signés avec l'algorithme `HS256` et le secret serveur `SECRET_KEY`. La vérification impose explicitement `algorithms=[settings.ALGORITHM]`, neutralisant les attaques par altération d'algorithme (ex: `none`).
- **Jeton de réinitialisation sécurisé :** Le mécanisme de mot de passe oublié génère un jeton cryptographiquement sécurisé (`secrets.token_urlsafe(24)`), assorti d'une durée de validité limitée à **15 minutes** (`reset_token_expires_at`) et à usage unique strict.
- **Réponses neutres anti-énumération :** Les requêtes `/api/auth/forgot-password` renvoient une réponse identique que l'email existe ou non, interdisant l'énumération automatisée d'adresses d'hôtes.

---

## Autorisation

### Modèle RBAC (Role-Based Access Control)
- Deux rôles stricts : `client` et `admin`.
- Toutes les routes d'administration `/api/admin/*` sont conditionnées par la dépendance `get_current_admin`.
- Un visiteur non authentifié recevant un accès direct à `/api/admin/*` est immédiatement rejeté avec le code `401 Unauthorized`.
- Un client connecté (`role == "client"`) tentant d'invoquer une route `/api/admin/*` est rejeté avec le code `403 Forbidden`.

### Protection IDOR (Insecure Direct Object Reference)
- Les endpoints `/api/reservations/{id}`, `/api/reservations/{id}/cancel` et `/api/payments` vérifient systématiquement que la ressource ciblée appartient bien à l'utilisateur authentifié :
  ```python
  if res.user_id != current_user.id and current_user.role != "admin":
      raise HTTPException(status_code=403, detail="Accès non autorisé")
  ```
- Un utilisateur malveillant manipulant l'identifiant d'une réservation pour voir, annuler ou payer le séjour d'un tiers reçoit systématiquement un refus `403 Forbidden`.

---

## Base de données

### SQLite (`backend/hotel.db`)
- **Isolation des fichiers :** La base de données est localisée exclusivement dans le répertoire `backend/hotel.db`. Le fichier orphelin qui résidait dans le répertoire racine frontend a été immédiatement détruit.
- **Interdiction d'exposition HTTP :** Le serveur de développement Vite a été configuré avec `server.fs.deny: ['**/*.db', '**/*.sqlite', '**/.env*', 'backend/**']`. Toute tentative de téléchargement HTTP direct de la base de données SQLite renvoie désormais une erreur `403 Restricted`.
- **Résolution robuste du chemin :** Le paramètre `DATABASE_URL` dans `config.py` résout désormais systématiquement le chemin absolu vers `backend/hotel.db`, prévenant toute création involontaire de fichier SQLite dans les répertoires publics.
- **Versionnement :** La base de données et les fichiers compilés Python ont été retirés de l'index Git et inscrits dans `.gitignore`.

### Injection SQL
- Toutes les requêtes sont construites via l'ORM SQLAlchemy avec des variables de liaison paramétrées. Aucune concaténation de chaînes de caractères brutes n'est utilisée.
- Les tests d'injection SQL (`' OR '1'='1' --`, `1' UNION SELECT ...`) ont tous été neutralisés en toute sécurité sans générer d'erreurs 500 ni altérer les tables.

---

## Réservations

- **Vérification des dates :** Le backend refuse les dates d'arrivée situées dans le passé (`check_in < today`) et impose que la date de départ soit strictement postérieure à l'arrivée (`check_out > check_in`).
- **Détection des chevauchements :** L'algorithme vérifie les réservations déjà enregistrées au statut `confirmed` ou `pending` sur la même chambre et rejette toute collision avec le statut `409 Conflict`.
- **Calcul serveur des montants :** Le montant total de la réservation est obligatoirement calculé par le backend :
  $$\text{total\_amount} = (\text{check\_out} - \text{check\_in}).\text{days} \times \text{room.price}$$
- Le backend n'accorde aucune confiance à un quelconque montant transmis par le frontend.

---

## Administration

- L'interface d'administration est totalement découplée du site public (aucun lien, menu ou indice visuel n'est affiché sur le site public).
- Chaque consultation de tableau de bord (KPIs, revenus, liste des réservations, mouvements, gestion des chambres, gestion des avis, journaux d'activité) est validée par le token de l'administrateur.
- La modification d'un statut de réservation déclenche automatiquement la notification correspondante dans l'Espace Client SQLite et trace l'opération dans le journal d'activité.

---

## Dépendances

### Frontend
- Exécution de `npm audit` : **0 vulnérabilité détectée**.
- Dépendances principales : React 19.2.8, React Router DOM 7.18.4, Vite 8.3.0, Tailwind CSS 3.4.19.

### Backend
- Dépendances modernes et à jour :
  - FastAPI 0.141.1
  - SQLAlchemy 2.0.54
  - Uvicorn 0.53.0
  - Pydantic 2.13.5
  - PyJWT 2.14.0
  - Bcrypt 5.0.0
  - Email-Validator 2.3.0
- Aucune dépendance non maintenue ou obsolète dans l'environnement virtuel.

---

## Configuration

- **Fichiers ignorés (`.gitignore`) :** Ajout des exclusions strictes pour `*.db`, `*.sqlite`, `.env`, `.env.*`, `__pycache__/`, `.venv/`.
- **CORS :** Restriction stricte aux origines autorisées (`http://localhost:5173`, `http://127.0.0.1:5173`, `http://localhost:3000`), interdisant le joker laxiste `["*"]` lorsque des credentials sont autorisés.
- **Gestion des secrets :** Configuration d'un template sécurisé `.env.example` documentant les variables requises sans divulguer les secrets de production.

---

## Vulnérabilités trouvées

| ID | Sévérité | Composant | Problème identifié | Statut |
|---|---|---|---|---|
| **SEC-001** | **CRITIQUE** | Fichiers / Vite | Fichier SQLite `hotel.db` présent dans la racine du frontend et téléchargeable en HTTP direct via le port 5173 (`HTTP 200 OK`). | **Corrigé** |
| **SEC-002** | **ÉLEVÉ** | CORS / API | Configuration CORS utilisant `allow_origins=["*"]` combiné à `allow_credentials=True`, exposant l'API à des requêtes cross-origin non sollicitées. | **Corrigé** |
| **SEC-003** | **ÉLEVÉ** | PII / Confidentialité | L'endpoint public `GET /api/reviews` renvoyait le modèle utilisateur complet (`UserOut`), divulguant les emails et numéros de téléphone des clients à n'importe quel visiteur anonyme. | **Corrigé** |
| **SEC-004** | **ÉLEVÉ** | Métier / Paiements | Vulnérabilité de falsification de prix (Price Tampering) : `create_payment` acceptait `data.amount` sans vérifier la concordance avec `res.total_amount`. Possibilité de régler un montant nul ou dérisoire (1 FCFA). | **Corrigé** |
| **SEC-005** | **MOYEN** | Auth / Brute-force | Absence de limitation de fréquence de requêtes (Rate Limiting) sur `/api/auth/login`, `/register`, `/forgot-password`, exposant à des attaques par force brute et bourrage d'identifiants. | **Corrigé** |
| **SEC-006** | **MOYEN** | Auth / Récupération | Jeton de réinitialisation sans date d'expiration et fuité directement dans le corps de la réponse HTTP de `/api/auth/forgot-password`. | **Corrigé** |
| **SEC-007** | **MOYEN** | API / DoS | Absence de contraintes de longueur maximale sur les chaînes de caractères reçues par Pydantic (risque d'épuisement mémoire). | **Corrigé** |
| **SEC-008** | **FAIBLE** | Git / Fichiers | La base de données `backend/hotel.db` et les fichiers `.pyc` étaient indexés dans l'historique de suivi Git faute de règles adaptées dans `.gitignore`. | **Corrigé** |
| **SEC-009** | **FAIBLE** | En-têtes HTTP | Absence des en-têtes de durcissement du navigateur (`X-Content-Type-Options`, `X-Frame-Options`, `Referrer-Policy`, etc.). | **Corrigé** |
| **SEC-010** | **INFORMATION** | Client / Stockage | Utilisation de `localStorage` pour persister le JWT. Risque théorique résiduel en cas de XSS (atténué par 0 utilisation de `dangerouslySetInnerHTML` et échappement automatique de React). | **Audité & Validé** |

---

## Vulnérabilités corrigées

1. **Suppression et blocage de `hotel.db` (SEC-001) :**
   - Suppression du fichier `hotel.db` orphelin à la racine.
   - Ajout de `server.fs.deny` dans `vite.config.js` bloquant les extensions `.db`, `.sqlite`, `.env` et le sous-répertoire `backend/**` avec code HTTP 403.
   - Forçage de `DATABASE_URL` via un validateur absolu dans `backend/app/config.py`.

2. **Restriction des origines CORS (SEC-002) :**
   - Remplacement de `allow_origins=["*"]` par `settings.CORS_ORIGINS` (`http://localhost:5173`, `http://127.0.0.1:5173`, `http://localhost:3000`).

3. **Protection des données personnelles sur les avis (SEC-003) :**
   - Création du schéma d'exposition restreinte `ReviewUserOut` ne contenant que `first_name`, `last_name` et `loyalty_tier`. Suppression totale de l'email, du téléphone, de l'ID utilisateur et des traces sensibles dans les avis publics.

4. **Intégrité et recalcul des paiements (SEC-004) :**
   - Le montant prélevé est désormais strictement aligné sur `res.total_amount` calculé côté serveur. Rejet immédiat avec erreur 400 en cas de discordance ou de tentative de paiement sur réservation annulée ou déjà réglée.

5. **Mise en place d'un Rate Limiter In-Memory (SEC-005) :**
   - Création de `backend/app/core/rate_limiter.py` implémentant une fenêtre glissante thread-safe. Application de quotas stricts sur les routes d'authentification (10 requêtes/min pour le login, 5/min pour l'inscription et la récupération) avec réponse `429 Too Many Requests`.

6. **Sécurisation du cycle de réinitialisation de mot de passe (SEC-006) :**
   - Génération de tokens cryptographiques de 24 octets aléatoires (`secrets.token_urlsafe(24)`).
   - Ajout d'une colonne `reset_token_expires_at` (expiration à 15 minutes).
   - Invalidation immédiate après usage (usage unique strict).
   - Suppression de toute fuite du token dans la réponse HTTP.

7. **Durcissement des schémas Pydantic (SEC-007) :**
   - Ajout de bornes `min_length` et `max_length` sur tous les champs texte dans `auth.py`, `user.py`, `reservation.py`, `payment.py`, `review.py`.
   - Contrôle strict des statuts autorisés par regex / pattern.

8. **Nettoyage du dépôt Git et `.gitignore` (SEC-008) :**
   - Désindexation de `backend/hotel.db` et de l'ensemble des fichiers `*.pyc` de l'arbre Git.
   - Ajout des motifs d'exclusion dans `.gitignore`.

9. **Ajout des en-têtes HTTP de sécurité (SEC-009) :**
   - Intégration d'un middleware Starlette/FastAPI positionnant `X-Content-Type-Options`, `X-Frame-Options`, `X-XSS-Protection` et `Referrer-Policy`.

---

## Tests effectués

La suite de tests de sécurité automatisée (`backend/test_security_suite.py`) a été exécutée contre le serveur FastAPI en conditions réelles :

```bash
python3 backend/test_security_suite.py
```

### Détail des 26 tests exécutés :

1. **Authentification & Sessions :**
   - `Admin login succeeds` (Connexion valide de l'administrateur avec token JWT).
   - `Client login succeeds` (Connexion valide du client avec token JWT).
   - `Wrong credentials rejected with 401` (Mot de passe incorrect rejeté).
   - `Tampered JWT rejected with 401` (Jeton dont la signature a été altérée rejeté).
   - `Missing JWT rejected with 401` (Accès non authentifié à une ressource protégée rejeté).

2. **Prévention des attaques par force brute :**
   - `Rate Limiter triggers HTTP 429 Too Many Requests on brute-force` (Déclenchement du statut 429 après dépassement du quota).

3. **Escalade de privilèges (RBAC) :**
   - `Visitor blocked from /api/admin/kpis (401)` (Visiteur anonyme bloqué).
   - `Client blocked from /api/admin/kpis (403)` (Client authentifié bloqué).
   - `Client blocked from /api/admin/reservations (403)` (Client bloqué de la liste admin).
   - `Injected role='admin' on register rejected/forced to 'client'` (Tentative d'escalade lors de l'inscription neutralisée).
   - `Injected role='admin' on profile update does not change role` (Tentative d'escalade lors de la mise à jour profil neutralisée).

4. **Contrôle d'accès objet (IDOR) :**
   - `Client A creates legitimate booking` (Création de réservation propriétaire).
   - `Attacker cannot view Client A's reservation (403 Forbidden)` (Attaquant incapable de consulter la réservation d'un tiers).
   - `Attacker cannot cancel Client A's reservation (403 Forbidden)` (Attaquant incapable d'annuler la réservation d'un tiers).
   - `Attacker cannot initiate payment for Client A's reservation (403 Forbidden)` (Attaquant incapable de payer pour la réservation d'un tiers).

5. **Logique métier & Intégrité des prix :**
   - `Price Tampering (sending 1 FCFA) rejected with 400 Bad Request` (Altération frauduleuse du montant rejetée).
   - `Check-out before check-in rejected with 400` (Dates incohérentes rejetées).
   - `Check-in in the past rejected with 400` (Réservation rétroactive rejetée).

6. **Résistance aux injections :**
   - `SQL Injection in login email fails safely (401/422)` (Injection SQL dans le champ email neutralisée).
   - `SQL Injection in room ID handled safely (404/422)` (Injection SQL dans l'identifiant URL de chambre neutralisée).
   - `XSS payload in review comment HTML-escaped` (Payload `<script>alert('XSS')</script>` neutralisé et échappé en `&lt;script&gt;`).

7. **Confidentialité & Protection des données personnelles :**
   - `Public /reviews endpoint does NOT expose email or phone` (Absence totale de données personnelles sur l'API publique).

8. **En-têtes HTTP de sécurité & CORS :**
   - `Header X-Content-Type-Options: nosniff present`.
   - `Header X-Frame-Options: DENY present`.
   - `Header X-XSS-Protection present`.
   - `Header Referrer-Policy present`.

---

## Tests réussis

- **Tests de sécurité :** 26 sur 26 tests réussis (**100% de succès**).
- **Tests de synchronisation Client ↔ Admin (`test_client_admin_sync.py`) :** 11 sur 11 étapes réelles validées.
- **Tests fonctionnels End-to-End (`test_e2e_flow.py`) :** 17 sur 17 flux validés.
- **Compilation de production React (`npm run build`) :** 100% validée sans erreur.
- **Audit des dépendances npm (`npm audit`) :** 0 vulnérabilité.

---

## Tests échoués

**0 test échoué** à l'issue des remédiations.

---

## Risques restants

1. **Environnement SQLite mono-serveur :**
   - SQLite est parfaitement adapté au déploiement actuel sur serveur unique. En cas de montée en charge vers une architecture multi-serveurs avec équilibrage de charge (load balancing), il conviendra de migrer vers PostgreSQL pour la concurrence multi-nœuds.
2. **Rate Limiting In-Memory :**
   - Le limiteur de débit actuel réside dans la mémoire vive du processus FastAPI. Il protège efficacement une instance unique. En cas de répartition de charge multi-instances, ce limiteur devra être couplé à un magasin distribué tel que Redis.
3. **Secret JWT par défaut en développement :**
   - Une valeur de repli est définie pour faciliter les tests locaux. En environnement de production finale, la variable d'environnement `SECRET_KEY` doit obligatoirement être renseignée avec une chaîne cryptographique d'au moins 64 caractères aléatoires.

---

## Recommandations

1. **Déploiement en production :**
   - Servir l'application exclusivement derrière un reverse proxy TLS (Nginx ou Caddy) avec certificat Let's Encrypt pour forcer HTTPS (`HSTS`).
   - Définir une variable d'environnement `SECRET_KEY` unique et forte :
     ```bash
     openssl rand -hex 32
     ```
2. **Sauvegarde SQLite automatisée :**
   - Mettre en place un cron job effectuant une sauvegarde cohérente de la base de données via l'utilitaire SQLite Online Backup :
     ```bash
     sqlite3 backend/hotel.db ".backup 'backend/backups/hotel_$(date +%Y%m%d).db'"
     ```
3. **Politique de mots de passe renforcée :**
   - Pour les comptes administrateurs, envisager à terme l'activation d'un double facteur d'authentification (2FA / TOTP).

---

## Conclusion technique

L'application **Hôtel Sainte Emmanuelle** a été auditée avec succès selon les standards de sécurité de l'industrie (OWASP Top 10, ASVS, bonnes pratiques FastAPI & React).

Les failles critiques et majeures identifiées ont été **entièrement corrigées au niveau du code source**, sans **aucune altération de la maquette graphique**, sans aucune régression fonctionnelle et avec une couverture de tests automatisés exemplaire. L'application est désormais robuste, protégée contre les attaques courantes (IDOR, injections, escalades de privilèges, falsification de données, fuites de PII) et prête pour une exploitation locale et un déploiement sécurisé.
