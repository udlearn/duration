# Docker

The `ralflorent/duration` Docker image packages the Go CLI as a single static binary on a minimal base image. It supports `linux/amd64` and `linux/arm64`.

## Quick start

```bash
docker pull ralflorent/duration
docker run --rm ralflorent/duration 5400000
# => 1h 30m
```

## Usage

Arguments are passed directly to the `duration` CLI:

```bash
# Short format (default)
docker run --rm ralflorent/duration 3600
# => 3s 600ms

# Medium format, value in seconds
docker run --rm ralflorent/duration -m --unit=s 3600
# => 1 hr

# Long format
docker run --rm ralflorent/duration -l --unit=m 90
# => 1 hour 30 minutes

# JSON output
docker run --rm ralflorent/duration --json 7200000
# => { "milliseconds": 7200000, "seconds": 7200, ... }

# Table output
docker run --rm ralflorent/duration --table --unit=s 3600 7200

# Multiple values
docker run --rm ralflorent/duration -m 60000 120000
# => 1 min
# => 2 mins
```

The `DURATION_UNIT` environment variable is also supported:

```bash
docker run --rm -e DURATION_UNIT=s ralflorent/duration -m 3600
# => 1 hr
```

## Version

```bash
docker run --rm ralflorent/duration --version
```

The version printed matches the value baked in at build time via the `VERSION` build argument (see below). Published images use the same version as the corresponding Git tag and npm release.

## Platforms

Published images are available for:

- `linux/amd64`
- `linux/arm64`

Docker automatically pulls the correct variant for your host architecture.

## Image details

- **Base**: `gcr.io/distroless/static-debian12:nonroot` — no shell, no package manager, non-root user.
- **Size**: ~5 MB compressed (single static Go binary + distroless base).
- **Entry point**: `/duration`; all arguments are forwarded to the CLI.

## Building locally

```bash
docker build -t duration:local .
docker run --rm duration:local -m --unit=s 3600
```

To set a specific version:

```bash
docker build --build-arg VERSION=1.3.2 -t duration:local .
```

## Publishing to Docker Hub (maintainer)

Images are published manually to [Docker Hub](https://hub.docker.com/r/ralflorent/duration) using `docker buildx` for multi-arch support.

### Prerequisites

- Docker with [BuildKit](https://docs.docker.com/build/buildkit/) enabled.
- A buildx builder that supports multi-platform builds:

```bash
docker buildx create --name multiarch --use
docker buildx inspect --bootstrap
```

### Publish a release

```bash
# Authenticate with Docker Hub
docker login docker.io

# Build and push (replace VERSION with the release tag, e.g. 1.3.2)
VERSION=1.3.2
docker buildx build \
  --platform linux/amd64,linux/arm64 \
  --build-arg VERSION=${VERSION} \
  -t ralflorent/duration:${VERSION} \
  -t ralflorent/duration:latest \
  --push .
```

### Tag hygiene

- Every stable release should push both `:VERSION` and `:latest`.
- For pre-release or release-candidate builds, push `:VERSION` only and skip `:latest` so consumers on `latest` stay on the last stable image.

## Security

- The image runs as a non-root user (`nonroot` UID 65534).
- The final image contains only the static binary — no shell, no libc, no package manager.
- For supply-chain pinning, reference the image by digest:

```bash
docker pull ralflorent/duration@sha256:<digest>
```
