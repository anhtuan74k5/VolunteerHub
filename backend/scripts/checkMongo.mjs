import dotenv from 'dotenv';
dotenv.config();
import mongoose from 'mongoose';

(async () => {
  try {
    console.log('MONGO_URI=', process.env.MONGO_URI ? 'present' : 'MISSING');
    // Use mongoose.connect to populate mongoose.connection
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000,
      connectTimeoutMS: 10000,
    });

    const admin = mongoose.connection.db.admin();
    const info = await admin.serverStatus();
    console.log('serverStatus ok, version=', info.version);

    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('collections:', collections.map(c=>c.name));

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Mongo check error:', err);
    process.exit(2);
  }
})();
