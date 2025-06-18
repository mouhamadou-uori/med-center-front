import { useFetch } from '#app'

export interface OrthancPatient {
  ID: string
  MainDicomTags: {
    PatientID: string
    PatientName: string
    PatientBirthDate?: string
    PatientSex?: string
  }
  Studies: string[]
  Type: string
  LastUpdate: string
}

export interface OrthancStudy {
  ID: string
  MainDicomTags: {
    StudyDate: string
    StudyDescription: string
    StudyID: string
    StudyInstanceUID: string
    AccessionNumber?: string
  }
  PatientMainDicomTags: {
    PatientID: string
    PatientName: string
    PatientBirthDate?: string
    PatientSex?: string
  }
  Series: string[]
  ParentPatient: string
  Type: string
  LastUpdate: string
}

export interface OrthancSeries {
  ID: string
  MainDicomTags: {
    SeriesDate?: string
    SeriesDescription?: string
    SeriesInstanceUID: string
    SeriesNumber: string
    Modality: string
  }
  Status: string
  Instances: string[]
  Type: string
  ParentStudy: string
  LastUpdate: string
}

export interface OrthancStatistics {
  CountPatients: number
  CountStudies: number
  CountSeries: number
  CountInstances: number
  TotalDiskSizeMB: number
  FreeDiskSizeMB: number
  DicomAet: string
  DicomPort: number
  HttpPort: number
  Version: string
  Uptime: string
}

export interface OrthancInstance {
  ID: string
  FileSize: number
  FileUuid: string
  IndexInSeries: number
  MainDicomTags: {
    InstanceNumber: string
    SOPInstanceUID: string
    ImageComments?: string
  }
  ParentSeries: string
  Type: string
}

export interface OrthancSearchResult {
  ID: string
  Path: string
  Type: string
  ParentResource: string
}

export interface OrthancSystemInfo {
  Version: string
  DatabaseVersion: string
  DicomAet: string
  DicomPort: number
  HttpPort: number
  Name: string
  PluginsEnabled: string[]
  StorageDirectorySize: number
  MemoryStatistics: {
    WorkingSetSize: number
    PeakWorkingSetSize: number
    PagedPool: number
    PeakPagedPool: number
    NonPagedPool: number
    PeakNonPagedPool: number
  }
  StorageCompression: boolean
}

export const useOrthancService = () => {
  const baseUrl = '/api/orthanc'

  const fetchPatients = async () => {
    return await useFetch<OrthancPatient[]>(`${baseUrl}/patients`)
  }

  const fetchPatient = async (id: string) => {
    return await useFetch<OrthancPatient>(`${baseUrl}/patients/${id}`)
  }

  const fetchPatientStudies = async (patientId: string) => {
    return await useFetch<OrthancStudy[]>(`${baseUrl}/patients/${patientId}/studies`)
  }

  const fetchStudy = async (studyId: string) => {
    return await useFetch<OrthancStudy>(`${baseUrl}/studies/${studyId}`)
  }

  const fetchStudySeries = async (studyId: string) => {
    return await useFetch<OrthancSeries[]>(`${baseUrl}/studies/${studyId}/series`)
  }

  const fetchStatistics = async () => {
    return await useFetch<OrthancStatistics>(`${baseUrl}/statistics`)
  }

  const fetchSystemInfo = async () => {
    return await useFetch<OrthancSystemInfo>(`${baseUrl}/system`)
  }

  const searchDicom = async (query: any) => {
    return await useFetch<OrthancSearchResult[]>(`${baseUrl}/tools/find`, {
      method: 'POST',
      body: query
    })
  }

  const downloadStudyArchive = async (studyId: string) => {
    return await useFetch(`${baseUrl}/studies/${studyId}/archive`, {
      responseType: 'blob'
    })
  }

  const getInstancePreview = async (instanceId: string) => {
    return await useFetch(`${baseUrl}/instances/${instanceId}/preview`, {
      responseType: 'blob'
    })
  }

  const downloadInstanceFile = async (instanceId: string) => {
    return await useFetch(`${baseUrl}/instances/${instanceId}/file`, {
      responseType: 'blob'
    })
  }

  const fetchInstance = async (instanceId: string) => {
    return await useFetch<OrthancInstance>(`${baseUrl}/instances/${instanceId}`)
  }

  return {
    fetchPatients,
    fetchPatient,
    fetchPatientStudies,
    fetchStudy,
    fetchStudySeries,
    fetchStatistics,
    fetchSystemInfo,
    searchDicom,
    downloadStudyArchive,
    getInstancePreview,
    downloadInstanceFile,
    fetchInstance
  }
}
