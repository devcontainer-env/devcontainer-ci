import * as core from '@actions/core'
import * as exec from '@actions/exec'
import { STATE_DID_UP, STATE_WORKSPACE_FOLDER } from './state.js'
import { buildDownArgs } from './commands.js'

export async function cleanup(): Promise<void> {
  try {
    const didUp = core.getState(STATE_DID_UP)
    if (didUp !== 'true') {
      // Container was never brought up, nothing to clean
      return
    }

    const workspaceFolder = core.getState(STATE_WORKSPACE_FOLDER)
    const { exitCode, stderr } = await exec.getExecOutput(
      'devcontainer',
      buildDownArgs(workspaceFolder),
      { ignoreReturnCode: true }
    )

    if (exitCode !== 0) {
      core.warning(
        `devcontainer down failed (exit code ${exitCode}): ${stderr}`
      )
    }
  } catch (error) {
    core.warning(
      `cleanup failed: ${error instanceof Error ? error.message : String(error)}`
    )
  }
}
