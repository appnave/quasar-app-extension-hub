/**
 * Resolve variáveis de ambiente em runtime de browser (Vite) com fallback.
 */
export function getEnv (key) {
  if (typeof import.meta !== 'undefined' && import.meta?.env && key in import.meta.env) {
    return import.meta.env[key]
  }

  if (typeof process !== 'undefined' && process?.env && key in process.env) {
    return process.env[key]
  }

  return undefined
}