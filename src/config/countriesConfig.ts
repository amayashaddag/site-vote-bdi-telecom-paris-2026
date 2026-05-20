import type { Country } from '../types'

export type CountryDisplayConfig = {
  id: number
  displayName: string
  headline: string
  description: string
  flagUrl: string
}

export const countriesDisplayConfig: CountryDisplayConfig[] = [
  {
    id: 1,
    displayName: 'France',
    headline: 'Saveurs locales et terroir',
    description: 'Fromages, pains et classiques culinaires qui inspirent la table internationale.',
    flagUrl: 'https://flagcdn.com/w80/fr.png',
  },
  {
    id: 2,
    displayName: 'Italie',
    headline: 'Passion méditerranéenne',
    description: 'Pâtes, pizzas et recettes ensoleillées qui éveillent l’appétit.',
    flagUrl: 'https://flagcdn.com/w80/it.png',
  },
  {
    id: 3,
    displayName: 'Japon',
    headline: 'Équilibre et finesse',
    description: 'Texturess subtiles et plats délicats portés par une présentation raffinée.',
    flagUrl: 'https://flagcdn.com/w80/jp.png',
  },
  {
    id: 4,
    displayName: 'Mexique',
    headline: 'Couleurs et épices',
    description: 'Saveurs intenses, tortillas et mélanges relevés pour un vote vibrant.',
    flagUrl: 'https://flagcdn.com/w80/mx.png',
  },
  {
    id: 5,
    displayName: 'Inde',
    headline: 'Aromates et diversité',
    description: 'Currys riches et épices chaudes qui réchauffent les papilles.',
    flagUrl: 'https://flagcdn.com/w80/in.png',
  },
  {
    id: 6,
    displayName: 'Thaïlande',
    headline: 'Fraîcheur épicée',
    description: 'Éclat de saveurs asiatiques, sucré‑salé et herbes fraîches.',
    flagUrl: 'https://flagcdn.com/w80/th.png',
  },
  {
    id: 7,
    displayName: 'Maroc',
    headline: 'Tradition du Maghreb',
    description: 'Épices chaudes, tajines et textures succulentes pour une ambiance conviviale.',
    flagUrl: 'https://flagcdn.com/w80/ma.png',
  },
  {
    id: 8,
    displayName: 'Brésil',
    headline: 'Énergie tropicale',
    description: 'Saveurs colorées et pâtisseries gourmandes de la cuisine brésilienne.',
    flagUrl: 'https://flagcdn.com/w80/br.png',
  },
]

export function findCountryConfig(countryId: number): CountryDisplayConfig | undefined {
  return countriesDisplayConfig.find((country) => country.id === countryId)
}

export function getCountryDisplayName(country: Country): string {
  return findCountryConfig(country.id)?.displayName ?? country.name
}
