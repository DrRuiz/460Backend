import { NextFunction, Response } from 'express';
import { IJwtRequest } from '../models/JwtRequest.model';

export const checkParamsIdToJwtId = (
    request: IJwtRequest,
    response: Response,
    next: NextFunction
) => {
    if (request.params.id !== request.claims.id) {
        response.status(400).send({
            message: 'Credentials do not match for this user.',
        });
    }
    next();
};

export const checkAdmin = (
    request: IJwtRequest,
    response: Response,
    next: NextFunction
) => {
    if (request.claims.role === 1) {
        next();
    } else {
        response.statusMessage = 'Invalid Privilege';
        response.status(403).send({
            message: 'User does not have privilege to access this route.',
        });
    }
};
