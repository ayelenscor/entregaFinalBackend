import express from 'express';
import CartManager from '../managers/CartManager.js';
import ProductManager from '../managers/ProductManager.js';

const router = express.Router();
const cartManager = new CartManager();
const productManager = new ProductManager();

router.post('/', async (req, res) => {
  try {
    const newCart = await cartManager.createCart();
    res.status(201).json(newCart);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear el carrito' });
  }
});

router.get('/:cid', async (req, res) => {
  try {
    const cart = await cartManager.getCartById(req.params.cid);
    if (!cart) {
      return res.status(404).json({ error: 'Carrito no encontrado' });
    }
    res.json(cart);
  } catch (error) {
    res.status(500).json({ error: 'Error al leer el carrito' });
  }
});

router.post('/:cid/product/:pid', async (req, res) => {
  try {
    const cartId = req.params.cid;
    const productId = req.params.pid;
    
    const productExists = await productManager.getProductById(productId);
    if (!productExists) {
      return res.status(404).json({ error: 'Producto no encontrado' });
    }

    const cart = await cartManager.addProductToCart(cartId, productId);
    res.json(cart);
  } catch (error) {
    const status = error.message === 'Carrito no encontrado' ? 404 : 500;
    res.status(status).json({ error: error.message });
  }
});

// DELETE: Eliminar un producto específico del carrito
router.delete('/:cid/products/:pid', async (req, res) => {
  try {
    const cartId = req.params.cid;
    const productId = req.params.pid;
    
    const cart = await cartManager.removeProductFromCart(cartId, productId);
    res.json(cart);
  } catch (error) {
    const status = error.message === 'Carrito no encontrado' ? 404 : 500;
    res.status(status).json({ error: error.message });
  }
});

// PUT: Actualizar todo el carrito
router.put('/:cid', async (req, res) => {
  try {
    const cartId = req.params.cid;
    const { products } = req.body;
    
    if (!Array.isArray(products)) {
      return res.status(400).json({ error: 'El campo products debe ser un array' });
    }
    
    const cart = await cartManager.updateCart(cartId, products);
    res.json(cart);
  } catch (error) {
    const status = error.message === 'Carrito no encontrado' ? 404 : 400;
    res.status(status).json({ error: error.message });
  }
});

// PUT: Actualizar cantidad de un producto específico
router.put('/:cid/products/:pid', async (req, res) => {
  try {
    const cartId = req.params.cid;
    const productId = req.params.pid;
    const { quantity } = req.body;
    
    if (!quantity || typeof quantity !== 'number') {
      return res.status(400).json({ error: 'Debe proporcionar una cantidad válida' });
    }
    
    const cart = await cartManager.updateProductQuantity(cartId, productId, quantity);
    res.json(cart);
  } catch (error) {
    const status = error.message.includes('no encontrado') ? 404 : 400;
    res.status(status).json({ error: error.message });
  }
});

// DELETE: Vaciar todo el carrito
router.delete('/:cid', async (req, res) => {
  try {
    const cartId = req.params.cid;
    const cart = await cartManager.clearCart(cartId);
    res.json(cart);
  } catch (error) {
    const status = error.message === 'Carrito no encontrado' ? 404 : 500;
    res.status(status).json({ error: error.message });
  }
});

export default router;
