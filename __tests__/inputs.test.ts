import { beforeEach, describe, it, expect, jest } from '@jest/globals'
import * as coreMock from '../__fixtures__/core'

describe('inputs', () => {
  beforeEach(() => {
    // Clear all mocks before each test
    jest.clearAllMocks()
  })

  it('should parse default values', async () => {
    // Mock core.getInput to return defaults
    coreMock.getInput.mockImplementation((name) => {
      const defaults: Record<string, string> = {
        'workspace-folder': '',
        config: '',
        'secrets-file': '',
        'image-name': '',
        'container-id-label': '',
        'run-args': '',
        'skip-post-create': 'false',
        'remote-env': '',
        'log-level': ''
      }
      return defaults[name] ?? ''
    })

    // Mock the core module
    await jest.unstable_mockModule('@actions/core', () => coreMock)
    const { getInputs } = await import('../src/inputs')

    const inputs = getInputs()
    expect(inputs.workspaceFolder).toBe('.')
    expect(inputs.config).toBe('')
    expect(inputs.secretsFile).toBe('')
    expect(inputs.imageName).toBe('')
    expect(inputs.containerIdLabel).toBe('')
    expect(inputs.runArgs).toEqual([])
    expect(inputs.skipPostCreate).toBe(false)
    expect(inputs.remoteEnv).toEqual({})
    expect(inputs.logLevel).toBe('info')
  })

  it('should parse skip-post-create=true', async () => {
    coreMock.getInput.mockImplementation((name) => {
      if (name === 'skip-post-create') return 'true'
      if (name === 'workspace-folder') return ''
      if (name === 'log-level') return ''
      return ''
    })

    await jest.unstable_mockModule('@actions/core', () => coreMock)
    const { getInputs } = await import('../src/inputs')

    const inputs = getInputs()
    expect(inputs.skipPostCreate).toBe(true)
  })

  it('should parse run-args with space splitting', async () => {
    coreMock.getInput.mockImplementation((name) => {
      if (name === 'run-args') return '--cap-add NET_ADMIN --device /dev/fuse'
      if (name === 'workspace-folder') return ''
      if (name === 'log-level') return ''
      return ''
    })

    await jest.unstable_mockModule('@actions/core', () => coreMock)
    const { getInputs } = await import('../src/inputs')

    const inputs = getInputs()
    expect(inputs.runArgs).toEqual([
      '--cap-add',
      'NET_ADMIN',
      '--device',
      '/dev/fuse'
    ])
  })

  it('should parse remote-env single line', async () => {
    coreMock.getInput.mockImplementation((name) => {
      if (name === 'remote-env') return 'KEY=value'
      if (name === 'workspace-folder') return ''
      if (name === 'log-level') return ''
      return ''
    })

    await jest.unstable_mockModule('@actions/core', () => coreMock)
    const { getInputs } = await import('../src/inputs')

    const inputs = getInputs()
    expect(inputs.remoteEnv).toEqual({ KEY: 'value' })
  })

  it('should parse remote-env multiple lines', async () => {
    coreMock.getInput.mockImplementation((name) => {
      if (name === 'remote-env') return 'KEY1=value1\nKEY2=value2'
      if (name === 'workspace-folder') return ''
      if (name === 'log-level') return ''
      return ''
    })

    await jest.unstable_mockModule('@actions/core', () => coreMock)
    const { getInputs } = await import('../src/inputs')

    const inputs = getInputs()
    expect(inputs.remoteEnv).toEqual({ KEY1: 'value1', KEY2: 'value2' })
  })

  it('should parse remote-env with values containing =', async () => {
    coreMock.getInput.mockImplementation((name) => {
      if (name === 'remote-env') return 'TOKEN=base64encodedvalue=='
      if (name === 'workspace-folder') return ''
      if (name === 'log-level') return ''
      return ''
    })

    await jest.unstable_mockModule('@actions/core', () => coreMock)
    const { getInputs } = await import('../src/inputs')

    const inputs = getInputs()
    expect(inputs.remoteEnv).toEqual({ TOKEN: 'base64encodedvalue==' })
  })

  it('should skip blank lines in remote-env', async () => {
    coreMock.getInput.mockImplementation((name) => {
      if (name === 'remote-env') return 'KEY1=value1\n\nKEY2=value2\n'
      if (name === 'workspace-folder') return ''
      if (name === 'log-level') return ''
      return ''
    })

    await jest.unstable_mockModule('@actions/core', () => coreMock)
    const { getInputs } = await import('../src/inputs')

    const inputs = getInputs()
    expect(inputs.remoteEnv).toEqual({ KEY1: 'value1', KEY2: 'value2' })
  })

  it('should parse secrets-file when provided', async () => {
    coreMock.getInput.mockImplementation((name) => {
      if (name === 'secrets-file') return '.github/secrets.json'
      if (name === 'workspace-folder') return ''
      if (name === 'log-level') return ''
      return ''
    })

    await jest.unstable_mockModule('@actions/core', () => coreMock)
    const { getInputs } = await import('../src/inputs')

    const inputs = getInputs()
    expect(inputs.secretsFile).toBe('.github/secrets.json')
  })
})
