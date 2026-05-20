import { useMemo } from 'react'
import type { Country } from '../types'

export interface VoteCount {
  countryId: number
  count: number
}

export interface LeaderboardRow {
  rank: number
  country: Country
  count: number
  percent: number
}

export function useSortedVotes(countries: Country[], voteCounts: VoteCount[]): LeaderboardRow[] {
  return useMemo(() => {
    const countMap = new Map<number, number>()
    voteCounts.forEach((vote) => {
      countMap.set(vote.countryId, vote.count)
    })

    const totalVotes = voteCounts.reduce((sum, vote) => sum + vote.count, 0)

    return countries
      .map((country) => {
        const count = countMap.get(country.id) ?? 0
        const percent = totalVotes === 0 ? 0 : Math.round((count / totalVotes) * 1000) / 10
        return {
          country,
          count,
          percent,
        }
      })
      .sort((a, b) => {
        if (b.count !== a.count) {
          return b.count - a.count
        }
        return a.country.name.localeCompare(b.country.name)
      })
      .map((row, index) => ({
        ...row,
        rank: index + 1,
      }))
  }, [countries, voteCounts])
}
