import {
  CurrentDateGenerator,
  UidGenerator,
} from "@/application/boundaries/utils.def";

export const mockUid: UidGenerator = () => "mock-uuid-123";
export const mockDate: CurrentDateGenerator = () =>
  new Date("2024-03-01T10:00:00.000Z");
