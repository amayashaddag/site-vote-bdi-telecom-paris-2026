import type { UserManagerSettings } from 'oidc-client-ts'

function getEnvVar(key: string): string {
  const value = import.meta.env[key]
  if (!value) {
    throw new Error(`Variable d'environnement manquante : ${key}`)
  }
  return value as string
}

export function getOidcSettings(): UserManagerSettings {
  return {
    authority: getEnvVar('VITE_OIDC_AUTHORITY'),
    client_id: getEnvVar('VITE_OIDC_CLIENT_ID'),
    redirect_uri: getEnvVar('VITE_OIDC_REDIRECT_URI'),
    post_logout_redirect_uri: getEnvVar('VITE_OIDC_POST_LOGOUT_REDIRECT_URI'),
    response_type: (import.meta.env.VITE_OIDC_RESPONSE_TYPE as string) ?? 'code',
    scope: (import.meta.env.VITE_OIDC_SCOPE as string) ?? 'openid profile email',
    loadUserInfo: true,
    automaticSilentRenew: true,
    userStore: undefined,
  }
}
