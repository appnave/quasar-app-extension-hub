import postMessage from './post-message.js'
import hubConfig from '../shared/default-hub-config.js'

export default (stateData = () => {}) => {
  window.addEventListener('message', ({ data }) => {
    if (data.type === 'requestAccessToken') {
      postMessage('responseAccessToken', { accessToken: stateData().accessToken })
    }

    if (data.type === 'requestUser') {
      postMessage('responseUser', { user: stateData().user })
    }

    if (data.type === 'setUser') {
      if (!hubConfig.storeAdapter === 'pinia') return

      import('../store/pinia-hub-store.js').then(({ default: piniaHubStore }) => {
        piniaHubStore().setUser(data.user)
      })
    }
  })
}
