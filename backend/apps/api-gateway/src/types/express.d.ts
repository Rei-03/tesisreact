// Type augmentation para Express Request con propiedad user
declare global {
  namespace Express {
    interface Request {
      user?: {
        userId: string;
        email: string;
        role: string;
        name?: string;
      };
    }
  }
}

export {};
