const redis = require("redis");

class CacheManager {
  constructor() {
    this.client = null;
    this.isConnected = false;
  }

  async connect() {
    try {
      if (!process.env.REDIS_HOST) {
        console.log("Redis not configured, skipping cache");
        return;
      }

      const redisUrl = `redis://:${process.env.REDIS_PASSWORD}@${process.env.REDIS_HOST}:${process.env.REDIS_PORT}`;
      
      this.client = redis.createClient({
        url: redisUrl,
        socket: {
          reconnectStrategy: (retries) => {
            if (retries > 10) {
              console.error("Redis: Too many reconnection attempts, giving up");
              return false;
            }
            return Math.min(retries * 50, 500);
          }
        }
      });
          }
          return Math.min(options.attempt * 100, 3000);
        },
      });

      await this.client.connect();
      this.isConnected = true;
      console.log("Redis connected successfully");

      this.client.on("error", (err) => {
        console.error("Redis error:", err);
        this.isConnected = false;
      });

      this.client.on("reconnecting", () => {
        console.log("Redis reconnecting...");
      });
    } catch (error) {
      console.error("Redis connection failed:", error);
      this.isConnected = false;
    }
  }

  async get(key) {
    if (!this.isConnected) return null;
    try {
      const value = await this.client.get(key);
      return value ? JSON.parse(value) : null;
    } catch (error) {
      console.error("Cache get error:", error);
      return null;
    }
  }

  async set(key, value, ttl = 300) {
    if (!this.isConnected) return false;
    try {
      await this.client.setEx(key, ttl, JSON.stringify(value));
      return true;
    } catch (error) {
      console.error("Cache set error:", error);
      return false;
    }
  }

  async del(key) {
    if (!this.isConnected) return false;
    try {
      await this.client.del(key);
      return true;
    } catch (error) {
      console.error("Cache delete error:", error);
      return false;
    }
  }

  async flush() {
    if (!this.isConnected) return false;
    try {
      await this.client.flushAll();
      return true;
    } catch (error) {
      console.error("Cache flush error:", error);
      return false;
    }
  }
}

const cache = new CacheManager();

module.exports = cache;
