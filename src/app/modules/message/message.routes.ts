import express, { NextFunction, Request, Response } from 'express';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import fileUploadHandler from '../../middlewares/fileUploaderHandler';
import ApiError from '../../../errors/ApiErrors';
import { StatusCodes } from 'http-status-codes';
import { getSingleFilePath } from '../../../shared/getFilePath';
import { MessageController } from './message.controller';
const router = express.Router();

router.route('/')
    .post(
        auth(USER_ROLES.USER),
        fileUploadHandler(),
        (req: Request, res: Response, next: NextFunction) => {
            try {

                const image = getSingleFilePath(req.files, 'image');

                req.body = { 
                    ...req.body,
                    sender: req.user.id,
                    image: image ? image : undefined
                };

                next();

            } catch (error) {
                throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to Process Message");
            }
        },
        MessageController.sendMessage
    )
    .get(
        auth(USER_ROLES.USER),
        MessageController.retrievedMessage
    )

export const MessageRoutes = router;