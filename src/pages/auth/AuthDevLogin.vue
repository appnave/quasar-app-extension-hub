<template>
  <q-page class="auth-dev-login column">
    <header class="auth-dev-login__header">
      <q-img
        alt="Logo Nave"
        class="auth-dev-login__logo"
        src="../../assets/nave.svg"
      />
    </header>

    <div class="auth-dev-login__content q-py-xl flex align-center">
      <div class="container-md row items-center justify-center">
        <div
          class="row full-width"
          :class="contentClasses"
        >
          <div class="col-12 col-md-7 col-sm-8">
            <q-img
              class="full-width"
              src="../../assets/login-avatar.svg"
            />
          </div>
  
          <div class="col-12 col-md-4 col-sm-8 column justify-center">
            <template v-if="isManualTokenLogin">
              <div class="q-mb-md text-body1 text-grey-8">
                Informe o token para efetuar o login.
              </div>

              <qas-input v-model="tokenModel" label="Token" icon="sym_r_key" />

              <qas-btn
                label="Inserir token"
                variant="primary"
                @click="onSetAccessToken(normalizedAccessToken)"
              />
            </template>

            <template v-else>
              <div class="q-mb-md">
                <h3 class="q-mb-sm">
                  Olá novamente :)
                </h3>
    
                <div class="text-body1 text-grey-8">
                  Faça o login para continuar. É necessário que você esteja logado no ambiente de desenvolvimento.
                </div>
              </div>
    
              <div class="q-mt-md">
                <div class="column q-gutter-y-md">
                  <qas-btn
                    label="Login automático"
                    variant="primary"
                    icon="sym_r_open_in_new"
                    @click="makeAutomaticLogin"
                  />
    
                  <qas-btn
                    label="Inserir token manualmente"
                    variant="secondary"
                    @click="setManualTokenLogin"
                  />
                </div>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>

    <app-dev-login-dialog
      v-model="showDevLogoutDialog"
      :environment="environment"
      :url="baseURL"
      @try-again="makeAutomaticLogin"
    />
  </q-page>
</template>

<script setup>
import {
  QasActions,
  QasHeader,
  QasPageHeader,
  QasInput,
  QasBtn,

  isLocalDevelopment
} from 'asteroid'

import hubConfig from '../../shared/default-hub-config'

import AppDevLoginDialog from '../../components/AppDevLoginDialog.vue'

import { QasInput, QasBtn, useScreen, isLocalDevelopment } from 'asteroid'
import { computed, ref, inject, onMounted } from 'vue'

import { useRoute, useRouter } from 'vue-router'

defineOptions({ name: 'AuthDevLogin' })

// globals
const qas = inject('qas')

// consts
const { development } = hubConfig

const isLocalhost = isLocalDevelopment()
const developmentMode = isLocalhost ? 'localhost' : 'preview'
const { environment, url: baseURL } = development[developmentMode]
const isDev = environment === 'development'

// composables
const screen = useScreen()
const router = useRouter()
const route = useRoute()

const { showDevLogoutDialog, makeAutomaticLogin } = useAutomaticLogin()

// refs
const isManualTokenLogin = ref(false)
const tokenModel = ref('')

// computeds
const contentClasses = computed(() => {
  if (screen.isLarge) return 'justify-between'

  if (screen.isMedium) return 'justify-center q-col-gutter-y-3xl'

  return 'q-col-gutter-y-3xl'
})

const normalizedAccessToken = computed(() => tokenModel.value.replace('__q_strn|', ''))

const hasAccessToken = computed(() => qas.getGetter({ entity: 'hub', key: 'hasAccessToken' }))

// hooks
onMounted(() => {
  if (hasAccessToken.value) goToHome()
})

// functions
function setManualTokenLogin () {
  isManualTokenLogin.value = true
}

function setAccessToken (token) {
  qas.getAction({
    entity: 'hub',
    key: 'setAccessToken',
    payload: token
  })
}

async function onSetAccessToken (token) {
  setAccessToken(token)

  const { from } = route.query

  // Se não tem from redireciona para a rota principal
  if (!from) return goToHome()

  // precisa começar com "/" para que o path funcione.
  const normalizedFrom = from.startsWith('/') ? from : `/${from}`

  const resolvedRoute = router.resolve({ path: normalizedFrom })

  // Se a rota não existe redireciona para a rota principal
  if (resolvedRoute.name === 'NotFound') return goToHome()

  // Redireciona para a rota de origem
  router.push(resolvedRoute)
}

function goToHome () {
  router.replace('/')
}

// composable definitions
function useAutomaticLogin () {
  const showDevLogoutDialog = ref(false)

  async function makeAutomaticLogin () {
    const { origin } = window.location

    const url = `${baseURL}/?requestAccessToken=true&requestAccessTokenOrigin=${origin}`

    const openedWindow = window.open(url, '_blank', 'width=600,height=600')

    // envia mensagem para a janela aberta quando ela estiver pronta
    openedWindow.onload = sendMessage

    // escuta a mensagem enviada pela janela aberta
    window.addEventListener('message', messageListener)

    function messageListener ({ data: { type, accessToken: token } }) {
      // Garante que a mensagem vem do domínio correto
      if (type === 'responseAccessToken') {
        openedWindow.close()

        token ? onSetAccessToken(token) : openDevLogoutDialog()

        // Limpa o listener após receber o token
        window.removeEventListener('message', messageListener)
      }
    }

    function sendMessage () {
      openedWindow.postMessage({ type: 'requestAccessToken' }, url)
    }
  }

  function openDevLogoutDialog () {
    showDevLogoutDialog.value = true
  }

  return {
    showDevLogoutDialog,
    makeAutomaticLogin,
    openDevLogoutDialog
  }
}
</script>

<style lang="scss">
.auth-dev-login {
  &__header {
    flex-shrink: 0;
    padding-left: var(--qas-spacing-3xl);
    padding-top: var(--qas-spacing-3xl);
  }

  &__logo {
    max-width: 150px;
  }

  &__content {
    flex: 1;
  }

  @media (max-width: $breakpoint-xs) {
    &__header {
      padding-left: var(--qas-spacing-lg);
      padding-top: var(--qas-spacing-lg);
    }

    &__logo {
      max-width: 124px;
    }
  }
}
</style>
