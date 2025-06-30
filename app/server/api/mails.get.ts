export default defineEventHandler(async (event) => {
  // Simuler des données d'emails pour éviter les erreurs
  const mails = [
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
      subject: 'Résultats de vos analyses',
      body: 'Bonjour, vos résultats d\'analyses sont disponibles. Tout semble normal...',
      date: new Date().toISOString()
    },
    {
      id: '2',
      unread: false,
      from: {
        name: 'Secrétariat MedCenter',
        email: 'secretariat@medcenter.com',
        avatar: { 
          src: 'https://github.com/nuxtlabs.png', 
          alt: 'Secrétariat' 
        }
      },
      subject: 'Confirmation de rendez-vous',
      body: 'Votre rendez-vous du 15 juin à 14h30 est confirmé...',
      date: new Date(Date.now() - 86400000).toISOString()
    },
    {
      id: '3',
      unread: true,
      from: {
        name: 'Dr Sophie Martin',
        email: 'sophie.martin@medcenter.com',
        avatar: { 
          src: 'https://github.com/nuxt.png', 
          alt: 'Dr Martin' 
        }
      },
      subject: 'Nouveau message',
      body: 'Voici les informations concernant votre traitement...',
      date: new Date(Date.now() - 172800000).toISOString()
    }
  ]

  // Ajouter des headers CORS si nécessaire
  setResponseHeaders(event, {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET',
    'Content-Type': 'application/json'
  })

  return mails
})
