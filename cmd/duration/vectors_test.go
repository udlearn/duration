package main

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"math"
	"os"
	"path/filepath"
	"strings"
	"testing"
)

type vectorFile struct {
	Cases []vectorCase `json:"cases"`
}

type vectorCase struct {
	Args           []string           `json:"args"`
	Stdout         string             `json:"stdout,omitempty"`
	StdoutContains string             `json:"stdout_contains,omitempty"`
	StdoutJSON     map[string]float64 `json:"stdout_json,omitempty"`
	StderrContains string             `json:"stderr_contains,omitempty"`
	Env            map[string]string  `json:"env,omitempty"`
	Exit           int                `json:"exit"`
}

func almostEqual(a, b float64) bool {
	if a == b {
		return true
	}
	d := math.Abs(a - b)
	if d < 1e-12 {
		return true
	}
	scale := math.Max(1, math.Max(math.Abs(a), math.Abs(b)))
	return d/scale < 1e-12
}

func TestCLIVectors(t *testing.T) {
	root := findProjectRoot(t)
	data, err := os.ReadFile(filepath.Join(root, "test", "fixtures", "cli_vectors.json"))
	if err != nil {
		t.Fatal(err)
	}
	var vf vectorFile
	if err := json.Unmarshal(data, &vf); err != nil {
		t.Fatal(err)
	}
	for i, tc := range vf.Cases {
		tc := tc
		name := strings.Join(tc.Args, " ")
		if name == "" {
			name = "(no-args)"
		}
		name = strings.ReplaceAll(name, "/", "_")
		t.Run(fmt.Sprintf("%d_%s", i, name), func(t *testing.T) {
			for k, v := range tc.Env {
				t.Setenv(k, v)
			}
			outBuf := &bytes.Buffer{}
			oldOut := os.Stdout
			rOut, wOut, err := os.Pipe()
			if err != nil {
				t.Fatal(err)
			}
			os.Stdout = wOut
			runErr := run(tc.Args)
			wOut.Close()
			_, _ = io.Copy(outBuf, rOut)
			rOut.Close()
			os.Stdout = oldOut

			if tc.Exit != 0 {
				if runErr == nil {
					t.Fatal("expected error exit")
				}
				msg := runErr.Error()
				if tc.StderrContains != "" && !strings.Contains(msg, tc.StderrContains) {
					t.Fatalf("error %q should contain %q", msg, tc.StderrContains)
				}
				return
			}
			if runErr != nil {
				t.Fatal(runErr)
			}
			out := outBuf.String()
			if tc.Stdout != "" && out != tc.Stdout {
				t.Fatalf("stdout mismatch:\nwant %q\ngot  %q", tc.Stdout, out)
			}
			if tc.StdoutContains != "" && !strings.Contains(out, tc.StdoutContains) {
				t.Fatalf("stdout %q should contain %q", out, tc.StdoutContains)
			}
			if tc.StdoutJSON != nil {
				var got map[string]float64
				if err := json.Unmarshal([]byte(strings.TrimSpace(out)), &got); err != nil {
					t.Fatal(err)
				}
				for k, want := range tc.StdoutJSON {
					g, ok := got[k]
					if !ok {
						t.Fatalf("missing key %s", k)
					}
					if !almostEqual(g, want) {
						t.Fatalf("%s: want %g got %g", k, want, g)
					}
				}
			}
		})
	}
}

func findProjectRoot(t *testing.T) string {
	t.Helper()
	dir, err := os.Getwd()
	if err != nil {
		t.Fatal(err)
	}
	for {
		if _, err := os.Stat(filepath.Join(dir, "go.mod")); err == nil {
			return dir
		}
		parent := filepath.Dir(dir)
		if parent == dir {
			t.Fatal("go.mod not found")
		}
		dir = parent
	}
}
