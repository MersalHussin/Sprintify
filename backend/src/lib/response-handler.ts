import type { Response } from "express";

export type StatusCode = keyof typeof STATUS_CODES;
const STATUS_CODES = {
    // Success codes
    200: "OK",
    201: "CREATED",

    // Client error codes
    400: "BAD_REQUEST",
    401: "UNAUTHORIZED",
    403: "FORBIDDEN",
    404: "NOT_FOUND",
    429: "TOO_MANY_REQUESTS",

    // Server error codes
    500: "INTERNAL_SERVER_ERROR",
    502: "BAD_GATEWAY",
    503: "SERVICE_UNAVAILABLE",
    504: "GATEWAY_TIMEOUT",
};

const ERROR_MESSAGES: Record<StatusCode, string> = {
    200: "OK",
    201: "Created",
    400: "Bad Request",
    401: "You are not authorized to access this resource",
    403: "You are not authorized to access this resource",
    404: "The requested resource was not found",
    429: "You have exceeded the rate limit",
    500: "An unexpected error occurred",
    502: "The server is not responding",
    503: "The server is temporarily unavailable",
    504: "The server timed out",
};

export const handleResponse = <TData = undefined>(
    res: Response,
    statusCode: StatusCode,
    data?: TData,
    errorMessage?: string,
) => {
    return res.status(statusCode).json({
        status: STATUS_CODES[statusCode],
        message: errorMessage ?? ERROR_MESSAGES[statusCode],
        ...(data !== undefined && { data }),
    });
};
