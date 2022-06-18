import { ethers, Wallet } from "ethers"
import { WalletData } from "../../cli/command"
import { SigningStrategy } from "../signer"
import { EthTxInput } from "./ethTxInput"

const DEFAULT_GAS_LIMIT = 21000

class EthSigningStrategy implements SigningStrategy {
  /**
   * Create and sign an Ethereum transaction
   * @param data
   * @param walletInfo
   * @returns signed transaction as string
   */
  execSignTx = async (data: EthTxInput, wallet: WalletData) => {
    const privateKey = wallet.privateKey
    const signerWallet = new Wallet(privateKey)

    const tx = {
      from: wallet.address,
      to: data.to,
      value: ethers.utils.parseEther(data.value),
      nonce: data.nonce,
      gasLimit: ethers.utils.hexlify(data.gasLimit),
      gasPrice: data.gasPrice,
    }

    const signedTx = await signerWallet.signTransaction(tx)
    return signedTx
  }
}

export { EthSigningStrategy, DEFAULT_GAS_LIMIT }
