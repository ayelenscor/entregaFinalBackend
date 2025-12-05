import Cart from '../models/cart.model.js';

class CartManager {
    async getCarts() {
        try {
            return await Cart.find().populate('products.product');
        } catch (error) {
            throw new Error(`Error al obtener carritos: ${error.message}`);
        }
    }

    async getCartById(id) {
        try {
            return await Cart.findById(id).populate('products.product');
        } catch (error) {
            return null;
        }
    }

    async createCart() {
        try {
            const newCart = new Cart({ products: [] });
            return await newCart.save();
        } catch (error) {
            throw new Error(`Error al crear carrito: ${error.message}`);
        }
    }

    async addProductToCart(cartId, productId) {
        try {
            const cart = await Cart.findById(cartId);

            if (!cart) {
                throw new Error("Carrito no encontrado");
            }

            const existingProductIndex = cart.products.findIndex(
                p => p.product.toString() === productId.toString()
            );

            if (existingProductIndex !== -1) {
                cart.products[existingProductIndex].quantity += 1;
            } else {
                cart.products.push({ product: productId, quantity: 1 });
            }

            await cart.save();
            return await Cart.findById(cartId).populate('products.product');
        } catch (error) {
            throw error;
        }
    }

    async removeProductFromCart(cartId, productId) {
        try {
            const cart = await Cart.findById(cartId);

            if (!cart) {
                throw new Error("Carrito no encontrado");
            }

            cart.products = cart.products.filter(
                p => p.product.toString() !== productId.toString()
            );

            await cart.save();
            return await Cart.findById(cartId).populate('products.product');
        } catch (error) {
            throw error;
        }
    }

    async updateCart(cartId, products) {
        try {
            const cart = await Cart.findById(cartId);

            if (!cart) {
                throw new Error("Carrito no encontrado");
            }

            cart.products = products;
            await cart.save();
            return await Cart.findById(cartId).populate('products.product');
        } catch (error) {
            throw error;
        }
    }

    async updateProductQuantity(cartId, productId, quantity) {
        try {
            const cart = await Cart.findById(cartId);

            if (!cart) {
                throw new Error("Carrito no encontrado");
            }

            const productIndex = cart.products.findIndex(
                p => p.product.toString() === productId.toString()
            );

            if (productIndex === -1) {
                throw new Error("Producto no encontrado en el carrito");
            }

            if (quantity <= 0) {
                throw new Error("La cantidad debe ser mayor a 0");
            }

            cart.products[productIndex].quantity = quantity;
            await cart.save();
            return await Cart.findById(cartId).populate('products.product');
        } catch (error) {
            throw error;
        }
    }

    async clearCart(cartId) {
        try {
            const cart = await Cart.findById(cartId);

            if (!cart) {
                throw new Error("Carrito no encontrado");
            }

            cart.products = [];
            await cart.save();
            return cart;
        } catch (error) {
            throw error;
        }
    }
}

export default CartManager;
