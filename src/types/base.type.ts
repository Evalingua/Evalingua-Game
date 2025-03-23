export interface PageResponse<T> {
    content: T[],
    totalPages: number,
    totalElements: number,
    currentPage: number,
    pageSize: number
}

export interface BaseResponse<T> {
    data: T,
    message: string,
    status_code: number
}

export interface BasePageResponse<T> {
    data: PageResponse<T>,
    message: string,
    status_code: number
}