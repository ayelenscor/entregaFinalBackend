import express from 'express';
import fs from 'fs/promises';
import path from 'path';

const router = express.Router();
const DATA_PATH = path.resolve('./data/products.json');

async function loadProducts() {
  try {
    const raw = await fs.readFile(DATA_PATH, 'utf8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function saveProducts(products) {
  await fs.writeFile(DATA_PATH, JSON.stringify(products, null, 2));
}

router.get('/', async (req, res) => {
  const products = await loadProducts();
  res.json(products);
});

router.post('/', async (req, res) => {
  try {
    const { title, description, code, price, status = true, stock, category, thumbnails = [] } = req.body;

    if (!title || !description || !code || !price || !stock || !category) {
      return res.status(400).json({ error: 'Todos los campos son obligatorios' });
    }

    const products = await loadProducts();
    
    if (products.some(p => p.code === code)) {
      return res.status(400).json({ error: 'Ya existe un producto con ese c�digo' });
    }

    const newProduct = {
      id: products.length > 0 ? Math.max(...products.map(p => p.id)) + 1 : 1,
      title,
      description,
      code,
      price,
      status,
      stock,
      category,
      thumbnails
    };

    products.push(newProduct);
    await saveProducts(products);
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear el producto' });
  }
});

export default router;
