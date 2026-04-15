import { ActionInputs } from './inputs.js'

export function buildUpArgs(inputs: ActionInputs): string[] {
  const args = ['up', '--workspace-folder', inputs.workspaceFolder]

  if (inputs.config) {
    args.push('--config', inputs.config)
  }

  if (inputs.secretsFile) {
    args.push('--secrets-file', inputs.secretsFile)
  }

  if (inputs.imageName) {
    args.push('--image-name', inputs.imageName)
  }

  if (inputs.containerIdLabel) {
    args.push('--id-label', inputs.containerIdLabel)
  }

  for (const runArg of inputs.runArgs) {
    args.push('--run-arg', runArg)
  }

  if (inputs.skipPostCreate) {
    args.push('--skip-post-create')
  }

  for (const [key, value] of Object.entries(inputs.remoteEnv)) {
    args.push('--remote-env', `${key}=${value}`)
  }

  args.push('--log-level', inputs.logLevel)

  return args
}
