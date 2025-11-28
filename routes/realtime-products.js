const socket = io();

function renderProducts(products) {
  const list = document.getElementById('productsList');
  if (!list) return;
  list.innerHTML = '';
  if (!products || products.length === 0) {
    list.innerHTML = '<li>No hay productos</li>';
    return;
  }
  products.forEach(p => {
    const li = document.createElement('li');
    li.dataset.id = p.id;
    li.innerHTML = `${p.title} - $${p.price} <button class="deleteBtn" data-id="${p.id}">Eliminar</button>`;
    list.appendChild(li);
  });
}

socket.on('products', (products) => {
  renderProducts(products);
});

// Form: create product
const form = document.getElementById('createProductForm');
if (form) {
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const payload = {
      title: data.get('title'),
      description: data.get('description'),
      code: data.get('code'),
      price: Number(data.get('price')),
      stock: Number(data.get('stock')),
      category: data.get('category'),
      thumbnails: data.get('thumbnails') ? String(data.get('thumbnails')).split(',').map(s => s.trim()).filter(Boolean) : []
    };

    try {
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        alert('Error creando producto: ' + (err.error || res.statusText));
        return;
      }
      form.reset();
      // server emits 'products' on success, so list will update via socket
    } catch (err) {
      console.error(err);
      alert('Error creando producto');
    }
  });
}

// Delegate delete button clicks
document.addEventListener('click', async (e) => {
  const btn = e.target.closest && e.target.closest('.deleteBtn');
  if (!btn) return;
  const id = btn.dataset.id;
  if (!id) return;
  if (!confirm('¿Eliminar producto?')) return;
  try {
    const res = await fetch(`/api/products/${id}`, { method: 'DELETE' });
    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      alert('Error eliminando: ' + (err.error || res.statusText));
      return;
    }
    // server emits 'products' on success, clients update via socket
  } catch (err) {
    console.error(err);
    alert('Error eliminando producto');
  }
});

// Request initial state once (socket also sends it when connecting)
fetch('/api/products')
  .then(r => r.json())
  .then(renderProducts)
  .catch(() => {});
