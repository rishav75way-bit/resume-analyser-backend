import { Request, Response, NextFunction } from 'express';

export const asyncHandler = <T extends Request = Request>(
    fn: (req: T, res: Response, next: NextFunction) => Promise<void>
) => {
    return (req: Request, res: Response, next: NextFunction) => {
        fn(req as T, res, next).catch(next);
    };
};
