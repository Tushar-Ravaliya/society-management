import app from "./src/app";
import { config } from "./src/config/config";
app.listen(config.PORT, () => {
  console.log("Server is running on port 3000");
});
