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
  const parsedPage = parseInt(query.page as string, 10);
  const parsedLimit = parseInt(query.limit as string, 10);

  const page = Math.max(1, isNaN(parsedPage) ? 1 : parsedPage);
  const limit = Math.max(
    1,
    isNaN(parsedLimit) || parsedLimit === 0 ? defaultLimit : parsedLimit
  );

  return { page, limit };
}

/**
 Calcula el total de páginas del total y limite
 @param total - Total número de items
 @param limit - Items por página
 @returns Total número de páginas
 */
export function calculateTotalPages(total: number, limit: number): number {
  return Math.ceil(total / limit);
}

/**
 Crea paginación objeto metadata
 @param page - Página actual
 @param limit - Items por página
 @param total - Total número de páginas
 @returns Paginación metadata
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

