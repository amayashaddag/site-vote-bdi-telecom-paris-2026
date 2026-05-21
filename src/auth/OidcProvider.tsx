import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { UserManager, User } from 'oidc-client-ts'
import { getOidcSettings } from './oidcClient'

const isDevelopment = (import.meta as any)?.env?.MODE === 'development'
const oidcDebugAuthority = (() => {
  try { return getOidcSettings().authority } catch { return '' }
})()

if (typeof window !== 'undefined' && isDevelopment && window.fetch) {
  const originalFetch = window.fetch.bind(window)
  window.fetch = async (resource: RequestInfo | URL, init?: RequestInit) => {
  const url = typeof resource === 'string' ? resource : resource instanceof URL ? resource.href : resource.url
    const method = init?.method ?? (resource instanceof Request ? resource.method : 'GET')
    const isOidcRequest = url.includes(oidcDebugAuthority) || url.includes('/.well-known/openid-configuration')

    if (isOidcRequest) {
      console.group('[OIDC DEBUG] fetch')
      console.log('Request URL:', url)
      console.log('Method:', method)
      console.log('Options:', init)
    }

    try {
      const response = await originalFetch(resource, init)
      if (isOidcRequest) {
        console.log('Response status:', response.status)
        console.log('Response ok:', response.ok)
        console.log('Response type:', response.type)
        console.groupEnd()
      }
      return response
    } catch (error) {
      if (isOidcRequest) {
        console.error('[OIDC DEBUG] fetch failed:', error)
        console.groupEnd()
      }
      throw error
    }
  }
}

interface OidcContextValue {
  user: User | null
  userId: string | null
  userEmail: string | null
  isAdmin: boolean
  loading: boolean
  error: string | null
  signIn: () => Promise<void>
  signOut: () => Promise<void>
  getAuthHeader: () => Record<string, string>
  debugSignIn: () => void
  debugAdminSignIn: () => void
  debugClearState: () => Promise<void>
}

const OidcContext = createContext<OidcContextValue | undefined>(undefined)

export function OidcProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const manager = useMemo(() => new UserManager(getOidcSettings()), [])

  useEffect(() => {
    const loadUser = async () => {
      try {
        const currentUser = await manager.getUser()
        setUser(currentUser)
      } catch (err) {
        console.error(err)
        setError('Impossible de charger l’utilisateur OIDC.')
      } finally {
        setLoading(false)
      }
    }

    const handleUserLoaded = (loadedUser: User) => {
      setUser(loadedUser)
    }

    const handleUserUnloaded = () => {
      setUser(null)
    }

    manager.events.addUserLoaded(handleUserLoaded)
    manager.events.addUserUnloaded(handleUserUnloaded)

    loadUser()

    return () => {
      manager.events.removeUserLoaded(handleUserLoaded)
      manager.events.removeUserUnloaded(handleUserUnloaded)
    }
  }, [manager])

  useEffect(() => {
    const completeRedirect = async () => {
      const url = window.location.href
      if (url.includes('code=') && url.includes('state=')) {
        try {
          const loadedUser = await manager.signinRedirectCallback()
          setUser(loadedUser)
          window.history.replaceState({}, document.title, window.location.pathname)
        } catch (err) {
          console.error('[OIDC] signinRedirectCallback error:', err)  // ← déjà là
          // ↓ Ajoute ça pour voir le détail
          console.error('[OIDC] error name:', (err as any)?.name)
          console.error('[OIDC] error message:', (err as any)?.message)
          console.error('[OIDC] current URL:', window.location.href)
          setError(`Échec du traitement du retour OIDC. ${(err as Error).message}`)
        }
      }
    }

    completeRedirect()
  }, [manager])

  const signIn = useCallback(async () => {
    setLoading(true)
    try {
      await manager.signinRedirect()
    } catch (err) {
      console.error(err)
      setError(`Échec de la redirection vers le fournisseur d’authentification. ${(err as Error).message}`)
      setLoading(false)
    }
  }, [manager])

  const signOut = useCallback(async () => {
    setLoading(true)
    try {
      await manager.signoutRedirect()
    } catch (err) {
      console.error(err)
      setError('Échec de la déconnexion.')
      setLoading(false)
    }
  }, [manager])

  const getAuthHeader = useCallback(() => {
    const headers: Record<string, string> = {}
    if (!user) return headers
    // prefer id_token then access_token
    // oidc-client-ts User stores tokens as properties
    // @ts-ignore
    const token = (user as any).id_token ?? (user as any).access_token
    if (!token) return headers
    return { Authorization: `Bearer ${token}` }
  }, [user])

  const adminEmails = ((import.meta as any)?.env?.VITE_ADMIN_EMAILS as string | undefined)
    ?.split(',')
    .map((item) => item.trim().toLowerCase())
    .filter(Boolean) ?? ['debug@example.com']

  const userEmail = (() => {
    if (!user) return null
    const profileEmail = user.profile?.email
    if (!profileEmail) return null
    if (Array.isArray(profileEmail)) {
      return profileEmail[0]?.toLowerCase() ?? null
    }
    return profileEmail.toLowerCase()
  })()

  const isAdmin = userEmail !== null && adminEmails.includes(userEmail)

  const debugSignIn = useCallback(() => {
    // allow only in development
    const mode = (import.meta as any)?.env?.MODE ?? process.env.NODE_ENV
    if (mode !== 'development') {
      console.warn('debugSignIn is only available in development')
      return
    }

    console.warn('[DEBUG] Connexion factice sans OIDC')
    const now = Math.floor(Date.now() / 1000)
    const debugUser = new User({
      access_token: 'debug-access-token',
      token_type: 'Bearer',
      id_token: 'debug-token',
      scope: 'openid profile email',
      profile: {
        sub: 'debug-user-id',
        iss: 'debug-issuer',
        aud: 'debug-audience',
        exp: now + 3600,
        iat: now,
        name: 'Utilisateur Debug',
        email: 'debug@example.com',
      },
    })
    setUser(debugUser)
    setLoading(false)
  }, [])

  const debugAdminSignIn = useCallback(() => {
    const mode = (import.meta as any)?.env?.MODE ?? process.env.NODE_ENV
    if (mode !== 'development') {
      console.warn('debugAdminSignIn is only available in development')
      return
    }

    console.warn('[DEBUG] Connexion admin factice sans OIDC')
    const now = Math.floor(Date.now() / 1000)
    const debugUser = new User({
      access_token: 'debug-admin-access-token',
      token_type: 'Bearer',
      id_token: 'debug-admin-token',
      scope: 'openid profile email',
      profile: {
        sub: 'debug-admin-user-id',
        iss: 'debug-issuer',
        aud: 'debug-audience',
        exp: now + 3600,
        iat: now,
        name: 'Admin Debug',
        email: 'debug@example.com',
      },
    })
    setUser(debugUser)
    setLoading(false)
  }, [])

  const debugClearState = useCallback(async () => {
    const mode = (import.meta as any)?.env?.MODE ?? process.env.NODE_ENV
    if (mode !== 'development') {
      console.warn('debugClearState is only available in development')
      return
    }

    console.warn('[DEBUG] Effacement de l’état debug et suppression des votes factices')
    setUser(null)
    setLoading(false)

    try {
      await manager.removeUser()
    } catch (err) {
      console.warn('Impossible de supprimer l’état OIDC existant', err)
    }

    try {
      console.log('[DEBUG] Envoi de la requête POST /api/debug/clear')
      const response = await fetch('/api/debug/clear', { method: 'POST' })
      console.log('[DEBUG] réponse /api/debug/clear', response.status, response.statusText)
      if (!response.ok) {
        const body = await response.json().catch(() => null)
        console.warn('Impossible de réinitialiser les votes debug sur le serveur', body)
      }
    } catch (err) {
      console.warn('Impossible de réinitialiser les votes debug sur le serveur', err)
    }
  }, [manager])

  const userId = user?.profile?.sub ?? null

  return (
    <OidcContext.Provider
      value={{
        user,
        userId,
        userEmail,
        isAdmin,
        loading,
        error,
        signIn,
        signOut,
        getAuthHeader,
        debugSignIn,
        debugAdminSignIn,
        debugClearState,
      }}
    >
      {children}
    </OidcContext.Provider>
  )
}

export function useOidcAuth() {
  const context = useContext(OidcContext)
  if (!context) {
    throw new Error('useOidcAuth doit être utilisé à l’intérieur du provider OidcProvider.')
  }
  return context
}
