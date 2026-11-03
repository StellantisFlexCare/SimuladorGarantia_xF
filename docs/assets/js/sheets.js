function generateUuid() {
  if (window.crypto && window.crypto.randomUUID) {
    return window.crypto.randomUUID();
  }

  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (char) {
    const random = Math.random() * 16 | 0;
    const value = char === 'x' ? random : (random & 0x3 | 0x8);
    return value.toString(16);
  });
}

window.saveQuoteToSheets = async function saveQuoteToSheets(quote) {
  const url = window.GOOGLE_SHEETS_URL || '';
  if (!url) {
    console.warn('Google Sheets não configurado. Defina window.GOOGLE_SHEETS_URL com a URL do App da Web do Apps Script.');
    return { ok: false, reason: 'sheets_not_configured' };
  }

  const payload = {
    id: generateUuid(),
    name: quote.client.name,
    phone: quote.client.phone,
    email: quote.client.email || null,
    cpfcnpj: quote.client.cpf || null,
    css: quote.dealership || null,
    vehicles: quote.items,
    total: Number(quote.total || 0),
    installments: quote.installments,
    installmentValue: Number(quote.installmentValue || 0),
    created_at: quote.createdAt || new Date().toISOString()
  };

  try {
    // text/plain evita o preflight CORS, que o Apps Script não suporta
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload)
    });
    const result = await response.json();
    if (!result.ok) {
      console.error('Erro ao salvar cotação na planilha:', result);
    }
    return result;
  } catch (error) {
    console.error('Erro ao salvar cotação na planilha:', error);
    return { ok: false, reason: error.message };
  }
};
