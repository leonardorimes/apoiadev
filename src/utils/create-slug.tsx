/**
 * Formata um username removendo espaços, caracteres especiais e decompondo acentos.
 * @param username string
 * @returns string tratado
 */
export function createSlug(username: string): string {
  return username
    .normalize("NFD") // Decompõe acentos
    .replace(/[\u0300-\u036f]/g, "") // Remove marcas de acento
    .replace(/ç/g, "c") // Trata cedilha
    .replace(/[^a-zA-Z0-9]/g, "") // Remove caracteres especiais
    .replace(/\s+/g, "") // Remove espaços
    .toLowerCase();
}
