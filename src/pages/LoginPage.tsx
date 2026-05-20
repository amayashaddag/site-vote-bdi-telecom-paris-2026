import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useOidcAuth } from '../auth/OidcProvider'
import WelcomeScreen from '../components/WelcomeScreen'

export default function LoginPage() {
  const { user, loading, error, signIn, debugSignIn, debugAdminSignIn, debugClearState } = useOidcAuth()
  const navigate = useNavigate()

  useEffect(() => {
    if (!loading && user) {
      navigate('/vote', { replace: true })
    }
  }, [loading, user, navigate])

  if (loading) {
    return <div className="status">Chargement de l&apos;authentification...</div>
  }

  return (
    <div className="app-shell">
      <WelcomeScreen
        title="Rejoignez le vote étudiant"
        description="Authentifiez-vous pour voter et participer à l’expérience culinaire du Village International."
      >
        <div className="auth-card">
          {error ? <div className="error">{error}</div> : null}
          <h2>Connexion</h2>
          <p>Choisissez votre méthode de connexion.</p>
          <button type="button" onClick={signIn}>
            Se connecter avec OIDC
          </button>
          <button type="button" onClick={debugSignIn} className="secondary">
            [DEBUG] Connexion rapide
          </button>
          <button type="button" onClick={debugAdminSignIn} className="secondary">
            [DEBUG ADMIN] Connexion admin
          </button>
          {import.meta.env.MODE === 'development' ? (
            <button type="button" onClick={debugClearState} className="secondary">
              [DEBUG] Effacer l’état debug
            </button>
          ) : null}
        </div>
      </WelcomeScreen>
    </div>
  )
}
