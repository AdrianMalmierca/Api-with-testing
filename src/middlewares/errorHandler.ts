import { Request, Response, NextFunction } from "express";

export const errorHandler = ( //to handle unexpected errors and send a generic response
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (res.headersSent) { //check if the response headers have already been sent, if so, delegate to the default error handler
    return next(err);
  }

  console.error(err);

  res.status(500).json({ error: "Internal Server Error" });
};

