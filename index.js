import express from "express";
import { promises as fs } from "fs";
import path from "path";

const app = express();
const PORT = 8080;


app.use(express.json());


const productsRouter = express.Router();
app.use("/api/products", productsRouter);


const cartsRouter = express.Router();
app.use("/api/carts", cartsRouter);


const productsFile = path.join("data", "products.json");
const readProducts = async () => {
    try {
        const data = await fs.readFile(productsFile, "utf-8");
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
import express from "express";
import { promises as fs } from "fs";
import path from "path";
import http from "http";
import { Server as IOServer } from "socket.io";
import { engine } from "express-handlebars";

const app = express();
const PORT = 8080;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Handlebars setup
app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", path.join(process.cwd(), "views"));

// Static files
app.use(express.static(path.join(process.cwd(), "public")));

const httpServer = http.createServer(app);
const io = new IOServer(httpServer);

const productsRouter = express.Router();
app.use("/api/products", productsRouter);

const cartsRouter = express.Router();
app.use("/api/carts", cartsRouter);

const viewsRouter = express.Router();
app.use("/", viewsRouter);

const productsFile = path.join("data", "products.json");
const readProducts = async () => {
    try {
        const data = await fs.readFile(productsFile, "utf-8");
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
};

const writeProducts = async (products) => {
    await fs.writeFile(productsFile, JSON.stringify(products, null, 2));
};

// API endpoints
productsRouter.get("/", async (req, res) => {
    try {
        const products = await readProducts();
        res.json(products);
    } catch (error) {
        res.status(500).json({ error: "Error al leer los productos" });
    }
});

productsRouter.post("/", async (req, res) => {
    try {
        const products = await readProducts();
        const {
            title,
            description,
            code,
            price,
            status = true,
            stock,
            category,
            thumbnails = []
        } = req.body;

        if (!title || !description || !code || !price || stock == null || !category) {
            return res.status(400).json({ error: "Todos los campos son obligatorios" });
        }

        if (products.some(p => p.code === code)) {
            return res.status(400).json({ error: "Ya existe un producto con ese código" });
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
        await writeProducts(products);

        // Emit updated products list to all connected sockets
        io.emit("products", products);

        res.status(201).json(newProduct);
    } catch (error) {
        res.status(500).json({ error: "Error al crear el producto" });
    }
});

productsRouter.delete("/:id", async (req, res) => {
    try {
        const id = Number(req.params.id);
        let products = await readProducts();
        const initialLength = products.length;
        products = products.filter(p => p.id !== id);
        if (products.length === initialLength) {
            return res.status(404).json({ error: "Producto no encontrado" });
        }
        await writeProducts(products);

        // Emit updated products list to all connected sockets
        io.emit("products", products);

        res.json({ success: true });
    } catch (error) {
        res.status(500).json({ error: "Error al eliminar el producto" });
    }
});

const cartsFile = path.join("data", "carts.json");
const readCarts = async () => {
    try {
        const data = await fs.readFile(cartsFile, "utf-8");
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
};

const writeCarts = async (carts) => {
    await fs.writeFile(cartsFile, JSON.stringify(carts, null, 2));
};

cartsRouter.post("/", async (req, res) => {
    try {
        const carts = await readCarts();
        const newCart = {
            id: carts.length > 0 ? Math.max(...carts.map(c => c.id)) + 1 : 1,
            products: []
        };

        carts.push(newCart);
        await writeCarts(carts);
        res.status(201).json(newCart);
    } catch (error) {
        res.status(500).json({ error: "Error al crear el carrito" });
    }
});

// Views
viewsRouter.get("/", async (req, res) => {
    const products = await readProducts();
    res.render("home", { products });
});

viewsRouter.get("/realtimeproducts", async (req, res) => {
    const products = await readProducts();
    res.render("realTimeProducts", { products });
});

io.on("connection", (socket) => {
    // Send current products upon connection
    readProducts().then(products => {
        socket.emit("products", products);
    });
});

const initializeDataDir = async () => {
    try {
        await fs.mkdir("data", { recursive: true });

        if (!(await fs.stat(productsFile).catch(() => false))) {
            await fs.writeFile(productsFile, "[]");
        }
        if (!(await fs.stat(cartsFile).catch(() => false))) {
            await fs.writeFile(cartsFile, "[]");
        }
    } catch (error) {
        console.error("Error al inicializar el directorio de datos:", error);
    }
};

const startServer = async () => {
    await initializeDataDir();
    httpServer.listen(PORT, () => {
        console.log(`Servidor corriendo en http://localhost:${PORT}`);
    });
};

startServer();
