import { FilterQuery, Model, Types, UpdateQuery, Document } from "mongoose";
import { AbstractDocument } from "../schemas/abstract.schema";
import { NotFoundException } from "@nestjs/common";

export class AbstractRepository<TDocument extends AbstractDocument> {
    constructor(protected readonly model: Model<TDocument>) {}

    async create(document: Partial<Omit<TDocument, '_id'>>): Promise<TDocument> {
        const createdDocument = new this.model({
            ...document,
            _id: new Types.ObjectId(),
        });
        return (await createdDocument.save()).toJSON() as unknown as TDocument;
    }

    async findOne(filterQuery: FilterQuery<TDocument>): Promise<TDocument> {
        const document = await this.model
            .findOne(filterQuery)
            .lean<TDocument>(true);

        if(!document){
            throw new NotFoundException('Not found document');
        }

        return document;
    }

    async findOneAndUpdate(filterQuery: FilterQuery<TDocument>,
        update: UpdateQuery<TDocument>
    ): Promise<TDocument> {
        const document = await this.model
            .findOneAndUpdate(filterQuery, update, {
                new: true,
            })
            .lean<TDocument>(true);
        
        if(!document) throw new NotFoundException('Not found document');

        return document;
    }

    async find(filterQuery: FilterQuery<TDocument>): Promise<TDocument[]> {
        return await this.model.find(filterQuery).lean<TDocument[]>(true);
    }

    async findOneAndDelete(filterQuery: FilterQuery<TDocument>): Promise<TDocument> {
        return await this.model.findOneAndDelete(filterQuery).lean<TDocument>(true);
    }

    async findOneAndPopulate(filterQuery: FilterQuery<TDocument>,
        populateField: string | Array<string>
    ): Promise<TDocument> {
        const document = await this.model
            .findOne(filterQuery)
            .populate(populateField)
            .lean<TDocument>(true);
        
        if(!document) throw new NotFoundException('Not found document');
        
        return document;
    }

    async findOneWithoutLean(filterQuery: FilterQuery<TDocument>): Promise<TDocument & Document>{
        const document = await this.model.findOne(filterQuery);
        return document;
    }

    async save(document: TDocument & Document): Promise<TDocument>{
        return await document.save();
    }
}