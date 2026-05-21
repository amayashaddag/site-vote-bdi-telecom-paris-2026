import type { Country } from '../types'

export type CountryDisplayConfig = {
  id: number
  displayName: string
  headline: string
  description: string
  flagUrl: string
}

export const countriesDisplayConfig: CountryDisplayConfig[] = []

export function findCountryConfig(countryId: number): CountryDisplayConfig | undefined {
  return countriesDisplayConfig.find((country) => country.id === countryId)
}

export function getCountryDisplayName(country: Country): string {
  return findCountryConfig(country.id)?.displayName ?? country.name
}
