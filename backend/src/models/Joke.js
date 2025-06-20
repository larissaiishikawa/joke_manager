const mongoose = require("mongoose");

const jokeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
      trim: true,
      minlength: [1, "Title cannot be empty"],
      maxlength: [200, "Title cannot exceed 200 characters"],
    },
    content: {
      type: String,
      required: [true, "Content is required"],
      trim: true,
      minlength: [1, "Content cannot be empty"],
      maxlength: [1000, "Content cannot exceed 1000 characters"],
    },
    category: {
      type: String,
      required: [true, "Category is required"],
      enum: {
        values: [
          "comedy",
          "puns",
          "dad-jokes",
          "programming",
          "dark-humor",
          "one-liner",
        ],
        message:
          "Category must be one of: comedy, puns, dad-jokes, programming, dark-humor, one-liner",
      },
    },
    author: {
      type: String,
      required: [true, "Author is required"],
      trim: true,
      minlength: [1, "Author cannot be empty"],
      maxlength: [100, "Author cannot exceed 100 characters"],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Created by user is required"],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    views: {
      type: Number,
      default: 0,
      min: 0,
    },
    likes: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

jokeSchema.index({ title: "text", content: "text", author: "text" });
jokeSchema.index({ category: 1 });
jokeSchema.index({ author: 1 });
jokeSchema.index({ createdBy: 1 });
jokeSchema.index({ createdAt: -1 });
jokeSchema.index({ isActive: 1 });

jokeSchema.index(
  {
    title: 1,
    content: 1,
    category: 1,
    author: 1,
  },
  {
    unique: true,
    partialFilterExpression: { isActive: true },
  }
);

jokeSchema.methods.incrementViews = function () {
  return this.updateOne({ $inc: { views: 1 } });
};

jokeSchema.methods.incrementLikes = function () {
  return this.updateOne({ $inc: { likes: 1 } });
};

jokeSchema.statics.findByCategory = function (category, options = {}) {
  const query = { category, isActive: true };
  return this.find(query, null, options).populate("createdBy", "username");
};

jokeSchema.statics.searchJokes = function (searchParams, options = {}) {
  const query = { isActive: true };

  if (searchParams.category) {
    query.category = searchParams.category;
  }

  if (searchParams.author) {
    query.author = new RegExp(searchParams.author, "i");
  }

  if (searchParams.keyword) {
    const keyword = searchParams.keyword.trim();

    const searches = [
      { title: new RegExp(`^${keyword}`, "i") },
      { content: new RegExp(`^${keyword}`, "i") },
      { title: new RegExp(`\\b${keyword}`, "i") },
      { content: new RegExp(`\\b${keyword}`, "i") },
    ];

    const promises = searches.map(async (searchQuery) => {
      const searchOptions = {
        ...query,
        ...searchQuery,
        ...(searchParams.category && { category: searchParams.category }),
        ...(searchParams.author && {
          author: new RegExp(searchParams.author, "i"),
        }),
      };

      return this.find(searchOptions)
        .populate("createdBy", "username")
        .sort({ createdAt: -1 })
        .limit(50);
    });

    return Promise.all(promises).then((results) => {
      const seen = new Set();
      const combined = [];

      results.forEach((result) => {
        result.forEach((joke) => {
          if (!seen.has(joke._id.toString())) {
            seen.add(joke._id.toString());
            combined.push(joke);
          }
        });
      });

      const start = options.skip || 0;
      const end = start + (options.limit || 10);

      return combined.slice(start, end);
    });
  }

  return this.find(query, null, options).populate("createdBy", "username");
};

jokeSchema.pre("save", function (next) {
  if (this.isNew) {
    this.title = this.title.trim();
    this.content = this.content.trim();
    this.author = this.author.trim();
  }
  next();
});

const Joke = mongoose.model("Joke", jokeSchema);

module.exports = Joke;
