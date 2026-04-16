# POSIX awk — duration formatting (stdin: one numeric value per line).
BEGIN {
	MS_DAY = 86400000
	MS_HOUR = 3600000
	MS_MIN = 60000
	MS_SEC = 1000
}

function abs(x) { return x < 0 ? -x : x }

function unit_factor(u,    ul) {
	ul = tolower(u)
	gsub(/^[ \t]+|[ \t]+$/, "", ul)
	if (ul == "") return 1
	if (ul == "ms" || ul == "milli" || ul == "millis" || ul == "millisecond" || ul == "milliseconds") return 1
	if (ul == "s" || ul == "sec" || ul == "secs" || ul == "second" || ul == "seconds") return 1000
	if (ul == "m" || ul == "min" || ul == "mins" || ul == "minute" || ul == "minutes") return 60000
	if (ul == "h" || ul == "hr" || ul == "hrs" || ul == "hour" || ul == "hours") return 3600000
	if (ul == "d" || ul == "day" || ul == "days") return 86400000
	return 1
}

function to_ms(val, u) { return val * unit_factor(u) }

function comp(ms, c,    w) {
	w = abs(ms)
	c["d"] = int(w / MS_DAY)
	c["h"] = int((w / MS_HOUR) % 24)
	c["m"] = int((w / MS_MIN) % 60)
	c["s"] = int((w / MS_SEC) % 60)
	c["l"] = w % MS_SEC
}

function plural(v, u) { return (v > 1) ? (u "s") : u }

function trimtrail(s) {
	if (match(s, /[eE]/)) return s
	if (index(s, ".") == 0) return s
	sub(/0+$/, "", s)
	sub(/\.$/, "", s)
	if (s == "" || s == "-") return "0"
	return s
}

function fmtg(x) { return trimtrail(sprintf("%g", x)) }

function fmt_short(ms,    c, neg, p) {
	neg = (ms < 0)
	comp(ms, c)
	p = ""
	if (c["d"] > 0) p = p (p ? " " : "") sprintf("%.0fd", c["d"])
	if (c["h"] > 0) p = p (p ? " " : "") sprintf("%.0fh", c["h"])
	if (c["m"] > 0) p = p (p ? " " : "") sprintf("%.0fm", c["m"])
	if (c["s"] > 0) p = p (p ? " " : "") sprintf("%.0fs", c["s"])
	if (c["l"] > 0) p = p (p ? " " : "") fmtg(c["l"]) "ms"
	if (neg) p = p " ago"
	return p
}

function fmt_medium(ms,    c, neg, p) {
	neg = (ms < 0)
	comp(ms, c)
	p = ""
	if (c["d"] > 0) p = p (p ? " " : "") sprintf("%.0f %s", c["d"], plural(c["d"], "day"))
	if (c["h"] > 0) p = p (p ? " " : "") sprintf("%.0f %s", c["h"], plural(c["h"], "hr"))
	if (c["m"] > 0) p = p (p ? " " : "") sprintf("%.0f %s", c["m"], plural(c["m"], "min"))
	if (c["s"] > 0) p = p (p ? " " : "") sprintf("%.0f %s", c["s"], plural(c["s"], "sec"))
	if (c["l"] > 0) p = p (p ? " " : "") fmtg(c["l"]) " ms"
	if (neg) p = p " ago"
	return p
}

function fmt_long(ms,    c, neg, p) {
	neg = (ms < 0)
	comp(ms, c)
	p = ""
	if (c["d"] > 0) p = p (p ? " " : "") sprintf("%.0f %s", c["d"], plural(c["d"], "day"))
	if (c["h"] > 0) p = p (p ? " " : "") sprintf("%.0f %s", c["h"], plural(c["h"], "hour"))
	if (c["m"] > 0) p = p (p ? " " : "") sprintf("%.0f %s", c["m"], plural(c["m"], "minute"))
	if (c["s"] > 0) p = p (p ? " " : "") sprintf("%.0f %s", c["s"], plural(c["s"], "second"))
	if (c["l"] > 0) p = p (p ? " " : "") fmtg(c["l"]) " " plural(c["l"], "millisecond")
	if (neg) p = p " ago"
	return p
}

function numstr(x) {
	if (x == 0) return "0"
	return sprintf("%.17g", x + 0)
}

function json_row(ms,    j) {
	j = "{\n"
	j = j "  \"milliseconds\": " numstr(ms) ",\n"
	j = j "  \"seconds\": " numstr(ms / 1000) ",\n"
	j = j "  \"minutes\": " numstr(ms / 60000) ",\n"
	j = j "  \"hours\": " numstr(ms / 3600000) ",\n"
	j = j "  \"days\": " numstr(ms / 86400000) "\n"
	j = j "}"
	return j
}

function pad_cell(s, cw) {
	while (length(s) < cw) s = s " "
	return s
}

function build_table(n, ms,    cell, nrow, ncol, i, j, cw, hdr, grid, line_d, line_eq, body, row, k) {
	ncol = 5
	nrow = n + 1
	cell[1,1] = "milliseconds"
	cell[1,2] = "seconds"
	cell[1,3] = "minutes"
	cell[1,4] = "hours"
	cell[1,5] = "days"
	for (i = 1; i <= n; i++) {
		m = ms[i]
		cell[i + 1, 1] = numstr(m)
		cell[i + 1, 2] = numstr(m / 1000)
		cell[i + 1, 3] = numstr(m / 60000)
		cell[i + 1, 4] = numstr(m / 3600000)
		cell[i + 1, 5] = numstr(m / 86400000)
	}
	cw = 0
	for (i = 1; i <= nrow; i++) {
		for (j = 1; j <= ncol; j++) {
			k = length(cell[i, j])
			if (k > cw) cw = k
		}
	}
	hdr = "| "
	for (j = 1; j <= ncol; j++) {
		hdr = hdr pad_cell(cell[1, j], cw)
		hdr = hdr (j < ncol ? " | " : " |")
	}
	grid = length(hdr)
	line_d = "+"
	for (k = 1; k <= grid - 2; k++) line_d = line_d "-"
	line_d = line_d "+"
	line_eq = "+"
	for (k = 1; k <= grid - 2; k++) line_eq = line_eq "="
	line_eq = line_eq "+"
	body = ""
	for (i = 2; i <= nrow; i++) {
		row = "| "
		for (j = 1; j <= ncol; j++) {
			row = row pad_cell(cell[i, j], cw)
			row = row (j < ncol ? " | " : " |")
		}
		body = body (i > 2 ? "\n" : "") row
	}
	return line_d "\n" hdr "\n" line_eq "\n" body "\n" line_d "\n"
}

{
	vals[++n] = $0
}

END {
	if (mode == "json") {
		for (i = 1; i <= n; i++) {
			if (i > 1) print ""
			print json_row(to_ms(vals[i] + 0, unit))
		}
		exit
	}
	if (mode == "table") {
		for (i = 1; i <= n; i++) ms[i] = to_ms(vals[i] + 0, unit)
		printf "%s", build_table(n, ms)
		exit
	}
	for (i = 1; i <= n; i++) ms[i] = to_ms(vals[i] + 0, unit)
	bc = 0
	if (want_short + 0) {
		block = ""
		for (i = 1; i <= n; i++) {
			line = fmt_short(ms[i])
			block = block (i > 1 ? "\n" : "") line
		}
		b[++bc] = block
	}
	if (want_medium + 0) {
		block = ""
		for (i = 1; i <= n; i++) {
			line = fmt_medium(ms[i])
			block = block (i > 1 ? "\n" : "") line
		}
		b[++bc] = block
	}
	if (want_long + 0) {
		block = ""
		for (i = 1; i <= n; i++) {
			line = fmt_long(ms[i])
			block = block (i > 1 ? "\n" : "") line
		}
		b[++bc] = block
	}
	if (bc == 0) {
		block = ""
		for (i = 1; i <= n; i++) {
			line = fmt_short(ms[i])
			block = block (i > 1 ? "\n" : "") line
		}
		b[++bc] = block
	}
	out = b[1]
	for (i = 2; i <= bc; i++) out = out "\n" b[i]
	if (out == "") out = "0"
	print out
}
