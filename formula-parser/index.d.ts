//@! Typings from https://github.com/peggyjs/peggy

/** Provides information pointing to a location within a source. */
export interface Location {
    /** Line in the parsed source (1-based). */
    line: number;
    /** Column in the parsed source (1-based). */
    column: number;
    /** Offset in the parsed source (0-based). */
    offset: number;
}

/** The `start` and `end` position's of an object within the source. */
export interface LocationRange {
    /** Any object that was supplied to the `parse()` call as the `grammarSource` option. */
    source: any;
    /** Position at the beginning of the expression. */
    start: Location;
    /** Position after the end of the expression. */
    end: Location;
}

/** Specific sequence of symbols is expected in the parsed source. */
interface LiteralExpectation {
    type: "literal";
    /** Expected sequence of symbols. */
    text: string;
    /** If `true`, symbols of any case is expected. `text` in that case in lower case */
    ignoreCase: boolean;
}

/** One of the specified symbols is expected in the parse position. */
interface ClassExpectation {
    type: "class";
    /** List of symbols and symbol ranges expected in the parse position. */
    parts: (string[] | string)[];
    /**
     * If `true`, meaning of `parts` is inverted: symbols that NOT expected in
     * the parse position.
     */
    inverted: boolean;
    /** If `true`, symbols of any case is expected. `text` in that case in lower case */
    ignoreCase: boolean;
}

/** Any symbol is expected in the parse position. */
interface AnyExpectation {
    type: "any";
}

/** EOF is expected in the parse position. */
interface EndExpectation {
    type: "end";
}

/**
 * Something other is expected in the parse position. That expectation is
 * generated by call of the `expected()` function in the parser code, as
 * well as rules with human-readable names.
 */
interface OtherExpectation {
    type: "other";
    /**
     * Depending on the origin of this expectation, can be:
     * - text, supplied to the `expected()` function
     * - human-readable name of the rule
     */
    description: string;
}

type Expectation
    = LiteralExpectation
    | ClassExpectation
    | AnyExpectation
    | EndExpectation
    | OtherExpectation;

/**
 * The entry that maps object in the `source` property of error locations
 * to the actual source text of a grammar. That entries is necessary for
 * formatting errors.
 */
 export interface SourceText {
    /**
     * Identifier of a grammar that stored in the `location().source` property
     * of error and diagnostic messages.
     *
     * This one should be the same object that used in the `location().source`,
     * because their compared using `===`.
     */
    source: any;
    /** Source text of a grammar. */
    text: string;
}

/** Thrown if the grammar contains a syntax error. */
class SyntaxError extends Error {
    /** Location where error was originated. */
    location: LocationRange;
    /**
     * List of possible tokens in the parse position, or `null` if error was
     * created by the `error()` call.
     */
    expected: Expectation[] | null;
    /**
     * Character in the current parse position, or `null` if error was created
     * by the `error()` call.
     */
    found: string | null;

    /**
     * Format the error with associated sources.  The `location.source` should have
     * a `toString()` representation in order the result to look nice. If source
     * is `null` or `undefined`, it is skipped from the output
     *
     * Sample output:
     * ```
     * Error: Expected "!", "$", "&", "(", ".", "@", character class, comment, end of line, identifier, literal, or whitespace but "#" found.
     *  --> my grammar:3:9
     *   |
     * 3 | start = # 'a';
     *   |         ^
     * ```
     *
     * @param sources mapping from location source to source text
     *
     * @returns the formatted error
     */
    format(sources: SourceText[]): string;
    /**
     * Constructs the human-readable message from the machine representation.
     *
     * @param expected Array of expected items, generated by the parser
     * @param found Any text that will appear as found in the input instead of expected
     */
    static buildMessage(expected: Expectation[], found: string): string;
}
