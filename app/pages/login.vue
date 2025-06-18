<template>
  <UContainer
    class="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8"
  >
    <div class="w-full max-w-md space-y-8">
      <div class="text-center">
        <img class="mx-auto h-30 w-auto" src="public/MedCenterLogo.png" alt="MedCenter Logo" />
        <h2 class="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
          {{
            isLoginMode
              ? "Connectez-vous à votre compte"
              : "Créez un nouveau compte"
          }}
        </h2>
        <p class="mt-2 text-sm text-gray-600 dark:text-gray-300">
          ou
          <UButton
            variant="link"
            @click="toggleMode"
            class="font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
          >
            {{ isLoginMode ? "créez un compte" : "connectez-vous" }}
          </UButton>
        </p>
      </div>

      <UCard class="mt-8">
        <form class="space-y-6" @submit.prevent="handleSubmit">
          <div v-if="!isLoginMode">
            <UFormGroup label="Nom complet" name="name">
              <UInput
                v-model="form.name"
                placeholder="Jean Dupont"
                icon="i-heroicons-user"
                required
              />
            </UFormGroup>
          </div>

          <UFormGroup label="Nom d'utilisateur" name="username">
            <UInput
              v-model="form.username"
              placeholder="nom d'utilisateur"
              icon="i-heroicons-user"
              required
            />
          </UFormGroup>

          <UFormGroup label="Mot de passe" name="password">
            <UInput
              v-model="form.password"
              type="password"
              placeholder="••••••••"
              icon="i-heroicons-lock-closed"
              required
            />
          </UFormGroup>

          <div v-if="isLoginMode" class="flex items-center justify-between">
            <UCheckbox
              v-model="rememberMe"
              name="remember"
              label="Se souvenir de moi"
            />
            <UButton variant="link" to="/forgot-password" class="text-sm">
              Mot de passe oublié ?
            </UButton>
          </div>

          <div>
            <UButton
              type="submit"
              block
              size="lg"
              :loading="isLoading"
              class="justify-center"
            >
              {{ isLoginMode ? "Se connecter" : "S'inscrire" }}
            </UButton>
          </div>
        </form>

        <div class="mt-6">
          <div class="relative">
            <div class="absolute inset-0 flex items-center">
              <div
                class="w-full border-t border-gray-300 dark:border-gray-600"
              ></div>
            </div>
            <div class="relative flex justify-center text-sm">
              <span
                class="px-2 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400"
              >
                Ou continuer avec
              </span>
            </div>
          </div>

          <div class="mt-6 grid grid-cols-1 gap-3">
            <UButton
              @click="signInWithGoogle"
              variant="outline"
              block
              size="lg"
              :loading="isGoogleLoading"
            >
              <template #leading>
                <svg class="w-5 h-5" viewBox="0 0 24 24" aria-hidden="true">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
              </template>
              Google
            </UButton>
          </div>
        </div>
      </UCard>

      <div class="text-center text-sm text-gray-600 dark:text-gray-400">
        <p>
          En continuant, vous acceptez nos
          <UButton variant="link" to="/terms" class="text-sm"
            >Conditions d'utilisation</UButton
          >
          et notre
          <UButton variant="link" to="/privacy" class="text-sm"
            >Politique de confidentialité</UButton
          >.
        </p>
      </div>
    </div>
  </UContainer>
</template>

<script setup lang="ts">
definePageMeta({
  requiresAuth: false,
  layout: 'none'
})
import { useAuth } from '../services/auth'

const auth = useAuth()

const isLoginMode = ref(true)
const rememberMe = ref(false)
const isLoading = ref(false)
const isGoogleLoading = ref(false)

const form = reactive({
  name: "",
  username: "",
  password: "",
})

const toggleMode = () => {
  isLoginMode.value = !isLoginMode.value
};

const handleSubmit = async () => {
  isLoading.value = true;
  try {
    if (isLoginMode.value) {
      // Logique de connexion avec Spring Boot
      const success = await auth.login(form.username, form.password);
      if (success) {
        // Redirection après connexion réussie
        await navigateTo("/");
      }
    } else {
      // Pour l'inscription, vous devrez implémenter cette fonctionnalité dans votre backend
      // et ajouter la méthode correspondante dans votre service d'authentification
      useToast().add({
        title: "Information",
        description: "L'inscription n'est pas encore implémentée",
        icon: "i-heroicons-information-circle",
        color: "blue",
      });
    }
  } catch (error) {
    // Gestion des erreurs
    useToast().add({
      title: "Erreur d'authentification",
      description: error.message || "Échec de l'authentification",
      icon: "i-heroicons-exclamation-triangle",
      color: "red",
    });
  } finally {
    isLoading.value = false;
  }
};

const signInWithGoogle = async () => {
  isGoogleLoading.value = true;
  try {
    // Cette fonctionnalité n'est pas implémentée avec Spring Boot
    useToast().add({
      title: "Information",
      description: "La connexion avec Google n'est pas encore implémentée",
      icon: "i-heroicons-information-circle",
      color: "blue",
    });
  } catch (error) {
    useToast().add({
      title: "Erreur",
      description: error.message,
      icon: "i-heroicons-exclamation-triangle",
      color: "red",
    });
  } finally {
    isGoogleLoading.value = false;
  }
};
</script>

<style scoped>
/* Styles personnalisés si nécessaire */
</style>
