import express from 'express';
import ProductManager from '../managers/ProductManager.js';

const router = express.Router();
const productManager = new ProductManager();

router.get('/', async (req, res) => {
    const products = await productManager.getProducts();
    // Convertir documentos de Mongoose a objetos planos
    const plainProducts = products.map(p => p.toObject ? p.toObject() : p);
    res.render('home', { products: plainProducts });
});

router.get('/realtimeproducts', async (req, res) => {
    const products = await productManager.getProducts();
    // Convertir documentos de Mongoose a objetos planos
    const plainProducts = products.map(p => p.toObject ? p.toObject() : p);
    res.render('realTimeProducts', { products: plainProducts });
});

export default router;
