import express, { Request, Response } from "express";
import cors from "cors";
import { StatusCodes } from "http-status-codes";
import { Morgan } from "./shared/morgan";
import router from './app/routes';
import globalErrorHandler from './app/middlewares/globalErrorHandler';
import requestIp from 'request-ip';
import rateLimit from 'express-rate-limit';
import ApiError from "./errors/ApiErrors";
// import handleStripeWebhook from "./stripe/handleStripeWebhook";
const app = express();
import "./helpers/cornJob"
import stripeWebhook from "./stripe/webhook/stripeWebhook";
import path from "path";
import stripeWebhookPayment from "./stripe/webhook/stripeWebhookPayment";
import stripeWebhookWithdraw from "./stripe/webhook/stripeWebhookWithdraw";

const limiter = rateLimit({
    windowMs: 5 * 60 * 1000, // 5 minutes
    max: 1000,
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: (req, res) => {
        if (!req.clientIp) {
            throw new ApiError(StatusCodes.BAD_REQUEST, 'Unable to determine client IP!');
        }
        return req.clientIp;
    },
    handler: (req, res, next, options) => {
        throw new ApiError(options?.statusCode, `Rate limit exceeded. Try again in ${options.windowMs / 60000} minutes.`);
    }
});


// Stripe webhook route - Local testing endpoint
app.post('/api/v1/stripe/webhook', express.raw({ type: 'application/json' }), stripeWebhook);
// Separate endpoints for production webhooks
app.post('/api/v1/stripe/webhook-payment', express.raw({ type: 'application/json' }), stripeWebhookPayment);
app.post('/api/v1/stripe/webhook-withdraw', express.raw({ type: 'application/json' }), stripeWebhookWithdraw);

// morgan
app.use(Morgan.successHandler);
app.use(Morgan.errorHandler);


//body parser
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(requestIp.mw());
app.use(limiter);

//file retrieve
// app.use(express.static('uploads'));
app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

//router
app.use('/api/v1', router);

app.get("/", (req: Request, res: Response) => {
    res.send("Hey Backend, How can I assist you ");
})

//global error handle
app.use(globalErrorHandler);

// handle not found route
app.use((req: Request, res: Response) => {
    res.status(StatusCodes.NOT_FOUND).json({
        success: false,
        message: "Not Found",
        errorMessages: [
            {
                path: req.originalUrl,
                message: "API DOESN'T EXIST"
            }
        ]
    })
});

export default app;