import { findCountryConfig } from '../config/countriesConfig'
import { useSortedVotes } from '../hooks/useSortedVotes'
import type { Country } from '../types'
import type { VoteCount } from '../hooks/useSortedVotes'

interface AdminLeaderboardProps {
  countries: Country[]
  votesByCountry: VoteCount[]
}

export default function AdminLeaderboard({ countries, votesByCountry }: AdminLeaderboardProps) {
  const rows = useSortedVotes(countries, votesByCountry)

  return (
    <section className="leaderboard-panel">
      <div className="leaderboard-header">
        <div>
          <p className="eyebrow">Résultats en direct</p>
          <h2>Classement des pays</h2>
        </div>
        <div className="live-pill">
          <span className="live-dot" /> Live
        </div>
      </div>

      <div className="leaderboard-list">
        {rows.map((row) => {
          const countryConfig = findCountryConfig(row.country.id)
          const displayName = countryConfig?.displayName ?? row.country.name
          const flagUrl = countryConfig?.flagUrl ?? 'https://flagcdn.com/w80/un.png'
          const topClass = row.rank <= 3 ? `leaderboard-rank-top leaderboard-rank-${row.rank}` : 'leaderboard-rank'

          return (
            <div key={row.country.id} className="leaderboard-row">
              <div className={topClass}>
                <span>{row.rank}</span>
              </div>

              <div className="leaderboard-country">
                <img className="leaderboard-flag" src={flagUrl} alt={`${displayName} drapeau`} />
                <div>
                  <p className="leaderboard-country-name">{displayName}</p>
                  <p className="leaderboard-country-meta">{row.percent.toFixed(1)} % des voix</p>
                </div>
              </div>

              <div className="leaderboard-progress">
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${row.percent}%` }} />
                </div>
              </div>

              <div className="leaderboard-count">{row.count} votes</div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
