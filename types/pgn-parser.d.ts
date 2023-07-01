// Quick and dirty types for pgn-parser, as it was not provided by the distributor.
// Here (https://www.npmjs.com/package/pgn-parser), btw

interface PgnParserComment {
    text: string;
}

interface PgnParserMove {
    comments: PgnParserComment[];
    move: string;
    move_number?: number;
    ravs?: PgnParserOutput[];
    nags?: string[];
}

interface PgnParserOutput {
    comments: PgnParserComment[] | null;
    headers?: { name: string, value: string }[];
    moves: PgnParserMove[];
    result: string;
}

interface PgnParser {
    parse(pgn: string): PgnParserOutput[];
}