import * as exec from '@actions/exec'

export async function ensureDevcontainerCli(): Promise<void> {
  try {
    // Check if devcontainer CLI is already available
    const { exitCode } = await exec.getExecOutput(
      'devcontainer',
      ['--version'],
      {
        ignoreReturnCode: true,
        silent: true
      }
    )

    if (exitCode === 0) {
      // CLI is already installed
      return
    }
  } catch {
    // Executable not found, will install below
  }

  // Install @devcontainers/cli globally
  await exec.exec('npm', ['install', '-g', '@devcontainers/cli'])
}
