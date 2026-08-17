import { v4 as uuid4 } from "uuid";

export const uid: () => string = uuid4;
export const getCurrentDate: () => Date = () => new Date();
