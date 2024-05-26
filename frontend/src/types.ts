export interface ApiResponse {
    success: boolean;
    validError?: boolean;
    errorMessage?: string;
    data?: any;
}

export const LOGGED_IN_UNKNOWN = 0;
export const LOGGED_IN_TRUE = 1;
export const LOGGED_IN_FALSE = 2;
