/**
 * Utilitários de Formatação Visual e Cores ANSI para o Terminal TUI do NexoQuiz
 */

export const colors = {
  reset: "\x1b[0m",
  bold: "\x1b[1m",
  dim: "\x1b[2m",
  italic: "\x1b[3m",
  underline: "\x1b[4m",

  // Cores de texto
  black: "\x1b[30m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  magenta: "\x1b[35m",
  cyan: "\x1b[36m",
  white: "\x1b[37m",
  gray: "\x1b[90m",

  // Cores brilhantes
  brightRed: "\x1b[91m",
  brightGreen: "\x1b[92m",
  brightYellow: "\x1b[93m",
  brightBlue: "\x1b[94m",
  brightMagenta: "\x1b[95m",
  brightCyan: "\x1b[96m",
  brightWhite: "\x1b[97m",

  // Fundos
  bgBlue: "\x1b[44m",
  bgGreen: "\x1b[42m",
  bgRed: "\x1b[41m",
  bgYellow: "\x1b[43m",
  bgDark: "\x1b[48;5;235m",
};

export const c = {
  brand: (text: string) => `${colors.bold}${colors.brightCyan}${text}${colors.reset}`,
  gold: (text: string) => `${colors.bold}${colors.brightYellow}${text}${colors.reset}`,
  success: (text: string) => `${colors.bold}${colors.brightGreen}${text}${colors.reset}`,
  error: (text: string) => `${colors.bold}${colors.brightRed}${text}${colors.reset}`,
  warning: (text: string) => `${colors.bold}${colors.yellow}${text}${colors.reset}`,
  info: (text: string) => `${colors.cyan}${text}${colors.reset}`,
  dim: (text: string) => `${colors.gray}${text}${colors.reset}`,
  bold: (text: string) => `${colors.bold}${text}${colors.reset}`,
  title: (text: string) => `${colors.bold}${colors.brightWhite}${text}${colors.reset}`,
  highlight: (text: string) => `${colors.bgBlue}${colors.brightWhite} ${text} ${colors.reset}`,
};

export function renderBanner(): string {
  return `
${c.brand("=======================================================================")}
${c.gold("  ⚖️  NEXOQUIZ — Engine de Avaliação Jurídica Digital (Terminal TUI)")}
${c.dim("  Simulação de Magistratura & ENAM · Base Canônica SQLite FTS5 · Offline")}
${c.brand("=======================================================================")}
`;
}

export function renderBox(title: string, content: string, borderColor: (t: string) => string = c.brand): string {
  const lines = content.split("\n");
  const maxLen = Math.max(
    title.length + 4,
    ...lines.map(l => l.replace(/\x1b\[[0-9;]*m/g, "").length)
  );
  const width = Math.min(Math.max(maxLen + 4, 50), 90);

  const top = borderColor(`┌─ [ ${c.title(title)} ] ` + "─".repeat(Math.max(0, width - title.length - 7)) + "┐");
  const bottom = borderColor("└" + "─".repeat(width) + "┘");

  const body = lines.map(line => {
    const rawLen = line.replace(/\x1b\[[0-9;]*m/g, "").length;
    const padding = " ".repeat(Math.max(0, width - rawLen - 2));
    return `${borderColor("│")} ${line}${padding} ${borderColor("│")}`;
  }).join("\n");

  return `${top}\n${body}\n${bottom}`;
}

export function renderProgressBar(current: number, total: number, length: number = 25): string {
  const percentage = Math.round((current / total) * 100);
  const filledLength = Math.round((length * current) / total);
  const emptyLength = length - filledLength;

  const bar = c.success("█".repeat(filledLength)) + c.dim("░".repeat(emptyLength));
  return `[${bar}] ${c.bold(`${current}/${total}`)} (${percentage}%)`;
}

export function renderTable(headers: string[], rows: string[][]): string {
  const colWidths = headers.map((h, i) => {
    const maxRowLen = rows.reduce((max, row) => {
      const cell = row[i] || "";
      const rawLen = cell.replace(/\x1b\[[0-9;]*m/g, "").length;
      return Math.max(max, rawLen);
    }, 0);
    return Math.max(h.length, maxRowLen) + 2;
  });

  const headerRow = headers.map((h, i) => h.padEnd(colWidths[i])).join(" │ ");
  const separator = colWidths.map(w => "─".repeat(w)).join("─┼─");

  const formattedRows = rows.map(row => {
    return row.map((cell, i) => {
      const rawLen = cell.replace(/\x1b\[[0-9;]*m/g, "").length;
      const pad = " ".repeat(Math.max(0, colWidths[i] - rawLen));
      return `${cell}${pad}`;
    }).join(" │ ");
  }).join("\n");

  return `${c.dim("┌─" + colWidths.map(w => "─".repeat(w)).join("─┬─") + "─┐")}\n` +
         `│ ${c.bold(headerRow)} │\n` +
         `${c.dim("├─" + separator + "─┤")}\n` +
         formattedRows.split("\n").map(r => `│ ${r} │`).join("\n") + "\n" +
         `${c.dim("└─" + colWidths.map(w => "─".repeat(w)).join("─┴─") + "─┘")}`;
}
