# Simulador de Pacotes de Manutenção FlexCare

Página web usada pelas concessionárias para simular o valor dos pacotes de manutenção programada FlexCare (Fiat, Jeep, Ram e Leapmotor) e registrar o lead do cliente numa planilha Google.

O site é estático: HTML, JavaScript puro e Tailwind via CDN. Não tem build nem dependências para instalar.

## Como funciona

1. O vendedor escolhe o **mês de referência** da tabela de preços, a **marca**, o **modelo/ano**, a **revisão inicial** e **quantas revisões** o pacote cobre (mínimo 2).
2. O valor do pacote é a soma dos preços das revisões escolhidas. O total aparece também em **12x sem juros** (total ÷ 12).
3. Dá para somar vários pacotes na mesma simulação.
4. Em **Salvar lead**, o vendedor informa concessionária, nome, telefone, CPF/CNPJ e e-mail (opcional). A cotação é enviada para a planilha pelo Google Apps Script.

## Estrutura

```
docs/                       Site publicado (GitHub Pages lê desta pasta)
├── index.html              Página única do simulador; define a URL do Apps Script
└── assets/
    ├── css/style.css
    ├── img/
    │   ├── Stellantis-Emblem.png
    │   └── models/         Fotos dos modelos (<marca>-<modelo>.webp)
    └── js/
        ├── data.js         Tabelas de preço por mês (FLEXCARE_MONTHS)
        ├── dealerships.js  Concessionárias por marca
        ├── simulation.js   Seleção, cálculo e lista de pacotes
        ├── sheets.js       Envio da cotação para a planilha
        └── app.js          Modal de lead, validações e avisos
google-apps-script/
└── Code.gs                 Script que grava as cotações na planilha
```

## Rodar localmente

Abra `docs/index.html` no navegador ou, para servir como no Pages:

```
cd docs
python -m http.server 8000
```

Depois acesse http://localhost:8000.

> Cotações salvas a partir do ambiente local também vão para a planilha de produção, porque a URL do Apps Script fica fixa no `index.html`.

## Publicação

O site é publicado pelo **GitHub Pages** a partir da branch `main`, pasta `/docs` (Settings → Pages). Qualquer push na `main` atualiza o site em poucos minutos.

## Manutenção do dia a dia

### Nova tabela de preços (todo mês)

Em `docs/assets/js/data.js`, cada item de `FLEXCARE_MONTHS` é um mês:

```js
{
  key: "2026-10",          // AAAA-MM
  label: "Outubro/2026",
  cars: [
    { "id": "jeep_01", "brand": "Jeep", "model": "Avenger", "name": "AVENGER 1.0T MHEV",
      "year": "2027", "revisions": [967, 998, 1170, ...] }   // preço da 1ª à 10ª revisão
  ]
}
```

- Adicione o mês novo **no topo** da lista e remova o mais antigo. O simulador mostra só os dois primeiros (mês atual e anterior).
- `revisions` traz o preço de cada revisão, em ordem. O número de revisões disponíveis segue o tamanho dessa lista.
- Os dados vêm da planilha `DadosMarcas.xlsx`.

### Fotos dos modelos

A foto é localizada pelo nome: `assets/img/models/<marca>-<modelo>.webp`, em minúsculas, sem acento e com hífen no lugar de espaços (ex.: `jeep-compass.webp`, `ram-1500.webp`). Para o modelo `Importados`, vale o nome do carro sem a motorização (ex.: `jeep-wrangler.webp`).

### Concessionárias

`docs/assets/js/dealerships.js` lista as concessionárias por marca (`Fiat`, `Jeep`, `Leapmotor`, `Ram`), pelo nome do PDV, sem código. A chave precisa ser igual ao campo `brand` usado em `data.js`.

## Planilha de cotações (Google Apps Script)

As cotações são gravadas na aba **Cotações**, com estas colunas: ID, Data, Nome, Telefone, E-mail, CPF/CNPJ, Concessionária, Veículos, Pacotes, Total, Parcelas, Valor Parcela, Itens (JSON) e Mês Referência.

Para configurar ou trocar a planilha:

1. Na planilha, abra **Extensões → Apps Script** e cole o conteúdo de `google-apps-script/Code.gs`.
2. **Implantar → Nova implantação → App da Web**, com *Executar como: Eu* e *Quem pode acessar: Qualquer pessoa*.
3. Copie a URL que termina em `/exec` e coloque em `window.GOOGLE_SHEETS_URL`, no `<head>` de `docs/index.html`.

Se você alterar o `Code.gs` depois, publique uma **nova versão** da implantação. Senão a URL continua rodando o código antigo.

## Segurança e dados pessoais

- O formulário coleta **nome, telefone, e-mail e CPF/CNPJ** (dados pessoais, sujeitos à LGPD). Restrinja o acesso à planilha a quem realmente precisa.
- A URL do Apps Script fica visível no código do site. Quem tiver essa URL consegue enviar linhas para a planilha. Se ela vazar ou receber dados indevidos, gere uma nova implantação e atualize o `index.html`.
- Cada cotação também fica salva no `localStorage` do navegador usado (chave `flexcare_quotes`). Em computadores compartilhados, limpe os dados do site quando necessário.
