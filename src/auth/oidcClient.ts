import type { UserManagerSettings } from 'oidc-client-ts'

function getEnvVar(key: string): string {
  const value = import.meta.env[key]
  if (!value) {
    throw new Error(`Variable d'environnement manquante : ${key}`)
  }
  return value as string
}

export function getOidcSettings(): UserManagerSettings {
  const authority = getEnvVar('VITE_OIDC_AUTHORITY')
  return {
    authority,
    client_id: getEnvVar('VITE_OIDC_CLIENT_ID'),
    redirect_uri: getEnvVar('VITE_OIDC_REDIRECT_URI'),
    post_logout_redirect_uri: getEnvVar('VITE_OIDC_POST_LOGOUT_REDIRECT_URI'),
    response_type: (import.meta.env.VITE_OIDC_RESPONSE_TYPE as string) ?? 'code',
    scope: (import.meta.env.VITE_OIDC_SCOPE as string) ?? 'openid profile email',
    loadUserInfo: false, // ← désactivé pour éviter un 2e fetch bloqué
    automaticSilentRenew: true,
    metadata: {
      issuer: `${authority}/`,
      authorization_endpoint: `https://auth.garezeldap.rezel.net/application/o/authorize/`,
      token_endpoint: `https://auth.garezeldap.rezel.net/application/o/token/`,
      end_session_endpoint: `${authority}/end-session/`,
      userinfo_endpoint: `https://auth.garezeldap.rezel.net/application/o/userinfo/`,
      jwks_uri: `${authority}/jwks/`,
      signing_keys: [],  // ← désactive le fetch des jwks
    },
    filterProtocolClaims: true,
    validateSubOnSilentRenew: false,
  }
}
