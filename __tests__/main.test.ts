/**
 * Unit tests for the action's main functionality, src/main.ts
 *
 * To mock dependencies in ESM, you can create fixtures that export mock
 * functions and objects. For example, the core module is mocked in this test,
 * so that the actual '@actions/core' module is not imported.
 */
import { jest } from '@jest/globals'
import path from 'path'
import { fileURLToPath } from 'url'
import * as core from '../__fixtures__/core.js'

// Create __dirname equivalent for ESM
const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Mocks should be declared before the module being tested is imported.
jest.unstable_mockModule('@actions/core', () => core)

// The module being tested should be imported dynamically. This ensures that the
// mocks are used in place of any actual dependencies.
const { run } = await import('../src/main.js')

describe('Keyphrase Checker Action', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks()
  })

  test('passes when text file has enough occurrences', async () => {
    // Get the path to the test file
    const testFilePath = path.join(__dirname, 'test-two-occurrences.md')

    // Setup mocks
    core.getInput.mockImplementation((name) => {
      switch (name) {
        case 'text-file':
          return testFilePath
        case 'keyphrase':
          return 'GitHub'
        case 'minimum-occurrences':
          return '2'
        default:
          return ''
      }
    })
    core.getBooleanInput.mockReturnValue(true)

    // Run the action
    await run()

    // Check expectations
    expect(core.setOutput).toHaveBeenCalledWith('occurrences', 2)
    expect(core.setFailed).not.toHaveBeenCalled()
  })

  test('fails when text file has fewer occurrences than required', async () => {
    // Get the path to the test file
    const testFilePath = path.join(__dirname, 'test-two-occurrences.md')

    // Setup mocks
    core.getInput.mockImplementation((name) => {
      switch (name) {
        case 'text-file':
          return testFilePath
        case 'keyphrase':
          return 'GitHub'
        case 'minimum-occurrences':
          return '3'
        default:
          return ''
      }
    })
    core.getBooleanInput.mockReturnValue(true)

    // Run the action
    await run()

    // Check expectations
    expect(core.setOutput).toHaveBeenCalledWith('occurrences', 2)
    expect(core.setFailed).toHaveBeenCalledWith(
      'Expected at least 3 occurrences of "GitHub", but found only 2'
    )
  })

  test('passes with direct text input having enough occurrences', async () => {
    // Setup mocks
    core.getInput.mockImplementation((name) => {
      switch (name) {
        case 'text':
          return "Hey @professortocat, I'm finished with my task"
        case 'keyphrase':
          return 'professortocat'
        case 'minimum-occurrences':
          return '1'
        default:
          return ''
      }
    })
    core.getBooleanInput.mockReturnValue(true)

    // Run the action
    await run()

    // Check expectations
    expect(core.setOutput).toHaveBeenCalledWith('occurrences', 1)
    expect(core.setFailed).not.toHaveBeenCalled()
  })

  test('handles case-insensitive search correctly', async () => {
    // Get the path to the test file with mixed case occurrences
    const testFilePath = path.join(__dirname, 'test-mixed-case.md')

    // Setup mocks
    core.getInput.mockImplementation((name) => {
      switch (name) {
        case 'text-file':
          return testFilePath
        case 'keyphrase':
          return 'GitHub'
        case 'minimum-occurrences':
          return '3'
        default:
          return ''
      }
    })
    core.getBooleanInput.mockReturnValue(false)

    // Run the action
    await run()

    // Check expectations
    expect(core.setOutput).toHaveBeenCalledWith('occurrences', 3)
    expect(core.setFailed).not.toHaveBeenCalled()
  })

  test('fails when file does not exist', async () => {
    const nonExistentFilePath = path.join(__dirname, 'non-existent.md')

    // Setup mocks
    core.getInput.mockImplementation((name) => {
      switch (name) {
        case 'text-file':
          return nonExistentFilePath
        case 'keyphrase':
          return 'GitHub'
        case 'minimum-occurrences':
          return '1'
        default:
          return ''
      }
    })
    core.getBooleanInput.mockReturnValue(true)

    // Run the action
    await run()

    // Check expectations
    expect(core.setFailed).toHaveBeenCalledWith(
      `File does not exist: ${nonExistentFilePath}`
    )
  })

  test('fails when neither text nor text-file is provided', async () => {
    // Setup mocks
    core.getInput.mockImplementation((name) => {
      switch (name) {
        case 'keyphrase':
          return 'GitHub'
        case 'minimum-occurrences':
          return '1'
        default:
          return ''
      }
    })
    core.getBooleanInput.mockReturnValue(true)

    // Run the action
    await run()

    // Check expectations
    expect(core.setFailed).toHaveBeenCalledWith(
      "Exactly one of 'text-file' or 'text' inputs must be provided"
    )
  })

  test('fails when both text and text-file are provided', async () => {
    const testFilePath = path.join(__dirname, 'test-two-occurrences.md')

    // Setup mocks
    core.getInput.mockImplementation((name) => {
      switch (name) {
        case 'text-file':
          return testFilePath
        case 'text':
          return 'Some text'
        case 'keyphrase':
          return 'GitHub'
        case 'minimum-occurrences':
          return '1'
        default:
          return ''
      }
    })
    core.getBooleanInput.mockReturnValue(true)

    // Run the action
    await run()

    // Check expectations
    expect(core.setFailed).toHaveBeenCalledWith(
      "Exactly one of 'text-file' or 'text' inputs must be provided"
    )
  })

  // Tests for maximum-occurrences feature
  test('passes when occurrences are within maximum limit', async () => {
    // Get the path to the test file
    const testFilePath = path.join(__dirname, 'test-two-occurrences.md')

    // Setup mocks
    core.getInput.mockImplementation((name) => {
      switch (name) {
        case 'text-file':
          return testFilePath
        case 'keyphrase':
          return 'GitHub'
        case 'minimum-occurrences':
          return '1'
        case 'maximum-occurrences':
          return '3'
        default:
          return ''
      }
    })
    core.getBooleanInput.mockReturnValue(true)

    // Run the action
    await run()

    // Check expectations
    expect(core.setOutput).toHaveBeenCalledWith('occurrences', 2)
    expect(core.setFailed).not.toHaveBeenCalled()
  })

  test('fails when occurrences exceed maximum limit', async () => {
    // Get the path to the test file
    const testFilePath = path.join(__dirname, 'test-two-occurrences.md')

    // Setup mocks
    core.getInput.mockImplementation((name) => {
      switch (name) {
        case 'text-file':
          return testFilePath
        case 'keyphrase':
          return 'GitHub'
        case 'minimum-occurrences':
          return '1'
        case 'maximum-occurrences':
          return '1'
        default:
          return ''
      }
    })
    core.getBooleanInput.mockReturnValue(true)

    // Run the action
    await run()

    // Check expectations
    expect(core.setOutput).toHaveBeenCalledWith('occurrences', 2)
    expect(core.setFailed).toHaveBeenCalledWith(
      'Expected at most 1 occurrences of "GitHub", but found 2'
    )
  })

  test('passes with exact occurrences when min equals max', async () => {
    // Get the path to the test file
    const testFilePath = path.join(__dirname, 'test-two-occurrences.md')

    // Setup mocks
    core.getInput.mockImplementation((name) => {
      switch (name) {
        case 'text-file':
          return testFilePath
        case 'keyphrase':
          return 'GitHub'
        case 'minimum-occurrences':
          return '2'
        case 'maximum-occurrences':
          return '2'
        default:
          return ''
      }
    })
    core.getBooleanInput.mockReturnValue(true)

    // Run the action
    await run()

    // Check expectations
    expect(core.setOutput).toHaveBeenCalledWith('occurrences', 2)
    expect(core.setFailed).not.toHaveBeenCalled()
  })

  test('fails when maximum is less than minimum', async () => {
    // Get the path to the test file
    const testFilePath = path.join(__dirname, 'test-two-occurrences.md')

    // Setup mocks
    core.getInput.mockImplementation((name) => {
      switch (name) {
        case 'text-file':
          return testFilePath
        case 'keyphrase':
          return 'GitHub'
        case 'minimum-occurrences':
          return '3'
        case 'maximum-occurrences':
          return '2'
        default:
          return ''
      }
    })
    core.getBooleanInput.mockReturnValue(true)

    // Run the action
    await run()

    // Check expectations
    expect(core.setFailed).toHaveBeenCalledWith(
      'Invalid configuration: maximum-occurrences (2) must be greater than or equal to minimum-occurrences (3)'
    )
  })

  test('passes with range validation - occurrences within range', async () => {
    // Get the path to the test file with mixed case occurrences (3 total)
    const testFilePath = path.join(__dirname, 'test-mixed-case.md')

    // Setup mocks
    core.getInput.mockImplementation((name) => {
      switch (name) {
        case 'text-file':
          return testFilePath
        case 'keyphrase':
          return 'GitHub'
        case 'minimum-occurrences':
          return '2'
        case 'maximum-occurrences':
          return '5'
        default:
          return ''
      }
    })
    core.getBooleanInput.mockReturnValue(false)

    // Run the action
    await run()

    // Check expectations
    expect(core.setOutput).toHaveBeenCalledWith('occurrences', 3)
    expect(core.setFailed).not.toHaveBeenCalled()
  })

  test('fails when occurrences are below minimum in range validation', async () => {
    // Get the path to the test file
    const testFilePath = path.join(__dirname, 'test-two-occurrences.md')

    // Setup mocks
    core.getInput.mockImplementation((name) => {
      switch (name) {
        case 'text-file':
          return testFilePath
        case 'keyphrase':
          return 'GitHub'
        case 'minimum-occurrences':
          return '3'
        case 'maximum-occurrences':
          return '5'
        default:
          return ''
      }
    })
    core.getBooleanInput.mockReturnValue(true)

    // Run the action
    await run()

    // Check expectations
    expect(core.setOutput).toHaveBeenCalledWith('occurrences', 2)
    expect(core.setFailed).toHaveBeenCalledWith(
      'Expected at least 3 occurrences of "GitHub", but found only 2'
    )
  })

  test('fails when occurrences are above maximum in range validation', async () => {
    // Get the path to the test file with mixed case occurrences (3 total)
    const testFilePath = path.join(__dirname, 'test-mixed-case.md')

    // Setup mocks
    core.getInput.mockImplementation((name) => {
      switch (name) {
        case 'text-file':
          return testFilePath
        case 'keyphrase':
          return 'GitHub'
        case 'minimum-occurrences':
          return '1'
        case 'maximum-occurrences':
          return '2'
        default:
          return ''
      }
    })
    core.getBooleanInput.mockReturnValue(false)

    // Run the action
    await run()

    // Check expectations
    expect(core.setOutput).toHaveBeenCalledWith('occurrences', 3)
    expect(core.setFailed).toHaveBeenCalledWith(
      'Expected at most 2 occurrences of "GitHub", but found 3'
    )
  })

  test('works with maximum-occurrences set to 0', async () => {
    // Setup mocks for text without the keyphrase
    core.getInput.mockImplementation((name) => {
      switch (name) {
        case 'text':
          return 'This text does not contain the searched term'
        case 'keyphrase':
          return 'GitHub'
        case 'minimum-occurrences':
          return '0'
        case 'maximum-occurrences':
          return '0'
        default:
          return ''
      }
    })
    core.getBooleanInput.mockReturnValue(true)

    // Run the action
    await run()

    // Check expectations
    expect(core.setOutput).toHaveBeenCalledWith('occurrences', 0)
    expect(core.setFailed).not.toHaveBeenCalled()
  })

  test('fails when maximum-occurrences is 0 but keyphrase is found', async () => {
    // Setup mocks
    core.getInput.mockImplementation((name) => {
      switch (name) {
        case 'text':
          return 'This text contains GitHub'
        case 'keyphrase':
          return 'GitHub'
        case 'minimum-occurrences':
          return '0'
        case 'maximum-occurrences':
          return '0'
        default:
          return ''
      }
    })
    core.getBooleanInput.mockReturnValue(true)

    // Run the action
    await run()

    // Check expectations
    expect(core.setOutput).toHaveBeenCalledWith('occurrences', 1)
    expect(core.setFailed).toHaveBeenCalledWith(
      'Expected at most 0 occurrences of "GitHub", but found 1'
    )
  })
})
