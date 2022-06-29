import type { NextApiRequest, NextApiResponse } from 'next'
import prettier from 'prettier'
import { Network, Result } from '..'
import { CodeType, getCode, GetCodeData } from './utils'

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Result<GetCodeData>>
) {
  const address = req.query['address'] as string
  const network = req.query['network'] as Network
  const codeType = req.query['codeType'] as CodeType

  const getCodeResult = await getCode(address, network, codeType)
  if (getCodeResult.error) {
    res.status(200).send({ error: getCodeResult.error })
  } else {
    let code = getCodeResult.data.Code
    if (codeType === 'ABI') {
      code = formatABI(code)
    }
    res.status(200).send({
      data: { ContractName: getCodeResult.data.ContractName, Code: code },
    })
  }
}

function formatABI(abi: string): string {
  let formatted = prettier.format(abi, {
    // so that `graph codegen` works
    quoteProps: 'preserve',
    trailingComma: 'none',
    semi: false,
  })
  // remove heading semicolon because prettier always adds one
  if (formatted[0] === ';') {
    formatted = formatted.slice(1)
  }
  return formatted
}
