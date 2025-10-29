import express from 'express';
import fs from 'fs/promises';
import path from 'path';

const router = express.Router();
const DATA_PATH = path.resolve('./data/carts.json');

async function loadCarts() {
  try {
    const raw = await fs.readFile(DATA_PATH, 'utf8');
    return JSON.parse(raw);
  } catch {
    return [];
  }
}

async function saveCarts(carts) {
  await fs.writeFile(DATA_PATH, JSON.stringify(carts, null, 2));
}

router.post('/', async (req, res) => {
  try {
   
    const carts = await loadCarts();
    
    
    const newId = carts.length > 0 
      ? Math.max(...carts.map(c => Number(c.id))) + 1 
      : 1;

   
    const newCart = {
      id: newId,
      products: []
    };


    carts.push(newCart);
    
   
    await saveCarts(carts);
    

    res.status(201).json(newCart);
  } catch (error) {
    console.error('Error al crear el carrito:', error);
    res.status(500).json({ 
      error: 'Error al crear el carrito',
      details: error.message 
    });
  }
});

export default router;
