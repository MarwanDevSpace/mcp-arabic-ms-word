import { z } from 'zod';
import { StandardResultEnvelope } from '../contracts/index.js';
export declare const addTableSchema: z.ZodObject<{
    filePath: z.ZodString;
    columns: z.ZodArray<z.ZodObject<{
        header: z.ZodString;
        widthPercent: z.ZodOptional<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        header: string;
        widthPercent?: number | undefined;
    }, {
        header: string;
        widthPercent?: number | undefined;
    }>, "many">;
    rows: z.ZodArray<z.ZodObject<{
        cells: z.ZodArray<z.ZodString, "many">;
        backgroundColor: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        cells: string[];
        backgroundColor?: string | undefined;
    }, {
        cells: string[];
        backgroundColor?: string | undefined;
    }>, "many">;
    isRtl: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
}, "strip", z.ZodTypeAny, {
    filePath: string;
    columns: {
        header: string;
        widthPercent?: number | undefined;
    }[];
    rows: {
        cells: string[];
        backgroundColor?: string | undefined;
    }[];
    isRtl: boolean;
}, {
    filePath: string;
    columns: {
        header: string;
        widthPercent?: number | undefined;
    }[];
    rows: {
        cells: string[];
        backgroundColor?: string | undefined;
    }[];
    isRtl?: boolean | undefined;
}>;
export type AddTableInput = z.input<typeof addTableSchema>;
export declare function handleAddTable(input: AddTableInput): Promise<StandardResultEnvelope>;
//# sourceMappingURL=add_table.d.ts.map