import * as marked from "marked"
import terminalRenderer from "marked-terminal"
import { readFileSync } from "fs"

marked.setOptions({ renderer: new terminalRenderer() })

/**
 * Read the help info from the Markdown file and display it on the terminal
 */
const printHelp = () => {
  // Show the parsed data
  console.log(marked.parse(readFileSync(__dirname + "/help.md").toString()))
}

export { printHelp }
