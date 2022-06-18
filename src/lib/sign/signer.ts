import { WalletData } from "../cli/command"

enum SupportedProtocols {
  Bitcoin = "bitcoin",
  Ethereum = "ethereum",
}

/**
 * Generic signer class
 * The actual job is done through some methods specific to each
 * protocol, made abstract with a strategy pattern
 */
class Signer {
  private signingStrategy: SigningStrategy

  constructor(strategy: SigningStrategy) {
    this.signingStrategy = strategy
  }

  signTx = (data: any, wallet: WalletData) => {
    const ret = this.signingStrategy.execSignTx(data, wallet)
    return ret
  }
}

interface SigningStrategy {
  execSignTx(data: any, wallet: WalletData): Promise<string>
}

export { Signer, SupportedProtocols, SigningStrategy }
