export interface IApiResponse<T = unknown> {
    success: boolean;
    message?: string;
    data?: T;
}

export interface IAuthResponseData {
    user: {
        id: string;
        email: string;
    };
    token: string;
}
