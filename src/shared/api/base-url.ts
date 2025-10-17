const DEFAULT_API_BASE = 'http://localhost:8080'

const configuredBase =
  process.env.API_URL || process.env.NEXT_PUBLIC_API_URL || DEFAULT_API_BASE

export function getApiBaseUrl(): string {
  return configuredBase.replace(/\/$/, '')
}
