const app = require("./app");
const connectDB = require("./config/db");
const config = require("./config/env");

const startServer = async () => {
  await connectDB();

  app.listen(config.port, () => {
    console.log(
      `Server running in ${config.nodeEnv} mode on port ${config.port}`,
    );
  });
};

startServer();
