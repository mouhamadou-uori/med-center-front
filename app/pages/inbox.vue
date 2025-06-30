<script setup lang="ts">
import { computed, ref, onMounted } from 'vue'
import type { Mail, ComposeEmailData } from '~/types'
import { useEmailService } from '~/services/email'
import { useAuth } from '~/services/auth'

definePageMeta({
  requiresAuth: true
})

const emailService = useEmailService()
const { getCurrentUser } = useAuth()
const user = getCurrentUser()

// États pour les emails reçus
const emails = ref<Mail[]>([])
const loading = ref(true)
const error = ref<string | null>(null)
const selectedMail = ref<Mail | null>(null)

// États pour la composition d'email
const composedEmail = ref<ComposeEmailData>({
  to: [''],
  cc: [''],
  bcc: [''],
  subject: '',
  body: ''
})

const showTemplates = ref(false)
const sending = ref(false)

// Modèles d'email prédéfinis
const emailTemplates = [
  {
    name: 'Confirmation RDV',
    subject: 'Confirmation de votre rendez-vous',
    body: `Bonjour,

Votre rendez-vous est confirmé pour le [DATE] à [HEURE].

Lieu : [LIEU]
Médecin : Dr [NOM_MEDECIN]

Merci de vous présenter 15 minutes avant l'heure du rendez-vous.

Cordialement,
L'équipe MedCenter`
  },
  {
    name: 'Rappel RDV',
    subject: 'Rappel : Rendez-vous demain',
    body: `Bonjour,

Nous vous rappelons votre rendez-vous demain à [HEURE] avec Dr [NOM_MEDECIN].

N'oubliez pas d'apporter votre carte vitale et vos ordonnances en cours.

À bientôt,
L'équipe MedCenter`
  },
  {
    name: 'Résultats disponibles',
    subject: 'Vos résultats sont disponibles',
    body: `Bonjour,

Vos résultats d'examens sont maintenant disponibles dans votre espace patient.

Connectez-vous pour les consulter : http://localhost:3000/results

Cordialement,
Votre équipe médicale`
  }
]

// Charger les emails reçus du professionnel connecté
const loadReceivedEmails = async () => {
  if (!user?.id) {
    error.value = "Utilisateur non connecté"
    loading.value = false
    return
  }

  try {
    loading.value = true
    const response = await $fetch(`/api/medical/professionnels/${user.id}/emails/received`)
    emails.value = response
    error.value = null
  } catch (err) {
    console.error('Erreur lors du chargement des emails:', err)
    error.value = "Impossible de charger les emails"
    // Données de fallback pour les tests
    emails.value = [
      {
        id: '1',
        unread: true,
        from: {
          name: 'Dr Martin Durand',
          email: 'martin.durand@medcenter.com',
          avatar: { 
            src: 'https://github.com/nuxt.png', 
            alt: 'Dr Durand' 
          }
        },
        subject: 'Consultation urgente',
        body: 'Patient nécessitant une consultation en urgence...',
        date: new Date().toISOString()
      },
      {
        id: '2',
        unread: false,
        from: {
          name: 'Secrétariat',
          email: 'secretariat@medcenter.com',
          avatar: { 
            src: 'https://github.com/nuxtlabs.png', 
            alt: 'Secrétariat' 
          }
        },
        subject: 'Planning modifié',
        body: 'Votre planning de demain a été modifié...',
        date: new Date(Date.now() - 86400000).toISOString()
      }
    ]
  } finally {
    loading.value = false
  }
}

// Filtrer les emails non lus
const unreadCount = computed(() => {
  return emails.value.filter(mail => mail.unread).length
})

// Utiliser un modèle d'email
const useTemplate = (template: any) => {
  composedEmail.value.subject = template.subject
  composedEmail.value.body = template.body
  showTemplates.value = false
}

// Envoyer l'email
const sendEmail = async () => {
  if (!composedEmail.value.to[0] || !composedEmail.value.subject || !composedEmail.value.body) {
    return
  }

  try {
    sending.value = true
    const result = await emailService.sendCompleteEmail({
      to: composedEmail.value.to.filter(email => email.trim() !== ''),
      cc: composedEmail.value.cc?.filter(email => email.trim() !== ''),
      bcc: composedEmail.value.bcc?.filter(email => email.trim() !== ''),
      subject: composedEmail.value.subject,
      html: `<div style="font-family: Arial, sans-serif; white-space: pre-wrap;">${composedEmail.value.body}</div>`
    })

    if (result.status === 'SUCCESS') {
      console.log('Email envoyé avec succès!')
      // Réinitialiser le formulaire
      composedEmail.value = {
        to: [''],
        cc: [''],
        bcc: [''],
        subject: '',
        body: ''
      }
    } else {
      console.error('Erreur:', result.message)
    }
  } catch (error) {
    console.error('Erreur lors de l\'envoi:', error)
  } finally {
    sending.value = false
  }
}

// Charger les emails au montage
onMounted(() => {
  loadReceivedEmails()
})
</script>

<template>
  <UDashboardPanel>
    <template #header>
      <UDashboardNavbar title="Messagerie">
        <template #subtitle>
          <span v-if="unreadCount > 0" class="text-primary">
            {{ unreadCount }} nouveau(x) message(s)
          </span>
          <span v-else class="text-gray-500">
            Aucun nouveau message
          </span>
        </template>
        
        <template #leading>
          <UDashboardSidebarCollapse />
        </template>

        <template #right>
          <UButton
            icon="i-lucide-refresh-cw"
            color="gray"
            variant="ghost"
            :loading="loading"
            @click="loadReceivedEmails"
          />
        </template>
      </UDashboardNavbar>
    </template>

    <template #body>
      <div class="h-full grid grid-cols-1 lg:grid-cols-2 gap-6 p-6">
        <!-- Section 1: Liste des emails reçus -->
        <div class="flex flex-col">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold">Messages reçus</h2>
            <UBadge v-if="unreadCount > 0" color="primary">
              {{ unreadCount }} non lu(s)
            </UBadge>
          </div>

          <!-- État de chargement -->
          <div v-if="loading" class="space-y-3">
            <USkeleton class="h-16 w-full" v-for="i in 5" :key="i" />
          </div>

          <!-- État d'erreur -->
          <div v-else-if="error" class="text-center py-8">
            <UIcon name="i-lucide-alert-triangle" class="size-12 mx-auto text-red-500 mb-4" />
            <p class="text-red-600 mb-4">{{ error }}</p>
            <UButton @click="loadReceivedEmails" size="sm">Réessayer</UButton>
          </div>

          <!-- Liste des emails -->
          <div v-else class="flex-1 overflow-y-auto space-y-2">
            <div v-if="emails.length === 0" class="text-center py-8">
              <UIcon name="i-lucide-inbox" class="size-16 mx-auto text-gray-400 mb-4" />
              <p class="text-gray-600">Aucun email reçu</p>
            </div>

            <UCard
              v-for="email in emails"
              :key="email.id"
              @click="selectedMail = email"
              class="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              :class="{ 'ring-2 ring-primary-500': selectedMail?.id === email.id }"
            >
              <div class="flex items-start gap-3">
                <UAvatar
                  v-bind="email.from.avatar"
                  :alt="email.from.name"
                  size="sm"
                />
                <div class="flex-1 min-w-0">
                  <div class="flex items-center gap-2">
                    <h4 class="font-medium truncate">{{ email.from.name }}</h4>
                    <UBadge v-if="email.unread" color="blue" size="xs">Nouveau</UBadge>
                  </div>
                  <p class="text-sm text-gray-600 dark:text-gray-400 truncate mt-1">
                    {{ email.subject }}
                  </p>
                  <p class="text-xs text-gray-500 mt-1">
                    {{ new Date(email.date).toLocaleDateString('fr-FR') }}
                  </p>
                </div>
              </div>
            </UCard>
          </div>

          <!-- Détails de l'email sélectionné -->
          <div v-if="selectedMail" class="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div class="flex items-center justify-between mb-3">
              <h3 class="font-semibold">{{ selectedMail.subject }}</h3>
              <UButton
                icon="i-lucide-x"
                color="gray"
                variant="ghost"
                size="xs"
                @click="selectedMail = null"
              />
            </div>
            <p class="text-sm text-gray-600 dark:text-gray-400 mb-2">
              De: {{ selectedMail.from.name }} ({{ selectedMail.from.email }})
            </p>
            <div class="text-sm">
              {{ selectedMail.body }}
            </div>
          </div>
        </div>

        <!-- Section 2: Composition d'email -->
        <div class="flex flex-col">
          <div class="flex items-center justify-between mb-4">
            <h2 class="text-lg font-semibold">Nouveau message</h2>
            <UButton
              icon="i-lucide-template"
              label="Modèles"
              color="gray"
              variant="soft"
              @click="showTemplates = true"
            />
          </div>

          <div class="flex-1 flex flex-col space-y-4">
            <!-- Champs du formulaire -->
            <UFormField label="À" required>
              <UInput
                v-model="composedEmail.to[0]"
                placeholder="destinataire@example.com"
                type="email"
                required
              />
            </UFormField>

            <UFormField label="CC (optionnel)">
              <UInput
                v-model="composedEmail.cc[0]"
                placeholder="copie@example.com"
                type="email"
              />
            </UFormField>

            <UFormField label="Objet" required>
              <UInput
                v-model="composedEmail.subject"
                placeholder="Objet du message"
                required
              />
            </UFormField>

            <UFormField label="Message" required class="flex-1">
              <UTextarea
                v-model="composedEmail.body"
                placeholder="Votre message..."
                :rows="12"
                class="h-full resize-none"
                required
              />
            </UFormField>

            <!-- Boutons d'action -->
            <div class="flex gap-2">
              <UButton
                icon="i-lucide-send"
                label="Envoyer"
                @click="sendEmail"
                :loading="sending"
                :disabled="!composedEmail.to[0] || !composedEmail.subject || !composedEmail.body"
              />
              <UButton
                icon="i-lucide-paperclip"
                label="Joindre"
                color="gray"
                variant="soft"
              />
              <UButton
                label="Brouillon"
                color="gray"
                variant="ghost"
              />
            </div>
          </div>
        </div>
      </div>
    </template>
  </UDashboardPanel>

  <!-- Modal des modèles -->
  <UModal v-model="showTemplates">
    <UCard>
      <template #header>
        <h3 class="text-lg font-semibold">Modèles d'email</h3>
      </template>

      <div class="space-y-3">
        <UCard
          v-for="template in emailTemplates"
          :key="template.name"
          class="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
          @click="useTemplate(template)"
        >
          <h4 class="font-medium">{{ template.name }}</h4>
          <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {{ template.subject }}
          </p>
        </UCard>
      </div>

      <template #footer>
        <div class="flex justify-end">
          <UButton color="gray" @click="showTemplates = false">Fermer</UButton>
        </div>
      </template>
    </UCard>
  </UModal>

  <!-- Modal des modèles -->
  <UModal v-model="showTemplates">
    <UCard>
      <template #header>
        <h3 class="text-lg font-semibold">Modèles d'email</h3>
      </template>

      <div class="space-y-3">
        <UCard
          v-for="template in emailTemplates"
          :key="template.name"
          class="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800"
          @click="useTemplate(template)"
        >
          <h4 class="font-medium">{{ template.name }}</h4>
          <p class="text-sm text-gray-600 dark:text-gray-400 mt-1">
            {{ template.subject }}
          </p>
        </UCard>
      </div>

      <template #footer>
        <div class="flex justify-end">
          <UButton color="gray" @click="showTemplates = false">Fermer</UButton>
        </div>
      </template>
    </UCard>
  </UModal>
</template>
