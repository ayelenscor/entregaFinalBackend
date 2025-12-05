import express from 'express';
import ProductManager from '../managers/ProductManager.js';

const router = express.Router();
const productManager = new ProductManager();

router.get('/', async (req, res) => {
  try {
    const { category, status, sort, limit } = req.query;
    
    const filters = {};
    if (category) filters.category = category;
    if (status !== undefined) filters.status = status === 'true';
    if (sort) filters.sort = sort;
    if (limit) filters.limit = limit;
    
    const products = await productManager.getProducts(filters);
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Error al leer los productos' });
  }
});

router.get('/:pid', async (req, res) => {
  try {
    const product = await productManager.getProductById(req.params.pid);
    if (!product) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Error al leer el producto' });
  }
});

router.post('/', async (req, res) => {
  try {
    const newProduct = await productManager.addProduct(req.body);
    
    if (req.app.get('io')) {
      const products = await productManager.getProducts();
      req.app.get('io').emit('products', products);
    }
    
    res.status(201).json(newProduct);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.put('/:pid', async (req, res) => {
  try {
    const updatedProduct = await productManager.updateProduct(req.params.pid, req.body);
    
    if (req.app.get('io')) {
      const products = await productManager.getProducts();
      req.app.get('io').emit('products', products);
    }
    
    res.json(updatedProduct);
  } catch (error) {
    const status = error.message === 'Producto no encontrado' ? 404 : 400;
    res.status(status).json({ error: error.message });
  }
});

router.delete('/:pid', async (req, res) => {
  try {
    await productManager.deleteProduct(req.params.pid);
    
    if (req.app.get('io')) {
      const products = await productManager.getProducts();
      req.app.get('io').emit('products', products);
    }
    
    res.json({ success: true });
  } catch (error) {
    const status = error.message === 'Producto no encontrado' ? 404 : 500;
    res.status(status).json({ error: error.message });
  }
});

export default router;
