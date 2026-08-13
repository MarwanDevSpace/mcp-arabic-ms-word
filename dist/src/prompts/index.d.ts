export interface PromptMessage {
    role: 'user' | 'assistant';
    content: {
        type: 'text';
        text: string;
    };
}
export interface PromptDefinition {
    name: string;
    description: string;
    arguments?: Array<{
        name: string;
        description: string;
        required?: boolean;
    }>;
    getMessages: (args: Record<string, string>) => PromptMessage[];
}
export declare function getPrompts(): PromptDefinition[];
//# sourceMappingURL=index.d.ts.map