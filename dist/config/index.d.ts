export interface ServerConfig {
    workspaceRoot: string;
    defaultFont: string;
    defaultDirection: 'rtl' | 'ltr';
    defaultPageSize: 'A4' | 'Letter' | 'A3';
    defaultMarginCm: number;
    logLevel: 'debug' | 'info' | 'warn' | 'error';
}
export declare function getConfig(): ServerConfig;
//# sourceMappingURL=index.d.ts.map