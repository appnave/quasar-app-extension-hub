import postMessage from './post-message.js'

export default (stateData = () => {}, customEvents = () => {}) => {
  window.addEventListener('message', ({ data }) => {
    if (data.type === 'requestAccessToken') {
      postMessage('responseAccessToken', { accessToken: stateData().accessToken })
    }

    if (data.type === 'requestUser') {
      postMessage('responseUser', { user: stateData().user })
    }

    customEvents(data)
  })
}
