import type { AuthUser } from "./user";
import type { TeamDocument } from "../models/team";

declare global {
  namespace Express {
    interface Request {
      user?: AuthUser;
      team?: TeamDocument;
    }
  }
}