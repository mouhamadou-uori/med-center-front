<script setup lang="ts">
import { useEmailService } from '~/services/email'
import type { EmailData } from '~/services/email'

const emit = defineEmits(['close', 'sent'])

const emailService = useEmailService()

// États du formulaire
const emailForm = reactive<EmailData>({
  to: [],
  subject: '',
  html: '',
  text: '',
  cc: [],
  bcc: []
})

const loading = ref(false)
const toInput = ref('')
const ccInput = ref('')
const bccInput = ref('')

// Mode d'envoi
const sendMode = ref<'sync' | 'async'>('sync')

// Ajouter des destinataires
const addRecipient = (input: string, array: string[]) => {
  if (input && emailService.isValidEmail(input)) {
    if (!array.includes(input)) {
      array.push(input)
    }
  }
}

const removeRecipient = (email: string, array: string[]) => {
  const index = array.indexOf(email)
  if (index > -1) {
    array.splice(index, 1)
  }
}

// Gérer l'appui sur Entrée pour ajouter des emails
const handleToKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' || event.key === ',') {
    event.preventDefault()
    addRecipient(toInput.value.trim(), emailForm.to)
    toInput.value = ''
  }
}

const handleCcKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' || event.key === ',') {
    event.preventDefault()
    addRecipient(ccInput.value.trim(), emailForm.cc!)
    ccInput.value = ''
  }
}

const handleBccKeydown = (event: KeyboardEvent) => {
  if (event.key === 'Enter' || event.key === ',') {
    event.preventDefault()
    addRecipient(bccInput.value.trim(), emailForm.bcc!)
    bccInput.value = ''
  }
}

// Envoyer l'email
const sendEmail = async () => {
  if (emailForm.to.length === 0) {
    emailService.showErrorNotification('Veuillez ajouter au moins un destinataire')
    return
  }

  if (!emailForm.subject) {
    emailService.showErrorNotification('Veuillez ajouter un objet')
    return
  }

  if (!emailForm.html && !emailForm.text) {
    emailService.showErrorNotification('Veuillez ajouter du contenu')
    return
  }

  loading.value = true

  try {
    let success = false

    if (sendMode.value === 'async') {
      success = await emailService.sendAsyncEmail(emailForm)
    } else {
      const result = await emailService.sendCompleteEmail(emailForm)
      success = result.status === 'SUCCESS'
    }

    if (success) {
      emailService.showSuccessNotification('Email envoyé avec succès')
      emit('sent')
      emit('close')
    }
  } catch (error) {
    emailService.showErrorNotification('Erreur lors de l\'envoi')
  } finally {
    loading.value = false
  }
}

// Templates prédéfinis
const useTemplate = (type: string) => {
  switch (type) {
    case 'appointment':
      emailForm.subject = 'Confirmation de rendez-vous'
      emailForm.html = `
        <div style="font-family: Arial, sans-serif;">
          <h2>Confirmation de rendez-vous</h2>
          <p>Votre rendez-vous est confirmé pour le [DATE] à [HEURE].</p>
          <p>Cordialement,<br>L'équipe MedCenter</p>
        </div>
      `
      break
    case 'results':
      emailForm.subject = 'Résultats d\'analyse disponibles'
      emailForm.html = `
        <div style="font-family: Arial, sans-serif;">
          <h2>Résultats disponibles</h2>
          <p>Vos résultats d'analyse sont maintenant disponibles.</p>
          <p>Connectez-vous à votre espace patient pour les consulter.</p>
          <p>Cordialement,<br>L'équipe MedCenter</p>
        </div>
      `
      break
    case 'reminder':
      emailForm.subject = 'Rappel de rendez-vous'
      emailForm.html = `
        <div style="font-family: Arial, sans-serif;">
          <h2>Rappel de rendez-vous</h2>
          <p>N'oubliez pas votre rendez-vous prévu demain à [HEURE].</p>
          <p>Merci de vous présenter 15 minutes avant.</p>
          <p>Cordialement,<br>L'équipe MedCenter</p>
        </div>
      `
      break
  }
}
</script>

<template>
  <UCard class="h-full flex flex-col">
    <template #header>
      <div class="flex items-center justify-between">
        <h3 class="text-lg font-medium">Nouveau message</h3>
        <UButton
          color="gray"
          variant="ghost"
          icon="i-lucide-x"
          @click="emit('close')"
        />
      </div>
    </template>

    <div class="flex-1 space-y-4">
      <!-- Templates -->
      <div class="flex gap-2">
        <UButton
          size="xs"
          variant="soft"
          @click="useTemplate('appointment')"
        >
          RDV
        </UButton>
        <UButton
          size="xs"
          variant="soft"
          @click="useTemplate('results')"
        >
          Résultats
        </UButton>
        <UButton
          size="xs"
          variant="soft"
          @click="useTemplate('reminder')"
        >
          Rappel
        </UButton>
      </div>

      <!-- Destinataires -->
      <UFormField label="À" required>
        <div class="space-y-2">
          <UInput
            v-model="toInput"
            placeholder="email@example.com"
            @keydown="handleToKeydown"
          />
          <div v-if="emailForm.to.length > 0" class="flex flex-wrap gap-1">
            <UBadge
              v-for="email in emailForm.to"
              :key="email"
              :label="email"
              color="primary"
              class="cursor-pointer"
              @click="removeRecipient(email, emailForm.to)"
            >
              <template #trailing>
                <UIcon name="i-lucide-x" class="size-3" />
              </template>
            </UBadge>
          </div>
        </div>
      </UFormField>

      <!-- CC -->
      <UFormField label="CC (optionnel)">
        <div class="space-y-2">
          <UInput
            v-model="ccInput"
            placeholder="email@example.com"
            @keydown="handleCcKeydown"
          />
          <div v-if="emailForm.cc && emailForm.cc.length > 0" class="flex flex-wrap gap-1">
            <UBadge
              v-for="email in emailForm.cc"
              :key="email"
              :label="email"
              color="gray"
              class="cursor-pointer"
              @click="removeRecipient(email, emailForm.cc!)"
            >
              <template #trailing>
                <UIcon name="i-lucide-x" class="size-3" />
              </template>
            </UBadge>
          </div>
        </div>
      </UFormField>

      <!-- Objet -->
      <UFormField label="Objet" required>
        <UInput v-model="emailForm.subject" placeholder="Objet du message" />
      </UFormField>

      <!-- Mode d'envoi -->
      <UFormField label="Mode d'envoi">
        <URadioGroup
          v-model="sendMode"
          :options="[
            { value: 'sync', label: 'Immédiat' },
            { value: 'async', label: 'En arrière-plan' }
          ]"
        />
      </UFormField>

      <!-- Contenu -->
      <UFormField label="Message" required>
        <UTextarea
          v-model="emailForm.html"
          placeholder="Tapez votre message ici..."
          :rows="8"
          autoresize
        />
      </UFormField>
    </div>

    <template #footer>
      <div class="flex justify-between items-center">
        <div class="text-xs text-gray-500">
          {{ emailForm.to.length }} destinataire(s)
        </div>
        <div class="flex gap-2">
          <UButton
            color="gray"
            @click="emit('close')"
          >
            Annuler
          </UButton>
          <UButton
            color="primary"
            icon="i-lucide-send"
            :loading="loading"
            @click="sendEmail"
          >
            Envoyer
          </UButton>
        </div>
      </div>
    </template>
  </UCard>
</template>
