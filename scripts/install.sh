#!/usr/bin/env sh
# Install the duration CLI: tries a release tarball first, then falls back to the POSIX shell + awk build.
#
# Usage (either URL works — root install.sh is a thin wrapper):
#   curl -fsSL https://raw.githubusercontent.com/udlearn/duration/main/install.sh | sh
#   curl -fsSL https://raw.githubusercontent.com/udlearn/duration/main/scripts/install.sh | sh
# Environment:
#   VERSION   — release tag without v (default: 1.3.2)
#   REPO      — github.com slug (default: udlearn/duration)
#   PREFIX    — install directory (default: $HOME/.local/bin)
#   DURATION_FORCE_SCRIPT — if set to 1, skip binaries and install the shell implementation only

set -e

VERSION="${VERSION:-1.3.2}"
REPO="${REPO:-udlearn/duration}"
PREFIX="${PREFIX:-$HOME/.local/bin}"
FORCE_SCRIPT="${DURATION_FORCE_SCRIPT:-0}"

TAG="v${VERSION}"
BASE="https://github.com/${REPO}/releases/download/${TAG}"
RAW="https://raw.githubusercontent.com/${REPO}/${TAG}"

# Allow installing from main when a release has not been cut yet.
if [ "${DURATION_RAW_REF:-}" != "" ]; then
	RAW="https://raw.githubusercontent.com/${REPO}/${DURATION_RAW_REF}"
fi

umask 022
mkdir -p "${PREFIX}"

detect_os() {
	uname_s=$(uname -s 2>/dev/null || printf '%s' "Linux")
	case "$uname_s" in
	Linux*) printf '%s' "linux" ;;
	Darwin*) printf '%s' "darwin" ;;
	MINGW* | MSYS* | CYGWIN*) printf '%s' "windows" ;;
	*) printf '%s' "linux" ;;
	esac
}

detect_arch() {
	uname_m=$(uname -m 2>/dev/null || printf '%s' "x86_64")
	case "$uname_m" in
	x86_64 | amd64) printf '%s' "amd64" ;;
	aarch64 | arm64) printf '%s' "arm64" ;;
	*) printf '%s' "amd64" ;;
	esac
}

install_script_pair() {
	echo "Installing POSIX shell CLI from ${RAW} ..." >&2
	tmp=$(mktemp -d)
	trap 'rm -rf "${tmp}"' EXIT INT HUP
	curl -fsSL "${RAW}/scripts/duration" -o "${tmp}/duration"
	curl -fsSL "${RAW}/scripts/_duration.awk" -o "${tmp}/_duration.awk"
	chmod +x "${tmp}/duration"
	mv "${tmp}/duration" "${PREFIX}/duration"
	mv "${tmp}/_duration.awk" "${PREFIX}/_duration.awk"
	trap - EXIT INT HUP
	rm -rf "${tmp}"
	echo "Installed ${PREFIX}/duration (requires awk on PATH)." >&2
}

install_tarball() {
	os=$(detect_os)
	arch=$(detect_arch)
	name="duration_${VERSION}_${os}_${arch}.tar.gz"
	url="${BASE}/${name}"
	tmp=$(mktemp -d)
	trap 'rm -rf "${tmp}"' EXIT INT HUP
	if ! curl -fsSL "${url}" -o "${tmp}/archive.tar.gz" 2>/dev/null; then
		rm -rf "${tmp}"
		trap - EXIT INT HUP
		return 1
	fi
	(
		cd "${tmp}" && tar -xzf archive.tar.gz
	)
	bin="duration"
	[ "${os}" = "windows" ] && bin="duration.exe"
	if [ ! -f "${tmp}/${bin}" ]; then
		echo "Release archive missing ${bin}" >&2
		rm -rf "${tmp}"
		trap - EXIT INT HUP
		return 1
	fi
	chmod +x "${tmp}/${bin}"
	mv "${tmp}/${bin}" "${PREFIX}/${bin}"
	rm -rf "${tmp}"
	trap - EXIT INT HUP
	echo "Installed ${PREFIX}/${bin}" >&2
	return 0
}

if [ "${FORCE_SCRIPT}" = "1" ]; then
	install_script_pair
	exit 0
fi

if install_tarball; then
	exit 0
fi

echo "No prebuilt binary for this platform or release missing; using shell implementation." >&2
RAW_FALLBACK="${RAW}"
if [ "${DURATION_RAW_REF:-}" = "" ]; then
	# Last resort: track main branch files when the tag is not published yet.
	RAW_FALLBACK="https://raw.githubusercontent.com/${REPO}/main"
fi
RAW="${RAW_FALLBACK}"
install_script_pair
