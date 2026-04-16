// Command duration formats numeric time spans (CLI parity with cli.js).
package main

import (
	"encoding/json"
	"fmt"
	"math"
	"os"
	"strconv"
	"strings"
)

// Set via -ldflags "-X main.version=1.2.3"
var version = "1.3.2"

const usageLine = "Usage: duration [options] <milliseconds...>"

const helpText = `Usage: duration [options] <milliseconds...>

Options:
-s              Display duration in short format (e.g., 1h 30m).
-m              Display duration in medium format (e.g., 1 hr 30 mins).
-l              Display duration in long format (e.g., 1 hour 30 minutes).
--json          Display duration in JSON format.
--table         Display duration in tabular format.
-u, --unit      Read duration values in the specified unit
                (default: milliseconds; e.g., ms, s, m, h, d).
-v, --version   Show version number.
-h, --help      Show this help message.

Examples:
1. display durations in short format:
$ duration 3600 54000
> 3s 600ms
> 54s

2. display duration in medium format:
$ duration -m 3600
> 3 secs 600ms

3. display duration read in seconds in long format:
$ duration -l --unit=s 3600
> 1 hour

Visit https://www.npmjs.com/package/@udlearn/duration for more info.`

type jsonRow struct {
	Milliseconds float64 `json:"milliseconds"`
	Seconds      float64 `json:"seconds"`
	Minutes      float64 `json:"minutes"`
	Hours        float64 `json:"hours"`
	Days         float64 `json:"days"`
}

func main() {
	if err := run(os.Args[1:]); err != nil {
		fmt.Fprintf(os.Stderr, "%s\n", err.Error())
		os.Exit(1)
	}
}

func run(args []string) error {
	cfg, err := parseArgs(args)
	if err != nil {
		return err
	}
	if cfg.help {
		fmt.Print(helpText)
		return nil
	}
	if cfg.version {
		fmt.Println(version)
		return nil
	}
	if len(cfg.values) == 0 {
		return fmt.Errorf("Error: provide a duration value as an argument.\n\n%s", usageLine)
	}

	msVals := make([]float64, 0, len(cfg.values))
	for _, v := range cfg.values {
		f, err := strconv.ParseFloat(v, 64)
		if err != nil || math.IsNaN(f) {
			return fmt.Errorf("Error: provide a number as an argument.\n\n%s", usageLine)
		}
		msVals = append(msVals, fromUnit(f, cfg.unit))
	}

	if cfg.asJSON {
		for i, ms := range msVals {
			b, err := json.MarshalIndent(toJSON(ms), "", "  ")
			if err != nil {
				return err
			}
			if i > 0 {
				fmt.Println()
			}
			fmt.Println(string(b))
		}
		return nil
	}
	if cfg.asTable {
		rows := make([]jsonRow, len(msVals))
		for i, ms := range msVals {
			rows[i] = toJSON(ms)
		}
		fmt.Print(formatTable(rows))
		return nil
	}

	formats := make([]string, 0, 3)
	if cfg.short {
		formats = append(formats, "short")
	}
	if cfg.medium {
		formats = append(formats, "medium")
	}
	if cfg.longFmt {
		formats = append(formats, "long")
	}
	if len(formats) == 0 {
		formats = append(formats, "short")
	}

	blocks := make([]string, 0, len(formats))
	for _, f := range formats {
		lines := make([]string, len(msVals))
		for i, ms := range msVals {
			lines[i] = formatOne(ms, f)
		}
		blocks = append(blocks, strings.Join(lines, "\n"))
	}
	out := strings.Join(blocks, "\n")
	if out == "" {
		out = "0"
	}
	fmt.Println(out)
	return nil
}

type config struct {
	help, version          bool
	asJSON, asTable        bool
	short, medium, longFmt bool
	unit                   string
	values                 []string
}

func parseArgs(args []string) (*config, error) {
	cfg := &config{}
	var pendingUnit bool
	for i := 0; i < len(args); i++ {
		a := args[i]
		if pendingUnit {
			cfg.unit = a
			pendingUnit = false
			continue
		}
		if a == "--" {
			cfg.values = append(cfg.values, args[i+1:]...)
			break
		}
		if len(a) > 1 && strings.HasPrefix(a, "-") {
			if _, err := strconv.ParseFloat(a, 64); err == nil {
				cfg.values = append(cfg.values, a)
				continue
			}
		}
		if a == "-h" || a == "--help" {
			cfg.help = true
			continue
		}
		if a == "-v" || a == "--version" {
			cfg.version = true
			continue
		}
		if a == "--json" {
			cfg.asJSON = true
			continue
		}
		if a == "--table" {
			cfg.asTable = true
			continue
		}
		if strings.HasPrefix(a, "--unit=") {
			cfg.unit = strings.TrimPrefix(a, "--unit=")
			continue
		}
		if a == "-u" || a == "--unit" {
			pendingUnit = true
			continue
		}
		if strings.HasPrefix(a, "-") && a != "-" {
			flags := a[1:]
			for _, c := range flags {
				switch c {
				case 'h':
					cfg.help = true
				case 'v':
					cfg.version = true
				case 's':
					cfg.short = true
				case 'm':
					cfg.medium = true
				case 'l':
					cfg.longFmt = true
				default:
					return nil, fmt.Errorf("Error: provide a number as an argument.\n\n%s", usageLine)
				}
			}
			continue
		}
		cfg.values = append(cfg.values, a)
	}
	if pendingUnit {
		return nil, fmt.Errorf("Error: provide a number as an argument.\n\n%s", usageLine)
	}
	if cfg.unit == "" {
		cfg.unit = os.Getenv("DURATION_UNIT")
	}
	return cfg, nil
}

func normalizeUnit(unit string) string {
	u := strings.ToLower(strings.TrimSpace(unit))
	if u == "" {
		return "milliseconds"
	}
	aliases := map[string]string{
		"ms": "milliseconds", "milli": "milliseconds", "millis": "milliseconds",
		"millisecond": "milliseconds", "milliseconds": "milliseconds",
		"s": "seconds", "sec": "seconds", "secs": "seconds", "second": "seconds", "seconds": "seconds",
		"m": "minutes", "min": "minutes", "mins": "minutes", "minute": "minutes", "minutes": "minutes",
		"h": "hours", "hr": "hours", "hrs": "hours", "hour": "hours", "hours": "hours",
		"d": "days", "day": "days", "days": "days",
	}
	if key, ok := aliases[u]; ok {
		return key
	}
	return "milliseconds"
}

func fromUnit(val float64, unit string) float64 {
	switch normalizeUnit(unit) {
	case "milliseconds":
		return val
	case "seconds":
		return val * 1000
	case "minutes":
		return val * 60000
	case "hours":
		return val * 3600000
	case "days":
		return val * 86400000
	default:
		return val
	}
}

func toJSON(ms float64) jsonRow {
	return jsonRow{
		Milliseconds: ms,
		Seconds:      ms / 1000,
		Minutes:      ms / 60000,
		Hours:        ms / 3600000,
		Days:         ms / 86400000,
	}
}

func components(ms float64) (days, hours, minutes, seconds, millis float64) {
	w := math.Abs(ms)
	days = math.Floor(w / 86400000)
	hours = math.Floor(math.Mod(w/3600000, 24))
	minutes = math.Floor(math.Mod(w/60000, 60))
	seconds = math.Floor(math.Mod(w/1000, 60))
	millis = math.Mod(w, 1000)
	return
}

func pluralize(val float64, unit string) string {
	if val > 1 {
		return unit + "s"
	}
	return unit
}

func formatOne(ms float64, kind string) string {
	neg := ms < 0
	w := ms
	if neg {
		w = -ms
	}
	d, h, mi, s, mil := components(w)
	var out string
	switch kind {
	case "short":
		out = formatShortComponents(d, h, mi, s, mil)
	case "medium":
		out = formatMediumComponents(d, h, mi, s, mil)
	case "long":
		out = formatLongComponents(d, h, mi, s, mil)
	default:
		out = formatShortComponents(d, h, mi, s, mil)
	}
	if neg {
		return out + " ago"
	}
	return out
}

func formatShortComponents(days, hours, minutes, seconds, millis float64) string {
	var parts []string
	if days > 0 {
		parts = append(parts, fmt.Sprintf("%.0fd", days))
	}
	if hours > 0 {
		parts = append(parts, fmt.Sprintf("%.0fh", hours))
	}
	if minutes > 0 {
		parts = append(parts, fmt.Sprintf("%.0fm", minutes))
	}
	if seconds > 0 {
		parts = append(parts, fmt.Sprintf("%.0fs", seconds))
	}
	if millis > 0 {
		parts = append(parts, trimTrail(fmt.Sprintf("%g", millis))+"ms")
	}
	return strings.Join(parts, " ")
}

func formatMediumComponents(days, hours, minutes, seconds, millis float64) string {
	var parts []string
	if days > 0 {
		parts = append(parts, fmt.Sprintf("%.0f %s", days, pluralize(days, "day")))
	}
	if hours > 0 {
		parts = append(parts, fmt.Sprintf("%.0f %s", hours, pluralize(hours, "hr")))
	}
	if minutes > 0 {
		parts = append(parts, fmt.Sprintf("%.0f %s", minutes, pluralize(minutes, "min")))
	}
	if seconds > 0 {
		parts = append(parts, fmt.Sprintf("%.0f %s", seconds, pluralize(seconds, "sec")))
	}
	if millis > 0 {
		parts = append(parts, fmt.Sprintf("%s ms", trimTrail(fmt.Sprintf("%g", millis))))
	}
	return strings.Join(parts, " ")
}

func formatLongComponents(days, hours, minutes, seconds, millis float64) string {
	var parts []string
	if days > 0 {
		parts = append(parts, fmt.Sprintf("%.0f %s", days, pluralize(days, "day")))
	}
	if hours > 0 {
		parts = append(parts, fmt.Sprintf("%.0f %s", hours, pluralize(hours, "hour")))
	}
	if minutes > 0 {
		parts = append(parts, fmt.Sprintf("%.0f %s", minutes, pluralize(minutes, "minute")))
	}
	if seconds > 0 {
		parts = append(parts, fmt.Sprintf("%.0f %s", seconds, pluralize(seconds, "second")))
	}
	if millis > 0 {
		parts = append(parts, fmt.Sprintf("%s %s", trimTrail(fmt.Sprintf("%g", millis)), pluralize(millis, "millisecond")))
	}
	return strings.Join(parts, " ")
}

func trimTrail(s string) string {
	if strings.Contains(s, "e") || strings.Contains(s, "E") {
		return s
	}
	if !strings.Contains(s, ".") {
		return s
	}
	s = strings.TrimRight(s, "0")
	s = strings.TrimRight(s, ".")
	if s == "" || s == "-" {
		return "0"
	}
	return s
}

func formatTable(rows []jsonRow) string {
	headers := []string{"milliseconds", "seconds", "minutes", "hours", "days"}
	cells := [][]string{headers}
	for _, r := range rows {
		cells = append(cells, []string{
			numStr(r.Milliseconds),
			numStr(r.Seconds),
			numStr(r.Minutes),
			numStr(r.Hours),
			numStr(r.Days),
		})
	}
	cellSize := 0
	for _, row := range cells {
		for _, cell := range row {
			if len(cell) > cellSize {
				cellSize = len(cell)
			}
		}
	}
	pad := func(s string) string {
		return s + strings.Repeat(" ", cellSize-len(s))
	}
	line := func(size int, ch byte) string {
		return "+" + strings.Repeat(string(ch), size-2) + "+"
	}
	headCells := make([]string, len(headers))
	for i, h := range headers {
		headCells[i] = pad(h)
	}
	header := "| " + strings.Join(headCells, " | ") + " |"
	gridSize := len(header)
	var bodyLines []string
	for ri := 1; ri < len(cells); ri++ {
		row := cells[ri]
		padded := make([]string, len(row))
		for i, c := range row {
			padded[i] = pad(c)
		}
		bodyLines = append(bodyLines, "| "+strings.Join(padded, " | ")+" |")
	}
	body := strings.Join(bodyLines, "\n")
	return strings.Join([]string{
		line(gridSize, '-'),
		header,
		line(gridSize, '='),
		body,
		line(gridSize, '-'),
	}, "\n") + "\n"
}

func numStr(f float64) string {
	return strconv.FormatFloat(f, 'f', -1, 64)
}
