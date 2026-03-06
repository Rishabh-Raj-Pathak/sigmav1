import { createPublicClient, http, parseAbi } from 'viem'
import { avalanche } from 'viem/chains'
import { CHAINLINK_FEEDS } from '../utils/constants'

const aggregatorV3Abi = parseAbi([
  'function latestRoundData() view returns (uint80 roundId, int256 answer, uint256 startedAt, uint256 updatedAt, uint80 answeredInRound)',
  'function decimals() view returns (uint8)',
])

const client = createPublicClient({
  chain: avalanche,
  transport: http(process.env.AVALANCHE_RPC_URL || 'https://avalanche-c-chain-rpc.publicnode.com/'),
})

export async function readChainlinkPrice(pair: string): Promise<{
  price: number
  updatedAt: number
} | null> {
  const address = CHAINLINK_FEEDS[pair]
  if (!address) return null

  try {
    const [roundData, decimals] = await Promise.all([
      client.readContract({
        address,
        abi: aggregatorV3Abi,
        functionName: 'latestRoundData',
      }),
      client.readContract({
        address,
        abi: aggregatorV3Abi,
        functionName: 'decimals',
      }),
    ])

    const price = Number(roundData[1]) / Math.pow(10, decimals)
    const updatedAt = Number(roundData[3])

    return { price, updatedAt }
  } catch (error) {
    console.error(`[Chainlink] Failed to read ${pair}:`, error)
    return null
  }
}

export async function readAllPrices(): Promise<Record<string, number>> {
  const pairs = Object.keys(CHAINLINK_FEEDS)
  const results = await Promise.allSettled(
    pairs.map((pair) => readChainlinkPrice(pair))
  )

  const prices: Record<string, number> = {}
  results.forEach((result, i) => {
    if (result.status === 'fulfilled' && result.value) {
      const symbol = pairs[i].split('/')[0]
      prices[symbol] = result.value.price
    }
  })

  return prices
}
