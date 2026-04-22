export type ListFolderRequest = {
    folder?: string
    keyword?: string
    sort_by?: string
}

export type ItemFolderResponse = {
    name: string
    created_at: string
    updated_at: string
    type: string
    uri: string
    size: number
    parent: string
}

export type ListFolderResponse = {
    parent: string
    total: number
    items: ItemFolderResponse[]
}

export type CreateFolderRequest = {
    folder_path: string
}

export type CreateFolderResponse = {
    message: string
    folder_path: string
}

export type DeleteFolderRequest = {
    folder_path: string
}

export type DeleteFolderResponse = {
    message: string
    deleted_folder: string
}

export type RenameFolderRequest = {
    old_path: string
    new_name: string
}

export type RenameFolderResponse = {
    old_path: string
    new_path: string
}
