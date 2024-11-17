export function createSuccessResponse({
  data,
  message,
}: {
  data: any;
  message: string;
}) {
  return {
    success: true,
    message,
    data,
  };
}

interface Pagination {
  totalItems: number;
  currentPage: number;
  totalPages: number;
  pageLeft: number;
}

export function createSuccessListResponse({
  success = true,
  pagination,
  message = 'Data fetched successfully',
  data,
}:{
  success?: boolean;
  pagination?: {
    totalItems: number;
    currentPage: number;
    totalPages: number;
    pageLeft: number;
  };
  message?: string;
  data: any;
}) {
  const calculatedPagination = {
    ...pagination,
    totalItems: data.length,
    // currentPage: pagination.currentPage,
    // pageLeft: pagination.totalPages - pagination.currentPage > 0 ? pagination.totalPages - pagination.currentPage : 0,
  };
  return {
    success,
    pagination : calculatedPagination,
    message,
    data,
  };
}


export function createSuccessMutationResponse({
  data,
  message,
}: {
  data?: any;
  message: string;
}) {
  return {
    success: true,
    message,
    data : data || null,
  };
}

export function createSuccessFetchResponse({
  data,
  totalCount,
  message,
}: {
  data: any;
  totalCount: number;
  message: string;
}) {
  return {
    success: true,
    totalCount,
    message,
    data,
  };
}