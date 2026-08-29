/**
 * Copia texto al portapapeles. Devuelve una promesa que resuelve a
 * true/false según el éxito, para que el componente pueda mostrar
 * "Copiado ✓" solo si funcionó de verdad.
 */
export async function copyToClipboard(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
    // Fallback para contextos no seguros (http) o navegadores antiguos
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}

/**
 * Descarga un array de objetos como CSV. `rows` es un array de objetos
 * planos (mismas claves en todos); la primera fila del CSV son las claves.
 */
export function exportToCSV(rows, filename) {
  if (!rows || rows.length === 0) return false;
  try {
    const headers = Object.keys(rows[0]);
    const escape = (val) => {
      const str = String(val ?? "");
      return /[",\n;]/.test(str) ? `"${str.replace(/"/g, '""')}"` : str;
    };
    const lines = [
      headers.join(";"),
      ...rows.map((row) => headers.map((h) => escape(row[h])).join(";")),
    ];
    // BOM UTF-8 para que Excel abra bien los acentos/€ sin configurar nada
    const blob = new Blob(["\uFEFF" + lines.join("\n")], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = filename.endsWith(".csv") ? filename : `${filename}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    return true;
  } catch {
    return false;
  }
}
