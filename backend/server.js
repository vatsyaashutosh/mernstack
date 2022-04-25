const app = require("./app");

const dotenv = require("dotenv");
const connectDatabase = require("./config/database");
const path = require("path");

dotenv.config({ path: path.join(__dirname, "./config/config.env") });

connectDatabase();

const port = process.env.PORT;

app.listen(port, () => {
  console.log(`Server is working on http://localhost:${port}`);
});
