import * as bitcoin from "bitcoinjs-lib"
import * as ecc from "tiny-secp256k1"
import ECPairFactory from "ecpair"
import { SigningStrategy } from "../signer"
import { BtcTxInput } from "./btcTxInput"
import { WalletData } from "../../cli/command"
import { BigNumber } from "ethers"

class BtcSigningStrategy implements SigningStrategy {
  ECPair = ECPairFactory(ecc)
  validator = (pubkey: Buffer, msghash: Buffer, signature: Buffer): boolean => this.ECPair.fromPublicKey(pubkey).verify(msghash, signature)

  /**
   * Create and sign a Bitcoin transaction
   * @param data
   * @param walletInfo
   * @returns signed transaction as string
   */
  execSignTx = async (data: BtcTxInput, walletInfo: WalletData) => {
    const network = data.testnet ? bitcoin.networks.testnet : bitcoin.networks.bitcoin
    const wallet = this.ECPair.fromWIF(walletInfo.privateKey, network)

    const psbt = new bitcoin.Psbt({ network: network })

    // For all given input UTXOs, calculate the sum of their values so that we know
    // how much should be sent back to the account
    let totalInputVal = BigNumber.from(0)
    for (const input of data.inputUTXO) {
      if (input.segwit) {
        psbt.addInput({
          hash: input.hash,
          index: input.index,
          witnessUtxo: {
            script: Buffer.from(input.witnessScriptPubkey + "", "hex"),
            value: BigNumber.from(input.witnessValue).toNumber(),
          },
        })

        totalInputVal = totalInputVal.add(BigNumber.from(input.witnessValue))
      } else {
        // Legacy inputs need to be processed differently, and require the complete raw tx data
        // Note that the value is not explicitly required (it is part of the raw tx), but it is
        // useful to keep track of the totalInputVal
        psbt.addInput({
          hash: input.hash,
          index: input.index,
          nonWitnessUtxo: Buffer.from(input.nonWitnessRawTxData, "hex"),
        })

        totalInputVal = totalInputVal.add(BigNumber.from(input.nonWitnessValue))
      }
    }

    const totalSpent = BigNumber.from(data.value).add(BigNumber.from(data.fee))
    const change = totalInputVal.sub(totalSpent)
    if (totalInputVal.lt(totalSpent)) {
      throw new Error(
        `Cannot create transaction: the value to send + the fees (${totalSpent.toNumber()}) are higher than the sum of the input UTXOs ${totalInputVal.toNumber()}`
      )
    }

    // Two outputs: one with the main value which needs to be sent, and one with the change to send back to the wallet's address
    psbt.addOutput({
      address: data.to,
      value: BigNumber.from(data.value).toNumber(),
    })
    // This is a point which is open to discussion: either go for security and use the
    // address of the wallet file - or go for privacy and allow a "change address" in
    // the data model. In this first version, go for the first option
    psbt.addOutput({
      address: walletInfo.address,
      value: change.toNumber(),
    })

    psbt.signInput(0, wallet)
    psbt.validateSignaturesOfInput(0, this.validator)
    psbt.finalizeAllInputs()

    const rawSignedTx = psbt.extractTransaction().toHex()

    return rawSignedTx
  }
}

export { BtcSigningStrategy }
