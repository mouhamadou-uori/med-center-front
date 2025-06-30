// Types pour les statistiques du dashboard
export interface Stat {
  label: string
  value: number
  icon: string
  type: 'revenue' | 'patients' | 'consultations' | 'general'
}

// Types pour les périodes de temps
export type Period = 'today' | 'week' | 'month' | 'year'

// Types pour les plages de données
export interface Range {
  start: string // Date ISO string
  end: string   // Date ISO string
}

// Types pour les réponses de l'API de statistiques
export interface StatsResponse {
  totalConsultations: number
  totalPatients: number
  totalRevenue: number
  consultationsToday: number
  patientsToday: number
  revenueToday: number
}

// Types pour les graphiques
export interface ChartData {
  labels: string[]
  datasets: {
    label: string
    data: number[]
    backgroundColor?: string | string[]
    borderColor?: string | string[]
    borderWidth?: number
  }[]
}

// Types pour les données de consultation
export interface ConsultationData {
  id: number
  patientName: string
  date: string
  status: 'completed' | 'pending' | 'cancelled'
  revenue: number
}

// Types pour les professionnels de santé
export interface ProfessionnelSante {
  id: number
  nom: string
  prenom: string
  specialite: string
  numeroOrdre: string
  hopital?: {
    id: number
    nom: string
    type: string
  }
}

// Types pour les hôpitaux
export interface Hopital {
  id: number
  nom: string
  type: string
  region: string
  ville: string
  adresse: string
  telephone: string
  email?: string
}

// Types pour les conseils médicaux publics
export interface Conseil {
  id: number
  titre: string
  resume: string
  contenu: string
  dateCreation: string
  dateModification: string
  datePublication: string
  statut: 'BROUILLON' | 'EN_REVISION' | 'PUBLIE' | 'ARCHIVE'
  visiblePublic: boolean
  pathologieId: number
  pathologieNom: string
  auteurId: number
  auteurNom: string
  approuveParId: number
  approuveParNom: string
  motsCles: string
  slug?: string
  sections: Section[]
  ressources: Ressource[]
  recommandations: Recommandation[]
}

export interface Recommandation {
  id: number
  texte: string
  ordre: number
}

export interface Pathologie {
  id: number
  nom: string
  description: string
  symptomes: string
  traitements: string
  prevention: string
  categorieId: number
  slug: string
  dateCreation: string
  actif: boolean
  categorie?: Categorie
}

export interface Categorie {
  id: number
  nom: string
  description: string
  actif: boolean
  couleur?: string
  icone?: string
}

export interface Section {
  id: number
  titre: string
  contenu: string
  ordre: number
  conseilId: number
}

export interface Ressource {
  id: number
  titre: string
  description: string
  type: 'PDF' | 'LIEN' | 'VIDEO'
  url: string
  conseilId: number
}

// Types pour les emails
export interface Mail {
  id: string
  unread?: boolean
  from: {
    name: string
    email: string
    avatar?: {
      src: string
      alt: string
    }
  }
  subject: string
  body: string
  date: string
  attachments?: Attachment[]
}

export interface Attachment {
  id: string
  name: string
  size: number
  type: string
  url: string
}

export interface ComposeEmailData {
  to: string[]
  cc?: string[]
  bcc?: string[]
  subject: string
  body: string
  attachments?: File[]
}
