# Multi-signer coding exercise

# 課題
EthereumまたはBitcoinの署名済み送金用トランザクションが作成できるCLIアプリケーション

# 実装に使用できる言語
- TypeScript
- Rust
- Python
- Go

# 条件
- インターネットに接続しない環境で実行できること
- testnetかmainnetで動作確認ができていること

# 入力
- アドレスや数量などトランザクションの構築に必要なパラメータ
- 入力方法はファイルやコマンドライン引数など自由

# 出力
- ブロードキャストできる形の署名済みトランザクション
- 出力方法は標準出力かファイル

# 実行例
```
$ ./example_app ./params.json
0x00112233445566778899AABBCCDDEEFF00112233445566778899AABBCCDDEEFF
```

# 提出物
- GitHubかGitLab上のリポジトリ
- ブロードキャスト結果を確認できるURL

==========================

# Coding exercise result

This tool was implemented in Node + Typescript. It relies on bitcoinlib-js to sign bitcoin txs, and ethers.js to sign ethereum txs.
Supported txs:
- Ethereum and EVM-compatible chains (test nets, Polygon, Avalanche, etc.)
- Bitcoin w/ Segwit inputs
- Bitcoin w/ Legacy inputs

**Some specific choices were made regarding certain aspects, please view the help file for more details.**

# Installation

For a local installation, after cloning this repository, run:
```
npm install
npm run build
chmod a+x dist/index.js
npm link
```

You can now execute the tool. Running the bin without any argument (or with -h) will display the help.
```
multi-signer -h
multi-signer -f ./my-btc-tx.json -w ./my-btc-wallet.json
```

# Limitations
As the CLI is executed offline, a lot of data must be provided explicitly (eg. nonce and gasPrice for Ethereum, or the previous tx's details for Bitcoin).

# Tests

Some unit tests are done for the most important parts of the application.

This tool was used to generate some signed txs on some public test networks, which I then broadcast afterwards (using a simple ethers.js script for Ethereum, and Electrum for Bitcoin).


Test #1: Bitcoin (with a Segwit input)
```
multi-signer -f ./src/test/input-files/single-btc-tx.json -w ./src/test/test-wallets/btc-test-wallet.json
```
https://blockstream.info/testnet/tx/78a910675da034a5e9b7edc9d38787d154aa4c3ca7305fd63966e3728ad18259

Test #2: Bitcoin (with a Legacy input)
```
multi-signer -f ./src/test/input-files/single-btc-tx-non-segwit-input.json -w ./src/test/test-wallets/btc-legacy-wallet.json
```
https://blockstream.info/testnet/tx/ba97218b23dbe302f2d1743d7b00581f1b2135c912b4aad3b1073e760b4d7414

Test #3: Ethereum Ropsten:
```
multi-signer -f ./src/test/input-files/single-eth-tx.json -w ./src/test/test-wallets/eth-vanity-wallet.json
```
https://ropsten.etherscan.io/tx/0xfc7a452c2a8fc2da40bf855dc328da2314f0870a2aabef530d3ff52d658b26a0
