export interface Country {
  id: number
  code: string
  name: string
}

export interface OidcUser {
  profile: {
    sub: string
    name?: string
    email?: string
    [key: string]: unknown
  }
  [key: string]: unknown
}
