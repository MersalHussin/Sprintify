import type { Request, Response, RequestHandler } from "express";

import { handleResponse } from "./response-handler";

type AsyncRouteHandler = (req: Request, res: Response) => Promise<Response | void>;

export function asyncHandler(handler: AsyncRouteHandler): RequestHandler {
  return (req, res) => {
    handler(req, res).catch((error: unknown) => {
      console.error(error as Error);
      if(!res.headersSent) handleResponse(res, 500, undefined, "An unexpected error occurred");
    });
  };
}
