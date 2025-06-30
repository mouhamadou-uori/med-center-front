# 🏥 MedCenter - Rapport Technique Complet

<div align="center">

## 📋 Documentation Technique Complète
### Plateforme Médicale MedCenter

---

**Projet** : MedCenter - Plateforme de Gestion Médicale
**Version** : 1.0
**Date** : 30 Juin 2025
**Équipe** : Development Team MedCenter

---

### 🎯 Objectif du Document

Ce rapport technique présente l'architecture complète de la plateforme MedCenter, couvrant les aspects backend et frontend, ainsi que l'intégration avec les systèmes DICOM pour la gestion des images médicales.

### 📊 Résumé Exécutif

MedCenter est une solution complète de gestion médicale développée avec une architecture moderne :
- **Backend** : Spring Boot 3.4.5 avec Java 17
- **Frontend** : Nuxt 3 avec Vue 3 et TypeScript
- **Base de données** : MySQL 8.0+
- **Images médicales** : Intégration Orthanc DICOM
- **Sécurité** : JWT et authentification multi-rôles

---

</div>

# 📑 Table des Matières

## 🖥️ PARTIE I - BACKEND
1. [Vue d'ensemble Backend](#vue-densemble-backend)
2. [Architecture Backend](#architecture-backend)
3. [Sécurité Backend](#sécurité-backend)
4. [Intégration DICOM](#intégration-dicom)
5. [Base de Données](#base-de-données)

## 🌐 PARTIE II - FRONTEND
1. [Vue d'ensemble Frontend](#vue-densemble-frontend)
2. [Architecture Frontend](#architecture-frontend)
3. [Composants et Pages](#composants-et-pages)

## ⚙️ PARTIE III - PARAMÉTRAGE ET CONFIGURATION
1. [Configuration du Backend](#🚀-configuration-du-backend)
2. [Configuration du Frontend](#🌐-configuration-du-frontend)

## 🎨 PARTIE IV - CONCEPTION
1. [Architecture Globale du Système](#architecture-globale-du-système)

## ⭐ PARTIE V - FONCTIONNALITÉS
1. [Fonctionnalités Principales](#🏥-fonctionnalités-principales)

## 📸 PARTIE VI - CAPTURES D'ÉCRAN
1. [Interface Utilisateur - Aperçu Visuel](#interface-utilisateur---aperçu-visuel)

## 🔗 PARTIE VII - INTÉGRATION
1. [Communication Backend-Frontend](#communication-backend-frontend)
2. [Déploiement](#déploiement)
3. [Roadmap](#roadmap)

---

# 🖥️ PARTIE I - BACKEND

## Vue d'ensemble Backend

**MedCenter** est une plateforme médicale développée avec une architecture moderne basée sur **Spring Boot 3.4.5** et **Java 17**. Le système intègre un serveur DICOM Orthanc pour la gestion des images médicales et propose une API REST complète pour la gestion des données de santé.

## Architecture Backend

### Stack Technologique Backend

| Composant | Technologie | Version | Description |
|-----------|------------|---------|-------------|
| **Runtime** | Java | 17 | Plateforme d'exécution |
| **Framework** | Spring Boot | 3.4.5 | Framework principal |
| **Base de données** | MySQL | 8.0+ | Stockage des données |
| **Serveur DICOM** | Orthanc | Latest | Gestion images médicales |
| **Sécurité** | Spring Security | 6.x | Authentification/Autorisation |
| **Tokens** | JWT | 0.11.5 | Authentification stateless |
| **ORM** | JPA/Hibernate | 6.x | Mapping objet-relationnel |
| **Client HTTP** | WebFlux | 6.x | Appels réactifs |
| **Email** | Resend API | 3.1.0 | Service d'envoi d'emails |
| **Build** | Maven | 3.8+ | Gestionnaire de dépendances |

### 🏛️ Architecture des Couches Backend

#### 1. **Couche Contrôleur (Controllers)**
Les contrôleurs exposent les endpoints REST de l'API :

| Contrôleur | Endpoints | Responsabilité |
|------------|-----------|----------------|
| `AuthController` | `/api/auth/**` | Authentification JWT & OAuth2 |
| `MedicalDataController` | `/api/medical/**` | Données médicales & patients |
| `OrthancController` | `/api/orthanc/**` | Intégration serveur DICOM |
| `EmailController` | `/api/emails/**` | Envoi d'emails |
| `PathologieController` | `/api/pathologies/**` | Gestion des pathologies |
| `ConseilMedicalController` | `/api/conseils/**` | Conseils médicaux |

#### 2. **Couche Service (Services)**
Les services implémentent la logique métier :

| Service | Fonction |
|---------|----------|
| `MedicalDataService` | Gestion des données médicales MySQL |
| `OrthancService` | Communication avec le serveur DICOM |
| `DynamicOrthancService` | Appels Orthanc avec URLs dynamiques |
| `EmailService` | Envoi d'emails via Resend |
| `SecurityService` | Gestion de la sécurité |
| `CustomUserDetailsService` | Chargement des utilisateurs |

#### 3. **Couche Modèle (Entities)**

##### 🏥 Modèles Principaux

| Entité | Description | Relations |
|--------|-------------|-----------|
| `Utilisateur` | Classe abstraite de base | Héritage (Patient, ProfessionnelSante, Administrateur) |
| `Patient` | Informations patient | `OneToOne` avec DossierMedical |
| `ProfessionnelSante` | Médecins et professionnels | `ManyToOne` avec Hopital |
| `Hopital` | Établissements de santé | `OneToMany` avec ServeurDICOM |
| `Consultation` | Consultations médicales | `ManyToOne` avec Patient et ProfessionnelSante |
| `Pathologie` | Pathologies médicales | `ManyToOne` avec CategoriePathologie |
| `ConseilMedical` | Conseils et recommandations | Structure hiérarchique |

##### 🖼️ Modèles DICOM (Orthanc)

| Entité | Description |
|--------|-------------|
| `PatientOrthanc` | Patients dans Orthanc |
| `Etude` | Études médicales DICOM |
| `Serie` | Séries d'images |
| `Instance` | Instances DICOM individuelles |

## Sécurité Backend

### 🔐 Architecture de Sécurité

#### 🎯 Système de Rôles

| Rôle | Permissions | Endpoints Autorisés |
|------|-------------|-------------------|
| `ADMIN` | Administration système | Tous les endpoints |
| `PROFESSIONNEL` | Gestion médicale | Patients, consultations, Orthanc |
| `RADIOLOGUE` | Imagerie médicale | Orthanc, upload DICOM |
| `PATIENT` | Consultation données | Données personnelles |

## Intégration DICOM

### 🖼️ Intégration DICOM avec Orthanc

#### Architecture d'Intégration
Le système utilise **deux approches** pour communiquer avec Orthanc :
1. **OrthancService** : URL fixe configurée
2. **DynamicOrthancService** : URLs dynamiques par hôpital

#### 📊 Endpoints DICOM Principaux

| Endpoint | Méthode | Description | Sécurité |
|----------|---------|-------------|----------|
| `/api/medical/hopitaux/{id}/patients-orthanc` | GET | Patients par hôpital | PROFESSIONNEL |
| `/api/medical/patients-orthanc/{id}/details` | GET | Détails patient complets | PROFESSIONNEL |
| `/api/orthanc/patients` | GET | Tous les patients | PUBLIC |
| `/api/orthanc/studies/{id}` | GET | Détails étude | RADIOLOGUE |
| `/api/orthanc/instances` | POST | Upload DICOM | RADIOLOGUE |

## Base de Données

### 💾 Modèle de Données

#### 📋 Tables Principales

##### Utilisateurs et Authentification
- `utilisateur` (table parent)
- `patient` (héritage)
- `professionnel_sante` (héritage)
- `administrateur` (héritage)

##### Données Médicales
- `dossier_medical`
- `consultation`
- `prescription`
- `donnee_sante`
- `pathologie_chronique`

##### Structures Organisationnelles
- `hopital`
- `serveur_dicom`
- `type_hopital`

##### Système de Conseils
- `pathologie`
- `categorie_pathologie`
- `conseil_medical`
- `section_conseil`
- `ressource_conseil`

---

# 🌐 PARTIE II - FRONTEND

## Vue d'ensemble Frontend

La partie frontend de **MedCenter** est développée avec **Nuxt 3** et **Vue 3** avec **TypeScript**, offrant une interface utilisateur moderne et responsive pour la gestion des données médicales. L'application utilise une architecture basée sur des composants réutilisables et une gestion d'état intégrée.

## Architecture Frontend

### Stack Technologique Frontend

| Composant | Technologie | Version | Description |
|-----------|------------|---------|-------------|
| **Framework** | Nuxt | 3.x | Framework Vue.js full-stack |
| **Vue** | Vue.js | 3.x | Framework JavaScript réactif |
| **Langage** | TypeScript | 5.0+ | Typage statique |
| **Styling** | Tailwind CSS | 3.x | Framework CSS utilitaire |
| **Composants UI** | Nuxt UI | Latest | Composants pré-construits |
| **Icônes** | Heroicons | 2.0+ | Icônes SVG optimisées |
| **Authentification** | Nuxt Auth | Latest | Gestion d'authentification |
| **Gestion d'état** | Pinia | 2.x | Store management |
| **Routage** | Nuxt Router | 3.x | Routage automatique |
| **API** | Nuxt Server | 3.x | API routes intégrées |

### 🏗️ Structure du Projet Frontend

```
app/
├── components/         # Composants réutilisables
│   ├── home/          # Composants du dashboard
│   ├── messages/      # Système de messagerie
│   ├── patients/      # Gestion des patients
│   └── settings/      # Paramètres
├── composables/       # Composables Vue
├── layouts/           # Layouts de page
├── middleware/        # Middleware de routage
├── pages/             # Pages de l'application
│   ├── dashboard/     # Tableau de bord
│   ├── patients/      # Gestion patients
│   ├── imagerie/      # Imagerie médicale
│   ├── orthanc/       # Interface DICOM
│   └── settings/      # Configuration
├── services/          # Services API
├── types/             # Types TypeScript
└── utils/             # Utilitaires
```

## Composants et Pages

### 🏠 Pages Principales

#### Dashboard
- **Page** : `pages/dashboard/index.vue`
- **Composants** : `HomeStats`, `HomeChart`, `HomePatientsTable`
- **Fonctionnalités** : Métriques temps réel, graphiques KPI, tableau de bord

#### Gestion des Patients
- **Page** : `pages/patients.vue`
- **Composants** : `PatientExplorer`, `AddModal`, `DeleteModal`
- **Fonctionnalités** : CRUD patients, recherche avancée, modal de détails

#### Imagerie DICOM
- **Pages** : `pages/orthanc/`, `pages/imagerie/`
- **Composants** : `ImageryDownload`, `ImageryReports`
- **Fonctionnalités** : Visualisation DICOM, téléchargement, rapports

#### Messagerie
- **Page** : `pages/inbox.vue`
- **Composants** : `InboxList`, `Message`, `MessageList`
- **Fonctionnalités** : Système de messages, notifications

---

# ⚙️ PARTIE III - PARAMÉTRAGE ET CONFIGURATION

## 🚀 Configuration du Backend

### Prérequis Backend

**Logiciels requis :**
- Java 17 ou supérieur
- Maven 3.8+
- MySQL 8.0+
- Git
- Docker (optionnel pour Orthanc)
- IDE (IntelliJ IDEA, Eclipse, VS Code)

### Vérification des versions
```bash
java --version
mvn --version
mysql --version
git --version
```

### 📂 Étape 1 : Clonage du Repository Backend
```bash
# Cloner le repository depuis GitHub
git clone https://github.com/votre-organisation/medcenter-backend.git

# Naviguer dans le dossier
cd medcenter-backend

# Vérifier la branche
git branch -a
git checkout main # ou develop selon votre workflow
```

### 🗄️ Étape 2 : Configuration de la Base de Données MySQL

#### 2.1 Installation MySQL (si nécessaire)

**Ubuntu/Debian :**
```bash
sudo apt update
sudo apt install mysql-server
sudo systemctl start mysql
sudo systemctl enable mysql
```

**macOS (avec Homebrew) :**
```bash
brew install mysql
brew services start mysql
```

**Windows :**
- Télécharger MySQL Installer depuis le site officiel
- Suivre l'assistant d'installation

#### 2.2 Configuration de la base de données
```sql
# Se connecter à MySQL
mysql -u root -p

# Créer la base de données
CREATE DATABASE med_center CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

# Créer l'utilisateur (optionnel, utiliser celui du projet)
CREATE USER 'wally'@'localhost' IDENTIFIED BY 'passer';
GRANT ALL PRIVILEGES ON med_center.* TO 'wally'@'localhost';
FLUSH PRIVILEGES;

# Vérifier la création
SHOW DATABASES;
EXIT;
```

#### 2.3 Importer le schéma de base
```bash
# Si des fichiers SQL existent dans le projet
mysql -u wally -p med_center < src/main/resources/schema.sql
mysql -u wally -p med_center < src/main/resources/data.sql

# Ou utiliser les fichiers de test
mysql -u wally -p med_center < src/main/resources/donnees-test-medical.sql
```

### 🖼️ Étape 3 : Configuration du Serveur DICOM Orthanc

#### 3.1 Installation avec Docker (Recommandé)
```bash
# Créer un dossier pour Orthanc
mkdir orthanc-data

# Lancer Orthanc avec Docker
docker run -d \
  --name orthanc \
  -p 8042:8042 \
  -p 4242:4242 \
  -v $(pwd)/orthanc-data:/var/lib/orthanc/db \
  jodogne/orthanc
```

#### 3.2 Vérification d'Orthanc
```bash
# Vérifier que le conteneur fonctionne
docker ps

# Accéder à l'interface web
# Ouvrir http://localhost:8042 dans le navigateur
# Login par défaut : orthanc / orthanc
```

### ⚙️ Étape 4 : Configuration de l'Application Backend

#### 4.1 Fichier application.properties
```properties
# Application
spring.application.name=med_center
server.port=9000

# Base de données MySQL
spring.datasource.url=jdbc:mysql://localhost:3306/med_center
spring.datasource.username=wally
spring.datasource.password=passer
spring.datasource.driver-class-name=com.mysql.cj.jdbc.Driver

# JPA/Hibernate
spring.jpa.hibernate.ddl-auto=none
spring.jpa.show-sql=true
spring.jpa.defer-datasource-initialization=false
spring.sql.init.mode=never

# Orthanc Configuration
orthanc.server.url=http://localhost:8042

# JWT Configuration
spring.security.oauth2.resourceserver.jwt.public-key-location=classpath:public.pem

# Email Configuration (Resend)
resend.api.key=votre-cle-api-resend
resend.from.email=MedCenter <no-reply@medcenter.sn>

# Logging
logging.level.root=error
logging.level.sn.xyz=info
```

#### 🔧 Étape 5 : Build et Lancement Backend
```bash
# Installation des dépendances
mvn clean install -DskipTests

# Lancement via Maven
mvn spring-boot:run

# Ou compiler et lancer le JAR
mvn clean package -DskipTests
java -jar target/medcenter-0.0.1-SNAPSHOT.jar
```

### 🔍 Vérification Backend
```bash
# Test de l'API
curl http://localhost:9000/api/orthanc/patients

# Test d'Orthanc
curl http://localhost:8042/system

# Vérifier l'état de santé
curl http://localhost:9000/actuator/health
```

---

## 🌐 Configuration du Frontend

### Prérequis Frontend
- Node.js 18+ ou 20+
- pnpm (gestionnaire de paquets recommandé)
- Git

### Vérification des versions
```bash
node --version
pnpm --version
git --version
```

### 📂 Étape 1 : Clonage du Repository Frontend
```bash
# Cloner le repository frontend
git clone https://github.com/votre-organisation/medcenter-front.git

# Naviguer dans le dossier
cd medcenter-front

# Vérifier la branche
git branch -a
git checkout main
```

### 📦 Étape 2 : Installation des Dépendances
```bash
# Installer les dépendances avec pnpm
pnpm install

# Ou avec npm si pnpm n'est pas disponible
npm install
```

### ⚙️ Étape 3 : Configuration de l'Environment

#### 3.1 Fichier .env (à créer)
```env
# Configuration API Backend
API_BASE_URL=http://localhost:9000

# Configuration Orthanc
ORTHANC_URL=http://localhost:8042

# Configuration de développement
NUXT_DEV=true
```

#### 3.2 Configuration Nuxt
Le fichier `nuxt.config.ts` est déjà configuré pour :
- Support TypeScript
- Nuxt UI Pro
- ESLint
- CSS Tailwind

### 🚀 Étape 4 : Lancement du Frontend

#### Mode Développement
```bash
# Lancement en mode développement
pnpm dev

# Ou avec npm
npm run dev
```

#### Mode Production
```bash
# Build pour la production
pnpm build

# Preview de la build
pnpm preview

# Ou génération statique
pnpm generate
```

### 🔗 Étape 5 : Vérification Frontend
```bash
# L'application sera accessible sur :
# http://localhost:3000

# Pages principales disponibles :
# - http://localhost:3000/ (Dashboard)
# - http://localhost:3000/login (Authentification)
# - http://localhost:3000/patients (Gestion patients)
# - http://localhost:3000/orthanc (Interface DICOM)
```

### 📋 Scripts Disponibles
```json
{
  "dev": "nuxt dev",              // Développement
  "build": "nuxt build",          // Build production
  "generate": "nuxt generate",    // Génération statique
  "preview": "nuxt preview",      // Preview build
  "lint": "eslint .",             // Linting
  "typecheck": "nuxt typecheck"   // Vérification types
}
```

---

# 🎨 PARTIE IV - CONCEPTION

## Architecture Globale du Système

La conception de MedCenter suit une architecture orientée objet bien structurée, utilisant l'héritage et les relations entre entités pour modéliser le domaine médical. Le diagramme ci-dessous illustre le modèle de classes principal du système :

<div align="center" style="page-break-after: always;">

![Diagramme de Classes MedCenter](./docs/images/architecture-complete-medcenter.png)

*Figure 1 : Diagramme de classes de la plateforme MedCenter montrant les relations entre les différentes entités : Utilisateur, Patient, ProfessionnelSante, DossierMedical, Consultation, et les entités DICOM*

</div>

## 🏗️ Architecture Complète du Système

### Vue d'Ensemble de l'Architecture

MedCenter adopte une architecture distribuée moderne combinant plusieurs technologies pour offrir une solution médicale complète et scalable :

<div align="center" style="page-break-after: always;">

![Architecture Complète MedCenter](./docs/images/architecture-globale-medcenter.svg)

*Figure 2 : Architecture complète de la plateforme MedCenter illustrant l'interaction entre le frontend Nuxt 3, le backend Spring Boot, la base de données MySQL, le serveur DICOM Orthanc et les services externes*

</div>

### 🔄 Communication Inter-Systèmes

#### **1. Couche Présentation (Frontend)**
- **Nuxt 3 + Vue 3** : Interface utilisateur moderne et réactive
- **TypeScript** : Typage statique pour la robustesse
- **Tailwind CSS** : Styling moderne et responsive
- **Pinia** : Gestion d'état centralisée

#### **2. Couche API (Backend)**
- **Spring Boot 3.4.5** : Framework Java robuste
- **Spring Security** : Authentification JWT et autorisation
- **WebFlux** : Communication réactive avec Orthanc
- **RESTful API** : Endpoints standardisés

#### **3. Couche Données**
- **MySQL 8.0+** : Base de données relationnelle principale
- **JPA/Hibernate** : ORM pour la persistance
- **Serveur DICOM Orthanc** : Stockage et gestion des images médicales

#### **4. Services Externes**
- **Resend API** : Service d'envoi d'emails
- **Docker** : Conteneurisation des services
- **Nginx** : Reverse proxy (production)

### 📊 Flux de Données Principal

```
┌─────────────┐    HTTP/REST    ┌─────────────┐    JPA/SQL    ┌─────────────┐
│   Frontend  │ ───────────────▶│   Backend   │ ─────────────▶│   MySQL     │
│  (Nuxt 3)   │◀─────────────── │(Spring Boot)│◀───────────── │             │
└─────────────┘    JSON/JWT     └─────────────┘   Entities    └─────────────┘
                                        │
                                        │ HTTP/REST
                                        ▼
                                ┌─────────────┐
                                │   Orthanc   │
                                │   (DICOM)   │
                                └─────────────┘
```

### 🛡️ Sécurité Multi-Couches

#### **Authentification et Autorisation**
- **JWT (JSON Web Tokens)** : Authentification stateless
- **Spring Security** : Protection des endpoints backend
- **Middleware Nuxt** : Protection des routes frontend
- **Rôles hiérarchiques** : ADMIN → PROFESSIONNEL → RADIOLOGUE → PATIENT

#### **Protection des Données**
- **CORS** : Configuration restrictive pour les origins
- **HTTPS** : Chiffrement des communications
- **Validation** : Sanitization côté client et serveur
- **Audit Trail** : Traçabilité complète des actions

### 🔄 Workflow Typique

1. **Authentification** : Utilisateur → Frontend → Backend → JWT
2. **Navigation** : Frontend → Middleware → Route Protection
3. **Données Patients** : Frontend → Backend → MySQL
4. **Images DICOM** : Frontend → Backend → Orthanc
5. **Notifications** : Backend → Frontend (WebSocket)

Cette architecture garantit la scalabilité, la sécurité et la maintenabilité de la plateforme MedCenter, tout en offrant une expérience utilisateur fluide et performante.

---

# ⭐ PARTIE V - FONCTIONNALITÉS

## 🏥 Fonctionnalités Principales

### 🔐 Authentification et Sécurité
- **Authentification JWT** : Système de tokens sécurisés avec expiration
- **Gestion multi-rôles** : Admin, Professionnel, Radiologue, Patient
- **OAuth2 Integration** : Support GitHub et Google
- **Protection des routes** : Middleware de sécurité frontend et backend
- **Autorisation basée sur les rôles** : Contrôle d'accès granulaire

### 👥 Gestion des Utilisateurs
- **Profils utilisateurs** : Patients, Professionnels de santé, Administrateurs
- **Gestion des hôpitaux** : Organisation par établissements
- **Équipes médicales** : Gestion des équipes et spécialités
- **Paramètres utilisateur** : Configuration personnalisée

### 🩺 Gestion Médicale
- **Dossiers patients** : Création, modification, consultation
- **Historique médical** : Suivi complet des consultations
- **Consultations** : Planification et gestion des rendez-vous
- **Prescriptions** : Gestion des ordonnances et médicaments
- **Données de santé** : Suivi des constantes vitales
- **Pathologies chroniques** : Gestion des maladies de longue durée

### 🖼️ Imagerie Médicale (DICOM)
- **Intégration Orthanc** : Serveur DICOM intégré
- **Visualisation d'images** : Viewer DICOM avancé
- **Gestion des études** : Organisation par patient et date
- **Téléchargement d'images** : Export sécurisé des examens
- **Upload DICOM** : Import d'images médicales
- **Rapports d'imagerie** : Génération de comptes-rendus

### 📊 Tableau de Bord et Analytics
- **Dashboard temps réel** : Métriques et KPI en direct
- **Graphiques interactifs** : Visualisation des données
- **Statistiques patients** : Suivi des admissions et consultations
- **Métriques de performance** : Analyse de l'activité médicale
- **Alertes et notifications** : Système de notification proactif

### 💬 Communication
- **Messagerie interne** : Système de messages entre professionnels
- **Notifications push** : Alertes temps réel
- **Email intégré** : Envoi d'emails via Resend API
- **Composition d'emails** : Interface de rédaction avancée

### 🔍 Recherche et Filtrage
- **Recherche globale** : Recherche dans tous les modules
- **Filtres avancés** : Critères de recherche multiples
- **Tri et pagination** : Navigation optimisée
- **Export de données** : Génération de rapports

### 📋 Conseils Médicaux
- **Base de connaissances** : Pathologies et traitements
- **Conseils personnalisés** : Recommandations par patient
- **Catégorisation** : Organisation par spécialité
- **Ressources documentaires** : Liens et références

### ⚙️ Administration
- **Gestion des serveurs DICOM** : Configuration multi-serveurs
- **Paramètres système** : Configuration globale
- **Audit et logs** : Traçabilité des actions
- **Sauvegarde et restauration** : Protection des données
- **Gestion des licences** : Suivi des abonnements

### 📱 Interface Utilisateur
- **Design responsive** : Compatible mobile et desktop
- **Interface moderne** : Design basé sur Tailwind CSS
- **Accessibilité** : Conforme aux standards WCAG
- **Thèmes personnalisables** : Mode sombre/clair
- **Navigation intuitive** : UX optimisée

---

# 📸 PARTIE VI - CAPTURES D'ÉCRAN

## Interface Utilisateur - Aperçu Visuel

### 🏠 Tableau de Bord Médecin Professionnel

<div align="center">
<img src="./docs/screenshots/dashboard-principal.png" alt="Tableau de Bord Médecin Professionnel" style="width: 100%; max-width: 1200px; border: 1px solid #ddd; border-radius: 8px; margin: 20px 0;">
</div>

*Tableau de bord personnalisé pour les médecins professionnels avec vue d'ensemble des patients, consultations du jour et métriques médicales*

---

### 👥 Gestion des Patients

<div align="center">
<img src="./docs/screenshots/gestion-patients.png" alt="Interface de Gestion des Patients" style="width: 100%; max-width: 1200px; border: 1px solid #ddd; border-radius: 8px; margin: 20px 0;">
</div>

*Interface complète de gestion des patients avec fonctionnalités de recherche, filtrage et actions CRUD*

---

### 🖼️ Tableau de Bord Imagerie Médicale

<div align="center">
<img src="./docs/screenshots/visualiseur-dicom.png" alt="Tableau de Bord Imagerie Médicale" style="width: 100%; max-width: 1200px; border: 1px solid #ddd; border-radius: 8px; margin: 20px 0;">
</div>

*Tableau de bord dédié à l'imagerie médicale avec accès rapide aux examens, statistiques d'imagerie et outils de visualisation DICOM*

---

### 👥 Patients Orthanc

<div align="center">
<img src="./docs/screenshots/interface-orthanc.png" alt="Liste des Patients Orthanc" style="width: 100%; max-width: 1200px; border: 1px solid #ddd; border-radius: 8px; margin: 20px 0;">
</div>

*Interface affichant la liste des patients stockés dans le serveur DICOM Orthanc avec leurs études et examens d'imagerie*

---

### 💡 Conseils Médicaux - Pathologies

<div align="center">
<img src="./docs/screenshots/messagerie-interne.png" alt="Page Conseils Médicaux Pathologies" style="width: 100%; max-width: 1200px; border: 1px solid #ddd; border-radius: 8px; margin: 20px 0;">
</div>

*Page dédiée aux conseils médicaux concernant les pathologies avec catégorisation, recommandations thérapeutiques et ressources documentaires*

---

# 🔗 PARTIE VII - INTÉGRATION

## Communication Backend-Frontend

### 🔄 Flux de Données

1. **Authentification** : Frontend → Backend `/api/auth/login`
2. **Données Patients** : Frontend → Backend `/api/medical/patients`
3. **Images DICOM** : Frontend → Backend → Orthanc
4. **Notifications** : Backend → Frontend (temps réel)

## Déploiement

### 🚀 Configuration de Déploiement

#### Backend (Spring Boot)
```bash
# Build
mvn clean package -DskipTests

# Déploiement
java -jar target/medcenter-0.0.1-SNAPSHOT.jar
```

#### Frontend (Nuxt 3)
```bash
# Build
npm run build

# Déploiement
npm run start
```

#### Docker Compose
```yaml
version: '3.8'
services:
  backend:
    build: ./backend
    ports:
      - "9000:9000"
    environment:
      - SPRING_PROFILES_ACTIVE=prod
  
  frontend:
    build: ./frontend
    ports:
      - "3000:3000"
    environment:
      - API_BASE_URL=http://backend:9000
  
  database:
    image: mysql:8.0
    environment:
      - MYSQL_DATABASE=med_center
      - MYSQL_USER=wally
      - MYSQL_PASSWORD=passer
```

## Roadmap

### 📋 Évolutions Prévues

#### Court Terme (Q3 2025)
- [ ] Tests d'intégration complets
- [ ] Documentation API OpenAPI
- [ ] Optimisation des performances
- [ ] Monitoring avancé

#### Moyen Terme (Q4 2025)
- [ ] Intégration Redis pour cache
- [ ] Notifications push
- [ ] Module de télémedecine
- [ ] App mobile

#### Long Terme (2026)
- [ ] Intelligence artificielle
- [ ] Intégration IoT médical
- [ ] Blockchain pour sécurité
- [ ] Expansion internationale

---

## 🛡️ Sécurité Globale

### Mesures de Sécurité Implémentées

1. **Authentification JWT** : Tokens sécurisés avec expiration
2. **CORS** : Configuration restrictive
3. **HTTPS** : Chiffrement des communications
4. **Validation** : Validation côté client et serveur
5. **Autorisation** : Contrôle d'accès basé sur les rôles
6. **Audit** : Traçabilité des actions

---

## 🔧 Maintenance et Support

### Équipe Technique

- **Développement Backend** : Spring Boot, Java
- **Développement Frontend** : Nuxt, Vue.js
- **DevOps** : Docker, CI/CD
- **Sécurité** : Audit, tests de pénétration
- **Base de données** : MySQL, optimisation

### Ressources

- **Documentation** : Wiki technique complet
- **Tests** : Suites de tests automatisés
- **Monitoring** : Dashboards de surveillance
- **Support** : Équipe de support 24/7

---

**Fin du Rapport Technique Complet**

---

*Ce document constitue la documentation technique complète de la plateforme MedCenter, couvrant tous les aspects du développement, de l'architecture et du déploiement.*

**Équipe de Développement MedCenter**
**Juin 2025**