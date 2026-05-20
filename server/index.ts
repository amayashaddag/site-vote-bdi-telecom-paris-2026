import express from 'express'
import cors from 'cors'
import {
  getCountries,
  hasUserVoted,
  recordVote,
  getVoters,
  getVotesByCountry,
  addCountry,
  updateCountry,
  deleteCountry,
  removeVote,
  resetVotes,
  clearDebugVotes,
} from './database.js'

const app = express()
const port = process.env.PORT ? Number(process.env.PORT) : 4000

const adminEmails = (process.env.ADMIN_EMAILS ?? 'debug@example.com')
  .split(',')
  .map((email) => email.trim().toLowerCase())
  .filter(Boolean)

function getRequestEmail(req: express.Request): string | null {
  const value = req.headers['x-user-email']
  if (Array.isArray(value)) {
    return value[0]?.toLowerCase() ?? null
  }
  return typeof value === 'string' ? value.toLowerCase() : null
}

function requireAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  const email = getRequestEmail(req)
  if (!email || !adminEmails.includes(email)) {
    return res.status(403).json({ error: 'Accès administrateur refusé' })
  }
  next()
}

app.use(cors())
app.use(express.json())

app.get('/api/countries', (_req, res) => {
  res.json({ countries: getCountries() })
})

app.get('/api/user-vote-status', (req, res) => {
  const userId = req.headers['x-user-id'] as string

  if (!userId) {
    return res.status(400).json({ error: 'userId manquant' })
  }

  const hasVoted = hasUserVoted(userId)
  res.json({ hasVoted })
})

app.post('/api/vote', (req, res) => {
  const userId = req.headers['x-user-id'] as string
  const { countryId } = req.body

  if (!userId) {
    return res.status(400).json({ error: 'userId manquant' })
  }

  if (typeof countryId !== 'number') {
    return res.status(400).json({ error: 'countryId invalide' })
  }

  if (hasUserVoted(userId)) {
    return res.status(409).json({ error: 'Vous avez déjà voté' })
  }

  const success = recordVote(userId, countryId)
  if (!success) {
    return res.status(404).json({ error: 'Pays introuvable' })
  }

  res.json({ success: true })
})

app.get('/api/admin/overview', requireAdmin, (_req, res) => {
  res.json({
    countries: getCountries(),
    votesByCountry: getVotesByCountry(),
    voters: getVoters(),
  })
})

app.post('/api/admin/countries', requireAdmin, (req, res) => {
  const { name, code } = req.body
  if (typeof name !== 'string' || !name.trim() || typeof code !== 'string' || !code.trim()) {
    return res.status(400).json({ error: 'Nom et code du pays requis' })
  }
  const country = addCountry({ name: name.trim(), code: code.trim().toUpperCase() })
  res.json({ country })
})

app.put('/api/admin/countries/:id', requireAdmin, (req, res) => {
  const countryId = Number(req.params.id)
  const { name, code } = req.body
  if (Number.isNaN(countryId)) {
    return res.status(400).json({ error: 'ID de pays invalide' })
  }
  if (typeof name !== 'string' || !name.trim() || typeof code !== 'string' || !code.trim()) {
    return res.status(400).json({ error: 'Nom et code du pays requis' })
  }
  const updated = updateCountry(countryId, { name: name.trim(), code: code.trim().toUpperCase() })
  if (!updated) {
    return res.status(404).json({ error: 'Pays introuvable' })
  }
  res.json({ country: updated })
})

app.delete('/api/admin/countries/:id', requireAdmin, (req, res) => {
  const countryId = Number(req.params.id)
  if (Number.isNaN(countryId)) {
    return res.status(400).json({ error: 'ID de pays invalide' })
  }
  const success = deleteCountry(countryId)
  if (!success) {
    return res.status(404).json({ error: 'Pays introuvable' })
  }
  res.json({ success: true })
})

app.post('/api/admin/voters/remove', requireAdmin, (req, res) => {
  const { userId } = req.body
  if (typeof userId !== 'string' || !userId.trim()) {
    return res.status(400).json({ error: 'userId requis' })
  }
  const success = removeVote(userId.trim())
  if (!success) {
    return res.status(404).json({ error: 'Vote introuvable pour cet utilisateur' })
  }
  res.json({ success: true })
})

app.post('/api/admin/votes/reset', requireAdmin, (_req, res) => {
  resetVotes()
  res.json({ success: true })
})

if (process.env.NODE_ENV !== 'production') {
  app.post('/api/debug/clear', async (_req, res) => {
    console.log('[DEBUG] Requête reçue sur /api/debug/clear')
    clearDebugVotes()
    console.log('[DEBUG] Votes debug supprimés')
    res.json({ success: true })
  })
}

app.use((_req, res) => {
  res.status(404).json({ error: 'Endpoint introuvable' })
})

app.listen(port, () => {
  console.log(`Serveur API démarré sur http://localhost:${port}`)
})
