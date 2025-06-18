-- SET FOREIGN_KEY_CHECKS = 0;

-- Tables sans dépendances
CREATE TABLE IF NOT EXISTS role (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    nom VARCHAR(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS hopital (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    nom VARCHAR(100) NOT NULL,
    type ENUM('PUBLIC', 'PRIVE', 'CLINIQUE', 'CHU', 'CENTRE_SANTE') NOT NULL,
    region VARCHAR(50) NOT NULL,
    ville VARCHAR(50) NOT NULL,
    adresse VARCHAR(255) NOT NULL,
    telephone VARCHAR(20) NOT NULL,
    email VARCHAR(100),
    site_web VARCHAR(100),
    statut VARCHAR(50)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tables avec une seule dépendance
CREATE TABLE IF NOT EXISTS utilisateur (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    last_name VARCHAR(50) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    username VARCHAR(50) NOT NULL,
    email VARCHAR(100) NOT NULL UNIQUE,
    tel VARCHAR(20),
    password VARCHAR(255) NOT NULL,
    roles VARCHAR(50) NOT NULL,
    date_creation DATETIME NOT NULL,
    date_suppression DATETIME,
    actif BOOLEAN DEFAULT TRUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS serveur_dicom (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    url_orthanc VARCHAR(255) NOT NULL,
    port_orthanc VARCHAR(10) NOT NULL,
    username VARCHAR(50) NOT NULL,
    password VARCHAR(50) NOT NULL,
    hopital_id BIGINT NOT NULL,
    CONSTRAINT fk_serveur_hopital FOREIGN KEY (hopital_id) REFERENCES hopital(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS professionnel_sante (
    id BIGINT PRIMARY KEY,
    specialite VARCHAR(100) NOT NULL,
    numero_ordre VARCHAR(50) NOT NULL,
    etablissement VARCHAR(100),
    region VARCHAR(50),
    hopital_id BIGINT,
    CONSTRAINT fk_prof_user FOREIGN KEY (id) REFERENCES utilisateur(id),
    CONSTRAINT fk_prof_hopital FOREIGN KEY (hopital_id) REFERENCES hopital(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS patient (
    id BIGINT PRIMARY KEY,
    numero_secu VARCHAR(15) NOT NULL UNIQUE, -- numéro de sécurité sociale
    adresse VARCHAR(255),
    contact_urgence VARCHAR(20),
    INDEX idx_patient_id (id),
    CONSTRAINT fk_patient_user FOREIGN KEY (id) REFERENCES utilisateur(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS administrateur (
    id BIGINT PRIMARY KEY,
    role VARCHAR(50),
    CONSTRAINT fk_admin_user FOREIGN KEY (id) REFERENCES utilisateur(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tables avec dépendances sur patient et professionnel_sante
CREATE TABLE IF NOT EXISTS consultation (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    date_heure DATETIME NOT NULL,
    type VARCHAR(50) NOT NULL,
    statut VARCHAR(50) NOT NULL,
    notes TEXT,
    professionnel_id BIGINT NOT NULL,
    patient_id BIGINT NOT NULL,
    CONSTRAINT fk_consult_prof FOREIGN KEY (professionnel_id) REFERENCES professionnel_sante(id),
    CONSTRAINT fk_consult_patient FOREIGN KEY (patient_id) REFERENCES patient(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS dossier_medical (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    date_creation DATETIME NOT NULL,
    date_mise_a_jour DATETIME,
    patient_id BIGINT NOT NULL,
    CONSTRAINT fk_dossier_patient FOREIGN KEY (patient_id) REFERENCES patient(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS prescription (
    id BIGINT PRIMARY KEY AUTO_INCREMENT,
    date_emission DATE NOT NULL,
    date_expiration DATE,
    medicaments TEXT NOT NULL,
    instructions TEXT,
    renouvelable BOOLEAN DEFAULT FALSE,
    consultation_id BIGINT NOT NULL,
    CONSTRAINT fk_prescription_consult FOREIGN KEY (consultation_id) REFERENCES consultation(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- SET FOREIGN_KEY_CHECKS = 1;
