const mongoose = require('mongoose');
const validator = require('validator');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Username is required'],
    unique: true,
    trim: true,
    minlength: [3, 'Username must be at least 3 characters'],
    maxlength: [50, 'Username cannot exceed 50 characters'],
    validate: {
      validator: function(v) {
        return /^[a-zA-Z0-9_]+$/.test(v);
      },
      message: 'Username can only contain letters, numbers, and underscores'
    }
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true,
    trim: true,
    lowercase: true,
    maxlength: [100, 'Email cannot exceed 100 characters'],
    validate: {
      validator: validator.isEmail,
      message: 'Please provide a valid email'
    }
  },
  passwordHash: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [60, 'Invalid password hash']
  },
  failedLoginAttempts: {
    type: Number,
    default: 0,
    min: 0,
    max: 10
  },
  lockedUntil: {
    type: Date,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  versionKey: false
});

userSchema.index({ username: 1 });
userSchema.index({ email: 1 });
userSchema.index({ lockedUntil: 1 }, { sparse: true });

userSchema.virtual('isLocked').get(function() {
  return !!(this.lockedUntil && this.lockedUntil > Date.now());
});

userSchema.methods.incrementFailedAttempts = function() {
  if (this.lockedUntil && this.lockedUntil < Date.now()) {
    return this.updateOne({
      $unset: {
        failedLoginAttempts: 1,
        lockedUntil: 1
      }
    });
  }

  const updates = { $inc: { failedLoginAttempts: 1 } };
  
  if (this.failedLoginAttempts + 1 >= 5) {
    updates.$set = {
      lockedUntil: new Date(Date.now() + 15 * 60 * 1000)
    };
  }
  
  return this.updateOne(updates);
};

userSchema.methods.resetFailedAttempts = function() {
  return this.updateOne({
    $unset: {
      failedLoginAttempts: 1,
      lockedUntil: 1
    },
    $set: {
      lastLogin: new Date()
    }
  });
};

userSchema.methods.toJSON = function() {
  const user = this.toObject();
  delete user.passwordHash;
  delete user.failedLoginAttempts;
  delete user.lockedUntil;
  return user;
};

const User = mongoose.model('User', userSchema);

module.exports = User;