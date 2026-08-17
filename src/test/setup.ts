import {
  clearDatabase,
  connectDb,
  disconnectDb,
} from "./usecases/integration/db";

before(connectDb);

after(disconnectDb);

afterEach(clearDatabase);
