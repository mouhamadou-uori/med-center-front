import { useAuth } from './auth'

/**
 * Types pour les réponses API DICOM/Orthanc
 */

// Patient
export interface OrthancPatient {
  id: string;
  patientName: string;
  patientBirthDate: string;
  patientSex: string;
  patientId: string;
  isStable: boolean;
  lastUpdate: string;
  studies: string[];
  mainDicomTags: {
    PatientName: string;
    PatientID: string;
    PatientBirthDate?: string;
    PatientSex?: string;
    [key: string]: any;
  };
}

// Série DICOM
export interface OrthancSeries {
  id: string;
  seriesDescription: string;
  seriesNumber: string;
  modality: string;
  seriesInstanceUID: string;
  bodyPartExamined: string | null;
  isStable: boolean;
  lastUpdate: string;
  instancesCount: number;
  seriesMainDicomTags: Record<string, any>;
}

// Étude DICOM
export interface OrthancStudy {
  id: string;
  studyDate: string;
  studyTime: string;
  studyDescription: string;
  studyInstanceUID: string;
  accessionNumber: string;
  isStable: boolean;
  lastUpdate: string;
  studyMainDicomTags: Record<string, any>;
  series: OrthancSeries[];
}

// Détails complets d'un patient
export interface OrthancPatientDetails {
  orthancUrl: string;
  hopitalId: number;
  hopitalNom: string;
  patientId: string;
  patientName: string;
  patientBirthDate: string;
  patientSex: string;
  patientIdDicom: string;
  isStable: boolean;
  lastUpdate: string;
  patientMainDicomTags: Record<string, any>;
  studies: OrthancStudy[];
}

// Liste des patients d'un hôpital
export interface OrthancPatientsResponse {
  orthancUrl: string;
  hopitalId: number;
  hopitalNom: string;
  patients: OrthancPatient[];
}

/**
 * Service pour accéder aux données DICOM via Orthanc
 */
export const useDicomService = () => {
  const config = useRuntimeConfig();
  const baseApiUrl = 'http://localhost:9000/api/medical';
  const { getToken, getCurrentUser } = useAuth();

  /**
   * Récupère l'ID de l'hôpital de l'utilisateur courant
   */
  const getUserHopitalId = (): number | null => {
    const user = getCurrentUser();
    if (!user || !user.hopital) {
      console.warn('[DICOM] Aucun hôpital associé à l\'utilisateur');
      return null;
    }
    return user.hopital.id;
  };

  /**
   * Récupère l'URL du serveur DICOM pour un hôpital
   */
  const getDicomServerUrl = async (hopitalId: number) => {
    const token = getToken();
    if (!token) {
      throw new Error('Non authentifié');
    }

    try {
      const response = await $fetch<{ url: string }>(`${baseApiUrl}/hopitaux/${hopitalId}/dicom-url`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      return response.url;
    } catch (error) {
      console.error('[DICOM] Erreur lors de la récupération de l\'URL du serveur DICOM:', error);
      throw error;
    }
  };

  /**
   * Récupère la liste des patients d'un hôpital
   */
  const getPatients = async (hopitalId?: number): Promise<OrthancPatientsResponse> => {
    const token = getToken();
    if (!token) {
      throw new Error('Non authentifié');
    }

    // Utiliser l'ID d'hôpital fourni ou celui de l'utilisateur
    const finalHopitalId = hopitalId || getUserHopitalId();
    if (!finalHopitalId) {
      throw new Error('ID d\'hôpital non disponible');
    }

    try {
      return await $fetch<OrthancPatientsResponse>(`${baseApiUrl}/hopitaux/${finalHopitalId}/patients-orthanc`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    } catch (error) {
      console.error('[DICOM] Erreur lors de la récupération des patients:', error);
      throw error;
    }
  };

  /**
   * Récupère les détails complets d'un patient avec ses études et séries
   */
  const getPatientDetails = async (patientId: string, hopitalId?: number): Promise<OrthancPatientDetails> => {
    const token = getToken();
    if (!token) {
      throw new Error('Non authentifié');
    }

    // Utiliser l'ID d'hôpital fourni ou celui de l'utilisateur
    const finalHopitalId = hopitalId || getUserHopitalId();
    
    try {
      let endpoint = '';
      
      if (finalHopitalId) {
        // Endpoint spécifique à un hôpital
        endpoint = `${baseApiUrl}/hopitaux/${finalHopitalId}/patients-orthanc/${patientId}/details`;
      } else {
        // Endpoint pour rechercher dans tous les hôpitaux
        endpoint = `${baseApiUrl}/patients-orthanc/${patientId}/details`;
      }
      
      return await $fetch<OrthancPatientDetails>(endpoint, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
    } catch (error) {
      console.error('[DICOM] Erreur lors de la récupération des détails du patient:', error);
      throw error;
    }
  };

  /**
   * Formate une date DICOM (YYYYMMDD) en format lisible
   */
  const formatDicomDate = (dicomDate?: string): string => {
    if (!dicomDate || dicomDate.length !== 8) {
      return 'Date inconnue';
    }
    
    const year = dicomDate.substring(0, 4);
    const month = dicomDate.substring(4, 6);
    const day = dicomDate.substring(6, 8);
    
    return `${day}/${month}/${year}`;
  };

  /**
   * Formate l'heure DICOM (HHMMSS) en format lisible
   */
  const formatDicomTime = (dicomTime?: string): string => {
    if (!dicomTime || dicomTime.length < 6) {
      return 'Heure inconnue';
    }
    
    const hours = dicomTime.substring(0, 2);
    const minutes = dicomTime.substring(2, 4);
    const seconds = dicomTime.substring(4, 6);
    
    return `${hours}:${minutes}:${seconds}`;
  };

  /**
   * Récupère l'URL d'aperçu d'une instance DICOM
   */
  const getImagePreviewUrl = (instanceId: string, hopitalId?: number): string => {
    const finalHopitalId = hopitalId || getUserHopitalId();
    if (!finalHopitalId) {
      console.warn('[DICOM] ID d\'hôpital non disponible pour l\'URL d\'aperçu');
      return '';
    }
    
    return `${baseApiUrl}/hopitaux/${finalHopitalId}/orthanc/instances/${instanceId}/preview`;
  };

  return {
    getUserHopitalId,
    getDicomServerUrl,
    getPatients,
    getPatientDetails,
    formatDicomDate,
    formatDicomTime,
    getImagePreviewUrl
  };
};
