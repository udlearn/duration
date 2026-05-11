# GitHub Action

**`udlearn/duration`** is a lightweight composite GitHub Action that formats a numeric duration into human-readable text directly in your workflow — no network calls, no `npm install`, no containers.

It wraps the same bundled CLI shipped in the npm package, so the output matches what you get from `duration` locally.

## Requirements

Any GitHub-hosted runner with Node.js pre-installed (ubuntu, macos, windows). The action uses `shell: bash`, which is available on all three.

**Recommended:** `runs-on: ubuntu-latest` for the fastest cold start.

## Usage

```yaml
- uses: udlearn/duration@v1
  id: fmt
  with:
    value: "5400000"
    unit: ms
    format: medium

- run: echo "${{ steps.fmt.outputs.result }}"
  # => 1 hr 30 mins
```

### Multiple formats in one job

```yaml
- uses: udlearn/duration@v1
  id: short
  with:
    value: "90"
    unit: s

- uses: udlearn/duration@v1
  id: json
  with:
    value: "90"
    unit: s
    format: json

- run: |
    echo "Short: ${{ steps.short.outputs.result }}"
    echo "JSON:  ${{ steps.json.outputs.result }}"
```

## Inputs

| Input    | Required | Default | Description                                                                           |
|----------|----------|---------|---------------------------------------------------------------------------------------|
| `value`  | **yes**  | —       | Numeric duration value (e.g. `5400000` or `3600`).                                    |
| `unit`   | no       | `ms`    | Unit for `value`. Accepts: `ms`, `s`, `sec`, `m`, `min`, `h`, `hr`, `d`, `day`, etc.  |
| `format` | no       | `short` | One of: `short`, `medium`, `long`, `json`, `table`.                                   |

## Outputs

| Output   | Description                                                            |
|----------|------------------------------------------------------------------------|
| `result` | Formatted duration string (or JSON/table text depending on `format`).  |

The step fails with a non-zero exit code if `value` is not a valid number or `format` is unrecognized.

## Format examples

Given `value: "5400000"` and `unit: ms`:

| `format` | `result`                                      |
|----------|-----------------------------------------------|
| `short`  | `1h 30m`                                      |
| `medium` | `1 hr 30 mins`                                |
| `long`   | `1 hour 30 minutes`                           |
| `json`   | `{"milliseconds":5400000,"seconds":5400,...}` |
| `table`  | ASCII table with all unit breakdowns          |

## Versioning

Pin to a **major tag** for automatic compatible updates:

```yaml
uses: udlearn/duration@v1
```

Or pin to an exact release for reproducibility:

```yaml
uses: udlearn/duration@v1.3.2
```

The action version tracks the npm package version (`@udlearn/duration`). Breaking changes bump the major tag (e.g. `v2`).

## Marketplace

This action is published on the [GitHub Marketplace](https://github.com/marketplace/actions/duration). To use it, reference `udlearn/duration@v1` in any workflow file.

## Limitations

- **v1 accepts numeric values only.** English string parsing (`Duration.parse("1 hour 30 minutes")`) is not exposed yet — planned for a future version.
- **Single value per step.** To format multiple durations, use multiple action steps.
- Output is always English (no locale support).

## Security

- Inputs are passed via environment variables, never interpolated directly into shell commands.
- The action runs `node` against a committed bundle — no network calls, no dynamic code fetching.
- For third-party usage, pin the action ref to a full SHA for supply-chain safety:

```yaml
uses: udlearn/duration@<commit-sha>
```
