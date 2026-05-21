import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { LowSync } from 'lowdb'
import { JSONFileSync } from 'lowdb/node'

export type Country = {
  id: number
  code: string
  name: string
}

export type Voter = {
  userId: string
  countryId: number
  timestamp: number
}

export type Data = {
  countries: Country[]
  voters: Voter[]
}

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const dbPath = path.join(__dirname, 'votes.json')

const initialCountries: Country[] = [
  { id: 1,  code: 'LB', name: 'Liban' },
  { id: 2,  code: 'TN', name: 'Tunisie' },
  { id: 3,  code: 'DZ', name: 'Algérie' },
  { id: 4,  code: 'BR', name: 'Brésil' },
  { id: 5,  code: 'SG', name: 'Singapour' },
  { id: 6,  code: 'UA-PL', name: 'Ukraine & Pologne' },
  { id: 7,  code: 'CO-PE', name: 'Colombie & Pérou' },
  { id: 8,  code: 'CN', name: 'Chine' },
  { id: 9,  code: 'JP', name: 'Japon' },
  { id: 10, code: 'WA', name: "Afrique de l'Ouest" },
]

const adapter = new JSONFileSync<Data>(dbPath)
const db = new LowSync<Data>(adapter)

function ensureDatabase(): Data {
  db.read()
  if (!db.data || !Array.isArray(db.data.countries) || !Array.isArray(db.data.voters)) {
    db.data = { countries: initialCountries, voters: [] }
    db.write()
    console.log('Base de données initialisée avec', initialCountries.length, 'pays')
  }
  return db.data
}

function writeDatabase(data: Data) {
  db.data = data
  db.write()
}

export function getCountries() {
  const data = ensureDatabase()
  return [...data.countries].sort((a, b) => a.name.localeCompare(b.name))
}

export function getCountry(countryId: number): Country | null {
  const data = ensureDatabase()
  return data.countries.find((country) => country.id === countryId) ?? null
}

export function addCountry(newCountry: Omit<Country, 'id'>): Country {
  const data = ensureDatabase()
  const nextId = data.countries.length > 0 ? Math.max(...data.countries.map((country) => country.id)) + 1 : 1
  const country: Country = { id: nextId, ...newCountry }
  const countries = [...data.countries, country]
  writeDatabase({ countries, voters: data.voters })
  return country
}

export function updateCountry(countryId: number, updates: Partial<Omit<Country, 'id'>>): Country | null {
  const data = ensureDatabase()
  const countries = data.countries.map((country) =>
    country.id === countryId ? { ...country, ...updates } : country,
  )
  const updated = countries.find((country) => country.id === countryId) ?? null
  if (!updated) {
    return null
  }

  writeDatabase({ countries, voters: data.voters })
  return updated
}

export function deleteCountry(countryId: number): boolean {
  const data = ensureDatabase()
  const hasCountry = data.countries.some((country) => country.id === countryId)
  if (!hasCountry) {
    return false
  }

  const countries = data.countries.filter((country) => country.id !== countryId)
  const voters = data.voters.filter((voter) => voter.countryId !== countryId)
  writeDatabase({ countries, voters })
  return true
}

export function getVoters() {
  const data = ensureDatabase()
  return [...data.voters]
}

export function getVotesByCountry() {
  const data = ensureDatabase()
  const votes = new Map<number, number>()
  data.voters.forEach((voter) => {
    votes.set(voter.countryId, (votes.get(voter.countryId) ?? 0) + 1)
  })
  return Array.from(votes.entries()).map(([countryId, count]) => ({ countryId, count }))
}

export function removeVote(userId: string): boolean {
  const data = ensureDatabase()
  const voters = data.voters.filter((voter) => voter.userId !== userId)
  if (voters.length === data.voters.length) {
    return false
  }

  writeDatabase({ countries: data.countries, voters })
  return true
}

export function clearDebugVotes(): void {
  const data = ensureDatabase()
  const voters = data.voters.filter((voter) => !voter.userId.startsWith('debug-'))
  writeDatabase({ countries: data.countries, voters })
}

export function resetVotes(): void {
  const data = ensureDatabase()
  writeDatabase({ countries: data.countries, voters: [] })
}

export function hasUserVoted(userId: string): boolean {
  const data = ensureDatabase()
  return data.voters.some((voter) => voter.userId === userId)
}

export function getUserVoteCountry(userId: string): number | null {
  const data = ensureDatabase()
  const voter = data.voters.find((v) => v.userId === userId)
  return voter?.countryId ?? null
}

export function recordVote(userId: string, countryId: number): boolean {
  const data = ensureDatabase()
  const country = data.countries.find((c) => c.id === countryId)
  if (!country) {
    return false
  }

  if (data.voters.some((v) => v.userId === userId)) {
    return false
  }

  const voters = [...data.voters, { userId, countryId, timestamp: Date.now() }]
  writeDatabase({ countries: data.countries, voters })
  return true
}
