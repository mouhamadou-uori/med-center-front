import { useAuth } from './auth'

const API_BASE_URL = 'http://localhost:9000/api'

export interface EmailData {
  to: string[]
  subject: string
  html?: string
  text?: string
  cc?: string[]
  bcc?: string[]
}

export interface SimpleEmailData {
  to: string
  subject: string
  htmlContent: string
}

export interface EmailResponse {
  status: 'SUCCESS' | 'ERROR'
  message: string
  id?: string
}

export const useEmailService = () => {
  const { getToken } = useAuth()

  // Headers communs avec authentification
  const getHeaders = () => {
    const token = getToken()
    return {
      'Content-Type': 'application/json',
      'Authorization': token ? `Bearer ${token}` : ''
    }
  }

  const getFormHeaders = () => {
    const token = getToken()
    return {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': token ? `Bearer ${token}` : ''
    }
  }

  // Validation d'email côté frontend
  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  // 1. Envoi d'email complet
  const sendCompleteEmail = async (emailData: EmailData): Promise<EmailResponse> => {
    try {
      const response = await $fetch<EmailResponse>(`${API_BASE_URL}/emails/send`, {
        method: 'POST',
        headers: getHeaders(),
        body: emailData
      })
      return response
    } catch (error) {
      console.error('Erreur envoi email complet:', error)
      return { status: 'ERROR', message: 'Erreur de connexion' }
    }
  }

  // 2. Envoi asynchrone
  const sendAsyncEmail = async (emailData: EmailData): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/emails/send-async`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(emailData)
      })
      return response.status === 202
    } catch (error) {
      console.error('Erreur envoi async:', error)
      return false
    }
  }

  // 3. Envoi simple et rapide
  const sendSimpleEmail = async (to: string, subject: string, htmlContent: string): Promise<EmailResponse> => {
    try {
      const params = new URLSearchParams({
        to,
        subject,
        htmlContent
      })

      const response = await $fetch<EmailResponse>(`${API_BASE_URL}/emails/send-simple`, {
        method: 'POST',
        headers: getFormHeaders(),
        body: params.toString()
      })
      return response
    } catch (error) {
      console.error('Erreur envoi simple:', error)
      return { status: 'ERROR', message: 'Erreur lors de l\'envoi' }
    }
  }

  // 4. Email de bienvenue
  const sendWelcomeEmail = async (to: string, firstName: string): Promise<EmailResponse> => {
    try {
      const params = new URLSearchParams({
        to,
        firstName
      })

      const response = await $fetch<EmailResponse>(`${API_BASE_URL}/emails/send-welcome`, {
        method: 'POST',
        headers: getFormHeaders(),
        body: params.toString()
      })
      return response
    } catch (error) {
      console.error('Erreur envoi bienvenue:', error)
      return { status: 'ERROR', message: 'Erreur lors de l\'envoi' }
    }
  }

  // 5. Email de réinitialisation de mot de passe
  const sendPasswordReset = async (to: string, resetToken: string): Promise<EmailResponse> => {
    try {
      const params = new URLSearchParams({
        to,
        resetToken
      })

      const response = await $fetch<EmailResponse>(`${API_BASE_URL}/emails/send-password-reset`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
          // Pas d'autorisation requise pour cet endpoint
        },
        body: params.toString()
      })
      return response
    } catch (error) {
      console.error('Erreur reset password:', error)
      return { status: 'ERROR', message: 'Erreur lors de l\'envoi' }
    }
  }

  // Fonctions utilitaires pour cas d'usage typiques
  const confirmAppointment = async (appointment: any): Promise<EmailResponse> => {
    const htmlContent = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2563eb;">Confirmation de rendez-vous</h2>
        <div style="background: #f0f8ff; padding: 15px; border-radius: 5px; margin: 15px 0;">
          <p><strong>Date :</strong> ${appointment.date}</p>
          <p><strong>Heure :</strong> ${appointment.time}</p>
          <p><strong>Médecin :</strong> Dr ${appointment.doctorName}</p>
          <p><strong>Lieu :</strong> ${appointment.location}</p>
        </div>
        <p>Merci de vous présenter 15 minutes avant l'heure du rendez-vous.</p>
      </div>
    `

    return await sendCompleteEmail({
      to: [appointment.patientEmail],
      subject: `Confirmation RDV - ${appointment.date}`,
      html: htmlContent,
      cc: appointment.doctorEmail ? [appointment.doctorEmail] : undefined
    })
  }

  const sendAppointmentReminder = async (appointment: any): Promise<EmailResponse> => {
    const message = `N'oubliez pas votre rendez-vous demain à ${appointment.time} avec Dr ${appointment.doctorName}`
    return await sendSimpleEmail(
      appointment.patientEmail,
      "Rappel RDV demain - MedCenter",
      `<div style="font-family: Arial, sans-serif;"><p>${message}</p></div>`
    )
  }

  const notifyNewMessage = async (recipient: any, senderName: string): Promise<boolean> => {
    return await sendAsyncEmail({
      to: [recipient.email],
      subject: "Nouveau message - MedCenter",
      html: `
        <div style="font-family: Arial, sans-serif;">
          <p>Vous avez reçu un nouveau message de ${senderName}.</p>
          <a href="http://localhost:3000/inbox" style="background: #2563eb; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            Voir le message
          </a>
        </div>
      `
    })
  }

  const notifyTestResults = async (patientEmail: string): Promise<EmailResponse> => {
    return await sendSimpleEmail(
      patientEmail,
      "Résultats disponibles - MedCenter",
      `
        <div style="font-family: Arial, sans-serif;">
          <h3>Vos résultats sont disponibles</h3>
          <p>Vos résultats d'analyse sont disponibles. Connectez-vous à votre espace patient pour les consulter.</p>
          <a href="http://localhost:3000/results" style="background: #059669; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">
            Consulter mes résultats
          </a>
        </div>
      `
    )
  }

  return {
    isValidEmail,
    sendCompleteEmail,
    sendAsyncEmail,
    sendSimpleEmail,
    sendWelcomeEmail,
    sendPasswordReset,
    confirmAppointment,
    sendAppointmentReminder,
    notifyNewMessage,
    notifyTestResults
  }
}
