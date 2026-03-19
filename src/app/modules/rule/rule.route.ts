import express from 'express';
import { RuleController } from './rule.controller';
import auth from '../../middlewares/auth';
import { USER_ROLES } from '../../../enums/user';

const router = express.Router();

router
  .post(
    '/',
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    RuleController.addRule,
  )
  .get('/:title', RuleController.getRule)
  .patch('/',
    auth(USER_ROLES.SUPER_ADMIN, USER_ROLES.ADMIN),
    RuleController.updateRule
  );

export const RuleRoutes = router;
