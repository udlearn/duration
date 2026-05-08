# Installing without npm (releases, binary, shell)

This guide is for users who want the `duration` CLI **without installing Node.js**. The npm package remains the primary distribution for the **library** (`require('@udlearn/duration')`); see the [README](../README.md) for that.

You have several practical options:

1. **Homebrew (tap)** — build the Go CLI from source with Go; installs `duration` and the man page.
2. **curl installer** — tries a GitHub Release binary for your OS/arch, then falls back to the POSIX shell + awk implementation.
3. **GitHub Release tarball** — download and unpack a prebuilt binary yourself.
4. **From source** — build the Go CLI locally, or run the shell script from a git checkout.

The command-line interface matches the Node-based CLI described in [`man/duration.1`](../man/duration.1) (also shipped in the npm package).

---

## 1. homebrew (macOS only)

See [homebrew-duration](https://github.com/udlearn/homebrew-duration) to learn more about this.

```bash
brew tap udlearn/duration
brew install duration
```

## 2. curl installer

The curl installer implementation is [`scripts/install.sh`](../scripts/install.sh).

```bash
curl -fsSL https://raw.githubusercontent.com/udlearn/duration/main/scripts/install.sh | sh
```

By default this installs into `~/.local/bin`. Use another directory on your `PATH`:

```bash
PREFIX=/usr/local/bin curl -fsSL https://raw.githubusercontent.com/udlearn/duration/main/scripts/install.sh | sh
```

### What the installer does

1. **Release binary** — For each [GitHub Release](https://github.com/udlearn/duration/releases), CI publishes tarballs named:

   `duration_<version>_<os>_<arch>.tar.gz`

   Examples: `duration_1.3.2_linux_amd64.tar.gz`, `duration_1.3.2_darwin_arm64.tar.gz`, `duration_1.3.2_windows_amd64.tar.gz` (contains `duration.exe`).

   The installer picks `os` and `arch` from `uname` (Linux, macOS, Windows via Git Bash/MSYS) and downloads the matching asset for `VERSION` (see below).

2. **Fallback** — If no tarball exists (wrong version tag, new platform, or release not published yet), it downloads [`scripts/duration`](../scripts/duration) and [`scripts/_duration.awk`](../scripts/_duration.awk) from `raw.githubusercontent.com` and installs both next to each other (the shell script expects `_duration.awk` in the same directory).

### Environment variables

| Variable                | Meaning                                                                                                |
| ----------------------- | ------------------------------------------------------------------------------------------------------ |
| `VERSION`               | Release **without** the `v` prefix (default: see `scripts/install.sh`, kept in sync with the package). |
| `PREFIX`                | Install directory (default: `$HOME/.local/bin`).                                                       |
| `REPO`                  | GitHub `owner/repo` slug (default: `udlearn/duration`).                                                |
| `DURATION_FORCE_SCRIPT` | If `1`, skip the binary download and install only the shell + awk files.                               |
| `DURATION_RAW_REF`      | Git ref for raw GitHub URLs (e.g. `main`) when not using the default tag-based raw URL.                |

If a release tag does not exist yet, the installer falls back to the **`main`** branch for the shell files.

---

## 3. Manual download from GitHub Releases

1. Open [Releases](https://github.com/udlearn/duration/releases) and pick a version.
2. Download `duration_<version>_<os>_<arch>.tar.gz` for your platform.
3. Extract the archive and move `duration` (or `duration.exe` on Windows) to a directory on your `PATH`.

No separate checksum file is required for basic use; verify integrity out-of-band if your policy requires it.

---

## 4. POSIX shell + awk (from the repo or npm tarball)

If you have a POSIX `sh` and `awk` (Linux, macOS, Git Bash, MSYS2, WSL):

- Copy [`scripts/duration`](../scripts/duration) and [`scripts/_duration.awk`](../scripts/_duration.awk) to the same directory.
- `chmod +x scripts/duration`
- Run `sh /path/to/duration …` or put that directory on `PATH`.

**Note:** `--table` output is validated exactly only against the Node/Go CLIs; the awk implementation may differ slightly in numeric formatting. Golden tests skip the strict table case for the shell CLI (see [`test/fixtures/cli_vectors.json`](../test/fixtures/cli_vectors.json)).

---

## 5. Build the Go CLI from source

Requires [Go](https://go.dev/) 1.21+:

```bash
git clone https://github.com/udlearn/duration.git
cd duration
go build -o duration -ldflags "-X main.version=$(node -p \"require('./package.json').version\")" ./cmd/duration
```

Install the binary wherever you like. `go test ./...` runs tests, including CLI vectors against the same fixtures as the shell runner.

---

## Manual page

After installing, you can install the man page system-wide (paths vary by OS):

```bash
sudo cp man/duration.1 /usr/local/share/man/man1/
sudo mandb # Linux, if applicable
```

Or read the file directly: [`man/duration.1`](../man/duration.1).
