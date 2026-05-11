import { HttpErrorResponse } from '@angular/common/http';

/**
 * Lê mensagens da API ASP.NET: `{ mensagem }`, erros de validação (`errors`) ou Problem Details (`title`).
 */
export function mensagemErroApi(
  err: unknown,
  fallback: string,
): string {
  if (err instanceof HttpErrorResponse) {
    const body = err.error;
    if (body && typeof body === 'object' && !Array.isArray(body)) {
      const rec = body as Record<string, unknown>;
      if (typeof rec['mensagem'] === 'string' && rec['mensagem'].trim()) {
        return rec['mensagem'].trim();
      }
      const errors = rec['errors'];
      if (errors && typeof errors === 'object' && !Array.isArray(errors)) {
        const partes: string[] = [];
        for (const msgs of Object.values(errors as Record<string, unknown>)) {
          if (Array.isArray(msgs)) {
            for (const m of msgs) {
              if (typeof m === 'string' && m.trim()) partes.push(m.trim());
            }
          }
        }
        if (partes.length) return partes.join(' ');
      }
      if (typeof rec['title'] === 'string' && rec['title'].trim()) {
        return rec['title'].trim();
      }
    }
    if (err.status === 0) {
      return 'Não foi possível conectar à API. Verifique se o servidor está em execução.';
    }
  }
  return fallback;
}
