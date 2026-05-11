FROM golang:1.22 AS build

WORKDIR /src
COPY go.mod ./
COPY cmd/ cmd/

ARG VERSION=0.0.0-dev
ARG TARGETOS=linux
ARG TARGETARCH

RUN CGO_ENABLED=0 GOOS=${TARGETOS} GOARCH=${TARGETARCH} \
    go build -trimpath -ldflags "-s -w -X main.version=${VERSION}" \
    -o /duration ./cmd/duration

FROM gcr.io/distroless/static-debian12:nonroot
COPY --from=build /duration /duration
ENTRYPOINT ["/duration"]
