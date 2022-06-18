import { WalletData } from "../cli/command"
import { BtcTxInput, UtxoInput } from "../sign/btc/btcTxInput"
import { DEFAULT_GAS_LIMIT } from "../sign/eth/ethsigner"
import { EthTxInput } from "../sign/eth/ethTxInput"
import { SupportedProtocols } from "../sign/signer"

const throwIfFieldIsUndefined = (obj: any, key: string, errMsgPrefix: string) => {
  if (obj[key] === undefined) {
    throw new Error(`${errMsgPrefix}: Key ${key} is not defined in the object`)
  }
}

/**
 * Validate the json provided by the user + marshal it in the correct struct
 * This method acts as a factory for the tx input data
 * @param inputObj
 * @returns BtcTxInput or EthTxInput
 */
const validateInputTx = (inputObj: any) => {
  // ------- Bitcoin
  if (inputObj.type == SupportedProtocols.Bitcoin) {
    throwIfFieldIsUndefined(inputObj, "to", "BTC tx")
    throwIfFieldIsUndefined(inputObj, "value", "BTC tx")
    throwIfFieldIsUndefined(inputObj, "fee", "BTC tx")
    throwIfFieldIsUndefined(inputObj, "inputUTXO", "BTC tx")
    if (!Array.isArray(inputObj.inputUTXO)) {
      throw new Error("BTC tx: Expected inputUTXO to be an array")
    }

    const inputUtxoArr: Array<UtxoInput> = []
    for (const elem of inputObj.inputUTXO) {
      throwIfFieldIsUndefined(elem, "hash", "BTC tx - input UTXO")
      throwIfFieldIsUndefined(elem, "index", "BTC tx - input UTXO")
      if (elem.segwit) {
        throwIfFieldIsUndefined(elem, "witnessScriptPubkey", "BTC tx - input UTXO (segwit)")
        throwIfFieldIsUndefined(elem, "witnessValue", "BTC tx - input UTXO (segwit)")
        inputUtxoArr.push({
          hash: elem.hash,
          index: elem.index,
          segwit: true,
          witnessScriptPubkey: elem.witnessScriptPubkey,
          witnessValue: elem.witnessValue,
        })
      } else {
        throwIfFieldIsUndefined(elem, "nonWitnessRawTxData", "BTC tx - input UTXO (non-segwit)")
        inputUtxoArr.push({
          hash: elem.hash,
          index: elem.index,
          segwit: false,
          nonWitnessRawTxData: elem.nonWitnessRawTxData,
          nonWitnessValue: elem.nonWitnessValue,
        })
      }
    }

    const tx: BtcTxInput = {
      type: SupportedProtocols.Bitcoin,
      testnet: !!inputObj.testnet,
      to: inputObj.to,
      value: inputObj.value,
      fee: inputObj.fee,
      inputUTXO: inputUtxoArr,
    }
    return tx
  }

  // ------- Ethereum and EVM compatible
  if (inputObj.type == SupportedProtocols.Ethereum) {
    throwIfFieldIsUndefined(inputObj, "to", "Ethereum tx")
    throwIfFieldIsUndefined(inputObj, "value", "Ethereum tx")
    throwIfFieldIsUndefined(inputObj, "nonce", "Ethereum tx")
    throwIfFieldIsUndefined(inputObj, "gasPrice", "Ethereum tx")

    // Note that gasLimit is an optional parameter, and is set to a default value if undefined
    const tx: EthTxInput = {
      type: inputObj.type,
      to: inputObj.to,
      value: inputObj.value,
      nonce: inputObj.nonce,
      gasLimit: inputObj.gasLimit || DEFAULT_GAS_LIMIT,
      gasPrice: inputObj.gasPrice,
    }
    return tx
  }

  throw new Error(`Unsupported tx type. Expected a known type attribute`)
}

/**
 * Validate the wallet data json read on disk + marshal it in the correct struct
 * @param walletObj
 * @returns WalletInput
 */
const validateWalletData = (walletData: any) => {
  try {
    throwIfFieldIsUndefined(walletData, "address", "Wallet data")
    throwIfFieldIsUndefined(walletData, "privateKey", "Wallet data")
  } catch (error) {
    throw new Error("Wallet data needs to be given as a JSON with the privateKey and address fields")
  }

  const walletObj: WalletData = {
    address: walletData.address,
    privateKey: walletData.privateKey,
  }
  return walletObj
}

export { throwIfFieldIsUndefined, validateInputTx, validateWalletData }
