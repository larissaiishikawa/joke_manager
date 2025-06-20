const express = require("express");
const { authMiddleware, createRateLimit } = require("../config/security");
const Joke = require("../models/Joke");
const cache = require("../config/cache");
const winston = require("winston");

const router = express.Router();

const logger = winston.createLogger({
  level: "info",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    ...(process.env.NODE_ENV !== "production"
      ? [new winston.transports.File({ filename: "logs/jokes.log" })]
      : []),
    new winston.transports.Console(),
  ],
});

const searchLimiter = createRateLimit(
  60 * 1000,
  30,
  "Too many search requests from this IP"
);

const createLimiter = createRateLimit(
  60 * 1000,
  10,
  "Too many joke creation requests from this IP"
);

router.get("/search", searchLimiter, async (req, res) => {
  try {
    const { category, keyword, author, page = 1, limit = 10 } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    if (pageNum < 1 || limitNum < 1 || limitNum > 50) {
      return res.status(400).json({
        success: false,
        message: "Invalid pagination parameters",
      });
    }

    const cacheKey = `search_${JSON.stringify(req.query)}`;
    const cachedResult = await cache.get(cacheKey);

    if (cachedResult) {
      logger.info("Search cache hit", {
        query: req.query,
        ip: req.ip,
      });
      return res.json(cachedResult);
    }

    const searchParams = {};
    if (category) searchParams.category = category;
    if (keyword) searchParams.keyword = keyword;
    if (author) searchParams.author = author;

    const skip = (pageNum - 1) * limitNum;
    const options = {
      skip,
      limit: limitNum,
      ...(keyword ? {} : { sort: { createdAt: -1 } }),
    };

    const [jokes, totalCount] = await Promise.all([
      Joke.searchJokes(searchParams, options),
      Joke.countDocuments({
        ...buildSearchQuery(searchParams),
        isActive: true,
      }),
    ]);

    const result = {
      success: true,
      message: "Jokes retrieved successfully",
      data: {
        jokes,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(totalCount / limitNum),
          totalJokes: totalCount,
          hasNextPage: pageNum < Math.ceil(totalCount / limitNum),
          hasPreviousPage: pageNum > 1,
        },
      },
    };

    await cache.set(cacheKey, result, 300);

    logger.info("Joke search performed", {
      searchParams,
      resultCount: jokes.length,
      totalCount,
      ip: req.ip,
    });

    res.json(result);
  } catch (error) {
    logger.error("Search error", { error: error.message, query: req.query });
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

router.post("/", authMiddleware, createLimiter, async (req, res) => {
  try {
    const { title, content, category, author } = req.body;

    if (!title || !content || !category || !author) {
      return res.status(400).json({
        success: false,
        message: "All fields (title, content, category, author) are required",
      });
    }

    const validCategories = [
      "comedy",
      "puns",
      "dad-jokes",
      "programming",
      "dark-humor",
      "one-liner",
    ];
    if (!validCategories.includes(category)) {
      return res.status(400).json({
        success: false,
        message: `Category must be one of: ${validCategories.join(", ")}`,
      });
    }

    const existingJoke = await Joke.findOne({
      title: title.trim(),
      content: content.trim(),
      category,
      author: author.trim(),
      isActive: true,
    });

    if (existingJoke) {
      logger.warn("Duplicate joke creation attempt", {
        title,
        userId: req.user.userId,
        ip: req.ip,
      });
      return res.status(409).json({
        success: false,
        message: "A joke with similar content already exists",
      });
    }

    const newJoke = new Joke({
      title: title.trim(),
      content: content.trim(),
      category,
      author: author.trim(),
      createdBy: req.user.userId,
    });

    await newJoke.save();
    await newJoke.populate("createdBy", "username");

    await invalidateJokesCaches();

    logger.info("New joke created", {
      jokeId: newJoke._id,
      title: newJoke.title,
      category: newJoke.category,
      userId: req.user.userId,
      ip: req.ip,
    });

    res.status(201).json({
      success: true,
      message: "Joke created successfully",
      data: {
        joke: newJoke,
      },
    });
  } catch (error) {
    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        message: messages.join(", "),
      });
    }

    logger.error("Joke creation error", {
      error: error.message,
      userId: req.user.userId,
    });
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid joke ID format",
      });
    }

    const joke = await Joke.findOne({
      _id: id,
      isActive: true,
    }).populate("createdBy", "username");

    if (!joke) {
      return res.status(404).json({
        success: false,
        message: "Joke not found",
      });
    }

    await joke.incrementViews();

    const result = {
      success: true,
      message: "Joke retrieved successfully",
      data: {
        joke,
      },
    };

    logger.info("Joke viewed", {
      jokeId: joke._id,
      views: joke.views + 1,
      ip: req.ip,
    });

    res.json(result);
  } catch (error) {
    logger.error("Get joke error", { error: error.message });
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

router.post("/:id/like", authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    if (!id.match(/^[0-9a-fA-F]{24}$/)) {
      return res.status(400).json({
        success: false,
        message: "Invalid joke ID format",
      });
    }

    const joke = await Joke.findOne({
      _id: id,
      isActive: true,
    });

    if (!joke) {
      return res.status(404).json({
        success: false,
        message: "Joke not found",
      });
    }

    joke.likes += 1;
    await joke.save();

    logger.info("Joke liked", {
      jokeId: joke._id,
      likes: joke.likes,
      userId: req.user.userId,
      ip: req.ip,
    });

    res.json({
      success: true,
      message: "Joke liked successfully",
      data: {
        likes: joke.likes,
      },
    });
  } catch (error) {
    logger.error("Like joke error", { error: error.message });
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

router.get("/", async (req, res) => {
  try {
    const { page = 1, limit = 10, category } = req.query;

    const pageNum = parseInt(page);
    const limitNum = parseInt(limit);

    if (pageNum < 1 || limitNum < 1 || limitNum > 50) {
      return res.status(400).json({
        success: false,
        message: "Invalid pagination parameters",
      });
    }

    const query = { isActive: true };
    if (category) query.category = category;

    const skip = (pageNum - 1) * limitNum;

    const [jokes, totalCount] = await Promise.all([
      Joke.find(query)
        .populate("createdBy", "username")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum),
      Joke.countDocuments(query),
    ]);

    const result = {
      success: true,
      message: "Jokes retrieved successfully",
      data: {
        jokes,
        pagination: {
          currentPage: pageNum,
          totalPages: Math.ceil(totalCount / limitNum),
          totalJokes: totalCount,
          hasNextPage: pageNum < Math.ceil(totalCount / limitNum),
          hasPreviousPage: pageNum > 1,
        },
      },
    };

    res.json(result);
  } catch (error) {
    logger.error("Get jokes list error", { error: error.message });
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
});

const buildSearchQuery = (searchParams) => {
  const query = {};

  if (searchParams.category) {
    query.category = searchParams.category;
  }

  if (searchParams.author) {
    query.author = new RegExp(searchParams.author, "i");
  }

  if (searchParams.keyword) {
    const keyword = searchParams.keyword.trim();

    query.$or = [
      { title: new RegExp(`^${keyword}`, "i") },
      { content: new RegExp(`^${keyword}`, "i") },
      { title: new RegExp(`\\b${keyword}\\b`, "i") },
      { content: new RegExp(`\\b${keyword}\\b`, "i") },
      { title: new RegExp(keyword, "i") },
      { content: new RegExp(keyword, "i") },
    ];
  }

  return query;
};

async function invalidateJokesCaches() {
  try {
    if (!cache.isConnected || !cache.client) {
      return;
    }

    const searchKeys = await cache.client.keys("search_*");

    if (searchKeys.length > 0) {
      await cache.client.del(searchKeys);
      logger.info(
        `Search cache invalidated: ${searchKeys.length} keys deleted`,
        {
          keys: searchKeys,
        }
      );
    }
  } catch (error) {
    logger.error("Error invalidating search caches:", error);
  }
}

module.exports = router;
