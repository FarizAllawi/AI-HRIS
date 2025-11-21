export interface Media {
    id: string;
    name: string;
    url: string;
    filePath: string;
    mimeType: string;
    size: string;
    disk: string;
    maxDownload?: number;
    downloadCount?: number;
    createdAt: string;
}
