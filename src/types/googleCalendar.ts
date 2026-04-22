export interface GoogleAuthUrlResponse {
    auth_url: string
}

export interface GoogleConnectRequest {
    code: string
    redirect_uri?: string
}

export interface CreateEventRequest {
    account_id: number
    summary: string
    start_time: string
    end_time: string
}

export interface CreateBatchEventsRequest {
    events: CreateEventRequest[]
}
