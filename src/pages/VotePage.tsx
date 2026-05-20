import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useOidcAuth } from '../auth/OidcProvider'
import PageHeader from '../components/PageHeader'
import VoteCard from '../components/VoteCard'
import VoteConfirmDialog from '../components/VoteConfirmDialog'
import { Country } from '../types'

export default function VotePage() {
  const [countries, setCountries] = useState<Country[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [selectedCountry, setSelectedCountry] = useState<Country | null>(null)

  const { user, signOut, userId, isAdmin } = useOidcAuth()
  const navigate = useNavigate()

  useEffect(() => {
    const checkVoteStatus = async () => {
      if (!userId) return

      try {
        const response = await fetch('/api/user-vote-status', {
          headers: { 'X-User-Id': userId },
        })
        if (response.ok) {
          const data = await response.json()
          if (data.hasVoted) {
            navigate('/already-voted', { replace: true })
            return
          }
        }
      } catch (err) {
        console.error('Failed to check vote status:', err)
      }
    }

    const loadCountries = async () => {
      setLoading(true)
      try {
        const response = await fetch('/api/countries')
        if (!response.ok) {
          throw new Error('Impossible de charger les pays.')
        }
        const data = await response.json()
        setCountries(data.countries ?? [])
      } catch (err) {
        setError((err as Error).message)
      } finally {
        setLoading(false)
      }
    }

    checkVoteStatus()
    loadCountries()
  }, [userId, navigate])

  const handleVoteClick = (country: Country) => {
    setSelectedCountry(country)
    setDialogOpen(true)
  }

  const handleConfirmVote = async () => {
    if (!selectedCountry || !userId) return

    setSubmitting(true)
    setError(null)

    try {
      const response = await fetch('/api/vote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Id': userId,
        },
        body: JSON.stringify({ countryId: selectedCountry.id }),
      })

      if (!response.ok) {
        const body = await response.json()
        throw new Error(body.error || 'Échec du vote.')
      }

      setDialogOpen(false)
      navigate('/already-voted', { replace: true })
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="app-shell">
      <PageHeader
        title="Vote culinaire"
        subtitle={`Bienvenue, ${user?.profile?.name ?? user?.profile?.email ?? 'invité'}. Choisissez votre pays préféré et confirmez votre vote.`}
        actions={
          <>
            {isAdmin ? (
              <button type="button" onClick={() => navigate('/admin')} className="secondary">
                Admin
              </button>
            ) : null}
            <button type="button" onClick={signOut} className="secondary">
              Déconnexion
            </button>
          </>
        }
      />

      <section className="vote-panel">
        <div className="vote-header">
          <div>
            <p>Choisissez le meilleur pays du Village International.</p>
          </div>
        </div>

        {loading ? (
          <div className="status">Chargement des pays...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : (
          <div className="country-list">
            {countries.map((country) => (
              <VoteCard
                key={country.id}
                country={country}
                onVote={handleVoteClick}
                disabled={submitting}
              />
            ))}
          </div>
        )}
      </section>

      {selectedCountry && (
        <VoteConfirmDialog
          open={dialogOpen}
          countryName={selectedCountry.name}
          onConfirm={handleConfirmVote}
          onCancel={() => setDialogOpen(false)}
        />
      )}
    </div>
  )
}
