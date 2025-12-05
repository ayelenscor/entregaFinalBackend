# 🛒 E-Commerce Backend

Backend de e-commerce desarrollado con **Node.js, Express, Mongoose y MongoDB** con actualización en tiempo real usando Socket.IO.

## 🚀 Características

- ✅ **CRUD completo** de productos y carritos
- ✅ **MongoDB** como base de datos principal
- ✅ **Mongoose** para esquemas y validaciones
- ✅ **Socket.IO** para actualizaciones en tiempo real
- ✅ **Handlebars** como motor de plantillas
- ✅ **Filtrado avanzado**: por categoría, disponibilidad, precio
- ✅ **Populate automático**: carritos con datos completos de productos
- ✅ **Validaciones robustas** a nivel de datos

## 📋 Requisitos

- Node.js v14+
- MongoDB (local o Atlas)
- npm

## 🔧 Instalación

1. **Clonar el repositorio:**
```bash
git clone <repo-url>
cd entregaFinalBackend
```

2. **Instalar dependencias:**
```bash
npm install
```

3. **Configurar MongoDB:**

**Opción A - MongoDB Local:**
- Descargar e instalar: https://www.mongodb.com/try/download/community
- El proyecto usa `mongodb://localhost:27017/ecommerce` por defecto

**Opción B - MongoDB Atlas (Cloud):**
- Crear cuenta: https://www.mongodb.com/cloud/atlas
- Actualizar `.env`:
```
MONGODB_URI=mongodb+srv://usuario:password@cluster.mongodb.net/ecommerce
```

4. **Variables de entorno (.env):**
```
MONGODB_URI=mongodb://localhost:27017/ecommerce
PORT=8080
```

5. **Ejecutar:**
```bash
npm run dev
```

Servidor corriendo en: `http://localhost:8080`

## 📚 API Endpoints

### Productos
- **GET** `/api/products` - Obtener todos los productos
  - Query: `?category=X&status=true&sort=asc&limit=10`
- **GET** `/api/products/:pid` - Obtener producto por ID
- **POST** `/api/products` - Crear producto
- **PUT** `/api/products/:pid` - Actualizar producto
- **DELETE** `/api/products/:pid` - Eliminar producto

### Carritos
- **GET** `/api/carts/:cid` - Obtener carrito (con populate)
- **POST** `/api/carts` - Crear carrito
- **POST** `/api/carts/:cid/product/:pid` - Agregar producto al carrito
- **PUT** `/api/carts/:cid/products/:pid` - Actualizar cantidad
- **DELETE** `/api/carts/:cid/products/:pid` - Eliminar producto del carrito
- **DELETE** `/api/carts/:cid` - Vaciar carrito
- **PUT** `/api/carts/:cid` - Actualizar carrito completo

### Vistas
- **GET** `/` - Página principal con catálogo
- **GET** `/realtimeproducts` - Productos en tiempo real (Socket.IO)

## 📁 Estructura del Proyecto

```
src/
├── config/
│   └── database.js          # Configuración de MongoDB
├── managers/
│   ├── ProductManager.js    # Lógica de productos
│   └── CartManager.js       # Lógica de carritos
├── models/
│   ├── product.model.js     # Esquema de productos
│   └── cart.model.js        # Esquema de carritos
└── routes/
    ├── products.router.js   # Endpoints de productos
    ├── carts.router.js      # Endpoints de carritos
    └── views.router.js      # Rutas de vistas
public/
├── css/
│   └── styles.css           # Estilos
views/
├── home.handlebars          # Página principal
├── realTimeProducts.handlebars  # Página tiempo real
└── layouts/
    └── main.handlebars      # Layout base
```

## 🗂️ Esquemas MongoDB

### Product
```javascript
{
  title: String (required),
  description: String (required),
  code: String (required, unique),
  price: Number (required, > 0),
  status: Boolean (default: true),
  stock: Number (required, >= 0),
  category: String (required),
  thumbnails: [String],
  timestamps: true
}
```

### Cart
```javascript
{
  products: [{
    product: ObjectId (ref: 'Product'),
    quantity: Number (min: 1)
  }],
  timestamps: true
}
```

## 🔍 Ejemplos de uso

### Crear un producto
```bash
curl -X POST http://localhost:8080/api/products \
  -H "Content-Type: application/json" \
  -d '{
    "title": "iPhone 15",
    "description": "Smartphone Apple",
    "code": "IPHONE15",
    "price": 999,
    "stock": 10,
    "category": "Celulares"
  }'
```

### Filtrar productos
```bash
# Por categoría
curl http://localhost:8080/api/products?category=Celulares

# Por precio (ascendente)
curl http://localhost:8080/api/products?sort=asc

# Disponibles y limitado a 5
curl http://localhost:8080/api/products?status=true&limit=5
```

### Crear carrito y agregar producto
```bash
# Crear carrito
curl -X POST http://localhost:8080/api/carts

# Agregar producto (reemplaza cid y pid con IDs reales)
curl -X POST http://localhost:8080/api/carts/{cid}/product/{pid}
```

## 🎯 Validaciones

- **Campos obligatorios**: title, description, code, price, stock, category
- **Precio**: debe ser número mayor a 0
- **Stock**: debe ser número >= 0
- **Código**: único y obligatorio
- **Cantidad en carrito**: mínimo 1

## ⚡ Socket.IO

La página de productos en tiempo real (`/realtimeproducts`) utiliza WebSockets para:
- Cargar productos en vivo
- Recibir actualizaciones cuando se crean/eliminan productos
- Interfaz reactiva sin recargar

## 🐛 Solución de problemas

### Error: "querySrv ENOTFOUND"
- Problema: Tu red/ISP bloquea conexiones SRV a MongoDB Atlas
- Solución: Usa MongoDB local o una VPN

### Error: "Cannot connect to MongoDB"
- Verifica que MongoDB esté ejecutándose
- Para local: `mongod --dbpath="C:\data\db"` (Windows)

### Puerto 8080 en uso
- Cambia en `.env`: `PORT=3000`

## 📦 Dependencias

- **express** - Framework web
- **mongoose** - ODM para MongoDB
- **socket.io** - WebSockets tiempo real
- **express-handlebars** - Motor de plantillas
- **dotenv** - Variables de entorno

## 📄 Licencia

ISC

## 👨‍💻 Autor

Desarrollado por Ayelen Scor

---

**Última actualización:** 5 de diciembre, 2025
