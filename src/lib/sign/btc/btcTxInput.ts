interface BtcTxInput {
  type: string
  testnet: boolean
  to: string
  value: string
  fee: string
  inputUTXO: Array<UtxoInput>
}

interface UtxoInput {
  hash: string
  index: number
  segwit: boolean
  nonWitnessRawTxData?: string
  nonWitnessValue?: string
  witnessScriptPubkey?: string
  witnessValue?: string
}

export { BtcTxInput, UtxoInput }
