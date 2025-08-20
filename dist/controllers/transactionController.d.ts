import type { Request, Response } from 'express';
export declare const TransactionController: {
    addTransaction: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    editTransaction: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    deleteTransaction: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    requestEditTransaction: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    requestDeleteTransaction: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    confirmChange: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
    getTeamTransactions: (req: Request, res: Response) => Promise<Response<any, Record<string, any>>>;
};
//# sourceMappingURL=transactionController.d.ts.map