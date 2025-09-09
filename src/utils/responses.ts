import { Response } from 'express';

export const sendSuccess = (res: Response, data: any, statusCode: number = 200) => {
  res.status(statusCode).json({
    success: true,
    data
  });
};

export const sendError = (res: Response, message: string, statusCode: number = 500) => {
  res.status(statusCode).json({
    success: false,
    error: message
  });
};

export const sendCreated = (res: Response, data: any) => {
  sendSuccess(res, data, 201);
};

export const sendNoContent = (res: Response) => {
  res.status(204).send();
};