import "dotenv/config";
import { createApp } from "./app";
import { logger } from "./modules/logger";

const PORT = process.env["PORT"] ?? "4000";

const app = createApp();

app.listen(Number(PORT), () => {
  logger.info({ port: PORT }, "adconfirm backend listening");
});
