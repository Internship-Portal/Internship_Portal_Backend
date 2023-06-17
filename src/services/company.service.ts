import {
  DocumentDefinition,
  FilterQuery,
  UpdateQuery,
  QueryOptions,
} from "mongoose";
import CompanyModel, { Company } from "../models/company";

// Create Company Service
export function createCompany(input: DocumentDefinition<Company>) {
  return CompanyModel.create(input);
}

// Find Company Service
export function findCompany(
  query: FilterQuery<Company>,
  options: QueryOptions = { lean: true }
) {
  return CompanyModel.find(query, {}, options);
}

// Find and Update Company Service
export function findAndUpdate(
  query: FilterQuery<Company>,
  update: UpdateQuery<Company>,
  options: QueryOptions
) {
  return CompanyModel.findOneAndUpdate(query, update, options);
}

// Delete Company Service
export function deleteCompany(query: FilterQuery<Company>) {
  return CompanyModel.deleteOne(query);
}
