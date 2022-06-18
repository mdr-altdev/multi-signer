# Multi-signer

This tool generates signed transactions for either Bitcoin or Ethereum

## Usage:
-h, --help        Print this help
-f, --inputfile   Path to a JSON file containing input for a tx to sign
-i, --input       Inline JSON data with the tx to sign
-o, --output      Optional path to an output file. If not given, stdout will be used
-w, --walletpath  Path to a file containing wallet data. See recommendations below

## Recommendations

### Wallet data format

For Ethereum (and EVM-compatible chains), this tool requires the private key of the signing account in a JSON with the following format.  
```
{
  "address": "0x0000e7cE6270c327d4c6f44ddA63041d5cA2C978",
  "privateKey": "45a637521614341081478a3c46f572afab3284af47a6d67ffb5c5ab34ae596a4"
}
```

For Bitcoin, the file format is similar for consistency, but the required key format is WIF (with the private ECDSA key encoded inside). Example file:  
```
{
  "address": "tb1qtr7pa6try9kru8rjdvfrk6pvknwc0kn4pe24rn",
  "privateKey": "cQrTisQTWVYpowxeWrg3t3tYwSHrYT1hBHBMkn1XsdEjL2MhzxA9"
}
```
**Important note**: Due to Bitcoin's UTXO model, the address given here is **important**.  
In the signed tx's outputs, the change (*input utxo - amount to send - fees*) needs to be sent back to an address. This is an attack vector, if someone manages to change this address to one they control, nothing can be done. In the case of an exchange, this data should also be protected like the private key (so not settable as a CLI option). This approach is not as good for privacy, but at least we're sure that the change is sent back to a controlled address.  

### Wallet data

Protection of the private keys is of the upmost importance, but this tool does nothing for this.  
The wallet data needs to be given here as an unencrypted file, but for production this is obviously a bad idea. Since this tool needs to be used offline in a local context, it is fine as a proof of concept, but if the machine executing this can be accessed through SSH, the keys will be compromised.

If the execution context is that of a cluster, a possibility would be to run this in a pod without any interactive shell, and provide the wallet data as a k8s secret (with appropriate RBAC properties). Another (more complex) approach would be to store the private data in a dedicated vault (ie. Hashicorp Vault or similar).  
If this tool is to be used on a standard server or in a container, the file containing the private key may be encrypted, and a call to a Vault could be used to decode it. Appropriate network rules would need to be set to allow communication ONLY between THIS particular process on THIS machine and the vault. Also, it may require a certain number of precautions (ie. rules to make sure that an attacker with SSH access could NOT call the vault to retrieve the secret, checksums to ensure that the container has not been tinkered with, etc.)

### Input data

#### Bitcoin

Bitcoin works with the UTXO model, meaning that new txs are done by combining unspent UTXOs
Segwit inputs work with witness UTXOs, and only require the following data: scriptPubkey and value.  
JSON example with a Segwit input
```
{
  "type": "bitcoin",
  "testnet": true,
  "to": "0x810Da64935AFbaDb540C235f01633aDba2146903",
  "value": "10000",
  "fee": "1000",
  "inputUTXO": [
    {
      "hash": "46ad20fb4db5c86cc5e25e2302c9acfde35943f6b12169bd2e7a455df45642b7",
      "index": 1,
      "segwit": true,
      "witnessScriptPubkey": "001458fc1ee963216c3e1c726b123b682cb4dd87da75",
      "witnessValue": "74600"
    }
  ]
}
```

Non-Segwit inputs require passing the whole previous tx. This data can be retrieved by querying a block explorer, for example:
```
curl "https://blockchain.info/rawtx/74d350ca44c324f4643274b98801f9a023b2b8b72e8e895879fd9070a68f7f1f?format=hex"
```
On the bitcoin testnet 3, BlockCypher still provides an API which allows to get this data
```
curl https://api.blockcypher.com/v1/btc/test3/txs/e9c2999639957b6f82a2613cef71b5c53ca24d7c9dc94125259beea403061246\?includeHex=true
```

JSON example for a Non-Segwit input:
```
{
  "type": "bitcoin",
  "testnet": "true",
  "to": "0x810Da64935AFbaDb540C235f01633aDba2146903",
  "value": "10000",
  "fee": "1000",
  "inputUTXO": [
    {
      "hash": "7d067b4a697a09d2c3cff7d4d9506c9955e93bff41bf82d439da7d030382bc3e",
      "index": 0,
      "segwit": false,
      "nonWitnessRawTxData": "02000000019b69251560ea1143de610b3c6630dcf94e12000ceba7d40b136bfb67f5a9e4eb000000006b483045022100a52f6c484072528334ac4aa5605a3f440c47383e01bc94e9eec043d5ad7e2c8002206439555804f22c053b89390958083730d6a66c1b711f6b8669a025dbbf5575bd012103abc7f1683755e94afe899029a8acde1480716385b37d4369ba1bed0a2eb3a0c5feffffff022864f203000000001976a914a2420e28fbf9b3bd34330ebf5ffa544734d2bfc788acb1103955000000001976a9149049b676cf05040103135c7342bcc713a816700688ac3bc50700",
      "nonWitnessValue": "19000"
    }
  ]
}
```

**All values are in Satoshis**

#### Ethereum (and EVM-compatible)

Ethereum's account-based model makes it easier to craft txs.
Only limitation: since this tool is expected to work offline, it cannot automatically get some values from the network: the sending account's nonce and the current (average) gasPrice. These values need to be given explicitly.  
**GasLimit is an optional parameter**. It may be overridden, but a default value of 21000 is applied if no value is given: this tool is not a generic signer, it only aims to make some txs to send some native tokens. The gas used for that kind of transaction can be guessed - thus the magic value

Unlike for Bitcoin, the networkId doesn't need to be given explicitly: no matter the chain (Ethereum mainnet, Ropsten, Polygon, Avalanche...), the signed transaction will be the same - the network ID only matters once a provider is used to broadcast the transaction

```
{
  "type": "ethereum",
  "from": "0x0000e7cE6270c327d4c6f44ddA63041d5cA2C978",
  "to": "0x810Da64935AFbaDb540C235f01633aDba2146903",
  "value": "0.1",
  "nonce": 1,
  "gasLimit": 21000,
  "gasPrice": 65,
}
```

**All values are in Ether, and not wei**. This implies that for a tx for Polygon, the values will be in MATIC, for Avalanche in AVAX, and so on.
