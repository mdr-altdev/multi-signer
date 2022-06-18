import { checkCliArgs } from "./command"

test("CLI: if given an input file, it must exist", async () => {
  await expect(
    checkCliArgs({
      inputfile: "./src/test/input-files/i-do-not-exist.json",
    })
  ).rejects.toThrow()
})

test("CLI: the txs to sign must be given in the form of valid JSON data", async () => {
  await expect(
    checkCliArgs({
      inputfile: "./src/test/input-files/invalidjson.json",
    })
  ).rejects.toThrow()

  await expect(
    checkCliArgs({
      inputfile: "./src/test/input-files/single-eth-tx.json",
      walletpath: "./src/test/test-wallets/eth-vanity-wallet.json",
    })
  ).resolves.toBe(true)

  await expect(
    checkCliArgs({
      input: "{'invalid': 'json'",
    })
  ).rejects.toThrow()

  await expect(
    checkCliArgs({
      input: `{"type": "ethereum","from": "0x0000e7cE6270c327d4c6f44ddA63041d5cA2C978",
              "to": "0x810Da64935AFbaDb540C235f01633aDba2146903",
              "value": "0.1","nonce": 1,"gasPrice": 65}`,
      walletpath: "./src/test/test-wallets/eth-vanity-wallet.json",
    })
  ).resolves.toBe(true)
})
