import express from 'express';
import { UserRoutes } from '../modules/user/user.routes';
import { AuthRoutes } from '../modules/auth/auth.routes';
import { TrackRoutes } from '../modules/track/track.routes';
import { ParcelRoutes } from '../modules/parcel/parcel.routes';
import { ReviewRoutes } from '../modules/review/review.route';
import { ContactSupportRoutes } from '../modules/contactSupport/contactSupport.route';
import { RuleRoutes } from '../modules/rule/rule.route';
import { PriceRoutes } from '../modules/price/price.route';
import { TransactionRoutes } from '../modules/transaction/transaction.route';
import { AnalyticRoutes } from '../modules/analytic/transaction.route';
import { DimensionFetcherRoutes } from '../modules/dimensionFetcher/dimensionFetcher.routes';
const router = express.Router();

const apiRoutes = [
    { path: "/user", route: UserRoutes },
    { path: "/auth", route: AuthRoutes },
    { path: "/track", route: TrackRoutes },
    { path: "/parcel", route: ParcelRoutes },
    { path: "/review", route: ReviewRoutes },
    { path: "/support", route: ContactSupportRoutes },
    { path: "/rule", route: RuleRoutes },
    { path: "/price", route: PriceRoutes },
    { path: "/transaction", route: TransactionRoutes },
    { path: "/analytic", route: AnalyticRoutes },
    { path: "/dimension", route: DimensionFetcherRoutes },
]

apiRoutes.forEach(route => router.use(route.path, route.route));
export default router;