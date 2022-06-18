#!/usr/bin/env node

import { checkCliArgs, executeCmd, parseCliArgs } from "./lib/cli/command"

const processCommand = async () => {
  const options = parseCliArgs()
  await checkCliArgs(options)
  await executeCmd(options)
}

processCommand()
