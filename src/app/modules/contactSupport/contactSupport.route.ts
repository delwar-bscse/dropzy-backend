import express, { NextFunction, Request, Response } from 'express';
import { USER_ROLES } from '../../../enums/user';
import auth from '../../middlewares/auth';
import validateRequest from '../../middlewares/validateRequest';
import { ContactSupportController } from './contactSupport.controller';
import { ContactSupportValidation } from './contactSupport.validation';
import fileUploadHandler from '../../middlewares/fileUploaderHandler';
import { getSingleFilePathDocument } from '../../../shared/getFilePath';
const router = express.Router();

router
  .route('/')
  .get(
    auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
    ContactSupportController.getContactSupports
  )
  .post(
    auth(USER_ROLES.COURIER, USER_ROLES.SENDER),
    fileUploadHandler(),
    async (req: Request, res: Response, next: NextFunction) => {
      try {
        console.log("Files : ", req.files)
        const attachment = await getSingleFilePathDocument(req.files, "attachment");
        // const mimetype = (req.files as any).attachment[0].mimetype;
        // console.log("Mimetype : ", mimetype);

        req.body = {
          ...req.body,
          ...(attachment && { attachment }),
        };
        next();

      } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Failed to Create Contact Support" });
      }
    },
    validateRequest(ContactSupportValidation.createContactSupportZodSchema),
    ContactSupportController.createContactSupport
  );

router
  .route('/:id')
  .get(
    auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
    ContactSupportController.getContactSupport
  )
  .patch(
    auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
    validateRequest(ContactSupportValidation.updateContactSupportZodSchema),
    ContactSupportController.updateContactSupport
  )
  .delete(
    auth(USER_ROLES.ADMIN, USER_ROLES.SUPER_ADMIN),
    ContactSupportController.deleteContactSupport
  );


export const ContactSupportRoutes = router;