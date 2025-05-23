import * as core from '@actions/core'
import * as fs from 'fs'

/**
 * Main function for the GitHub Action
 */
async function run(): Promise<void> {
  try {
    // Get inputs from action definition
    const textFile: string = core.getInput('text-file', { required: false })
    const text: string = core.getInput('text', { required: false })
    const keyphrase: string = core.getInput('keyphrase', { required: true })
    const caseSensitive: boolean = core.getBooleanInput('case-sensitive', {
      required: true
    })
    const minimumOccurrences: number = parseInt(
      core.getInput('minimum-occurrences', { required: true })
    )

    // Check that exactly one of text or textFile is provided
    if ((!textFile && !text) || (textFile && text)) {
      core.setFailed(
        "Exactly one of 'text-file' or 'text' inputs must be provided"
      )
      return
    }

    let contentToCheck: string

    // Get content based on which input was provided
    if (textFile) {
      // Check if file exists
      if (!fs.existsSync(textFile)) {
        core.setFailed(`File does not exist: ${textFile}`)
        return
      }

      // Read file content
      contentToCheck = fs.readFileSync(textFile, 'utf8')
    } else {
      // Use the provided text content
      contentToCheck = text
    }

    // Create regex for the keyphrase with case sensitivity option
    const regexFlags: string = caseSensitive ? 'g' : 'gi'
    const regex: RegExp = new RegExp(keyphrase, regexFlags)
    const matches: string[] | null = contentToCheck.match(regex)
    const occurrences: number = matches ? matches.length : 0

    // Set the count as an output
    core.setOutput('occurrences', occurrences)

    // Log the results for easier debugging
    core.info(
      `Found ${occurrences} occurrences of "${keyphrase}" ${
        caseSensitive ? '(case-sensitive)' : '(case-insensitive)'
      } in ${textFile || 'provided text'}`
    )

    // Check if the minimum requirement is met
    if (occurrences < minimumOccurrences) {
      core.setFailed(
        `Expected at least ${minimumOccurrences} occurrences of "${keyphrase}", but found only ${occurrences}`
      )
    } else {
      core.info(
        `✅ Success! Found ${occurrences} occurrences (minimum required: ${minimumOccurrences})`
      )
    }
  } catch (error) {
    // Handle any uncaught errors
    core.setFailed(
      `Action failed with error: ${error instanceof Error ? error.message : String(error)}`
    )
  }
}

// Call the main function
run()

// Export for testing
export { run }
