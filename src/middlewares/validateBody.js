import createHttpError from 'http-errors';

export const validateBody = (schema) => async (req, res, next) => {
  try {
    const value = await schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });
    req.body = value;
    next();
  } catch (err) {
    const message = err.errors ? err.errors.join(', ') : 'Validation error';
    next(createHttpError(400, message));
  }
};
