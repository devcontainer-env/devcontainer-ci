import { describe, it, expect } from '@jest/globals'
import { buildUpArgs } from '../src/commands'
import { ActionInputs } from '../src/inputs'

describe('commands', () => {
  describe('buildUpArgs', () => {
    it('should build minimal args with defaults', () => {
      const inputs: ActionInputs = {
        workspaceFolder: '.',
        config: '',
        secretsFile: '',
        imageName: '',
        containerIdLabel: '',
        runArgs: [],
        skipPostCreate: false,
        remoteEnv: {},
        logLevel: 'info'
      }

      const args = buildUpArgs(inputs)
      expect(args).toEqual([
        'up',
        '--workspace-folder',
        '.',
        '--log-level',
        'info'
      ])
    })

    it('should include config when provided', () => {
      const inputs: ActionInputs = {
        workspaceFolder: '.',
        config: '.devcontainer/devcontainer.json',
        secretsFile: '',
        imageName: '',
        containerIdLabel: '',
        runArgs: [],
        skipPostCreate: false,
        remoteEnv: {},
        logLevel: 'info'
      }

      const args = buildUpArgs(inputs)
      expect(args).toContain('--config')
      expect(args).toContain('.devcontainer/devcontainer.json')
    })

    it('should include secrets-file when provided', () => {
      const inputs: ActionInputs = {
        workspaceFolder: '.',
        config: '',
        secretsFile: '.github/secrets.json',
        imageName: '',
        containerIdLabel: '',
        runArgs: [],
        skipPostCreate: false,
        remoteEnv: {},
        logLevel: 'info'
      }

      const args = buildUpArgs(inputs)
      expect(args).toContain('--secrets-file')
      expect(args).toContain('.github/secrets.json')
    })

    it('should include image-name when provided', () => {
      const inputs: ActionInputs = {
        workspaceFolder: '.',
        config: '',
        secretsFile: '',
        imageName: 'my-image:latest',
        containerIdLabel: '',
        runArgs: [],
        skipPostCreate: false,
        remoteEnv: {},
        logLevel: 'info'
      }

      const args = buildUpArgs(inputs)
      expect(args).toContain('--image-name')
      expect(args).toContain('my-image:latest')
    })

    it('should include id-label when provided', () => {
      const inputs: ActionInputs = {
        workspaceFolder: '.',
        config: '',
        secretsFile: '',
        imageName: '',
        containerIdLabel: 'ci-build',
        runArgs: [],
        skipPostCreate: false,
        remoteEnv: {},
        logLevel: 'info'
      }

      const args = buildUpArgs(inputs)
      expect(args).toContain('--id-label')
      expect(args).toContain('ci-build')
    })

    it('should include skip-post-create flag when true', () => {
      const inputs: ActionInputs = {
        workspaceFolder: '.',
        config: '',
        secretsFile: '',
        imageName: '',
        containerIdLabel: '',
        runArgs: [],
        skipPostCreate: true,
        remoteEnv: {},
        shutdown: true,
        logLevel: 'info'
      }

      const args = buildUpArgs(inputs)
      expect(args).toContain('--skip-post-create')
    })

    it('should not include skip-post-create flag when false', () => {
      const inputs: ActionInputs = {
        workspaceFolder: '.',
        config: '',
        secretsFile: '',
        imageName: '',
        containerIdLabel: '',
        runArgs: [],
        skipPostCreate: false,
        remoteEnv: {},
        logLevel: 'info'
      }

      const args = buildUpArgs(inputs)
      expect(args).not.toContain('--skip-post-create')
    })

    it('should include all run-args', () => {
      const inputs: ActionInputs = {
        workspaceFolder: '.',
        config: '',
        secretsFile: '',
        imageName: '',
        containerIdLabel: '',
        runArgs: ['--cap-add', 'NET_ADMIN', '--device', '/dev/fuse'],
        skipPostCreate: false,
        remoteEnv: {},
        logLevel: 'info'
      }

      const args = buildUpArgs(inputs)
      expect(args).toContain('--run-arg')
      expect(args).toContain('--cap-add')
      expect(args).toContain('NET_ADMIN')
      expect(args).toContain('--device')
      expect(args).toContain('/dev/fuse')
    })

    it('should include all remote-env entries', () => {
      const inputs: ActionInputs = {
        workspaceFolder: '.',
        config: '',
        secretsFile: '',
        imageName: '',
        containerIdLabel: '',
        runArgs: [],
        skipPostCreate: false,
        remoteEnv: { KEY1: 'value1', KEY2: 'value2' },
        shutdown: true,
        logLevel: 'info'
      }

      const args = buildUpArgs(inputs)
      expect(args).toContain('--remote-env')
      expect(args).toContain('KEY1=value1')
      expect(args).toContain('KEY2=value2')
    })

    it('should build with all flags', () => {
      const inputs: ActionInputs = {
        workspaceFolder: '/workspace',
        config: '.devcontainer/devcontainer.json',
        secretsFile: '.github/secrets.json',
        imageName: 'my-image:latest',
        containerIdLabel: 'ci-build',
        runArgs: ['--cap-add', 'NET_ADMIN'],
        skipPostCreate: true,
        remoteEnv: { KEY: 'value' },
        shutdown: true,
        logLevel: 'debug'
      }

      const args = buildUpArgs(inputs)
      expect(args).toContain('up')
      expect(args).toContain('--workspace-folder')
      expect(args).toContain('/workspace')
      expect(args).toContain('--config')
      expect(args).toContain('.devcontainer/devcontainer.json')
      expect(args).toContain('--secrets-file')
      expect(args).toContain('.github/secrets.json')
      expect(args).toContain('--image-name')
      expect(args).toContain('my-image:latest')
      expect(args).toContain('--id-label')
      expect(args).toContain('ci-build')
      expect(args).toContain('--run-arg')
      expect(args).toContain('--cap-add')
      expect(args).toContain('NET_ADMIN')
      expect(args).toContain('--skip-post-create')
      expect(args).toContain('--remote-env')
      expect(args).toContain('KEY=value')
      expect(args).toContain('--log-level')
      expect(args).toContain('debug')
    })
  })

})
