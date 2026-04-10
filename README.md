# devcontainer-ci

> GitHub Action to run and manage Dev Containers in CI with automatic setup and
> cleanup.

[![CI](https://github.com/devcontainer-env/devcontainer-ci/actions/workflows/ci.yml/badge.svg)](https://github.com/devcontainer-env/devcontainer-ci/actions/workflows/ci.yml)
[![Release](https://img.shields.io/github/v/release/devcontainer-env/devcontainer-ci)](https://github.com/devcontainer-env/devcontainer-ci/releases/latest)
[![Coverage](./badges/coverage.svg)](./badges/coverage.svg)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Automatically installs `@devcontainers/cli`, runs dev containers with full
configuration support, and ensures cleanup even if the workflow is cancelled.

## Features

- 🚀 Automatic installation of `@devcontainers/cli`
- ⚙️ Configurable dev container startup with comprehensive argument support
- 🧹 Automatic cleanup via post-step (even on cancellation)
- 📝 Full support for secrets, custom images, labels, and environment variables
- 📤 Structured JSON output with container metadata
- 🔄 State persistence between main and post steps

## Quick Start

```yaml
jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: devcontainer-env/devcontainer-ci@v1
        id: setup
        with:
          config: .devcontainer/devcontainer.json
      - run: echo "Running in ${{ steps.setup.outputs.container-id }}"
```

## Inputs

| Input                | Description                                               | Default |
| -------------------- | --------------------------------------------------------- | ------- |
| `workspace-folder`   | Workspace folder to use inside container                  | `.`     |
| `config`             | Path to devcontainer.json file                            | (empty) |
| `secrets-file`       | Path to a secrets file to pass to the container           | (empty) |
| `image-name`         | Custom image name to use                                  | (empty) |
| `container-id-label` | Label to use for container ID                             | (empty) |
| `run-args`           | Additional Docker run arguments (space-separated)         | (empty) |
| `skip-post-create`   | Skip running postCreateCommand                            | `false` |
| `remote-env`         | Environment variables for container (multiline KEY=VALUE) | (empty) |
| `log-level`          | Log level for devcontainer commands                       | `info`  |

## Outputs

| Output             | Description                      |
| ------------------ | -------------------------------- |
| `container-id`     | The ID of the started container  |
| `remote-user`      | The remote user in the container |
| `workspace-folder` | The remote workspace folder path |

## Examples

### Minimal

```yaml
- uses: devcontainer-env/devcontainer-ci@v1
```

### With Custom Configuration

```yaml
- uses: devcontainer-env/devcontainer-ci@v1
  id: dev
  with:
    config: .devcontainer/devcontainer.json
    image-name: my-custom-image:latest
    container-id-label: ci-build
    run-args: --cap-add NET_ADMIN --device /dev/fuse
    remote-env: |
      CI=true
      BUILD_NUMBER=${{ github.run_number }}
    log-level: debug

- run: echo "Container: ${{ steps.dev.outputs.container-id }}"
```

### With Secrets

```yaml
- uses: devcontainer-env/devcontainer-ci@v1
  with:
    secrets-file: .github/secrets.json
```

## How It Works

1. **Install** — Checks for `devcontainer` CLI in PATH; installs
   `@devcontainers/cli` globally if needed
2. **Setup** — Parses inputs and runs `devcontainer up` with configured
   arguments
3. **Output** — Extracts container metadata from JSON output and sets action
   outputs
4. **Cleanup** — Post-step automatically runs `devcontainer down` (skips if main
   step failed)

The cleanup step always runs (`post-if: always()`) but intelligently skips if
the main step never succeeded, preventing cleanup errors on partial failures.

## Development

### Setup

```bash
npm install
npm run all  # format, lint, test, coverage, bundle
```

### Commands

```bash
npm run format:write   # Format code
npm run lint          # Lint
npm run ci-test       # Run tests
npm run coverage      # Generate coverage badge
npm run package       # Bundle for dist/
npm run all           # Run all checks
```

### Integration Testing

Integration tests require Docker and a valid `.env` file:

```bash
cp .env.example .env
# Edit .env to set INPUT_WORKSPACE-FOLDER and other inputs
npm run local-action
```

## Notes

- The post-cleanup step always runs and automatically executes
  `devcontainer down` (skips only if main step never succeeded)
- Container IDs and workspace folders are persisted between main and post steps
  via GitHub Actions state
- `run-args` are split by whitespace; quoting is not supported (by design for CI
  simplicity)
- `remote-env` supports multiline input with values containing `=` (split on
  first `=`)

## License

MIT
