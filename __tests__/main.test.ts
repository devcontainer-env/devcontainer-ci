import { beforeEach, afterEach, describe, it, expect } from '@jest/globals'
import { jest } from '@jest/globals'
import * as core from '../__fixtures__/core.js'
import * as exec from '../__fixtures__/exec.js'

// Mock the installer module
const mockEnsureDevcontainerCli = jest.fn()
jest.unstable_mockModule('../src/installer.js', () => ({
  ensureDevcontainerCli: mockEnsureDevcontainerCli
}))

// Setup mocks before importing the module being tested
jest.unstable_mockModule('@actions/core', () => core)
jest.unstable_mockModule('@actions/exec', () => exec)

// Import the module being tested
const { run } = await import('../src/main.js')

describe('main.ts', () => {
  beforeEach(() => {
    // Setup default mock implementations
    core.getInput.mockImplementation((name) => {
      const defaults: Record<string, string> = {
        'workspace-folder': '.',
        config: '',
        'secrets-file': '',
        'image-name': '',
        'container-id-label': '',
        'run-args': '',
        'skip-post-create': 'false',
        'remote-env': '',
        'log-level': 'info'
      }
      return defaults[name] ?? ''
    })

    mockEnsureDevcontainerCli.mockResolvedValue(undefined)

    // Default successful devcontainer up output
    exec.getExecOutput.mockResolvedValue({
      exitCode: 0,
      stdout: JSON.stringify({
        outcome: 'success',
        containerId: 'test-container-id',
        remoteUser: 'testuser',
        remoteWorkspaceFolder: '/workspace'
      }),
      stderr: ''
    })
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should set outputs on successful run', async () => {
    await run()

    expect(core.setOutput).toHaveBeenCalledWith(
      'container-id',
      'test-container-id'
    )
    expect(core.setOutput).toHaveBeenCalledWith('remote-user', 'testuser')
    expect(core.setOutput).toHaveBeenCalledWith(
      'workspace-folder',
      '/workspace'
    )
  })

  it('should save state on successful run', async () => {
    await run()

    expect(core.saveState).toHaveBeenCalledWith('DID_UP', 'true')
    expect(core.saveState).toHaveBeenCalledWith(
      'CONTAINER_ID',
      'test-container-id'
    )
    expect(core.saveState).toHaveBeenCalledWith(
      'WORKSPACE_FOLDER',
      '/workspace'
    )
  })

  it('should ensure devcontainer CLI is installed', async () => {
    await run()

    expect(mockEnsureDevcontainerCli).toHaveBeenCalled()
  })

  it('should call devcontainer up with correct args', async () => {
    await run()

    expect(exec.getExecOutput).toHaveBeenCalledWith(
      'devcontainer',
      expect.arrayContaining([
        'up',
        '--workspace-folder',
        '.',
        '--log-level',
        'info'
      ]),
      { ignoreReturnCode: true }
    )
  })

  it('should fail on non-zero exit code', async () => {
    exec.getExecOutput.mockResolvedValue({
      exitCode: 1,
      stdout: '',
      stderr: 'Some error message'
    })

    await run()

    expect(core.setFailed).toHaveBeenCalledWith(
      expect.stringContaining('devcontainer up failed with exit code 1')
    )
    expect(core.setOutput).not.toHaveBeenCalled()
  })

  it('should fail on invalid JSON output', async () => {
    exec.getExecOutput.mockResolvedValue({
      exitCode: 0,
      stdout: 'invalid json',
      stderr: ''
    })

    await run()

    expect(core.setFailed).toHaveBeenCalledWith(
      expect.stringContaining('Failed to parse devcontainer output')
    )
    expect(core.setOutput).not.toHaveBeenCalled()
  })

  it('should fail on unsuccessful outcome', async () => {
    exec.getExecOutput.mockResolvedValue({
      exitCode: 0,
      stdout: JSON.stringify({
        outcome: 'failure',
        containerId: '',
        remoteUser: '',
        remoteWorkspaceFolder: ''
      }),
      stderr: ''
    })

    await run()

    expect(core.setFailed).toHaveBeenCalledWith(
      expect.stringContaining(
        'devcontainer up did not succeed: outcome=failure'
      )
    )
    expect(core.setOutput).not.toHaveBeenCalled()
  })

  it('should handle installer error', async () => {
    const installerError = new Error('npm install failed')
    mockEnsureDevcontainerCli.mockRejectedValue(installerError)

    await run()

    expect(core.setFailed).toHaveBeenCalledWith('npm install failed')
  })

  it('should build args with custom inputs', async () => {
    core.getInput.mockImplementation((name) => {
      const customInputs: Record<string, string> = {
        'workspace-folder': '/custom/path',
        config: '.devcontainer/devcontainer.json',
        'secrets-file': '.github/secrets.json',
        'image-name': 'my-image:latest',
        'container-id-label': 'ci-build',
        'run-args': '--cap-add NET_ADMIN',
        'skip-post-create': 'true',
        'remote-env': 'KEY=value',
        'log-level': 'debug'
      }
      return customInputs[name] ?? ''
    })

    await run()

    expect(exec.getExecOutput).toHaveBeenCalledWith(
      'devcontainer',
      expect.arrayContaining([
        'up',
        '--workspace-folder',
        '/custom/path',
        '--config',
        '.devcontainer/devcontainer.json',
        '--secrets-file',
        '.github/secrets.json',
        '--image-name',
        'my-image:latest',
        '--id-label',
        'ci-build',
        '--run-arg',
        '--cap-add',
        '--run-arg',
        'NET_ADMIN',
        '--skip-post-create',
        '--remote-env',
        'KEY=value',
        '--log-level',
        'debug'
      ]),
      { ignoreReturnCode: true }
    )
  })
})
