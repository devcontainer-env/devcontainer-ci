import * as core from '@actions/core'
import * as exec from '@actions/exec'
import { getInputs } from './inputs.js'
import { buildUpArgs } from './commands.js'
import { ensureDevcontainerCli } from './installer.js'
import {
  STATE_DID_UP,
  STATE_CONTAINER_ID,
  STATE_WORKSPACE_FOLDER
} from './state.js'

interface DevcontainerUpOutput {
  outcome: string
  containerId: string
  remoteUser: string
  remoteWorkspaceFolder: string
}

/**
 * The main function for the action.
 *
 * @returns Resolves when the action is complete.
 */
export async function run(): Promise<void> {
  try {
    const inputs = getInputs()
    core.debug(`Inputs: ${JSON.stringify(inputs, null, 2)}`)

    core.info('Ensuring devcontainer CLI is installed...')
    await ensureDevcontainerCli()

    core.info('Running devcontainer up...')
    const args = buildUpArgs(inputs)
    const { exitCode, stdout, stderr } = await exec.getExecOutput(
      'devcontainer',
      args,
      { ignoreReturnCode: true }
    )

    if (exitCode !== 0) {
      throw new Error(
        `devcontainer up failed with exit code ${exitCode}: ${stderr}`
      )
    }

    let output: DevcontainerUpOutput
    try {
      output = JSON.parse(stdout)
    } catch (error) {
      throw new Error(`Failed to parse devcontainer output: ${stdout}`, {
        cause: error
      })
    }

    if (output.outcome !== 'success') {
      throw new Error(
        `devcontainer up did not succeed: outcome=${output.outcome}`
      )
    }

    core.info(`Container started: ${output.containerId}`)

    // Save state for post step
    core.saveState(STATE_DID_UP, 'true')
    core.saveState(STATE_CONTAINER_ID, output.containerId)
    core.saveState(STATE_WORKSPACE_FOLDER, output.remoteWorkspaceFolder)

    // Set outputs for subsequent steps
    core.setOutput('container-id', output.containerId)
    core.setOutput('remote-user', output.remoteUser)
    core.setOutput('workspace-folder', output.remoteWorkspaceFolder)
  } catch (error) {
    core.setFailed(error instanceof Error ? error.message : String(error))
  }
}
