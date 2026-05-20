import { useOidcAuth } from '../auth/OidcProvider'

export default function AlreadyVotedPage() {
  const { signOut } = useOidcAuth()

  return (
    <div className="app-shell">
      <section className="vote-panel success-message">
        <h1>✓ Merci !</h1>
        <p>Votre vote a déjà été comptabilisé.</p>
        <p>Merci de votre participation au Village International.</p>
        <button type="button" onClick={signOut} className="secondary">
          Déconnexion
        </button>
      </section>
    </div>
  )
}
