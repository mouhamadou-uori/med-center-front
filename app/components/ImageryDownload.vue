<template>
  <div>
    <div class="p-4">
      <div class="flex flex-col gap-4">
        <!-- Liste des études -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div v-for="study in studies" :key="study.id">
            <UCard class="hover:shadow-md transition-shadow duration-200">
              <div class="p-4">
                <div class="flex flex-col gap-2">
                  <div class="flex-1">
                    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div>
                        <h4 class="font-medium">{{ study.studyDescription || 'Étude sans description' }}</h4>
                        <p class="text-sm text-gray-600 dark:text-gray-400">
                          {{ formatDate(study.studyDate) }} 
                          <span v-if="study.studyTime">
                            {{ dicomService.formatDicomTime(study.studyTime) }}
                          </span>
                          <UBadge class="ml-2" color="primary" size="xs">
                            {{ study.series.length }} séries
                          </UBadge>
                        </p>
                      </div>
                      
                      <UButton
                        color="gray"
                        variant="soft"
                        size="xs"
                        icon="i-lucide-download"
                        :loading="downloadInProgress && selectedStudies.includes(study.id)"
                        @click.stop="selectedStudies = [study.id]; downloadSelectedStudies()"
                      >
                        Télécharger
                      </UButton>
                    </div>
                    
                    <div class="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      <span class="font-mono">{{ study.id.substring(0, 8) }}...</span>
                      <span v-if="study.accessionNumber" class="ml-2">
                        Accession: {{ study.accessionNumber }}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </UCard>
          </div>
        </div>

        <!-- Instructions et informations complémentaires -->
        <UCard class="mt-6 bg-gray-50 dark:bg-gray-800/50">
          <template #header>
            <div class="flex items-center gap-2">
              <UIcon name="i-lucide-info" class="text-blue-600 size-5" />
              <h3 class="font-medium">Instructions de téléchargement</h3>
            </div>
          </template>

          <div class="prose dark:prose-invert max-w-none">
            <p>
              Cette page vous permet de télécharger des études d'imagerie médicale au format DICOM. 
              Suivez ces étapes :
            </p>
            <ol>
              <li>Sélectionnez un patient dans la liste à gauche</li>
              <li>Cochez les études que vous souhaitez télécharger</li>
              <li>Cliquez sur le bouton "Télécharger la sélection"</li>
              <li>Les études sélectionnées seront téléchargées sous forme d'archive ZIP</li>
            </ol>
            
            <div class="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg mt-4">
              <h4 class="text-blue-800 dark:text-blue-300 font-medium">Remarque importante</h4>
              <p class="text-blue-700 dark:text-blue-300 text-sm mt-1">
                Les fichiers DICOM peuvent être volumineux. Le téléchargement peut prendre quelques minutes
                selon la taille des études et votre connexion internet.
              </p>
            </div>
          </div>
        </UCard>
      </div>

      <!-- Pied de page -->
      <div class="p-4 border-t sticky bottom-0 bg-white dark:bg-gray-800 rounded-b-lg">
        <div class="flex items-center justify-between">
          <UButton
            v-if="selectedStudies.length > 0"
            color="primary" 
            icon="i-lucide-download"
            :disabled="downloadInProgress"
            :loading="downloadInProgress"
            @click="downloadSelectedStudies"
          >
            Télécharger {{ selectedStudies.length }} étude(s)
          </UButton>
          <div v-else></div> <!-- Élément vide pour maintenir le flex space-between -->
          <UButton color="gray" @click="closeModal">Fermer</UButton>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useDicomService } from '~/services/dicom'
import type { OrthancPatient, OrthancStudy } from '~/services/dicom'

definePageMeta({
  requiresAuth: true
})

const dicomService = useDicomService()

const props = defineProps<{
  studies: Array<any>;
  closeModal: () => void;
}>();

const emit = defineEmits<{
  (e: 'download', studyIds: string[]): void;
}>();

const selectedStudies = ref<string[]>([]);
const downloadInProgress = ref(false);

/**
 * Formate une date au format local
 */
const formatDate = (dateString?: string): string => {
  if (!dateString) return 'Date inconnue';
  const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: '2-digit', day: '2-digit' };
  return new Intl.DateTimeFormat('fr-FR', options).format(new Date(dateString));
};

/**
 * Télécharge les études sélectionnées
 */
const downloadSelectedStudies = async () => {
  if (selectedStudies.value.length === 0) {
    console.warn("Veuillez sélectionner au moins une étude")
    return
  }
  
  downloadInProgress.value = true
  
  try {
    console.log(`Préparation de ${selectedStudies.value.length} étude(s)`)
    
    // Simulation du téléchargement
    setTimeout(() => {
      console.log(`${selectedStudies.value.length} étude(s) téléchargée(s)`)
      downloadInProgress.value = false
    }, 2000)
    
  } catch (err) {
    console.error('Erreur lors du téléchargement:', err)
    downloadInProgress.value = false
  }
}
</script>

<style scoped>
/* Ajoutez ici vos styles spécifiques au composant */
</style>