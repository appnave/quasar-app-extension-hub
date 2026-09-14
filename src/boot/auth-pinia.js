import piniaHubStore from '../store/pinia-hub-store.js'
import can from '../helpers/can.js'
import setMessageEvent from '../helpers/set-message-event.js'

import { toRaw } from 'vue'
import { DefineGlobalPiniaStore } from '@bildvitta/store-adapter'

import {
  addRoutes,
  beforeEach,
  getGlobalVariables,
  interceptAxios
} from '../helpers/auth-boot.js'

export default ({ router, app, Vue }) => {
  const store = piniaHubStore()

  /**
   * Registra os eventos de postMessage do hub.
   * toRaw: estado plano, pois o postMessage não clona o Proxy reativo.
   */
  setMessageEvent(() => toRaw(store.$state))

  const { quasar } = getGlobalVariables({ app, Vue })

  // Adiciona a store hub ao Pinia globalmente
  app.use(DefineGlobalPiniaStore, { stores: { hub: () => store } })

  interceptAxios({
    router,
    quasar,
    storeConfig: {
      refresh: store.refresh,
      clear: store.clear
    }
  })

  addRoutes(router)

  beforeEach({
    isPinia: true,
    quasar,
    router,
    store
  })

  const canFn = can(() => store.user)
  app.config.globalProperties.$can = canFn
}
