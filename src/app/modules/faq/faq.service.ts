import { StatusCodes } from 'http-status-codes';
import ApiError from '../../../errors/ApiErrors';
import { IFaq } from './faq.interface';
import { Faq } from './faq.model';
import { checkMongooseIDValidation } from '../../../shared/checkMongooseIDValidation';
import QueryBuilder from '../../../helpers/QueryBuilder';
import { FilterQuery } from 'mongoose';


const createFaqToDB = async (payload: IFaq): Promise<IFaq> => {

    const faq = await Faq.create(payload);
    if (!faq) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to created Faq');
    }

    return faq;
};

const faqsFromDB = async (query: FilterQuery<any>): Promise<{ faqs: IFaq[], pagination: any }> => {

    const FaqQuery = new QueryBuilder(
        Faq.find({}),
        query
    ).paginate();

    const [faqs, pagination] = await Promise.all([
        FaqQuery.queryModel,
        FaqQuery.getPaginationInfo()
    ]);

    return { faqs, pagination };
};

const deleteFaqToDB = async (id: string): Promise<IFaq | undefined> => {

    checkMongooseIDValidation(id, "Faq")

    await Faq.findByIdAndDelete(id);
    return;
};

const updateFaqToDB = async (id: string, payload: IFaq): Promise<IFaq> => {

    checkMongooseIDValidation(id, "Faq")

    const updatedFaq = await Faq.findByIdAndUpdate({ _id: id }, payload, {
        new: true,
    });

    if (!updatedFaq) {
        throw new ApiError(StatusCodes.BAD_REQUEST, 'Failed to updated Faq');
    }

    return updatedFaq;
};

export const FaqService = {
    createFaqToDB,
    updateFaqToDB,
    faqsFromDB,
    deleteFaqToDB,
};  