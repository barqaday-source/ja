export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

type TableShape = { Row: Record<string, unknown>; Insert: Record<string, unknown>; Update: Record<string, unknown>; Relationships: [] };
type FunctionShape = { Args: Record<string, unknown>; Returns: unknown };

/**
 * Base Supabase contract. Run `pnpm supabase:types` against the real project to
 * replace this compatibility contract with introspected, column-level types.
 */
export type Database = {
  public: {
    Tables: Record<string, TableShape>;
    Views: Record<string, TableShape>;
    Functions: Record<string, FunctionShape>;
    Enums: Record<string, string>;
    CompositeTypes: Record<string, Record<string, unknown>>;
  };
};
