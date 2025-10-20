// Global type augmentation for Express
declare global {
  namespace Express {
    interface Request {
      user?: any;
      userId?: string;
      body?: any;
      query?: any;
      params?: any;
      headers?: any;
      ip?: string;
      connection?: any;
      method?: string;
      path?: string;
      protocol?: string;
      get?(name: string): string | undefined;
    }

    interface Response {
      status?(code: number): Response;
      json?(obj?: any): Response;
    }
  }
}

// Module augmentation for express-serve-static-core
declare module 'express-serve-static-core' {
  interface Request {
    user?: any;
    userId?: string;
    body?: any;
    query?: any;
    params?: any;
    headers?: any;
    ip?: string;
    connection?: any;
    method?: string;
    path?: string;
    protocol?: string;
    get?(name: string): string | undefined;
  }

  interface Response {
    status?(code: number): Response;
    json?(obj?: any): Response;
  }
}

// Module augmentation for express
declare module 'express' {
  interface NextFunction {
    (): void;
  }
}

export {};