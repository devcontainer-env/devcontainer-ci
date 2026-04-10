import * as core from '@actions/core'

export interface ActionInputs {
  workspaceFolder: string
  config: string
  secretsFile: string
  imageName: string
  containerIdLabel: string
  runArgs: string[]
  skipPostCreate: boolean
  remoteEnv: Record<string, string>
  logLevel: string
}

export function getInputs(): ActionInputs {
  const workspaceFolder = core.getInput('workspace-folder') || '.'
  const config = core.getInput('config')
  const secretsFile = core.getInput('secrets-file')
  const imageName = core.getInput('image-name')
  const containerIdLabel = core.getInput('container-id-label')
  const runArgsInput = core.getInput('run-args')
  const skipPostCreateInput = core.getInput('skip-post-create')
  const remoteEnvInput = core.getInput('remote-env')
  const logLevel = core.getInput('log-level') || 'info'

  // Parse run-args: space-separated string to array
  const runArgs = runArgsInput
    .trim()
    .split(/\s+/)
    .filter((arg) => arg.length > 0)

  // Parse skip-post-create: 'true' → true, else false
  const skipPostCreate = skipPostCreateInput === 'true'

  // Parse remote-env: multiline KEY=VALUE
  const remoteEnv: Record<string, string> = {}
  if (remoteEnvInput) {
    remoteEnvInput
      .split('\n')
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .forEach((line) => {
        const equalsIndex = line.indexOf('=')
        if (equalsIndex > 0) {
          const key = line.substring(0, equalsIndex)
          const value = line.substring(equalsIndex + 1)
          remoteEnv[key] = value
        }
      })
  }

  return {
    workspaceFolder,
    config,
    secretsFile,
    imageName,
    containerIdLabel,
    runArgs,
    skipPostCreate,
    remoteEnv,
    logLevel
  }
}
