// OLD
await mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
  
  // NEW (clean version)
  await mongoose.connect(process.env.MONGO_URI);
  