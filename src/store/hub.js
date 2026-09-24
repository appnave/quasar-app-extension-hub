import setAuthorizationHeader from '../helpers/set-authorization-header.js'
import { hasString } from '../helpers/string.js'
import { replaceAccessToken, replaceUser } from '../helpers/mutations.js'

import axios from 'axios'
import { LocalStorage } from 'quasar'

// Revive access token from cache.
const accessToken = LocalStorage.getItem('accessToken') || ''
setAuthorizationHeader(accessToken)

const stateData = () => {
  return {
    accessToken,
    user: LocalStorage.getItem('user') || {}
  }
}

const getters = {
  hasAccessToken: state => hasString(state.accessToken),
  hasUser: state => !!Object.keys(state.user).length,
  userPermissions: state => state.user.userPermissions
}

const actions = {
  clear () {
    replaceAccessToken.call(this)
    replaceUser.call(this)
  },

  async callback (payload = {}) {
    const { code, state } = payload

    try {
      const { data } = await axios.get('/auth/callback', {
        params: { code, state }
      })

      replaceAccessToken.call(this, { accessToken: data.accessToken })
      return data
    } catch (error) {
      replaceAccessToken.call(this)
      throw error
    }
  },

  async getUser () {
    try {
      const { data } = await axios.get('/users/me', {
        params: {
          version: import.meta.env.ME_VERSION
        }
      })

      replaceUser.call(this, { user: data.result })
      return data.result
    } catch (error) {
      replaceUser.call(this)
      throw error
    }
  },

  async login (payload = {}) {
    const { url } = payload

    const { data } = await axios.get('/auth/login', {
      params: { url }
    })

    return data.loginUrl
  },

  async logout (payload = {}) {
    const { url } = payload

    const { data } = await axios.get('/auth/logout', {
      params: { url }
    })

    return data.logoutUrl
  },

  async refresh () {
    try {
      const { data } = await axios.get('/auth/refresh')

      replaceAccessToken.call(this, { accessToken: data.accessToken })
      return data
    } catch (error) {
      replaceAccessToken.call(this)
      throw error
    }
  },

  async getUserMeURL () {
    try {
      const { data } = await axios.get('/users/me/edit')
      return data
    } catch (error) {
      throw error
    }
  },

  setAccessToken (payload) {
    replaceAccessToken.call(this, { accessToken: payload })
  },

  setUser (payload) {
    replaceUser.call(this, { user: payload })
  }
}

export default {
  state: stateData,
  getters,
  actions
}
