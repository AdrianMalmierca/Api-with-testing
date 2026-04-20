import { Request } from "express";

export interface PaginationParams {
  page: number;
  limit: number;
}

export interface PaginationMetadata {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

/**
 * Parse and validate pagination parameters from request query
 * @param query - Request query object
 * @param defaultLimit - Default limit if not provided or invalid (default: 10)
 * @returns Validated pagination parameters
 */
export function parsePaginationParams(
  query: Request["query"],
  defaultLimit: number = 10
): PaginationParams {
  const parsedPage = parseInt(query.page as string, 10); //base 10 to ensure it's treated as a decimal number
  const parsedLimit = parseInt(query.limit as string, 10);

  const page = Math.max(1, isNaN(parsedPage) ? 1 : parsedPage); //if page is not a number or less than 1, default to 1
  const limit = Math.max(
    1,
    isNaN(parsedLimit) || parsedLimit === 0 ? defaultLimit : parsedLimit
  );

  return { page, limit };
}

/**
 Calculate total number of pages based on total items and limit
 @param total - Total number of items
 @param limit - Items per page
 @returns Total number of pages
 */
export function calculateTotalPages(total: number, limit: number): number {
  return Math.ceil(total / limit);
}

/**
 Create pagination metadata object
 @param page - Current page
 @param limit - Items per page
 @param total - Total number of pages
 @returns Pagination metadata
 */
export function createPaginationMetadata(
  page: number,
  limit: number,
  total: number
): PaginationMetadata {
  return {
    page,
    limit,
    total,
    totalPages: calculateTotalPages(total, limit),
  };
}

