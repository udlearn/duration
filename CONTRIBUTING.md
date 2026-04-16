# How to contribute

These are a few guidelines that contributors need to follow to keep things easy.

## Repository layout

| Path | Purpose |
|------|---------|
| [`index.js`](index.js), [`cli.js`](cli.js) | npm library and Node CLI source |
| [`cmd/duration/`](cmd/duration) | Go static CLI |
| [`scripts/`](scripts) | POSIX `duration` + `awk`, installer, vector test runner |
| [`test/`](test) | Node test suite and shared CLI fixtures |
| [`examples/`](examples) | Small runnable demo |
| [`docs/`](docs) | Extra docs (e.g. non-npm install) |
| [`man/duration.1`](man/duration.1) | Manual page for the CLI |

## Getting Started

- Create a branch or fork the repository
- Add your functionality or fix a bug
- Ensure that your changes pass the tests
- Only refactoring and documentation changes require no new tests.
- Only pull requests with passing tests will be accepted.

## Submitting Changes

- Push your changes to your branch/fork.
- Submit a pull request.

## Additional Resources

- [General GitHub documentation](http://help.github.com/)
- [GitHub pull request documentation](http://help.github.com/send-pull-requests/)
