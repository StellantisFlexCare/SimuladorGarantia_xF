    // Estado da simulação
    let simulationCart = [];
    const INSTALLMENT_COUNT = 12;

    // Formatação monetária BRL
    function formatCurrency(val) {
      return val.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    }

    function formatInstallmentValue(val) {
      const [integerPart, decimalPart] = formatCurrency(val)
        .replace(/^R\$\s?/, '')
        .split(',');
      return `<strong class="text-2xl leading-none">${integerPart}</strong><span class="text-sm leading-none">,${decimalPart}</span>`;
    }

    function calculateInstallmentValue(totalAmount) {
      return totalAmount / INSTALLMENT_COUNT;
    }

    function buildInstallmentSummaryMarkup(totalAmount) {
      const installmentValue = calculateInstallmentValue(totalAmount);
      return `
        <span class="flex items-baseline gap-1 font-black leading-none text-emerald-700"><span class="text-[12px]">${INSTALLMENT_COUNT}x</span> ${formatInstallmentValue(installmentValue)}</span>
        <span class="text-[12px] font-black uppercase tracking-[0.08em] leading-none text-emerald-700">Sem juros</span>
      `;
    }

    // Inicialização ao carregar página
    window.addEventListener('DOMContentLoaded', () => {
      document.querySelectorAll('#quoteModal input').forEach(input => {
        input.value = '';
      });
      populateMonthOptions();
      populateBrandOptions();
      onBrandChange();
      renderCart();
    });

    function getSelectedMonth() {
      const monthKey = document.getElementById('monthSelect').value;
      return FLEXCARE_MONTHS.find(month => month.key === monthKey) || FLEXCARE_MONTHS[0];
    }

    function populateMonthOptions() {
      const monthSelect = document.getElementById('monthSelect');
      monthSelect.innerHTML = '';
      // Apenas o mês atual e o anterior ficam disponíveis.
      FLEXCARE_MONTHS.slice(0, 2).forEach(month => {
        const option = document.createElement('option');
        option.value = month.key;
        option.textContent = month.label.split('/')[0];
        monthSelect.appendChild(option);
      });
      monthSelect.value = FLEXCARE_MONTHS[0].key;
    }

    // Troca a tabela de preços usada na simulação
    function onMonthChange() {
      FLEXCARE_DATABASE = getSelectedMonth().cars;
      populateBrandOptions();
      onBrandChange();
    }

    function populateBrandOptions() {
      const brandSelect = document.getElementById('brandSelect');
      const selectedBrand = brandSelect.value;
      const brands = [...new Set(FLEXCARE_DATABASE.map(car => car.brand))];

      brandSelect.innerHTML = '';
      const placeholder = document.createElement('option');
      placeholder.value = '';
      placeholder.textContent = 'Selecione uma marca';
      placeholder.disabled = true;
      placeholder.selected = true;
      brandSelect.appendChild(placeholder);

      brands.forEach(brand => {
        const option = document.createElement('option');
        option.value = brand;
        option.textContent = brand.toUpperCase();
        brandSelect.appendChild(option);
      });

      brandSelect.value = brands.includes(selectedBrand) ? selectedBrand : '';
    }

function calculateSelectedRevisions(car) {
  const startRevision = parseInt(
    document.getElementById('packageSelect').value,
    10
  );
  const quantity = parseInt(
    document.getElementById('revisionQuantitySelect').value,
    10
  );

  return car.revisions
    .slice(startRevision - 1, startRevision - 1 + quantity)
    .reduce((total, revisionPrice) => total + revisionPrice, 0);
}

function updateRevisionQuantityOptions(car) {
  const startRevision = parseInt(
    document.getElementById('packageSelect').value,
    10
  );
  const quantitySelect = document.getElementById('revisionQuantitySelect');
  const maxQuantity = car.revisions.length - startRevision + 1;
  const minimumQuantity = Math.min(2, maxQuantity);
  const currentQuantity = Math.min(
    Math.max(parseInt(quantitySelect.value, 10) || minimumQuantity, minimumQuantity),
    maxQuantity
  );

  quantitySelect.innerHTML = '';
  for (let quantity = minimumQuantity; quantity <= maxQuantity; quantity += 1) {
    const option = document.createElement('option');
    option.value = quantity;
    option.textContent = `${quantity} ${quantity === 1 ? 'revisão' : 'revisões'}`;
    option.selected = quantity === currentQuantity;
    quantitySelect.appendChild(option);
  }
}

function updateStartRevisionOptions(car) {
    const packageSelect = document.getElementById('packageSelect');
    const currentRevision = parseInt(packageSelect.value, 10) || 3;
    const selectedRevision = Math.min(currentRevision, car.revisions.length);

    packageSelect.innerHTML = '';
    for (let revision = 1; revision <= car.revisions.length; revision += 1) {
  const option = document.createElement('option');
  option.value = revision;
  option.textContent = `${revision}ª Revisão`;
  option.selected = revision === selectedRevision;
  packageSelect.appendChild(option);
    }
}

  // Foto do modelo: assets/img/models/<marca>-<modelo>.webp (ex.: jeep-compass.webp).
  // "Importados" agrupa carros diferentes, então usa o nome do carro (ex.: jeep-wrangler.webp).
  function getModelImage(car) {
    const slug = value => String(value)
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    const model = car.model === 'Importados' ? car.name.replace(/\s+\d.*$/, '') : car.model;
    return `assets/img/models/${slug(car.brand)}-${slug(model)}.webp`;
  }

  // Filtra modelos pela marca
  function onBrandChange() {
      const selectedBrand = document.getElementById('brandSelect').value;
      const modelSelect = document.getElementById('modelSelect');
      modelSelect.innerHTML = '';

      const placeholder = document.createElement('option');
      placeholder.value = '';
      placeholder.textContent = selectedBrand ? 'Selecione um modelo' : 'Selecione primeiro uma marca';
      placeholder.disabled = true;
      placeholder.selected = true;
      modelSelect.appendChild(placeholder);

      modelSelect.disabled = !selectedBrand;
      const filtered = FLEXCARE_DATABASE.filter(item => item.brand === selectedBrand);
      // Agrupa as versões sob o nome do modelo (o rótulo do optgroup aparece em negrito)
      const groups = new Map();
      filtered.forEach((car) => {
        if (!groups.has(car.model)) groups.set(car.model, []);
        groups.get(car.model).push(car);
      });
      [...groups.keys()].sort((a, b) => a.localeCompare(b, 'pt-BR')).forEach((model) => {
        const group = document.createElement('optgroup');
        group.label = model.toUpperCase();
        groups.get(model)
          .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR', { numeric: true }))
          .forEach((car) => {
            const opt = document.createElement('option');
            opt.value = car.id;
            opt.textContent = car.name.includes(car.year)
              ? car.name
              : `${car.name} (${car.year})`;
            group.appendChild(opt);
          });
        modelSelect.appendChild(group);
      });

      onSelectionChange();
    }

    function onSelectionChange() {

    const modelId =
        document.getElementById('modelSelect').value;

    const car =
        FLEXCARE_DATABASE.find(
            item => item.id === modelId
        );

    if (!car) {
      document.getElementById('packageSelect').disabled = true;
      document.getElementById('revisionQuantitySelect').disabled = true;
      document.getElementById('selectedPackageLabel').textContent =
        'Selecione uma marca e um modelo';
      toggleAddButtonState();
      return;
    }

    document.getElementById('packageSelect').disabled = false;
    document.getElementById('revisionQuantitySelect').disabled = false;
    updateStartRevisionOptions(car);
    updateRevisionQuantityOptions(car);

    const startRevision = parseInt(
      document.getElementById('packageSelect').value,
      10
    );
    const quantity = parseInt(
      document.getElementById('revisionQuantitySelect').value,
      10
    );
    const finalRevision = startRevision + quantity - 1;
    const packageLabel = quantity === 1
      ? `${startRevision}ª Revisão`
      : `${startRevision}ª à ${finalRevision}ª Revisão (${quantity} revisões)`;

    document.getElementById('selectedPackageLabel').textContent =
      packageLabel;
    toggleAddButtonState();
}

function addVehicleToCart() {

    if (simulationCart.length > 0) {
      showToast('Você já adicionou um pacote. Remova antes de incluir outro.', 'warn');
      return;
    }

    const modelId =
        document.getElementById('modelSelect').value;

    const startRevision =
        parseInt(
        document.getElementById('packageSelect').value,
        10
      );
    const quantity =
      parseInt(
        document.getElementById('revisionQuantitySelect').value,
        10
        );

    const car =
        FLEXCARE_DATABASE.find(
            item => item.id === modelId
        );

    if (!car) {
        showToast("Selecione um modelo válido antes de adicionar.", "warn");
        return;
    }

    const price =
        calculateSelectedRevisions(car);
    const packageName = quantity === 1
      ? `${startRevision}ª Revisão`
      : `${startRevision}ª à ${startRevision + quantity - 1}ª Revisão (${quantity} revisões)`;

    const cartItem = {

        id:
            'item_' +
            Date.now() +
            Math.random().toString(36).substr(2, 4),

        brand: car.brand,

        modelName: car.name,

        year: car.year,

        packageName:
          packageName,

        revision:
          startRevision,

        quantity: quantity,

        price: price,

        referenceMonth: getSelectedMonth().label,

        image: getModelImage(car)
    };

    simulationCart.push(cartItem);

    renderCart();

    showToast(
        `${car.name} adicionado com sucesso!`
    );
}

    // Remove item individual
    function removeCartItem(itemId) {
      simulationCart = simulationCart.filter(item => item.id !== itemId);
      renderCart();
      showToast('Veículo removido da simulação', 'info');
    }

    // Renderiza a lista e calcula totais
    function toggleAddButtonState() {
      const addVehicleBtn = document.getElementById('addVehicleBtn');
      const hasItems = simulationCart.length > 0;
      const hasSelectedModel = Boolean(document.getElementById('modelSelect').value);
      const isDisabled = hasItems || !hasSelectedModel;

      addVehicleBtn.disabled = isDisabled;
      addVehicleBtn.setAttribute('aria-disabled', String(isDisabled));
      addVehicleBtn.classList.toggle('opacity-70', isDisabled);
      addVehicleBtn.classList.toggle('cursor-not-allowed', isDisabled);
    }

    function renderCart() {
      const listContainer = document.getElementById('cartList');
      const emptyState = document.getElementById('emptyState');
      const itemsBadge = document.getElementById('itemsBadge');
      const grandTotalDisplay = document.getElementById('grandTotalDisplay');
      const summaryCountText = document.getElementById('summaryCountText');
      const summaryInstallment = document.getElementById('summaryInstallment');

      toggleAddButtonState();
      listContainer.innerHTML = '';
      const totalCount = simulationCart.length;
      itemsBadge.textContent = `${totalCount} ${totalCount === 1 ? 'Pacote' : 'Pacotes'}`;
      summaryCountText.textContent = `(${totalCount} ${totalCount === 1 ? 'veículo' : 'veículos'})`;

      if (totalCount === 0) {
        emptyState.classList.remove('hidden');
        grandTotalDisplay.textContent = formatCurrency(0);
        summaryInstallment.innerHTML = buildInstallmentSummaryMarkup(0);
        return;
      }

      emptyState.classList.add('hidden');

      let totalSum = 0;

      simulationCart.forEach((item, index) => {
        totalSum += item.price;
        const card = document.createElement('div');
        card.className = "rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden";

        card.innerHTML = `
          <div class="bg-white px-4 pt-4 pb-2">
            <img src="${item.image}" alt="${item.brand} ${item.modelName}" class="w-full h-40 object-contain"
              onerror="this.parentElement.remove()">
          </div>
          <div class="border-t border-slate-100 px-4 pt-3 pb-3">
            <p class="text-[10px] font-semibold text-slate-500 uppercase tracking-wide">${item.brand}</p>
            <h4 class="text-sm font-bold text-slate-900 mt-0.5">${item.modelName}</h4>
            <p class="text-xs text-slate-400 mt-0.5">Ano-modelo ${item.year}</p>
            <div class="border-t border-slate-100 mt-3 pt-3 flex items-center justify-between gap-3">
              <span class="text-xs text-slate-500">${item.packageName}</span>
              <span class="text-sm font-bold text-slate-900 whitespace-nowrap">${formatCurrency(item.price)}</span>
            </div>
            <button onclick="removeCartItem('${item.id}')" class="mt-3 text-xs text-slate-500 underline underline-offset-2 hover:text-rose-600 transition">
              Remover
            </button>
          </div>
        `;
        listContainer.appendChild(card);
      });

      grandTotalDisplay.textContent = formatCurrency(totalSum);
      summaryInstallment.innerHTML = buildInstallmentSummaryMarkup(totalSum);
    }
