interface EthTxInput {
  type: string
  to: string
  value: string
  nonce: number
  gasLimit: number
  gasPrice: number
}

export { EthTxInput }
