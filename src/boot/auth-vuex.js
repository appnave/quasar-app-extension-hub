import hubModule from '../store/hub.js'

import can from '../helpers/can.js'
import setMessageEvent from '../helpers/set-message-event.js'

import { toRaw } from 'vue'

import {
  addRoutes,
  beforeEach,
  getGlobalVariables,
  interceptAxios
} from '../helpers/auth-boot.js'

export default ({ router, app, Vue, store }) => {
  const {
    isLatestQuasar,
    quasar
  } = getGlobalVariables({ app, Vue })

  store.registerModule('hub', hubModule)

  /**
   * Registra os eventos de postMessage do hub.
   * toRaw: estado plano, pois o postMessage não clona o Proxy reativo.
   */
  setMessageEvent(() => toRaw(store.state.hub))

  interceptAxios({
    router,
    quasar,
    storeConfig: {
      refresh: () => store.dispatch('hub/refresh'),
      clear: () => store.dispatch('hub/clear')
    }
  })

  addRoutes(router)

  beforeEach({
    isPinia: false,
    quasar,
    router,
    store
  })

  const canFn = can(() => store.state.hub.user)

  if (isLatestQuasar) {
    app.config.globalProperties.$can = canFn
  } else {
    Vue.prototype.$can = canFn
  }
}
