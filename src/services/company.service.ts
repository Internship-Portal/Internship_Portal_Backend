import {
  DocumentDefinition,
  FilterQuery,
  UpdateQuery,
  QueryOptions,
} from "mongoose";
import CompanyModel, { Company } from "../models/company";

export const createCompany = (input: DocumentDefinition<Company>) => {
  return CompanyModel.create(input);
};

export const findCompany = (
  query: FilterQuery<Company>,
  options: QueryOptions = { lean: true }
) => {
  return CompanyModel.find(query, {}, options);
};

export function findAndUpdate(
  query: FilterQuery<Company>,
  update: UpdateQuery<Company>,
  options: QueryOptions
) {
  return CompanyModel.findOneAndUpdate(query, update, options);
}

export const deleteCompany = (query: FilterQuery<Company>) => {
  return CompanyModel.deleteOne(query);
};
