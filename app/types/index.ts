
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
