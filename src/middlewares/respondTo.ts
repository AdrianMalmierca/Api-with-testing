import { Request, Response, NextFunction } from "express";

export const respondTo = //to validate the Accept header and ensure the server can respond with an acceptable format
  (...acceptedFormats: string[]) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const formatHandlers = Object.fromEntries(
      acceptedFormats.map((format) => [
        format,
        () => {
          next();
        },
      ])
    );

    res.format({ //check the Accept header against the accepted formats and call the corresponding handler
      ...formatHandlers,
      default: () => {
        res.status(406).json({ error: "Not Acceptable" });
      },
    });
  };

