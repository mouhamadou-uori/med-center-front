export default defineNuxtPlugin((nuxtApp) => {
  // Détection des transitions entre layouts différents
  let previousLayout = null

  nuxtApp.hook('page:start', () => {
    // Capture le layout actuel avant la transition
    previousLayout = nuxtApp.$route.meta.layout || 'default'
  })

  nuxtApp.hook('page:finish', () => {
    // Comparaison avec le nouveau layout
    const currentLayout = nuxtApp.$route.meta.layout || 'default'
    
    if (previousLayout !== currentLayout) {
      console.log(`Transition de layout: ${previousLayout} → ${currentLayout}`)
      
      // S'assurer que le scroll est réinitialisé lors d'un changement de layout
      if (process.client) {
        window.scrollTo(0, 0)
      }
    }
  })
})
