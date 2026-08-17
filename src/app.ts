import { env } from "./env";
import connectToDb from "./utils/connectToDb";
import createServer from "./server";
import chalk from "chalk";

const app = createServer();

app.listen(env.PORT, () => {
  console.log(chalk.magentaBright(`App is running on port: ${env.PORT}`));
  connectToDb();
});
