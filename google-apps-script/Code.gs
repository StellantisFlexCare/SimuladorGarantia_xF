// Cole este código em Extensões > Apps Script da planilha e publique como App da Web
// (Executar como: Eu | Quem pode acessar: Qualquer pessoa).

const SHEET_NAME = 'Cotações';
const HEADERS = [
  'ID', 'Data', 'Nome', 'Telefone', 'E-mail', 'CPF/CNPJ', 'Concessionária',
  'Veículos', 'Pacotes', 'Total', 'Parcelas', 'Valor Parcela', 'Itens (JSON)',
  'Mês Referência'
];

function getSheet() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }
  if (sheet.getLastRow() === 0) {
    sheet.appendRow(HEADERS);
    sheet.setFrozenRows(1);
  }
  return sheet;
}

function doPost(e) {
  const lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    const data = JSON.parse(e.postData.contents);
    const items = data.vehicles || [];

    getSheet().appendRow([
      data.id,
      new Date(data.created_at || Date.now()),
      data.name,
      "'" + (data.phone || ''),
      data.email || '',
      "'" + (data.cpfcnpj || ''),
      data.css || '',
      items.map(i => `${i.brand} ${i.modelName} (${i.year})`).join(', '),
      items.map(i => `${i.packageName} x${i.quantity}`).join(', '),
      Number(data.total || 0),
      data.installments || '',
      Number(data.installmentValue || 0),
      JSON.stringify(items),
      items.map(i => i.referenceMonth || '').join(', ')
    ]);

    return json({ ok: true });
  } catch (err) {
    return json({ ok: false, reason: String(err) });
  } finally {
    lock.releaseLock();
  }
}

function json(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}
