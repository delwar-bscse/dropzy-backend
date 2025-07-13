import express, { NextFunction, Request, Response } from "express";
import { BookmarkController } from "./bookmark.controller";
import auth from "../../middlewares/auth";
import { USER_ROLES } from "../../../enums/user";
import ApiError from "../../../errors/ApiErrors";
import { StatusCodes } from "http-status-codes";
const router = express.Router();


router.route("/")
    .post(
        auth(USER_ROLES.USER),
        (req: Request, res: Response, next: NextFunction) => {
            try {
                req.body = {
                    service: req.body.service,
                    user: req.user.id
                };

                next();

            } catch (error) {
                throw new ApiError(StatusCodes.BAD_REQUEST, "Failed to Process Bookmark");
            }
        },
        BookmarkController.toggleBookmark
    )
    .get(
        auth(USER_ROLES.USER),
        BookmarkController.retrieveBookmarks
    );

export const BookmarkRoutes = router;
