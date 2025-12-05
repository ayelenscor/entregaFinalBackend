import 'dotenv/config';
import express from "express";
import path from "path";
import http from "http";
import { Server as IOServer } from "socket.io";
import { engine } from "express-handlebars";
import { connectDB } from "./src/config/database.js";
import productsRouter from "./src/routes/products.router.js";
import cartsRouter from "./src/routes/carts.router.js";
import viewsRouter from "./src/routes/views.router.js";
import ProductManager from "./src/managers/ProductManager.js";
process.on('uncaughtException', (err) => { console.error('Uncaught Exception:', err); });
process.on('unhandledRejection', (reason) => { console.error('Unhandled Rejection:', reason); });

const app = express();
const PORT_BASE = 8080;
let currentPort = PORT_BASE;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.engine("handlebars", engine());
app.set("view engine", "handlebars");
app.set("views", path.join(process.cwd(), "views"));

app.use(express.static(path.join(process.cwd(), "public")));
app.use("/routes", express.static(path.join(process.cwd(), "src", "routes")));

const httpServer = http.createServer(app);
const io = new IOServer(httpServer);

app.set('io', io);

app.use("/api/products", productsRouter);
app.use("/api/carts", cartsRouter);
app.use("/", viewsRouter);

const productManager = new ProductManager();

io.on("connection", (socket) => {
    console.log("Cliente conectado");
    productManager.getProducts().then(products => {
        socket.emit("products", products);
    });
});

const startServer = async () => {
    await connectDB();
    const listen = () => {
        httpServer.listen(currentPort, () => {
            console.log(`Servidor corriendo en http://localhost:${currentPort}`);
        });
    };
    httpServer.on('error', (err) => {
        if (err.code === 'EADDRINUSE' && currentPort === PORT_BASE) {
            currentPort = PORT_BASE + 1;
            console.log(`Puerto 8080 ocupado, usando ${currentPort}`);
            setTimeout(listen, 100);
        } else {
            console.error('Error al iniciar servidor', err);
            process.exit(1);
        }
    });
    listen();
};

startServer();
