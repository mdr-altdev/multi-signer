import { WalletData } from "../../cli/command"
import { BtcSigningStrategy } from "./btcsigner"
import { BtcTxInput } from "./btcTxInput"

test("Sign a legacy Bitcoin transaction, check that the returned value is consistent", async () => {
  const txData: BtcTxInput = {
    type: "bitcoin",
    to: "mv4rnyY3Su5gjcDNzbMLKBQkBicCtHUtFB",
    testnet: true,
    value: "80000",
    fee: "5000",
    inputUTXO: [
      {
        hash: "e9c2999639957b6f82a2613cef71b5c53ca24d7c9dc94125259beea403061246",
        index: 0,
        segwit: false,
        nonWitnessRawTxData:
          "0200000001f075235ea9cea4d180d00d40881ba4edd364f8912ff8afca75179a9e65ef56ca010000006a47304402200209327e616a9155a4cb40fd67de47793f052e0fbbf6aa0c071f3bb6df5b01b3022046019c7e7c950d5cc7a96531d67ec92ce529119450abfa23af89ae098eaabb1101210397ba2a1908c7f34fa4020199928deb972d4016e4fd001e535e68ce4a83d26b21feffffff02f0490200000000001976a9145a453650d889ecab9ed216e1bde6926dbef57e6c88acdc9b1900000000001976a914d955a830db6cf68827796b53860a09137057288888ac67cb2200",
        nonWitnessValue: "150000",
      },
    ],
  }
  const walletData: WalletData = {
    address: "mokG2GJkY7qU45FFpUU6JukqyjjkLwRoYh",
    privateKey: "cS6y7VJu7dKvSyDLSdsX465c2zzWvkkg1MtRJWe9oPL1tU78KtsN",
  }
  const strategy = new BtcSigningStrategy()
  const retVal = await strategy.execSignTx(txData, walletData)

  expect(retVal).toBe(
    "020000000146120603a4ee9b252541c99d7c4da23cc5b571ef3c61a2826f7b95399699c2e9000000006b483045022100d69d1fa65a49d6bebd7000825027b3a64e2604a4cbdbeb7855b9b090317752a70220028ebea07593c78bdaac11be191af3ad05ccafbda31a1458e391fd7cfaaf280a0121028de213493865238bbf154d889c2a9d05207a3eaf684389ed71bd48e524fbd526ffffffff0280380100000000001976a9149f9a7abd600c0caa03983a77c8c3df8e062cb2fa88ace8fd0000000000001976a9145a453650d889ecab9ed216e1bde6926dbef57e6c88ac00000000"
  )
})

test("Sign a Segwit Bitcoin transaction, check that the returned value is consistent", async () => {
  const txData: BtcTxInput = {
    type: "bitcoin",
    to: "mv4rnyY3Su5gjcDNzbMLKBQkBicCtHUtFB",
    testnet: true,
    value: "10000",
    fee: "1000",
    inputUTXO: [
      {
        hash: "46ad20fb4db5c86cc5e25e2302c9acfde35943f6b12169bd2e7a455df45642b7",
        index: 1,
        segwit: true,
        witnessScriptPubkey: "001458fc1ee963216c3e1c726b123b682cb4dd87da75",
        witnessValue: "74600",
      },
    ],
  }
  const walletData: WalletData = {
    address: "tb1qtr7pa6try9kru8rjdvfrk6pvknwc0kn4pe24rn",
    privateKey: "cQrTisQTWVYpowxeWrg3t3tYwSHrYT1hBHBMkn1XsdEjL2MhzxA9",
  }
  const strategy = new BtcSigningStrategy()
  const retVal = await strategy.execSignTx(txData, walletData)

  expect(retVal).toBe(
    "02000000000101b74256f45d457a2ebd6921b1f64359e3fdacc902235ee2c56cc8b54dfb20ad460100000000ffffffff0210270000000000001976a9149f9a7abd600c0caa03983a77c8c3df8e062cb2fa88ac70f800000000000016001458fc1ee963216c3e1c726b123b682cb4dd87da750247304402205df83baeb83adc0f794f33f92f35e5668a4d43306be93dedc71040ccd382f175022019a70cefa25627bd6a8b1d56994e0f970c7b448cf2990ef22ecb6238839dbfb4012103e99880fc7e82dc044586b4316318f15f3d728c3eccbde624684cff937abde89c00000000"
  )
})
