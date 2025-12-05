import mongoose from 'mongoose';
import { promises as fs } from 'fs';
import path from 'path';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ecommerce';
let useDatabase = false;

export const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI, {
      dbName: 'ecommerce'
    });
    useDatabase = true;
    console.log('✅ Conectado a MongoDB');
  } catch (error) {
    console.error('❌ Error al conectar a MongoDB:', error.message);
    console.error('💡 Asegúrate de que MongoDB esté ejecutándose: mongod --dbpath="C:\\data\\db"');
    process.exit(1);
  }
};

export const isUsingDatabase = () => useDatabase;

mongoose.connection.on('disconnected', () => {
  console.log('⚠️ MongoDB desconectado');
});

mongoose.connection.on('error', (err) => {
  console.error('❌ Error de MongoDB:', err);
});
