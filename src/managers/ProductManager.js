import Product from '../models/product.model.js';
import { promises as fs } from 'fs';
import path from 'path';
import { isUsingDatabase } from '../config/database.js';

class ProductManager {
    constructor() {
        this.path = path.join(process.cwd(), 'data', 'products.json');
    }

    async getProducts(filters = {}) {
        try {
            if (isUsingDatabase()) {
                return await this._getProductsDB(filters);
            } else {
                return await this._getProductsJSON(filters);
            }
        } catch (error) {
            throw new Error(`Error al obtener productos: ${error.message}`);
        }
    }

    async _getProductsDB(filters = {}) {
        const { category, status, sort, limit } = filters;
        let query = {};

        if (category) {
            query.category = new RegExp(category, 'i');
        }

        if (status !== undefined) {
            query.status = status;
        }

        let productQuery = Product.find(query);

        if (sort) {
            const sortOrder = sort.toLowerCase() === 'asc' ? 1 : -1;
            productQuery = productQuery.sort({ price: sortOrder });
        }

        if (limit) {
            productQuery = productQuery.limit(parseInt(limit));
        }

        const products = await productQuery;
        return products.map(p => p.toObject ? p.toObject() : p);
    }

    async _getProductsJSON(filters = {}) {
        try {
            const data = await fs.readFile(this.path, 'utf-8');
            let products = JSON.parse(data);

            if (filters.category) {
                products = products.filter(p => 
                    p.category.toLowerCase().includes(filters.category.toLowerCase())
                );
            }

            if (filters.status !== undefined) {
                products = products.filter(p => p.status === filters.status);
            }

            if (filters.sort) {
                const sortOrder = filters.sort.toLowerCase() === 'asc' ? 1 : -1;
                products.sort((a, b) => (a.price - b.price) * sortOrder);
            }

            if (filters.limit) {
                products = products.slice(0, parseInt(filters.limit));
            }

            return products;
        } catch (error) {
            return [];
        }
    }

    async getProductById(id) {
        try {
            if (isUsingDatabase()) {
                return await Product.findById(id);
            } else {
                const data = await fs.readFile(this.path, 'utf-8');
                const products = JSON.parse(data);
                return products.find(p => p._id === id || p.id === id);
            }
        } catch (error) {
            return null;
        }
    }

    async addProduct(productData) {
        try {
            const { title, description, code, price, status = true, stock, category, thumbnails = [] } = productData;

            if (!title || !description || !code || !price || stock == null || !category) {
                throw new Error("Todos los campos son obligatorios");
            }

            if (typeof price !== 'number' || price <= 0) {
                throw new Error("El precio debe ser un número mayor a 0");
            }

            if (typeof stock !== 'number' || stock < 0) {
                throw new Error("El stock debe ser un número mayor o igual a 0");
            }

            if (isUsingDatabase()) {
                // Verificar código duplicado
                const existingProduct = await Product.findOne({ code });
                if (existingProduct) {
                    throw new Error("Ya existe un producto con ese código");
                }

                const newProduct = new Product({
                    title,
                    description,
                    code,
                    price,
                    status,
                    stock,
                    category,
                    thumbnails
                });

                return await newProduct.save();
            } else {
                // Guardar en JSON
                const data = await fs.readFile(this.path, 'utf-8');
                const products = JSON.parse(data);

                if (products.some(p => p.code === code)) {
                    throw new Error("Ya existe un producto con ese código");
                }

                const newProduct = {
                    _id: new Date().getTime().toString(),
                    id: products.length > 0 ? Math.max(...products.map(p => p.id || 0)) + 1 : 1,
                    title,
                    description,
                    code,
                    price,
                    status,
                    stock,
                    category,
                    thumbnails,
                    createdAt: new Date(),
                    updatedAt: new Date()
                };

                products.push(newProduct);
                await fs.writeFile(this.path, JSON.stringify(products, null, 2));
                return newProduct;
            }
        } catch (error) {
            throw error;
        }
    }

    async updateProduct(id, updates) {
        try {
            if (isUsingDatabase()) {
                const product = await Product.findById(id);

                if (!product) {
                    throw new Error("Producto no encontrado");
                }

                const { code, price, stock } = updates;

                if (code && code !== product.code) {
                    const existingProduct = await Product.findOne({ code });
                    if (existingProduct) {
                        throw new Error("Ya existe un producto con ese código");
                    }
                }

                if (price !== undefined && (typeof price !== 'number' || price <= 0)) {
                    throw new Error("El precio debe ser un número mayor a 0");
                }

                if (stock !== undefined && (typeof stock !== 'number' || stock < 0)) {
                    throw new Error("El stock debe ser un número mayor o igual a 0");
                }

                Object.keys(updates).forEach(key => {
                    if (updates[key] !== undefined && key !== '_id') {
                        product[key] = updates[key];
                    }
                });

                return await product.save();
            } else {
                // Actualizar en JSON
                const data = await fs.readFile(this.path, 'utf-8');
                const products = JSON.parse(data);
                const index = products.findIndex(p => p._id === id || p.id === id);

                if (index === -1) {
                    throw new Error("Producto no encontrado");
                }

                products[index] = {
                    ...products[index],
                    ...updates,
                    updatedAt: new Date()
                };

                await fs.writeFile(this.path, JSON.stringify(products, null, 2));
                return products[index];
            }
        } catch (error) {
            throw error;
        }
    }

    async deleteProduct(id) {
        try {
            if (isUsingDatabase()) {
                const result = await Product.findByIdAndDelete(id);
                
                if (!result) {
                    throw new Error("Producto no encontrado");
                }

                return true;
            } else {
                // Eliminar de JSON
                const data = await fs.readFile(this.path, 'utf-8');
                let products = JSON.parse(data);
                const initialLength = products.length;
                products = products.filter(p => p._id !== id && p.id !== id);
                
                if (products.length === initialLength) {
                    throw new Error("Producto no encontrado");
                }

                await fs.writeFile(this.path, JSON.stringify(products, null, 2));
                return true;
            }
        } catch (error) {
            throw error;
        }
    }
}

export default ProductManager;
