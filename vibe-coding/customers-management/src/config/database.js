import mongoose from 'mongoose';

class DatabaseConnection {
  constructor() {
    this.connection = null;
    this.isConnected = false;
  }

  async connect(uri = 'mongodb://localhost:27017/customers-management', options = {}) {
    try {
      const defaultOptions = {
        maxPoolSize: 10,
        serverSelectionTimeoutMS: 5000,
        socketTimeoutMS: 45000,
        connectTimeoutMS: 10000,
        ...options
      };

      if (this.isConnected) {
        console.log('Database already connected');
        return this.connection;
      }

      this.connection = await mongoose.connect(uri, defaultOptions);
      this.isConnected = true;

      mongoose.connection.on('error', (error) => {
        console.error('Database connection error:', error);
        this.isConnected = false;
      });

      mongoose.connection.on('disconnected', () => {
        console.log('Database disconnected');
        this.isConnected = false;
      });

      mongoose.connection.on('reconnected', () => {
        console.log('Database reconnected');
        this.isConnected = true;
      });

      console.log('Database connected successfully');
      return this.connection;
    } catch (error) {
      this.isConnected = false;
      throw new Error(`Database connection failed: ${error.message}`);
    }
  }

  async disconnect() {
    try {
      if (this.connection) {
        await mongoose.disconnect();
        this.connection = null;
        this.isConnected = false;
        console.log('Database disconnected successfully');
      }
    } catch (error) {
      throw new Error(`Database disconnection failed: ${error.message}`);
    }
  }

  getConnection() {
    return this.connection;
  }

  isConnectionActive() {
    return this.isConnected && mongoose.connection.readyState === 1;
  }
}

export default new DatabaseConnection();
