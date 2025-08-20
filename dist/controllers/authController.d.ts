import type { Request, Response } from 'express';
declare const register: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
declare const login: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
declare const logout: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
declare const forgotPassword: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
declare const resetPassword: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
export { register, login, logout, forgotPassword, resetPassword, };
//# sourceMappingURL=authController.d.ts.map