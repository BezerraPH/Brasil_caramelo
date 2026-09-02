// Utilitários padronizados para WebLN (NIP-57 / Lightning Network)

export type WebLNProvider = {
  enable: () => Promise<void>;
  sendPayment: (invoice: string) => Promise<{ preimage?: string }>;
  makeInvoice?: (args: { amount: number; defaultMemo?: string }) => Promise<{ paymentRequest: string }>;
};

/**
 * Verifica se uma carteira WebLN está injetada no navegador (Alby, Mutiny, etc.)
 */
export function isWebLNAvailable(): boolean {
  if (typeof window === "undefined") return false;
  return "webln" in window && Boolean((window as unknown as { webln?: WebLNProvider }).webln);
}

/**
 * Executa pagamento de fatura Lightning via WebLN.
 */
export async function payWithWebLN(invoice: string): Promise<{ success: boolean; preimage?: string; error?: string }> {
  if (!isWebLNAvailable()) {
    return { success: false, error: "Extensão WebLN não detectada no navegador." };
  }

  try {
    const webln = (window as unknown as { webln: WebLNProvider }).webln;
    await webln.enable();
    const res = await webln.sendPayment(invoice);
    return { success: true, preimage: res?.preimage };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Pagamento cancelado ou rejeitado pela carteira.";
    return { success: false, error: msg };
  }
}
