/*
 * Licensed under MIT License
 * This module provides Swagger documentation setup for Express
 */
import createHttpError from 'http-errors';
import swaggerUI from 'swagger-ui-express';
import fs from 'node:fs';

import { SWAGGER_PATH } from '../constants/index.js';

export const swaggerDocs = () => {
  try {
    if (!SWAGGER_PATH) {
      throw new Error('SWAGGER_PATH is not defined');
    }
    const fileContent = fs.readFileSync(SWAGGER_PATH, 'utf-8');
    const swaggerDoc = JSON.parse(fileContent);
    return [...swaggerUI.serve, swaggerUI.setup(swaggerDoc)];
  } catch (err) {
    return (req, res, next) => {
      next(createHttpError(500, "Unable to load swagger documentation"));
    };
  }
};
