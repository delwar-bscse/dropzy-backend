import express, { NextFunction, Request, Response } from 'express';
import { DimensionFetcherController } from './dimensionFetcher.controller';
import fileUploadHandler from '../../middlewares/fileUploaderHandler';
import { getMultipleFilesPath } from '../../../shared/getFilePath';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';

const router = express.Router();

router.post(
    '/extract',
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.COURIER, USER_ROLES.SENDER),
    fileUploadHandler(),
    async (req: Request, res: Response, next: NextFunction) => {
        const images = await getMultipleFilesPath(req.files, "images");
        req.body = {
            ...(images && { images }),
        };
        next();
    },
    DimensionFetcherController.extractDimensions
);

export const DimensionFetcherRoutes = router;
