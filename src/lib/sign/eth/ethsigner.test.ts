import { WalletData } from "../../cli/command"
import { EthSigningStrategy } from "./ethsigner"
import { EthTxInput } from "./ethTxInput"

test("Sign an Ethereum transaction, check that the returned value is consistent", async () => {
  const txData: EthTxInput = {
    type: "ethereum",
    to: "0xBEF0fed0499014dE99D43BebB5A2EA0f30F68c35",
    value: "0.1",
    nonce: 2,
    gasLimit: 21000,
    gasPrice: 65,
  }
  const walletData: WalletData = {
    address: "0x0000e7cE6270c327d4c6f44ddA63041d5cA2C978",
    privateKey: "45a637521614341081478a3c46f572afab3284af47a6d67ffb5c5ab34ae596a4",
  }
  const strategy = new EthSigningStrategy()
  const retVal = await strategy.execSignTx(txData, walletData)

  expect(retVal).toBe(
    "0xf867024182520894bef0fed0499014de99d43bebb5a2ea0f30f68c3588016345785d8a0000801ca08c992766ff5ac4ddc7e35088cacd0f251a4ad37758b6bbb3669961021b89706ba05a2ddc47f5a0ea3239ee7e984982ef3aff58ab026f652e3fa61d78333a46538f"
  )
})
