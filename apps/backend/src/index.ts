import "dotenv/config";
import { createApp } from "./app";

const PORT = process.env["PORT"] ?? "4000";

const app = createApp();

app.listen(Number(PORT), () => {
  console.log(`[backend] listening on http://localhost:${PORT}`);
});
