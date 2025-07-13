import express, { NextFunction, Request, Response } from 'express';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';
import { ReportController } from './report.controller';
import ApiError from '../../../errors/ApiErrors';
import { StatusCodes } from 'http-status-codes';
import validateRequest from '../../middlewares/validateRequest';
import { createReportZodValidationSchema } from './report.validation';
const router = express.Router();

router.post('/', 
    auth(USER_ROLES.USER),
    async (req: Request, res: Response, next: NextFunction) => {
        try {
            
            req.body = { ...req.body, author: req.user.id };
            next();
            
        } catch (error) {
            throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to Process Reservation");
        }
    },
    validateRequest(createReportZodValidationSchema),
    ReportController.createReport
);

export const ReportRoutes = router;