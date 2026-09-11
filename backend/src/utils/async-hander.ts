import type { Response, Request, NextFunction, RequestHandler } from "express";


export function asyncHandler( 
    handler: (req: Request, res: Response, next: NextFunction,)=> Promise<void>,
): RequestHandler
{

    return function wrapperHander(req, res, next) {
        void handler(req, res, next).catch(next);
    }
}