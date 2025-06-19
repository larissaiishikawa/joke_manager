const mongoose = require('mongoose');
const { connectDatabase } = require('../config/database');
const cache = require('../config/cache');
const { hashPassword } = require('../config/security');
const User = require('./User');
const Joke = require('./Joke');

class Database {
  static async connect() {
    await connectDatabase();
    await cache.connect();
    await this.createIndexes();
    await this.seedDatabase();
  }

  static async createIndexes() {
    try {
      await User.createIndexes();
      await Joke.createIndexes();
      console.log('Database indexes created successfully');
    } catch (error) {
      console.error('Error creating indexes:', error);
    }
  }

  static async seedDatabase() {
    try {
      const userCount = await User.countDocuments();
      if (userCount === 0) {
        await this.createTestUsers();
        await this.createSampleJokes();
        console.log('Database seeded successfully');
      }
    } catch (error) {
      console.error('Error seeding database:', error);
    }
  }

  static async createTestUsers() {
    const testUsers = [
      {
        username: 'admin',
        email: 'admin@test.com',
        passwordHash: await hashPassword('admin123')
      },
      {
        username: 'user',
        email: 'user@test.com',
        passwordHash: await hashPassword('user123')
      },
      {
        username: 'jokemaster',
        email: 'jokemaster@test.com',
        passwordHash: await hashPassword('jokes123')
      }
    ];

    await User.insertMany(testUsers);
    console.log('Test users created');
  }

  static async createSampleJokes() {
    const adminUser = await User.findOne({ email: 'admin@test.com' });
    const regularUser = await User.findOne({ email: 'user@test.com' });
    
    const sampleJokes = [
      {
        title: 'Classic Programming Joke',
        content: 'Why do programmers prefer dark mode? Because light attracts bugs!',
        category: 'programming',
        author: 'CodeMaster',
        createdBy: adminUser._id
      },
      {
        title: 'Dad Joke Special',
        content: 'I told my wife she was drawing her eyebrows too high. She looked surprised.',
        category: 'dad-jokes',
        author: 'DadJokePro',
        createdBy: regularUser._id
      },
      {
        title: 'Pun Intended',
        content: 'I wondered why the baseball kept getting bigger. Then it hit me.',
        category: 'puns',
        author: 'PunMaster',
        createdBy: adminUser._id
      },
      {
        title: 'One Liner Gold',
        content: 'I have a fear of speed bumps, but I am slowly getting over it.',
        category: 'one-liner',
        author: 'QuickWit',
        createdBy: regularUser._id
      },
      {
        title: 'Comedy Central',
        content: 'My therapist says I have a preoccupation with vengeance. We will see about that.',
        category: 'comedy',
        author: 'StandUpStar',
        createdBy: adminUser._id
      },
      {
        title: 'Programming Humor',
        content: 'There are only 10 types of people in the world: those who understand binary and those who dont.',
        category: 'programming',
        author: 'ByteJoker',
        createdBy: regularUser._id
      }
    ];

    await Joke.insertMany(sampleJokes);
    console.log('Sample jokes created');
  }

  static async disconnect() {
    try {
      await mongoose.disconnect();
      console.log('Database disconnected');
    } catch (error) {
      console.error('Error disconnecting from database:', error);
    }
  }
}

module.exports = Database;