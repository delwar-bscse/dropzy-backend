import { model, Schema } from 'mongoose'
import { ICategory, CategoryModel } from './category.interface'
import config from '../../../config'

const categorySchema = new Schema<ICategory, CategoryModel>(
    {
        name: {
            type: String,
            required: true,
            unique: true,
        },
        image: {
            type: String,
            required: true
        }
    },
    { timestamps: true },
)


categorySchema.post("find", function(categories: ICategory[]) {

    categories.forEach((category: ICategory) => {
        if (category.image) {
            category.image = `http://${config.ip_address}:${config.port}${category.image}`;
        }
    });

})

export const Category = model<ICategory, CategoryModel>('Category', categorySchema)