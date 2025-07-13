import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { BookmarkService } from "./bookmark.service";

const toggleBookmark = catchAsync(async(req: Request, res: Response)=>{

    const result = await BookmarkService.toggleBookmark(req.body);
    
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: result
    })
});

const retrieveBookmarks = catchAsync(async(req: Request, res: Response)=>{
    const result = await BookmarkService.retrieveBookmarksFromDB(req.user, req.query);
    sendResponse(res, {
        statusCode: 200,
        success: true,
        message: "Bookmark Retrieved Successfully",
        data: result
    })
});


export const BookmarkController = {toggleBookmark, retrieveBookmarks}