import { Request, Response, NextFunction } from "express";
import Joi from "joi";

export const validatePayload = //to validate the request body against a Joi schema
  (schema: Joi.ObjectSchema) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const payload = req.body;
    const result = schema.validate(payload);

    if (result.error) {
      res.status(422).json({ error: result.error.details });
      return;
    }

    next();
  };

