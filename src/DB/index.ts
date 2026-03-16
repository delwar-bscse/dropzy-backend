import colors from 'colors';
import { UserModel } from '../app/modules/user/user.model';
import config from '../config';
import { USER_ROLES } from '../enums/user';
import { logger } from '../shared/logger';


// create super admin data
const superUser = {
    name: 'Super Admin',
    role: USER_ROLES.SUPER_ADMIN,
    email: config.admin.email,
    password: config.admin.password,
    verified: true
};

const seedSuperAdmin = async () => {

    // check super admin exist or not
    const isExistSuperAdmin = await UserModel.findOne({
        role: USER_ROLES.SUPER_ADMIN,
    });

    // create super admin
    if (!isExistSuperAdmin) {
        await UserModel.create(superUser);
        logger.info(colors.green('✔ Super admin created successfully!'));
    }

    return;
};

export default seedSuperAdmin;