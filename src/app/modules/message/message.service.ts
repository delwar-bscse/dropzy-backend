import { FilterQuery } from 'mongoose';
import QueryBuilder from '../../../helpers/QueryBuilder';
import { IMessage } from './message.interface';
import { Message } from './message.model';

const sendMessageToDB = async (payload: any): Promise<IMessage> => {

    // save to DB
    const response = await Message.create(payload);

    //@ts-ignore
    const io = global.io;
    if (io) {
        io.emit(`getMessage::${payload?.chatId}`, response);
    }

    return response;
};

const retrievedMessageFromDB = async (id: any, query: FilterQuery<IMessage>): Promise<{ messages: IMessage[], pagination: any }> => {

    const MessageQuery = new QueryBuilder(
        Message.find({ chatId: id }).lean().exec(),
        query
    ).paginate().filter();

    const [messages, pagination] = await Promise.all([
        MessageQuery.queryModel,
        MessageQuery.getPaginationInfo()
    ]);

    return { messages, pagination };
};

export const MessageService = { sendMessageToDB, retrievedMessageFromDB };
