export interface ResourceDefinition {
    uri: string;
    name: string;
    description: string;
    mimeType: string;
    readHandler: () => Promise<string>;
}
export declare function getResources(): ResourceDefinition[];
//# sourceMappingURL=index.d.ts.map