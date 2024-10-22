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