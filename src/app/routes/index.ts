import express from 'express';
import { UserRoutes } from '../modules/user/user.routes';
import { AuthRoutes } from '../modules/auth/auth.routes';
import { RuleRoutes } from '../modules/rule/rule.route';
import { PlanRoutes } from '../modules/plan/plan.routes';
import { ServiceRoutes } from '../modules/service/service.routes';
import { ReservationRoutes } from '../modules/reservation/reservation.routes';
import { ReportRoutes } from '../modules/report/report.routes';
import { MessageRoutes } from '../modules/message/message.routes';
import { FaqRoutes } from '../modules/faq/faq.route';
import { ChatRoutes } from '../modules/chat/chat.routes';
import { CategoryRoutes } from '../modules/category/category.routes';
import { BannerRoutes } from '../modules/banner/banner.routes';
import { BookmarkRoutes } from '../modules/bookmark/bookmark.routes';
import { AdminRoutes } from '../modules/admin/admin.route';
const router = express.Router();

const apiRoutes = [
    { path: "/user", route: UserRoutes },
    { path: "/auth", route: AuthRoutes },
    { path: "/rule", route: RuleRoutes },
    { path: "/plan", route: PlanRoutes },
    { path: "/service", route: ServiceRoutes },
    { path: "/reservation", route: ReservationRoutes },
    { path: "/report", route: ReportRoutes },
    { path: "/message", route: MessageRoutes },
    { path: "/faq", route: FaqRoutes },
    { path: "/chat", route: ChatRoutes },
    { path: "/category", route: CategoryRoutes },
    { path: "/banner", route: BannerRoutes },
    { path: "/bookmark", route: BookmarkRoutes },
    { path: "/admin", route: AdminRoutes},
]

apiRoutes.forEach(route => router.use(route.path, route.route));
export default router;