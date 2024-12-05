/**
 * This file was auto-generated by Fern from our API Definition.
 */

/**
 * The dialect to localize to. This is only available when language is set to English.
 *
 * Options: Australian (au), Indian (in), Southern American (so), UK (uk), US (us).
 */
export type LocalizeDialect = "au" | "in" | "so" | "uk" | "us";

export const LocalizeDialect = {
    Au: "au",
    In: "in",
    So: "so",
    Uk: "uk",
    Us: "us",
} as const;