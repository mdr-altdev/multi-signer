/* eslint-disable indent */
import { parse } from "ts-command-line-args"
import { promises as fs } from "fs"
import { printHelp } from "./help"
import { validateInputTx, validateWalletData } from "../utils/utils"
import { Signer, SupportedProtocols } from "../sign/signer"
import { EthSigningStrategy } from "../sign/eth/ethsigner"
import { BtcSigningStrategy } from "../sign/btc/btcsigner"

interface ICliArguments {
  inputfile?: string
  input?: string
  output?: string
  walletpath?: string
  help?: boolean
}

interface WalletData {
  address: string
  privateKey: string
}

/**
 * Fetch the arguments given through stdin and put them in a structured object
 * @returns ICliArguments object
 */
const parseCliArgs = () => {
  // All arguments are optional because the check is done manually in checkCliArgs
  const args = parse<ICliArguments>({
    inputfile: { type: String, alias: "f", optional: true },
    input: { type: String, alias: "i", optional: true },
    output: { type: String, alias: "o", optional: true },
    walletpath: { type: String, alias: "w", optional: true },
    help: { type: Boolean, alias: "h", optional: true },
  })

  return args
}

/**
 * Check whether the arguments given by the user are consistent or not
 * @param args object which contains the parsed CLI args
 * @returns boolean ok. Throws an exception if something's wrong
 */
const checkCliArgs = async (args: ICliArguments): Promise<boolean> => {
  if (Object.keys(args).length == 0 || args.help) {
    // Help flag -> the rest of the args do not matter
    return true
  }

  // Has a tx to sign been provided as input --
  if (args.input && args.inputfile) {
    throw new Error("Options -f and -i are in conflict: Cannot specify the transactions to sign both through an input file AND stdin")
  }
  if (!args.input && !args.inputfile) {
    throw new Error("Please specify a list of transactions to sign (either -f or -i)")
  }

  if (args.inputfile) {
    try {
      const stat = await fs.lstat(args.inputfile)
      stat.isFile()
    } catch (error) {
      throw new Error(`Tx input file ${args.inputfile} not found`)
    }
  }
  let inputData
  try {
    // Will throw if there is an issue with the data
    inputData = await readTxInputData(args.input, args.inputfile)
  } catch (error) {
    throw new Error("Couldn't parse the txs to sign as JSON data")
  }
  validateInputTx(inputData)

  // Has the wallet data been provided --
  if (!args.walletpath) {
    throw new Error(`A path to a file containing the private key must be given (-w)`)
  }
  const walletData = await readWalletSecretData(args.walletpath)
  validateWalletData(walletData)

  return true
}

/**
 * Actually do the job requested by the user: depending on the arguments, sign and return the tx
 * @param args object which contains the parsed CLI args
 * @returns void
 */
const executeCmd = async (args: ICliArguments) => {
  if (Object.keys(args).length == 0 || args.help) {
    printHelp()
    return
  }

  const txData = await readTxInputData(args.input, args.inputfile)
  const txObj = validateInputTx(txData)
  const walletData = await readWalletSecretData(args.walletpath)
  const walletObj = validateWalletData(walletData)

  let signer: Signer
  switch (txData.type) {
    case SupportedProtocols.Bitcoin:
      signer = new Signer(new BtcSigningStrategy())
      break
    case SupportedProtocols.Ethereum:
      signer = new Signer(new EthSigningStrategy())
      break
    default:
      throw new Error("Unsupported transaction type")
  }

  // Do the actual job: execute the signing strategy
  const retVal = await signer.signTx(txObj, walletObj)

  if (args.output) {
    await fs.writeFile(args.output, retVal)
  } else {
    console.log(retVal)
  }
}

const readTxInputData = async (inlineInput: string | null, inputFilePath: string | null) => {
  let inputData = inlineInput
  if (inputFilePath) {
    const buffer = await fs.readFile(inputFilePath)
    inputData = buffer.toString()
  }

  // Will throw an exception if it's not valid JSON data, which is intentional
  return JSON.parse(inputData)
}

const readWalletSecretData = async (walletPath: string) => {
  const buffer = await fs.readFile(walletPath)
  const walletData = buffer.toString()

  // Will throw an exception if it's not valid JSON data, which is intentional
  return JSON.parse(walletData)
}

export { parseCliArgs, checkCliArgs, executeCmd, WalletData }
