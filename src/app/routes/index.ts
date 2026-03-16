import express from 'express';
import { UserRoutes } from '../modules/user/user.routes';
import { AuthRoutes } from '../modules/auth/auth.routes';
// import { RuleRoutes } from '../modules/rule/rule.route';
// import { ReportRoutes } from '../modules/report/report.routes';
// import { ChatRoutes } from '../modules/chat/chat.routes';
// import { AdminRoutes } from '../modules/admin/admin.route';
const router = express.Router();

const apiRoutes = [
    { path: "/user", route: UserRoutes },
    { path: "/auth", route: AuthRoutes },
    // { path: "/rule", route: RuleRoutes },
    // { path: "/chat", route: ChatRoutes },
    // { path: "/report", route: ReportRoutes },
    // { path: "/admin", route: AdminRoutes},
]

apiRoutes.forEach(route => router.use(route.path, route.route));
export default router;