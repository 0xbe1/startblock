import type { NextApiRequest, NextApiResponse } from 'next'
import { Network, Result } from '..'
import axios from 'axios'

const logger = require('pino')()

const API_TIMEOUT = 5000

type Config = {
  [key in Network]: { domain: string; apiKey: string }
}

const config: Config = {
  ethereum: {
    domain: 'api.etherscan.io',
    apiKey: process.env.ETHERSCAN_API_KEY || '',
  },
  bsc: {
    domain: 'api.bscscan.com',
    apiKey: process.env.BSCSCAN_API_KEY || '',
  },
  avalanche: {
    domain: 'api.snowtrace.io',
    apiKey: process.env.SNOWTRACE_API_KEY || '',
  },
  fantom: {
    domain: 'api.ftmscan.com',
    apiKey: process.env.FTMSCAN_API_KEY || '',
  },
  arbitrum: {
    domain: 'api.arbiscan.io',
    apiKey: process.env.ARBISCAN_API_KEY || '',
  },
  polygon: {
    domain: 'api.polygonscan.com',
    apiKey: process.env.POLYGONSCAN_API_KEY || '',
  },
  aurora: {
    domain: 'api.aurorascan.dev',
    apiKey: process.env.AURORASCAN_API_KEY || '',
  },
  optimism: {
    domain: 'api-optimistic.etherscan.io',
    apiKey: process.env.OPTIMISTIC_ETHERSCAN_API_KEY || '',
  },
  celo: {
    domain: 'explorer.celo.org',
    apiKey: '', // no api key needed
  },
}

// Uncomment to debug
// axios.interceptors.request.use((request) => {
//   console.log('Starting Request', JSON.stringify(request, null, 2))
//   return request
// })

// TODO: response type

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Result>
) {
  const address = req.query['address'] as string
  const network = req.query['network'] as Network
  logger.info({ address, network })
  try {
    const { data } = await axios.get(`https://${config[network].domain}/api`, {
      params: {
        module: 'account',
        action: 'txlist',
        address,
        startblock: 0,
        endblock: 99999999,
        page: 1,
        offset: 1,
        sort: 'asc',
        apikey: config[network].apiKey,
      },
      timeout: API_TIMEOUT,
    })
    if (data.status === '1') {
      res.status(200).json({
        data: {
          blockNumber: data.result[0].blockNumber,
        },
      })
    } else {
      logger.warn(JSON.stringify(data))
      res.status(200).json({
        data: {
          blockNumber: 0,
        },
        error: {
          msg: data.message,
        },
      })
    }
  } catch (error: any) {
    logger.error(JSON.stringify(error, Object.getOwnPropertyNames(error)))
    res.status(500).json({
      data: {
        blockNumber: 0,
      },
      error: {
        msg: 'unknown error',
      },
    })
  }
}
