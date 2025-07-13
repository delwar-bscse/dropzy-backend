import { Request, Response } from "express";
import catchAsync from "../../../shared/catchAsync";
import sendResponse from "../../../shared/sendResponse";
import { StatusCodes } from "http-status-codes";
import { ChatService } from "./chat.service";

const createChat = catchAsync(async (req: Request, res: Response) => {
    const chat = await ChatService.createChatToDB([req.user?.id, req.body.id]);

    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Create Chat Successfully',
        data: chat,
    });
})

const getChat = catchAsync(async (req: Request, res: Response) => {
    const chatList = await ChatService.retrievedChatFromDB(req.user, req.query);
  
    sendResponse(res, {
        statusCode: StatusCodes.OK,
        success: true,
        message: 'Chat Retrieve Successfully',
        data: chatList
    });
});

export const ChatController = { 
    createChat, 
    getChat
};