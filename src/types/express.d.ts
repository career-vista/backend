import { NextFunction as ExpressNextFunction } from 'express';

declare global {
  namespace Express {
    export interface Request {
      user?: any;
      userId?: string;
      body: any;
      query: any;
      params: any;
      headers: any;
      ip: string;
      connection: any;
      method: string;
      path: string;
      protocol: string;
      get(name: string): string | undefined;
    }

    export interface Response {
      status(code: number): Response;
      json(obj?: any): Response;
    }
  }
}

declare module 'express-serve-static-core' {
  export interface Request {
    user?: any;
    userId?: string;
  }
}

declare module 'express' {
  export interface NextFunction {
    (): void;
  }
}