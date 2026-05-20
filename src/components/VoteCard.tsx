import { type Country } from '../types'
import { findCountryConfig } from '../config/countriesConfig'

interface VoteCardProps {
  country: Country
  onVote: (country: Country) => void
  disabled?: boolean
}

export default function VoteCard({ country, onVote, disabled }: VoteCardProps) {
  const countryConfig = findCountryConfig(country.id)

  return (
    <article className="vote-card">
      <div className="vote-card-header">
        <img
          className="vote-card-flag"
          src={countryConfig?.flagUrl ?? 'https://flagcdn.com/w80/un.png'}
          alt={`${countryConfig?.displayName ?? country.name} drapeau`}
          loading="lazy"
        />
        <div>
          <p className="vote-card-name">{countryConfig?.displayName ?? country.name}</p>
          <p className="vote-card-headline">{countryConfig?.headline ?? 'Découvrez ce pays'}</p>
        </div>
      </div>

      <p className="vote-card-description">{countryConfig?.description ?? 'Sélectionnez ce pays pour voter.'}</p>

      <div className="vote-card-actions">
        <button type="button" onClick={() => onVote(country)} disabled={disabled}>
          Voter pour {countryConfig?.displayName ?? country.name}
        </button>
      </div>
    </article>
  )
}
