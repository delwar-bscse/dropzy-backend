import express, { Request, Response, NextFunction } from 'express';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { CategoryController } from './category.controller';
import { createCategoryZodValidationSchema } from './category.validation';
import fileUploadHandler from '../../middlewares/fileUploaderHandler';
import { getSingleFilePath } from '../../../shared/getFilePath';
import ApiError from '../../../errors/ApiErrors';
import { StatusCodes } from 'http-status-codes';
const router = express.Router();


router.route('/')
    .post(
        auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
        fileUploadHandler(),
        async (req: Request, res: Response, next: NextFunction) => {
            try {

                const image = await getSingleFilePath(req.files, 'image');

                req.body = {
                    ...req.body,
                    image: image
                };

                next();

            } catch (error) {
                throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to Process Category");
            }
        },
        validateRequest(createCategoryZodValidationSchema),
        CategoryController.createCategory,
    )
    .get(
        auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN, USER_ROLES.USER),
        CategoryController.retrievedCategories,
    );

router.route('/:id')
    .patch(
        auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
        fileUploadHandler(),
        async(req: Request, res: Response, next: NextFunction) => {
            try {

                const image = await getSingleFilePath(req.files, 'image');

                req.body = {
                    ...req.body,
                    image: image ? image : undefined
                };

                next();

            } catch (error) {
                throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to Process Category");
            }
        },
        CategoryController.updateCategory,
    )
    .delete(
        auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
        CategoryController.deleteCategory
    )

export const CategoryRoutes = router;