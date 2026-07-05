const MENU = [
  { id: 19, name: "Chicken Korma", price: 350 },
  { id: 1, name: "Chicken Biryani Single", price: 350 },
  { id: 2, name: "Chicken Biryani Double", price: 550 },
  { id: 3, name: "Chicken Yakhni Pulao Single", price: 350 },
  { id: 4, name: "Chicken Yakhni Pulao Double", price: 550 },
  { id: 5, name: "Beef Yakhni Pulao Single", price: 500 },
  { id: 6, name: "Beef Yakhni Pulao Double", price: 800 },
  { id: 7, name: "Beef Biryani Single", price: 500 },
  { id: 8, name: "Beef Biryani Double", price: 800 },
  { id: 9, name: "Sada Pulao Single", price: 250 },
  { id: 10, name: "Sada Pulao Double", price: 400 },
  { id: 11, name: "Sada Biryani Single", price: 250 },
  { id: 12, name: "Sada Biryani Double", price: 400},
  { id: 13, name: "Shami Kabab", price: 180 },
  { id: 14, name: "Raita", price: 90 },
  { id: 15, name: "Salad", price: 90 },
  { id: 16, name: "Cold Drink", price: 90 },
  { id: 17, name: "Mineral Water Small", price: 70 },
  { id: 18, name: "Mineral Water Large", price: 120 },
];

let cart = {};
let deliveryCharge = 100;
let activeTab = 0;

function fmt(n) { return 'Rs. ' + Number(n).toFixed(0); }

function init() {
  const today = new Date().toISOString().split('T')[0];
  document.getElementById('invoice-date').value = today;
  document.getElementById('invoice-num').placeholder = 'INV-' + Date.now().toString().slice(-6);
  renderMenu(MENU);
}

function filterMenu(q) {
  const filtered = MENU.filter(i =>
    i.name.toLowerCase().includes(q.toLowerCase())
  );
  renderMenu(filtered);
}

function renderMenu(items) {
  const g = document.getElementById('menu-grid');
  g.innerHTML = items.map(item => {
    const inCart = cart[item.id];
    const qty = inCart ? inCart.qty : 0;
    return `<div class="menu-item ${inCart ? 'selected' : ''}" id="mi-${item.id}">
      <div class="mi-name">${item.name}</div>
      <div class="mi-price">${fmt(item.price)}</div>
      <div class="mi-qty-row">
        <button class="qty-btn" onclick="event.stopPropagation(); changeQty(${item.id}, -1)">−</button>
        <input class="qty-input" type="number" min="0" max="99" value="${qty}" id="qty-${item.id}"
          onchange="setQty(${item.id}, this.value)" onclick="event.stopPropagation()" />
        <button class="qty-btn" onclick="event.stopPropagation(); changeQty(${item.id}, 1)">+</button>
      </div>
    </div>`;
  }).join('');
}

function changeQty(id, delta) {
  const input = document.getElementById('qty-' + id);
  let v = parseInt(input.value) + delta;
  
  if (v < 1) {
    if (cart[id]) {
      delete cart[id];
      updateCart();
      renderMenu(MENU);
    }
    return;
  }
  
  input.value = v;
  if (!cart[id]) {
    const item = MENU.find(m => m.id === id);
    cart[id] = { ...item, qty: v };
  } else {
    cart[id].qty = v;
  }
  updateCart();
  renderMenu(MENU);
}

function setQty(id, val) {
  let v = parseInt(val);
  if (!v || v < 1) {
    if (cart[id]) {
      delete cart[id];
      updateCart();
      renderMenu(MENU);
    }
    return;
  }
  if (!cart[id]) {
    const item = MENU.find(m => m.id === id);
    cart[id] = { ...item, qty: v };
  } else {
    cart[id].qty = v;
  }
  updateCart();
  renderMenu(MENU);
}

function toggleItem(id) {
  if (cart[id]) {
    delete cart[id];
  } else {
    const item = MENU.find(m => m.id === id);
    const qtyEl = document.getElementById('qty-' + id);
    const qty = qtyEl ? parseInt(qtyEl.value) || 0 : 0;
    const finalQty = qty > 0 ? qty : 1;
    cart[id] = { ...item, qty: finalQty };
  }
  updateCart();
  renderMenu(MENU);
}

function updateCart() {
  const items = Object.values(cart);
  document.getElementById('cart-count').textContent = items.length;
  document.getElementById('gen-btn').disabled = items.length === 0;
  renderCartTab();
}

function renderCartTab() {
  const items = Object.values(cart);
  const cartBody = document.getElementById('cart-body');
  const totalsBox = document.getElementById('totals-box');

  if (items.length === 0) {
    cartBody.innerHTML = `<div class="empty-state">
      <div class="empty-icon">🛒</div>
      <div class="empty-text">No items added yet.<br>Go to Menu tab to add items.</div>
    </div>`;
    totalsBox.innerHTML = '';
    return;
  }

  cartBody.innerHTML = `<table class="cart-table">
    <thead><tr>
      <th>Item</th>
      <th>Qty</th>
      <th>Price</th>
      <th>Total</th>
      <th></th>
    </tr></thead>
    <tbody>${items.map(i => `<tr>
      <td><strong>${i.name}</strong></td>
      <td>${i.qty}</td>
      <td>${fmt(i.price)}</td>
      <td style="font-weight:600">${fmt(i.price * i.qty)}</td>
      <td><button class="del-btn" onclick="removeItem(${i.id})">✕</button></td>
    </tr>`).join('')}</tbody>
  </table>`;

  const sub = items.reduce((s, i) => s + i.price * i.qty, 0);
  const tax = parseFloat(document.getElementById('tax-pct')?.value || 0);
  const taxAmt = sub * tax / 100;
  const grand = sub + taxAmt + deliveryCharge;

  totalsBox.innerHTML = `
    <div class="totals-row">
      <span>Subtotal</span>
      <span>${fmt(sub)}</span>
    </div>
    ${tax > 0 ? `<div class="totals-row"><span>Tax (${tax}%)</span><span>${fmt(taxAmt)}</span></div>` : ''}
    <div class="totals-row">
      <span>Delivery</span>
      <span><input class="delivery-input" type="number" value="${deliveryCharge}" min="0"
        onchange="deliveryCharge = parseFloat(this.value)||0; renderCartTab()" /></span>
    </div>
    <div class="totals-row grand">
      <span>Grand Total</span>
      <span>${fmt(grand)}</span>
    </div>`;
}

function removeItem(id) {
  delete cart[id];
  updateCart();
  renderMenu(MENU);
}

function clearCart() {
  if (Object.keys(cart).length === 0) return;
  if (!confirm('Clear all items from cart?')) return;
  cart = {};
  updateCart();
  renderMenu(MENU);
}

function switchTab(idx) {
  activeTab = idx;
  document.querySelectorAll('.tab-btn').forEach((b, i) => b.classList.toggle('active', i === idx));
  document.querySelectorAll('.tab-panel').forEach((p, i) => p.classList.toggle('active', i === idx));
  if (idx === 1) renderCartTab();
}

function generateInvoice() {
  const items = Object.values(cart);
  if (items.length === 0) { showToast('Add items first!'); return; }

  const restName = document.getElementById('rest-name').value || 'Restaurant';
  const restAddr = document.getElementById('rest-addr').value || '';
  const restPhone = document.getElementById('rest-phone').value || '';
  const customer = document.getElementById('customer-name').value || 'Valued Customer';
  const invNum = document.getElementById('invoice-num').value || ('INV-' + Date.now().toString().slice(-6));
  const invDate = document.getElementById('invoice-date').value || new Date().toISOString().split('T')[0];
  const notes = document.getElementById('invoice-notes').value || '';
  const taxPct = parseFloat(document.getElementById('tax-pct').value || 0);

  const sub = items.reduce((s, i) => s + i.price * i.qty, 0);
  const taxAmt = sub * taxPct / 100;
  const grand = sub + taxAmt + deliveryCharge;

  const formatDate = (d) => {
    const dd = new Date(d + 'T00:00:00');
    return dd.toLocaleDateString('en-PK', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  const html = `
    <div class="inv-header">
      <div class="inv-logo">${restName}</div>
    </div>
    <div class="inv-meta">
      <div class="inv-meta-item">
        <div class="inv-meta-label">Invoice #</div>
        <div class="inv-meta-value">${invNum}</div>
      </div>
      <div class="inv-meta-item">
        <div class="inv-meta-label">Date</div>
        <div class="inv-meta-value">${formatDate(invDate)}</div>
      </div>
    </div>
    <div class="inv-customer">
      <div class="inv-customer-label">Billed To</div>
      <div class="inv-customer-name">${customer}</div>
      ${notes ? `<div style="font-size:12px;color:var(--text2);margin-top:4px;">Note: ${notes}</div>` : ''}
    </div>
    <div class="inv-items">
      <table class="inv-table">
        <thead><tr>
          <th>Item</th>
          <th style="text-align:center">Qty</th>
          <th style="text-align:right">Rate</th>
          <th>Total</th>
        </tr></thead>
        <tbody>${items.map(i => `<tr>
          <td>
            <div style="font-weight:500">${i.name}</div>
          </td>
          <td style="text-align:center">${i.qty}</td>
          <td style="text-align:right">${fmt(i.price)}</td>
          <td style="font-weight:600">${fmt(i.price * i.qty)}</td>
        </tr>`).join('')}</tbody>
      </table>
    </div>
    <div class="inv-totals">
      <div class="inv-total-row"><span>Subtotal</span><span>${fmt(sub)}</span></div>
      ${taxPct > 0 ? `<div class="inv-total-row"><span>Tax (${taxPct}%)</span><span>${fmt(taxAmt)}</span></div>` : ''}
      <div class="inv-total-row"><span>Delivery Charges</span><span>${fmt(deliveryCharge)}</span></div>
      <div class="inv-total-row grand-total"><span>TOTAL</span><span>${fmt(grand)}</span></div>
    </div>
    <div class="inv-footer">
      Thank you for your order!<br>
     ${restAddr}${restPhone ? ' | ' + restPhone : ''}
    </div>`;

  document.getElementById('invoice-capture').innerHTML = html;
  document.getElementById('invoice-overlay').classList.add('show');
  document.body.style.overflow = 'hidden';
}

function closeInvoice() {
  document.getElementById('invoice-overlay').classList.remove('show');
  document.body.style.overflow = '';
}

async function captureCanvas() {
  const el = document.getElementById('invoice-capture');
  return await html2canvas(el, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false,
  });
}

async function downloadInvoice() {
  showToast('Generating image...');
  try {
    const canvas = await captureCanvas();
    const link = document.createElement('a');
    const invNum = document.getElementById('invoice-num').value || 'invoice';
    link.download = `${invNum}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
    showToast('Downloaded!');
  } catch(e) {
    showToast('Download failed');
  }
}

async function shareInvoice() {
  if (!navigator.share && !navigator.canShare) {
    showToast('Sharing not supported on this browser');
    return;
  }
  showToast('Preparing to share...');
  try {
    const canvas = await captureCanvas();
    const blob = await new Promise(res => canvas.toBlob(res, 'image/png'));
    const invNum = document.getElementById('invoice-num').value || 'invoice';
    const file = new File([blob], `${invNum}.png`, { type: 'image/png' });
    const restName = document.getElementById('rest-name').value || 'Restaurant';

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({
        title: `Invoice from ${restName}`,
        text: `Please find your invoice attached.`,
        files: [file],
      });
      showToast('Shared!');
    } else if (navigator.share) {
      await navigator.share({
        title: `Invoice from ${restName}`,
        text: `Your invoice total: see attached image`,
      });
    } else {
      showToast('Sharing not available. Please download instead.');
    }
  } catch(e) {
    if (e.name !== 'AbortError') showToast('Share failed. Try download instead.');
  }
}

function showToast(msg) {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2500);
}

// Initialize on DOM load
document.addEventListener('DOMContentLoaded', () => {
  init();
  updateCart();
});
