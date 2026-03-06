'use client'

import useSWR from 'swr'
import { POLLING_INTERVAL } from '@/lib/utils/constants'

const fetcher = (url: string) => fetch(url).then((res) => {
  if (!res.ok) throw new Error(`API error: ${res.status}`)
  return res.json()
})

export function usePolling<T>(
  endpoint: string,
  interval: number = POLLING_INTERVAL
) {
  return useSWR<T>(endpoint, fetcher, {
    refreshInterval: interval,
    revalidateOnFocus: true,
    dedupingInterval: 5000,
    errorRetryCount: 3,
    errorRetryInterval: 10000,
  })
}
