import { useEffect, useMemo, useState } from 'react'
import { useOidcAuth } from '../auth/OidcProvider'
import AdminLeaderboard from '../components/AdminLeaderboard'
import { Country } from '../types'

interface AdminVoter {
  userId: string
  countryId: number
  timestamp: number
}

interface VoteCount {
  countryId: number
  count: number
}

interface AdminOverview {
  countries: Country[]
  voters: AdminVoter[]
  votesByCountry: VoteCount[]
}

export default function AdminPage() {
  const { user, userId, userEmail, isAdmin, signOut } = useOidcAuth()
  const [overview, setOverview] = useState<AdminOverview | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [newCountryName, setNewCountryName] = useState('')
  const [newCountryCode, setNewCountryCode] = useState('')
  const [editingCountryId, setEditingCountryId] = useState<number | null>(null)
  const [editName, setEditName] = useState('')
  const [editCode, setEditCode] = useState('')
  const [message, setMessage] = useState<string | null>(null)

  const headers = useMemo(() => {
    const h: Record<string, string> = { 'Content-Type': 'application/json' }
    if (userId) h['X-User-Id'] = userId
    if (userEmail) h['X-User-Email'] = userEmail
    return h
  }, [userId, userEmail])

  useEffect(() => {
    if (!isAdmin) return

    const loadAdminOverview = async () => {
      setLoading(true)
      setError(null)
      try {
        const response = await fetch('/api/admin/overview', { headers })
        if (!response.ok) {
          const body = await response.json()
          throw new Error(body.error || 'Impossible de charger les données d’administration.')
        }
        const data = await response.json()
        setOverview(data)
      } catch (err) {
        setError((err as Error).message)
      } finally {
        setLoading(false)
      }
    }

    loadAdminOverview()
  }, [headers, isAdmin])

  const refresh = async () => {
    setMessage(null)
    try {
      const response = await fetch('/api/admin/overview', { headers })
      if (!response.ok) {
        const body = await response.json()
        throw new Error(body.error || 'Impossible de rafraîchir les données.')
      }
      const data = await response.json()
      setOverview(data)
    } catch (err) {
      setError((err as Error).message)
    }
  }

  const getVoteCount = (countryId: number) => {
    return overview?.votesByCountry.find((item) => item.countryId === countryId)?.count ?? 0
  }

  const startEdit = (country: Country) => {
    setEditingCountryId(country.id)
    setEditName(country.name)
    setEditCode(country.code)
    setMessage(null)
  }

  const submitUpdateCountry = async () => {
    if (editingCountryId === null) return
    setError(null)
    try {
      const response = await fetch(`/api/admin/countries/${editingCountryId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({ name: editName, code: editCode }),
      })
      if (!response.ok) {
        const body = await response.json()
        throw new Error(body.error || 'Impossible de modifier le pays.')
      }
      await refresh()
      setEditingCountryId(null)
      setMessage('Pays mis à jour avec succès.')
    } catch (err) {
      setError((err as Error).message)
    }
  }

  const submitDeleteCountry = async (countryId: number) => {
    setError(null)
    try {
      const response = await fetch(`/api/admin/countries/${countryId}`, {
        method: 'DELETE',
        headers,
      })
      if (!response.ok) {
        const body = await response.json()
        throw new Error(body.error || 'Impossible de supprimer le pays.')
      }
      await refresh()
      setMessage('Pays supprimé, les votes associés ont été nettoyés.')
    } catch (err) {
      setError((err as Error).message)
    }
  }

  const submitAddCountry = async () => {
    if (!newCountryName || !newCountryCode) {
      setError('Le code et le nom du pays sont requis.')
      return
    }
    setError(null)
    try {
      const response = await fetch('/api/admin/countries', {
        method: 'POST',
        headers,
        body: JSON.stringify({ name: newCountryName, code: newCountryCode }),
      })
      if (!response.ok) {
        const body = await response.json()
        throw new Error(body.error || 'Impossible d’ajouter le pays.')
      }
      setNewCountryName('')
      setNewCountryCode('')
      await refresh()
      setMessage('Nouveau pays ajouté.')
    } catch (err) {
      setError((err as Error).message)
    }
  }

  const submitRemoveVote = async (userIdToRemove: string) => {
    setError(null)
    try {
      const response = await fetch('/api/admin/voters/remove', {
        method: 'POST',
        headers,
        body: JSON.stringify({ userId: userIdToRemove }),
      })
      if (!response.ok) {
        const body = await response.json()
        throw new Error(body.error || 'Impossible de supprimer le vote.')
      }
      await refresh()
      setMessage(`Vote de ${userIdToRemove} supprimé.`)
    } catch (err) {
      setError((err as Error).message)
    }
  }

  const submitResetVotes = async () => {
    if (!window.confirm('Réinitialiser tous les votes ? Cette action est irréversible.')) {
      return
    }
    setError(null)
    try {
      const response = await fetch('/api/admin/votes/reset', {
        method: 'POST',
        headers,
      })
      if (!response.ok) {
        const body = await response.json()
        throw new Error(body.error || 'Impossible de réinitialiser les votes.')
      }
      await refresh()
      setMessage('Tous les votes ont été réinitialisés.')
    } catch (err) {
      setError((err as Error).message)
    }
  }

  if (!isAdmin) {
    return (
      <div className="app-shell">
        <div className="vote-panel">
          <h1>Accès refusé</h1>
          <p>Vous n’êtes pas autorisé à accéder à la page d’administration.</p>
        </div>
      </div>
    )
  }

  return (
    <div className="app-shell">
      <header>
        <h1>Administration du vote</h1>
        <p>Connecté en tant que {user?.profile?.email ?? 'utilisateur inconnu'}.</p>
      </header>

      <section className="vote-panel">
        <div className="vote-header">
          <div>
            <p>Résumé des données du vote en cours.</p>
            <p>Nombre de pays: {overview?.countries.length ?? 0}</p>
            <p>Nombre de votes enregistrés: {overview?.voters.length ?? 0}</p>
          </div>
          <div className="vote-header-actions">
            <button type="button" onClick={submitResetVotes} className="secondary">
              Réinitialiser tous les votes
            </button>
            <button type="button" onClick={signOut} className="secondary">
              Déconnexion
            </button>
          </div>
        </div>

        {loading ? (
          <div className="status">Chargement des données d’administration...</div>
        ) : error ? (
          <div className="error">{error}</div>
        ) : (
          <>
            {message ? <div className="status">{message}</div> : null}
            {overview ? (
              <AdminLeaderboard
                countries={overview.countries}
                votesByCountry={overview.votesByCountry}
              />
            ) : null}
            <div className="admin-grid">
              <div className="admin-panel">
                <h2>Pays</h2>
                <table>
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Code</th>
                      <th>Nom</th>
                      <th>Votes</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {overview?.countries.map((country) => (
                      <tr key={country.id}>
                        <td>{country.id}</td>
                        <td>
                          {editingCountryId === country.id ? (
                            <input
                              value={editCode}
                              onChange={(event) => setEditCode(event.target.value)}
                            />
                          ) : (
                            country.code
                          )}
                        </td>
                        <td>
                          {editingCountryId === country.id ? (
                            <input
                              value={editName}
                              onChange={(event) => setEditName(event.target.value)}
                            />
                          ) : (
                            country.name
                          )}
                        </td>
                        <td>{getVoteCount(country.id)}</td>
                        <td>
                          {editingCountryId === country.id ? (
                            <>
                              <button type="button" onClick={submitUpdateCountry}>
                                Sauvegarder
                              </button>
                              <button type="button" onClick={() => setEditingCountryId(null)} className="secondary">
                                Annuler
                              </button>
                            </>
                          ) : (
                            <>
                              <button type="button" onClick={() => startEdit(country)}>
                                Modifier
                              </button>
                              <button
                                type="button"
                                onClick={() => submitDeleteCountry(country.id)}
                                className="secondary"
                              >
                                Supprimer
                              </button>
                            </>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>

                <div className="admin-form">
                  <h3>Ajouter un pays</h3>
                  <input
                    type="text"
                    placeholder="Code"
                    value={newCountryCode}
                    onChange={(event) => setNewCountryCode(event.target.value)}
                  />
                  <input
                    type="text"
                    placeholder="Nom"
                    value={newCountryName}
                    onChange={(event) => setNewCountryName(event.target.value)}
                  />
                  <button type="button" onClick={submitAddCountry}>
                    Ajouter
                  </button>
                </div>
              </div>

              <div className="admin-panel">
                <h2>Votes</h2>
                <table>
                  <thead>
                    <tr>
                      <th>Utilisateur</th>
                      <th>ID Pays</th>
                      <th>Date</th>
                      <th>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {overview?.voters.map((voter) => (
                      <tr key={`${voter.userId}-${voter.countryId}`}> 
                        <td>{voter.userId}</td>
                        <td>{voter.countryId}</td>
                        <td>{new Date(voter.timestamp).toLocaleString()}</td>
                        <td>
                          <button type="button" onClick={() => submitRemoveVote(voter.userId)}>
                            Supprimer vote
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </>
        )}
      </section>
    </div>
  )
}
