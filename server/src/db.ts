import mongoose from 'mongoose';

export async function connectMongo(uri: string) {
  mongoose.set('strictQuery', true);
  const maxAttempts = 20;
  for (let attempt = 1; attempt <= maxAttempts; attempt += 1) {
    try {
      await mongoose.connect(uri);
      return;
    } catch (error) {
      console.warn(`MongoDB connection attempt ${attempt}/${maxAttempts} failed`);
      if (attempt === maxAttempts) {
        throw error;
      }
      await new Promise((resolve) => setTimeout(resolve, 1500));
    }
  }
}

export function mongoReady() {
  return mongoose.connection.readyState === 1;
}
