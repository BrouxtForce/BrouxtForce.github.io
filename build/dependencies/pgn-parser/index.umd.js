"use strict";
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
        typeof define === 'function' && define.amd ? define(['exports'], factory) :
            (global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.PgnParser = {}));
})(this, (function (exports) {
    'use strict';
    var commonjsGlobal = typeof globalThis !== 'undefined' ? globalThis : typeof window !== 'undefined' ? window : typeof global !== 'undefined' ? global : typeof self !== 'undefined' ? self : {};
    var _pgnParserExports = {};
    var _pgnParser = {
        get exports() { return _pgnParserExports; },
        set exports(v) { _pgnParserExports = v; },
    };
    (function (module) {
        (function (root, factory) {
            if (module.exports) {
                module.exports = factory();
            }
        })(commonjsGlobal, function () {
            function peg$subclass(child, parent) {
                function C() { this.constructor = child; }
                C.prototype = parent.prototype;
                child.prototype = new C();
            }
            function peg$SyntaxError(message, expected, found, location) {
                var self = Error.call(this, message);
                if (Object.setPrototypeOf) {
                    Object.setPrototypeOf(self, peg$SyntaxError.prototype);
                }
                self.expected = expected;
                self.found = found;
                self.location = location;
                self.name = "SyntaxError";
                return self;
            }
            peg$subclass(peg$SyntaxError, Error);
            function peg$padEnd(str, targetLength, padString) {
                padString = padString || " ";
                if (str.length > targetLength) {
                    return str;
                }
                targetLength -= str.length;
                padString += padString.repeat(targetLength);
                return str + padString.slice(0, targetLength);
            }
            peg$SyntaxError.prototype.format = function (sources) {
                var str = "Error: " + this.message;
                if (this.location) {
                    var src = null;
                    var k;
                    for (k = 0; k < sources.length; k++) {
                        if (sources[k].source === this.location.source) {
                            src = sources[k].text.split(/\r\n|\n|\r/g);
                            break;
                        }
                    }
                    var s = this.location.start;
                    var offset_s = (this.location.source && (typeof this.location.source.offset === "function"))
                        ? this.location.source.offset(s)
                        : s;
                    var loc = this.location.source + ":" + offset_s.line + ":" + offset_s.column;
                    if (src) {
                        var e = this.location.end;
                        var filler = peg$padEnd("", offset_s.line.toString().length, ' ');
                        var line = src[s.line - 1];
                        var last = s.line === e.line ? e.column : line.length + 1;
                        var hatLen = (last - s.column) || 1;
                        str += "\n --> " + loc + "\n"
                            + filler + " |\n"
                            + offset_s.line + " | " + line + "\n"
                            + filler + " | " + peg$padEnd("", s.column - 1, ' ')
                            + peg$padEnd("", hatLen, "^");
                    }
                    else {
                        str += "\n at " + loc;
                    }
                }
                return str;
            };
            peg$SyntaxError.buildMessage = function (expected, found) {
                var DESCRIBE_EXPECTATION_FNS = {
                    literal: function (expectation) {
                        return "\"" + literalEscape(expectation.text) + "\"";
                    },
                    class: function (expectation) {
                        var escapedParts = expectation.parts.map(function (part) {
                            return Array.isArray(part)
                                ? classEscape(part[0]) + "-" + classEscape(part[1])
                                : classEscape(part);
                        });
                        return "[" + (expectation.inverted ? "^" : "") + escapedParts.join("") + "]";
                    },
                    any: function () {
                        return "any character";
                    },
                    end: function () {
                        return "end of input";
                    },
                    other: function (expectation) {
                        return expectation.description;
                    }
                };
                function hex(ch) {
                    return ch.charCodeAt(0).toString(16).toUpperCase();
                }
                function literalEscape(s) {
                    return s
                        .replace(/\\/g, "\\\\")
                        .replace(/"/g, "\\\"")
                        .replace(/\0/g, "\\0")
                        .replace(/\t/g, "\\t")
                        .replace(/\n/g, "\\n")
                        .replace(/\r/g, "\\r")
                        .replace(/[\x00-\x0F]/g, function (ch) { return "\\x0" + hex(ch); })
                        .replace(/[\x10-\x1F\x7F-\x9F]/g, function (ch) { return "\\x" + hex(ch); });
                }
                function classEscape(s) {
                    return s
                        .replace(/\\/g, "\\\\")
                        .replace(/\]/g, "\\]")
                        .replace(/\^/g, "\\^")
                        .replace(/-/g, "\\-")
                        .replace(/\0/g, "\\0")
                        .replace(/\t/g, "\\t")
                        .replace(/\n/g, "\\n")
                        .replace(/\r/g, "\\r")
                        .replace(/[\x00-\x0F]/g, function (ch) { return "\\x0" + hex(ch); })
                        .replace(/[\x10-\x1F\x7F-\x9F]/g, function (ch) { return "\\x" + hex(ch); });
                }
                function describeExpectation(expectation) {
                    return DESCRIBE_EXPECTATION_FNS[expectation.type](expectation);
                }
                function describeExpected(expected) {
                    var descriptions = expected.map(describeExpectation);
                    var i, j;
                    descriptions.sort();
                    if (descriptions.length > 0) {
                        for (i = 1, j = 1; i < descriptions.length; i++) {
                            if (descriptions[i - 1] !== descriptions[i]) {
                                descriptions[j] = descriptions[i];
                                j++;
                            }
                        }
                        descriptions.length = j;
                    }
                    switch (descriptions.length) {
                        case 1:
                            return descriptions[0];
                        case 2:
                            return descriptions[0] + " or " + descriptions[1];
                        default:
                            return descriptions.slice(0, -1).join(", ")
                                + ", or "
                                + descriptions[descriptions.length - 1];
                    }
                }
                function describeFound(found) {
                    return found ? "\"" + literalEscape(found) + "\"" : "end of input";
                }
                return "Expected " + describeExpected(expected) + " but " + describeFound(found) + " found.";
            };
            function peg$parse(input, options) {
                options = options !== undefined ? options : {};
                var peg$FAILED = {};
                var peg$source = options.grammarSource;
                var peg$startRuleFunctions = { pgn: peg$parsepgn, tags: peg$parsetags, game: peg$parsegame, games: peg$parsegames };
                var peg$startRuleFunction = peg$parsepgn;
                var peg$c0 = "Event";
                var peg$c1 = "event";
                var peg$c2 = "Site";
                var peg$c3 = "site";
                var peg$c4 = "Date";
                var peg$c5 = "date";
                var peg$c6 = "Round";
                var peg$c7 = "round";
                var peg$c8 = "White";
                var peg$c9 = "white";
                var peg$c10 = "Black";
                var peg$c11 = "black";
                var peg$c12 = "Result";
                var peg$c13 = "result";
                var peg$c14 = "WhiteTitle";
                var peg$c15 = "Whitetitle";
                var peg$c16 = "whitetitle";
                var peg$c17 = "whiteTitle";
                var peg$c18 = "BlackTitle";
                var peg$c19 = "Blacktitle";
                var peg$c20 = "blacktitle";
                var peg$c21 = "blackTitle";
                var peg$c22 = "WhiteELO";
                var peg$c23 = "WhiteElo";
                var peg$c24 = "Whiteelo";
                var peg$c25 = "whiteelo";
                var peg$c26 = "whiteElo";
                var peg$c27 = "BlackELO";
                var peg$c28 = "BlackElo";
                var peg$c29 = "Blackelo";
                var peg$c30 = "blackelo";
                var peg$c31 = "blackElo";
                var peg$c32 = "WhiteUSCF";
                var peg$c33 = "WhiteUscf";
                var peg$c34 = "Whiteuscf";
                var peg$c35 = "whiteuscf";
                var peg$c36 = "whiteUscf";
                var peg$c37 = "BlackUSCF";
                var peg$c38 = "BlackUscf";
                var peg$c39 = "Blackuscf";
                var peg$c40 = "blackuscf";
                var peg$c41 = "blackUscf";
                var peg$c42 = "WhiteNA";
                var peg$c43 = "WhiteNa";
                var peg$c44 = "Whitena";
                var peg$c45 = "whitena";
                var peg$c46 = "whiteNa";
                var peg$c47 = "whiteNA";
                var peg$c48 = "BlackNA";
                var peg$c49 = "BlackNa";
                var peg$c50 = "Blackna";
                var peg$c51 = "blackna";
                var peg$c52 = "blackNA";
                var peg$c53 = "blackNa";
                var peg$c54 = "WhiteType";
                var peg$c55 = "Whitetype";
                var peg$c56 = "whitetype";
                var peg$c57 = "whiteType";
                var peg$c58 = "BlackType";
                var peg$c59 = "Blacktype";
                var peg$c60 = "blacktype";
                var peg$c61 = "blackType";
                var peg$c62 = "EventDate";
                var peg$c63 = "Eventdate";
                var peg$c64 = "eventdate";
                var peg$c65 = "eventDate";
                var peg$c66 = "EventSponsor";
                var peg$c67 = "Eventsponsor";
                var peg$c68 = "eventsponsor";
                var peg$c69 = "eventSponsor";
                var peg$c70 = "Section";
                var peg$c71 = "section";
                var peg$c72 = "Stage";
                var peg$c73 = "stage";
                var peg$c74 = "Board";
                var peg$c75 = "board";
                var peg$c76 = "Opening";
                var peg$c77 = "opening";
                var peg$c78 = "Variation";
                var peg$c79 = "variation";
                var peg$c80 = "SubVariation";
                var peg$c81 = "Subvariation";
                var peg$c82 = "subvariation";
                var peg$c83 = "subVariation";
                var peg$c84 = "ECO";
                var peg$c85 = "Eco";
                var peg$c86 = "eco";
                var peg$c87 = "NIC";
                var peg$c88 = "Nic";
                var peg$c89 = "nic";
                var peg$c90 = "Time";
                var peg$c91 = "time";
                var peg$c92 = "UTCTime";
                var peg$c93 = "UTCtime";
                var peg$c94 = "UtcTime";
                var peg$c95 = "Utctime";
                var peg$c96 = "utctime";
                var peg$c97 = "utcTime";
                var peg$c98 = "UTCDate";
                var peg$c99 = "UTCdate";
                var peg$c100 = "UtcDate";
                var peg$c101 = "Utcdate";
                var peg$c102 = "utcdate";
                var peg$c103 = "utcDate";
                var peg$c104 = "TimeControl";
                var peg$c105 = "Timecontrol";
                var peg$c106 = "timecontrol";
                var peg$c107 = "timeControl";
                var peg$c108 = "SetUp";
                var peg$c109 = "Setup";
                var peg$c110 = "setup";
                var peg$c111 = "setUp";
                var peg$c112 = "FEN";
                var peg$c113 = "Fen";
                var peg$c114 = "fen";
                var peg$c115 = "Termination";
                var peg$c116 = "termination";
                var peg$c117 = "Annotator";
                var peg$c118 = "annotator";
                var peg$c119 = "Mode";
                var peg$c120 = "mode";
                var peg$c121 = "PlyCount";
                var peg$c122 = "Plycount";
                var peg$c123 = "plycount";
                var peg$c124 = "plyCount";
                var peg$c125 = "Variant";
                var peg$c126 = "variant";
                var peg$c127 = "WhiteRatingDiff";
                var peg$c128 = "BlackRatingDiff";
                var peg$c129 = "WhiteFideId";
                var peg$c130 = "BlackFideId";
                var peg$c131 = "WhiteTeam";
                var peg$c132 = "BlackTeam";
                var peg$c133 = "Clock";
                var peg$c134 = "WhiteClock";
                var peg$c135 = "BlackClock";
                var peg$c137 = "\"";
                var peg$c138 = "\\";
                var peg$c139 = ".";
                var peg$c140 = ":";
                var peg$c141 = "/";
                var peg$c142 = "B";
                var peg$c143 = "W";
                var peg$c144 = "N";
                var peg$c145 = "?";
                var peg$c146 = "-";
                var peg$c147 = "+";
                var peg$c148 = "*";
                var peg$c149 = "1-0";
                var peg$c150 = "0-1";
                var peg$c151 = "1/2-1/2";
                var peg$c152 = "=";
                var peg$c153 = "%csl";
                var peg$c154 = "%cal";
                var peg$c155 = "%";
                var peg$c156 = "%eval";
                var peg$c157 = "[%";
                var peg$c158 = "}";
                var peg$c159 = ",";
                var peg$c160 = "Y";
                var peg$c161 = "G";
                var peg$c162 = "R";
                var peg$c163 = "{";
                var peg$c164 = "[";
                var peg$c165 = "]";
                var peg$c166 = ";";
                var peg$c167 = "clk";
                var peg$c168 = "egt";
                var peg$c169 = "emt";
                var peg$c170 = "mct";
                var peg$c171 = "(";
                var peg$c172 = ")";
                var peg$c173 = " ";
                var peg$c174 = "e.p.";
                var peg$c175 = "O-O-O";
                var peg$c176 = "O-O";
                var peg$c177 = "@";
                var peg$c178 = "+-";
                var peg$c179 = "$$$";
                var peg$c180 = "#";
                var peg$c181 = "$";
                var peg$c182 = "!!";
                var peg$c183 = "??";
                var peg$c184 = "!?";
                var peg$c185 = "?!";
                var peg$c186 = "!";
                var peg$c187 = "\u203C";
                var peg$c188 = "\u2047";
                var peg$c189 = "\u2049";
                var peg$c190 = "\u2048";
                var peg$c191 = "\u25A1";
                var peg$c192 = "\u221E";
                var peg$c193 = "\u2A72";
                var peg$c194 = "\u2A71";
                var peg$c195 = "\xB1";
                var peg$c196 = "\u2213";
                var peg$c197 = "-+";
                var peg$c198 = "\u2A00";
                var peg$c199 = "\u27F3";
                var peg$c200 = "\u2192";
                var peg$c201 = "\u2191";
                var peg$c202 = "\u21C6";
                var peg$c203 = "D";
                var peg$c204 = "x";
                var peg$r0 = /^[ \t\n\r]/;
                var peg$r1 = /^[\n\r]/;
                var peg$r2 = /^[\-a-zA-Z0-9.]/;
                var peg$r3 = /^[^"\\\r\n]/;
                var peg$r4 = /^[0-9?]/;
                var peg$r5 = /^[0-9]/;
                var peg$r6 = /^[^\n\r]/;
                var peg$r7 = /^[RNBQKP]/;
                var peg$r8 = /^[RNBQ]/;
                var peg$r9 = /^[a-h]/;
                var peg$r10 = /^[1-8]/;
                var peg$e0 = peg$literalExpectation("Event", false);
                var peg$e1 = peg$literalExpectation("event", false);
                var peg$e2 = peg$literalExpectation("Site", false);
                var peg$e3 = peg$literalExpectation("site", false);
                var peg$e4 = peg$literalExpectation("Date", false);
                var peg$e5 = peg$literalExpectation("date", false);
                var peg$e6 = peg$literalExpectation("Round", false);
                var peg$e7 = peg$literalExpectation("round", false);
                var peg$e8 = peg$literalExpectation("White", false);
                var peg$e9 = peg$literalExpectation("white", false);
                var peg$e10 = peg$literalExpectation("Black", false);
                var peg$e11 = peg$literalExpectation("black", false);
                var peg$e12 = peg$literalExpectation("Result", false);
                var peg$e13 = peg$literalExpectation("result", false);
                var peg$e14 = peg$literalExpectation("WhiteTitle", false);
                var peg$e15 = peg$literalExpectation("Whitetitle", false);
                var peg$e16 = peg$literalExpectation("whitetitle", false);
                var peg$e17 = peg$literalExpectation("whiteTitle", false);
                var peg$e18 = peg$literalExpectation("BlackTitle", false);
                var peg$e19 = peg$literalExpectation("Blacktitle", false);
                var peg$e20 = peg$literalExpectation("blacktitle", false);
                var peg$e21 = peg$literalExpectation("blackTitle", false);
                var peg$e22 = peg$literalExpectation("WhiteELO", false);
                var peg$e23 = peg$literalExpectation("WhiteElo", false);
                var peg$e24 = peg$literalExpectation("Whiteelo", false);
                var peg$e25 = peg$literalExpectation("whiteelo", false);
                var peg$e26 = peg$literalExpectation("whiteElo", false);
                var peg$e27 = peg$literalExpectation("BlackELO", false);
                var peg$e28 = peg$literalExpectation("BlackElo", false);
                var peg$e29 = peg$literalExpectation("Blackelo", false);
                var peg$e30 = peg$literalExpectation("blackelo", false);
                var peg$e31 = peg$literalExpectation("blackElo", false);
                var peg$e32 = peg$literalExpectation("WhiteUSCF", false);
                var peg$e33 = peg$literalExpectation("WhiteUscf", false);
                var peg$e34 = peg$literalExpectation("Whiteuscf", false);
                var peg$e35 = peg$literalExpectation("whiteuscf", false);
                var peg$e36 = peg$literalExpectation("whiteUscf", false);
                var peg$e37 = peg$literalExpectation("BlackUSCF", false);
                var peg$e38 = peg$literalExpectation("BlackUscf", false);
                var peg$e39 = peg$literalExpectation("Blackuscf", false);
                var peg$e40 = peg$literalExpectation("blackuscf", false);
                var peg$e41 = peg$literalExpectation("blackUscf", false);
                var peg$e42 = peg$literalExpectation("WhiteNA", false);
                var peg$e43 = peg$literalExpectation("WhiteNa", false);
                var peg$e44 = peg$literalExpectation("Whitena", false);
                var peg$e45 = peg$literalExpectation("whitena", false);
                var peg$e46 = peg$literalExpectation("whiteNa", false);
                var peg$e47 = peg$literalExpectation("whiteNA", false);
                var peg$e48 = peg$literalExpectation("BlackNA", false);
                var peg$e49 = peg$literalExpectation("BlackNa", false);
                var peg$e50 = peg$literalExpectation("Blackna", false);
                var peg$e51 = peg$literalExpectation("blackna", false);
                var peg$e52 = peg$literalExpectation("blackNA", false);
                var peg$e53 = peg$literalExpectation("blackNa", false);
                var peg$e54 = peg$literalExpectation("WhiteType", false);
                var peg$e55 = peg$literalExpectation("Whitetype", false);
                var peg$e56 = peg$literalExpectation("whitetype", false);
                var peg$e57 = peg$literalExpectation("whiteType", false);
                var peg$e58 = peg$literalExpectation("BlackType", false);
                var peg$e59 = peg$literalExpectation("Blacktype", false);
                var peg$e60 = peg$literalExpectation("blacktype", false);
                var peg$e61 = peg$literalExpectation("blackType", false);
                var peg$e62 = peg$literalExpectation("EventDate", false);
                var peg$e63 = peg$literalExpectation("Eventdate", false);
                var peg$e64 = peg$literalExpectation("eventdate", false);
                var peg$e65 = peg$literalExpectation("eventDate", false);
                var peg$e66 = peg$literalExpectation("EventSponsor", false);
                var peg$e67 = peg$literalExpectation("Eventsponsor", false);
                var peg$e68 = peg$literalExpectation("eventsponsor", false);
                var peg$e69 = peg$literalExpectation("eventSponsor", false);
                var peg$e70 = peg$literalExpectation("Section", false);
                var peg$e71 = peg$literalExpectation("section", false);
                var peg$e72 = peg$literalExpectation("Stage", false);
                var peg$e73 = peg$literalExpectation("stage", false);
                var peg$e74 = peg$literalExpectation("Board", false);
                var peg$e75 = peg$literalExpectation("board", false);
                var peg$e76 = peg$literalExpectation("Opening", false);
                var peg$e77 = peg$literalExpectation("opening", false);
                var peg$e78 = peg$literalExpectation("Variation", false);
                var peg$e79 = peg$literalExpectation("variation", false);
                var peg$e80 = peg$literalExpectation("SubVariation", false);
                var peg$e81 = peg$literalExpectation("Subvariation", false);
                var peg$e82 = peg$literalExpectation("subvariation", false);
                var peg$e83 = peg$literalExpectation("subVariation", false);
                var peg$e84 = peg$literalExpectation("ECO", false);
                var peg$e85 = peg$literalExpectation("Eco", false);
                var peg$e86 = peg$literalExpectation("eco", false);
                var peg$e87 = peg$literalExpectation("NIC", false);
                var peg$e88 = peg$literalExpectation("Nic", false);
                var peg$e89 = peg$literalExpectation("nic", false);
                var peg$e90 = peg$literalExpectation("Time", false);
                var peg$e91 = peg$literalExpectation("time", false);
                var peg$e92 = peg$literalExpectation("UTCTime", false);
                var peg$e93 = peg$literalExpectation("UTCtime", false);
                var peg$e94 = peg$literalExpectation("UtcTime", false);
                var peg$e95 = peg$literalExpectation("Utctime", false);
                var peg$e96 = peg$literalExpectation("utctime", false);
                var peg$e97 = peg$literalExpectation("utcTime", false);
                var peg$e98 = peg$literalExpectation("UTCDate", false);
                var peg$e99 = peg$literalExpectation("UTCdate", false);
                var peg$e100 = peg$literalExpectation("UtcDate", false);
                var peg$e101 = peg$literalExpectation("Utcdate", false);
                var peg$e102 = peg$literalExpectation("utcdate", false);
                var peg$e103 = peg$literalExpectation("utcDate", false);
                var peg$e104 = peg$literalExpectation("TimeControl", false);
                var peg$e105 = peg$literalExpectation("Timecontrol", false);
                var peg$e106 = peg$literalExpectation("timecontrol", false);
                var peg$e107 = peg$literalExpectation("timeControl", false);
                var peg$e108 = peg$literalExpectation("SetUp", false);
                var peg$e109 = peg$literalExpectation("Setup", false);
                var peg$e110 = peg$literalExpectation("setup", false);
                var peg$e111 = peg$literalExpectation("setUp", false);
                var peg$e112 = peg$literalExpectation("FEN", false);
                var peg$e113 = peg$literalExpectation("Fen", false);
                var peg$e114 = peg$literalExpectation("fen", false);
                var peg$e115 = peg$literalExpectation("Termination", false);
                var peg$e116 = peg$literalExpectation("termination", false);
                var peg$e117 = peg$literalExpectation("Annotator", false);
                var peg$e118 = peg$literalExpectation("annotator", false);
                var peg$e119 = peg$literalExpectation("Mode", false);
                var peg$e120 = peg$literalExpectation("mode", false);
                var peg$e121 = peg$literalExpectation("PlyCount", false);
                var peg$e122 = peg$literalExpectation("Plycount", false);
                var peg$e123 = peg$literalExpectation("plycount", false);
                var peg$e124 = peg$literalExpectation("plyCount", false);
                var peg$e125 = peg$literalExpectation("Variant", false);
                var peg$e126 = peg$literalExpectation("variant", false);
                var peg$e127 = peg$literalExpectation("WhiteRatingDiff", false);
                var peg$e128 = peg$literalExpectation("BlackRatingDiff", false);
                var peg$e129 = peg$literalExpectation("WhiteFideId", false);
                var peg$e130 = peg$literalExpectation("BlackFideId", false);
                var peg$e131 = peg$literalExpectation("WhiteTeam", false);
                var peg$e132 = peg$literalExpectation("BlackTeam", false);
                var peg$e133 = peg$literalExpectation("Clock", false);
                var peg$e134 = peg$literalExpectation("WhiteClock", false);
                var peg$e135 = peg$literalExpectation("BlackClock", false);
                var peg$e136 = peg$otherExpectation("whitespace");
                var peg$e137 = peg$classExpectation([" ", "\t", "\n", "\r"], false, false);
                var peg$e138 = peg$classExpectation(["\n", "\r"], false, false);
                var peg$e140 = peg$classExpectation(["-", ["a", "z"], ["A", "Z"], ["0", "9"], "."], false, false);
                var peg$e141 = peg$literalExpectation("\"", false);
                var peg$e142 = peg$classExpectation(["\"", "\\", "\r", "\n"], true, false);
                var peg$e143 = peg$literalExpectation("\\", false);
                var peg$e144 = peg$classExpectation([["0", "9"], "?"], false, false);
                var peg$e145 = peg$literalExpectation(".", false);
                var peg$e146 = peg$classExpectation([["0", "9"]], false, false);
                var peg$e147 = peg$literalExpectation(":", false);
                var peg$e148 = peg$literalExpectation("/", false);
                var peg$e149 = peg$literalExpectation("B", false);
                var peg$e150 = peg$literalExpectation("W", false);
                var peg$e151 = peg$literalExpectation("N", false);
                var peg$e152 = peg$literalExpectation("?", false);
                var peg$e153 = peg$literalExpectation("-", false);
                var peg$e154 = peg$literalExpectation("+", false);
                var peg$e155 = peg$literalExpectation("*", false);
                var peg$e156 = peg$literalExpectation("1-0", false);
                var peg$e157 = peg$literalExpectation("0-1", false);
                var peg$e158 = peg$literalExpectation("1/2-1/2", false);
                var peg$e159 = peg$literalExpectation("=", false);
                var peg$e160 = peg$literalExpectation("%csl", false);
                var peg$e161 = peg$literalExpectation("%cal", false);
                var peg$e162 = peg$literalExpectation("%", false);
                var peg$e163 = peg$literalExpectation("%eval", false);
                var peg$e164 = peg$literalExpectation("[%", false);
                var peg$e165 = peg$literalExpectation("}", false);
                var peg$e166 = peg$anyExpectation();
                var peg$e167 = peg$classExpectation(["\n", "\r"], true, false);
                var peg$e168 = peg$literalExpectation(",", false);
                var peg$e169 = peg$literalExpectation("Y", false);
                var peg$e170 = peg$literalExpectation("G", false);
                var peg$e171 = peg$literalExpectation("R", false);
                var peg$e172 = peg$literalExpectation("{", false);
                var peg$e173 = peg$literalExpectation("[", false);
                var peg$e174 = peg$literalExpectation("]", false);
                var peg$e175 = peg$literalExpectation(";", false);
                var peg$e176 = peg$literalExpectation("clk", false);
                var peg$e177 = peg$literalExpectation("egt", false);
                var peg$e178 = peg$literalExpectation("emt", false);
                var peg$e179 = peg$literalExpectation("mct", false);
                var peg$e180 = peg$literalExpectation("(", false);
                var peg$e181 = peg$literalExpectation(")", false);
                var peg$e182 = peg$otherExpectation("integer");
                var peg$e183 = peg$literalExpectation(" ", false);
                var peg$e184 = peg$literalExpectation("e.p.", false);
                var peg$e185 = peg$literalExpectation("O-O-O", false);
                var peg$e186 = peg$literalExpectation("O-O", false);
                var peg$e187 = peg$literalExpectation("@", false);
                var peg$e188 = peg$literalExpectation("+-", false);
                var peg$e189 = peg$literalExpectation("$$$", false);
                var peg$e190 = peg$literalExpectation("#", false);
                var peg$e191 = peg$literalExpectation("$", false);
                var peg$e192 = peg$literalExpectation("!!", false);
                var peg$e193 = peg$literalExpectation("??", false);
                var peg$e194 = peg$literalExpectation("!?", false);
                var peg$e195 = peg$literalExpectation("?!", false);
                var peg$e196 = peg$literalExpectation("!", false);
                var peg$e197 = peg$literalExpectation("\u203C", false);
                var peg$e198 = peg$literalExpectation("\u2047", false);
                var peg$e199 = peg$literalExpectation("\u2049", false);
                var peg$e200 = peg$literalExpectation("\u2048", false);
                var peg$e201 = peg$literalExpectation("\u25A1", false);
                var peg$e202 = peg$literalExpectation("\u221E", false);
                var peg$e203 = peg$literalExpectation("\u2A72", false);
                var peg$e204 = peg$literalExpectation("\u2A71", false);
                var peg$e205 = peg$literalExpectation("\xB1", false);
                var peg$e206 = peg$literalExpectation("\u2213", false);
                var peg$e207 = peg$literalExpectation("-+", false);
                var peg$e208 = peg$literalExpectation("\u2A00", false);
                var peg$e209 = peg$literalExpectation("\u27F3", false);
                var peg$e210 = peg$literalExpectation("\u2192", false);
                var peg$e211 = peg$literalExpectation("\u2191", false);
                var peg$e212 = peg$literalExpectation("\u21C6", false);
                var peg$e213 = peg$literalExpectation("D", false);
                var peg$e214 = peg$classExpectation(["R", "N", "B", "Q", "K", "P"], false, false);
                var peg$e215 = peg$classExpectation(["R", "N", "B", "Q"], false, false);
                var peg$e216 = peg$classExpectation([["a", "h"]], false, false);
                var peg$e217 = peg$classExpectation([["1", "8"]], false, false);
                var peg$e218 = peg$literalExpectation("x", false);
                var peg$f0 = function (head, m) { return m; };
                var peg$f1 = function (head, tail) {
                    return [head].concat(tail);
                };
                var peg$f2 = function (games) {
                    return games;
                };
                var peg$f3 = function (t, c, p) {
                    var mess = messages;
                    messages = [];
                    return { tags: t, gameComment: c, moves: p, messages: mess };
                };
                var peg$f4 = function (head, m) { return m; };
                var peg$f5 = function (head, tail) {
                    var result = {};
                    [head].concat(tail).forEach(function (element) {
                        result[element.name] = element.value;
                    });
                    return result;
                };
                var peg$f6 = function (members) {
                    if (members === null)
                        return {};
                    members.messages = messages;
                    return members;
                };
                var peg$f7 = function (tag) { return tag; };
                var peg$f8 = function (value) { return { name: 'Event', value: value }; };
                var peg$f9 = function (value) { return { name: 'Site', value: value }; };
                var peg$f10 = function (value) { return { name: 'Date', value: value }; };
                var peg$f11 = function (value) { return { name: 'Round', value: value }; };
                var peg$f12 = function (value) { return { name: 'WhiteTitle', value: value }; };
                var peg$f13 = function (value) { return { name: 'BlackTitle', value: value }; };
                var peg$f14 = function (value) { return { name: 'WhiteElo', value: value }; };
                var peg$f15 = function (value) { return { name: 'BlackElo', value: value }; };
                var peg$f16 = function (value) { return { name: 'WhiteUSCF', value: value }; };
                var peg$f17 = function (value) { return { name: 'BlackUSCF', value: value }; };
                var peg$f18 = function (value) { return { name: 'WhiteNA', value: value }; };
                var peg$f19 = function (value) { return { name: 'BlackNA', value: value }; };
                var peg$f20 = function (value) { return { name: 'WhiteType', value: value }; };
                var peg$f21 = function (value) { return { name: 'BlackType', value: value }; };
                var peg$f22 = function (value) { return { name: 'White', value: value }; };
                var peg$f23 = function (value) { return { name: 'Black', value: value }; };
                var peg$f24 = function (value) { return { name: 'Result', value: value }; };
                var peg$f25 = function (value) { return { name: 'EventDate', value: value }; };
                var peg$f26 = function (value) { return { name: 'EventSponsor', value: value }; };
                var peg$f27 = function (value) { return { name: 'Section', value: value }; };
                var peg$f28 = function (value) { return { name: 'Stage', value: value }; };
                var peg$f29 = function (value) { return { name: 'Board', value: value }; };
                var peg$f30 = function (value) { return { name: 'Opening', value: value }; };
                var peg$f31 = function (value) { return { name: 'Variation', value: value }; };
                var peg$f32 = function (value) { return { name: 'SubVariation', value: value }; };
                var peg$f33 = function (value) { return { name: 'ECO', value: value }; };
                var peg$f34 = function (value) { return { name: 'NIC', value: value }; };
                var peg$f35 = function (value) { return { name: 'Time', value: value }; };
                var peg$f36 = function (value) { return { name: 'UTCTime', value: value }; };
                var peg$f37 = function (value) { return { name: 'UTCDate', value: value }; };
                var peg$f38 = function (value) { return { name: 'TimeControl', value: value }; };
                var peg$f39 = function (value) { return { name: 'SetUp', value: value }; };
                var peg$f40 = function (value) { return { name: 'FEN', value: value }; };
                var peg$f41 = function (value) { return { name: 'Termination', value: value }; };
                var peg$f42 = function (value) { return { name: 'Annotator', value: value }; };
                var peg$f43 = function (value) { return { name: 'Mode', value: value }; };
                var peg$f44 = function (value) { return { name: 'PlyCount', value: value }; };
                var peg$f45 = function (value) { return { name: 'Variant', value: value }; };
                var peg$f46 = function (value) { return { name: 'WhiteRatingDiff', value: value }; };
                var peg$f47 = function (value) { return { name: 'BlackRatingDiff', value: value }; };
                var peg$f48 = function (value) { return { name: 'WhiteFideId', value: value }; };
                var peg$f49 = function (value) { return { name: 'BlackFideId', value: value }; };
                var peg$f50 = function (value) { return { name: 'WhiteTeam', value: value }; };
                var peg$f51 = function (value) { return { name: 'BlackTeam', value: value }; };
                var peg$f52 = function (value) { return { name: 'Clock', value: value }; };
                var peg$f53 = function (value) { return { name: 'WhiteClock', value: value }; };
                var peg$f54 = function (value) { return { name: 'BlackClock', value: value }; };
                var peg$f55 = function (a, value) {
                    addMessage({ key: a, value: value, message: `Format of tag: "${a}" not correct: "${value}"` });
                    return { name: a, value: value };
                };
                var peg$f56 = function (a, value) {
                    addMessage({ key: a, value: value, message: `Tag: "${a}" not known: "${value}"` });
                    return { name: a, value: value };
                };
                var peg$f58 = function (chars) { return chars.join(""); };
                var peg$f59 = function (stringContent) { return stringContent.map(c => c.char || c).join(''); };
                var peg$f60 = function () { return { type: "char", char: "\\" }; };
                var peg$f61 = function () { return { type: "char", char: '"' }; };
                var peg$f62 = function (sequence) { return sequence; };
                var peg$f63 = function (year, month, day) {
                    let val = "" + year.join("") + '.' + month.join("") + '.' + day.join("");
                    return { value: val, year: mi(year), month: mi(month), day: mi(day) };
                };
                var peg$f64 = function (hour, minute, second, millis) {
                    let val = hour.join("") + ':' + minute.join("") + ':' + second.join("");
                    let ms = 0;
                    if (millis) {
                        val = val + '.' + millis;
                        addMessage({ message: `Unusual use of millis in time: ${val}` });
                        mi(millis);
                    }
                    return { value: val, hour: mi(hour), minute: mi(minute), second: mi(second), millis: ms };
                };
                var peg$f65 = function (millis) { return millis.join(""); };
                var peg$f66 = function (value) { return value; };
                var peg$f67 = function (c, t) { return c + '/' + t; };
                var peg$f68 = function (value) { return value; };
                var peg$f69 = function (value) { return value; };
                var peg$f70 = function (res) {
                    if (!res) {
                        addMessage({ message: "Tag TimeControl has to have a value" });
                        return "";
                    }
                    return res;
                };
                var peg$f71 = function (head, m) { return m; };
                var peg$f72 = function (head, tail) { return [head].concat(tail); };
                var peg$f73 = function (tcnqs) { return tcnqs; };
                var peg$f74 = function () { return { kind: 'unknown', value: '?' }; };
                var peg$f75 = function () { return { kind: 'unlimited', value: '-' }; };
                var peg$f76 = function (moves, seconds, incr) { return { kind: 'movesInSecondsIncrement', moves: moves, seconds: seconds, increment: incr }; };
                var peg$f77 = function (moves, seconds) { return { kind: 'movesInSeconds', moves: moves, seconds: seconds }; };
                var peg$f78 = function (seconds, incr) { return { kind: 'increment', seconds: seconds, increment: incr }; };
                var peg$f79 = function (seconds) { return { kind: 'suddenDeath', seconds: seconds }; };
                var peg$f80 = function (seconds) { return { kind: 'hourglass', seconds: seconds }; };
                var peg$f81 = function (res) { return res; };
                var peg$f82 = function (res) { return res; };
                var peg$f83 = function (res) { return res; };
                var peg$f84 = function (res) { return res; };
                var peg$f85 = function (res) { return res; };
                var peg$f86 = function (v) { return v; };
                var peg$f87 = function () { return 0; };
                var peg$f88 = function () { addMessage({ message: 'Use "-" for an unknown value' }); return 0; };
                var peg$f89 = function (digits) { return makeInteger(digits); };
                var peg$f90 = function (cm, mn, hm, nag, dr, ca, vari, all) {
                    var arr = (all ? all : []);
                    var move = {};
                    move.moveNumber = mn;
                    move.notation = hm;
                    if (ca) {
                        move.commentAfter = ca.comment;
                    }
                    if (cm) {
                        move.commentMove = cm.comment;
                    }
                    if (dr) {
                        move.drawOffer = true;
                    }
                    move.variations = (vari ? vari : []);
                    move.nag = (nag ? nag : null);
                    arr.unshift(move);
                    move.commentDiag = ca;
                    return arr;
                };
                var peg$f91 = function (e) { return e; };
                var peg$f92 = function (eg) { return [eg]; };
                var peg$f93 = function (cf, c) { return c; };
                var peg$f94 = function (cf, cfl) { return merge([cf].concat(cfl)); };
                var peg$f95 = function () { return; };
                var peg$f96 = function (cm) { return cm; };
                var peg$f97 = function (cm) { return { comment: cm }; };
                var peg$f98 = function (cf, ic) { return ic; };
                var peg$f99 = function (cf, tail) { return merge([{ colorFields: cf }].concat(tail[0])); };
                var peg$f100 = function (ca, ic) { return ic; };
                var peg$f101 = function (ca, tail) { return merge([{ colorArrows: ca }].concat(tail[0])); };
                var peg$f102 = function (cc, cv, ic) { return ic; };
                var peg$f103 = function (cc, cv, tail) { var ret = {}; ret[cc] = cv; return merge([ret].concat(tail[0])); };
                var peg$f104 = function (cc, cv, ic) { return ic; };
                var peg$f105 = function (cc, cv, tail) { var ret = {}; ret[cc] = cv; return merge([ret].concat(tail[0])); };
                var peg$f106 = function (ev, ic) { return ic; };
                var peg$f107 = function (ev, tail) { var ret = {}; ret["eval"] = parseFloat(ev); return merge([ret].concat(tail[0])); };
                var peg$f108 = function (ac, val, ic) { return ic; };
                var peg$f109 = function (ac, val, tail) { var ret = {}; ret[ac] = val.join(""); return merge([ret].concat(tail[0])); };
                var peg$f110 = function (c, ic) { return ic; };
                var peg$f111 = function (c, tail) {
                    if (tail.length > 0) {
                        return merge([{ comment: trimEnd(c.join("")) }].concat(trimStart(tail[0])));
                    }
                    else {
                        return { comment: c.join("") };
                    }
                };
                var peg$f112 = function (ch) { return ch; };
                var peg$f113 = function (ch) { return ch; };
                var peg$f114 = function (cm) { return cm.join(""); };
                var peg$f115 = function (cf, cfl) {
                    var arr = [];
                    arr.push(cf);
                    for (var i = 0; i < cfl.length; i++) {
                        arr.push(cfl[i][2]);
                    }
                    return arr;
                };
                var peg$f116 = function (col, f) { return col + f; };
                var peg$f117 = function (cf, cfl) {
                    var arr = [];
                    arr.push(cf);
                    for (var i = 0; i < cfl.length; i++) {
                        arr.push(cfl[i][2]);
                    }
                    return arr;
                };
                var peg$f118 = function (col, ff, ft) { return col + ff + ft; };
                var peg$f119 = function () { return "Y"; };
                var peg$f120 = function () { return "G"; };
                var peg$f121 = function () { return "R"; };
                var peg$f122 = function () { return "B"; };
                var peg$f123 = function (col, row) { return col + row; };
                var peg$f128 = function () { return "clk"; };
                var peg$f129 = function () { return "egt"; };
                var peg$f130 = function () { return "emt"; };
                var peg$f131 = function () { return "mct"; };
                var peg$f132 = function (hm, s1, s2, millis) {
                    let ret = s1;
                    if (!hm) {
                        addMessage({ message: `Hours and minutes missing` });
                    }
                    else {
                        ret = hm + ret;
                    }
                    if (hm && ((hm.match(/:/g) || []).length == 2)) {
                        if (hm.search(':') == 2) {
                            addMessage({ message: `Only 1 digit for hours normally used` });
                        }
                    }
                    if (!s2) {
                        addMessage({ message: `Only 2 digit for seconds normally used` });
                    }
                    else {
                        ret += s2;
                    }
                    if (millis) {
                        addMessage({ message: `Unusual use of millis in clock value` });
                        ret += '.' + millis;
                    }
                    return ret;
                };
                var peg$f133 = function (hm, s1, s2) {
                    let ret = s1;
                    if (!hm) {
                        addMessage({ message: `Hours and minutes missing` });
                    }
                    else {
                        ret = hm + ret;
                    }
                    if (hm && ((hm.match(/:/g) || []).length == 2)) {
                        if (hm.search(':') == 1) {
                            addMessage({ message: `Only 2 digits for hours normally used` });
                        }
                    }
                    if (!s2) {
                        addMessage({ message: `Only 2 digit for seconds normally used` });
                    }
                    else {
                        ret += s2;
                    }
                    return ret;
                };
                var peg$f134 = function (hours, minutes) {
                    if (!minutes) {
                        addMessage({ message: `No hours found` });
                        return hours;
                    }
                    return hours + minutes;
                };
                var peg$f135 = function (h1, h2) {
                    let ret = h1;
                    if (h2) {
                        ret += h2 + ":";
                    }
                    else {
                        ret += ":";
                    }
                    return ret;
                };
                var peg$f136 = function (m1, m2) {
                    let ret = m1;
                    if (m2) {
                        ret += m2 + ":";
                    }
                    else {
                        ret += ":";
                        addMessage({ message: `Only 2 digits for minutes normally used` });
                    }
                    return ret;
                };
                var peg$f137 = function (d) { return d; };
                var peg$f138 = function (vari, all) { var arr = (all ? all : []); arr.unshift(vari); return arr; };
                var peg$f139 = function (num) { return num; };
                var peg$f140 = function (digits) { return makeInteger(digits); };
                var peg$f141 = function () { return ''; };
                var peg$f142 = function (fig, disc, str, col, row, pr, ch) {
                    var hm = {};
                    hm.fig = (fig ? fig : null);
                    hm.disc = (disc ? disc : null);
                    hm.strike = (str ? str : null);
                    hm.col = col;
                    hm.row = row;
                    hm.check = (ch ? ch : null);
                    hm.promotion = pr;
                    hm.notation = (fig ? fig : "") + (disc ? disc : "") + (str ? str : "") + col + row + (pr ? pr : "") + (ch ? ch : "");
                    return hm;
                };
                var peg$f143 = function (fig, cols, rows, str, col, row, pr, ch) {
                    var hm = {};
                    hm.fig = (fig ? fig : null);
                    hm.strike = (str == 'x' ? str : null);
                    hm.col = col;
                    hm.row = row;
                    hm.notation = (fig && (fig !== 'P') ? fig : "") + cols + rows + (str == 'x' ? str : "-") + col + row + (pr ? pr : "") + (ch ? ch : "");
                    hm.check = (ch ? ch : null);
                    hm.promotion = pr;
                    return hm;
                };
                var peg$f144 = function (fig, str, col, row, pr, ch) {
                    var hm = {};
                    hm.fig = (fig ? fig : null);
                    hm.strike = (str ? str : null);
                    hm.col = col;
                    hm.row = row;
                    hm.check = (ch ? ch : null);
                    hm.promotion = pr;
                    hm.notation = (fig ? fig : "") + (str ? str : "") + col + row + (pr ? pr : "") + (ch ? ch : "");
                    return hm;
                };
                var peg$f145 = function (ch) { var hm = {}; hm.notation = 'O-O-O' + (ch ? ch : ""); hm.check = (ch ? ch : null); return hm; };
                var peg$f146 = function (ch) { var hm = {}; hm.notation = 'O-O' + (ch ? ch : ""); hm.check = (ch ? ch : null); return hm; };
                var peg$f147 = function (fig, col, row) { var hm = {}; hm.fig = fig; hm.drop = true; hm.col = col; hm.row = row; hm.notation = fig + '@' + col + row; return hm; };
                var peg$f148 = function (ch) { return ch[1]; };
                var peg$f149 = function (ch) { return ch[1]; };
                var peg$f150 = function (f) { return '=' + f; };
                var peg$f151 = function (nag, nags) { var arr = (nags ? nags : []); arr.unshift(nag); return arr; };
                var peg$f152 = function (num) { return '$' + num; };
                var peg$f153 = function () { return '$3'; };
                var peg$f154 = function () { return '$4'; };
                var peg$f155 = function () { return '$5'; };
                var peg$f156 = function () { return '$6'; };
                var peg$f157 = function () { return '$1'; };
                var peg$f158 = function () { return '$2'; };
                var peg$f159 = function () { return '$3'; };
                var peg$f160 = function () { return '$4'; };
                var peg$f161 = function () { return '$5'; };
                var peg$f162 = function () { return '$6'; };
                var peg$f163 = function () { return '$7'; };
                var peg$f164 = function () { return '$10'; };
                var peg$f165 = function () { return '$13'; };
                var peg$f166 = function () { return '$14'; };
                var peg$f167 = function () { return '$15'; };
                var peg$f168 = function () { return '$16'; };
                var peg$f169 = function () { return '$17'; };
                var peg$f170 = function () { return '$18'; };
                var peg$f171 = function () { return '$19'; };
                var peg$f172 = function () { return '$22'; };
                var peg$f173 = function () { return '$32'; };
                var peg$f174 = function () { return '$36'; };
                var peg$f175 = function () { return '$40'; };
                var peg$f176 = function () { return '$132'; };
                var peg$f177 = function () { return '$220'; };
                var peg$currPos = 0;
                var peg$savedPos = 0;
                var peg$posDetailsCache = [{ line: 1, column: 1 }];
                var peg$maxFailPos = 0;
                var peg$maxFailExpected = [];
                var peg$silentFails = 0;
                var peg$result;
                if ("startRule" in options) {
                    if (!(options.startRule in peg$startRuleFunctions)) {
                        throw new Error("Can't start parsing from rule \"" + options.startRule + "\".");
                    }
                    peg$startRuleFunction = peg$startRuleFunctions[options.startRule];
                }
                function location() {
                    return peg$computeLocation(peg$savedPos, peg$currPos);
                }
                function peg$literalExpectation(text, ignoreCase) {
                    return { type: "literal", text: text, ignoreCase: ignoreCase };
                }
                function peg$classExpectation(parts, inverted, ignoreCase) {
                    return { type: "class", parts: parts, inverted: inverted, ignoreCase: ignoreCase };
                }
                function peg$anyExpectation() {
                    return { type: "any" };
                }
                function peg$endExpectation() {
                    return { type: "end" };
                }
                function peg$otherExpectation(description) {
                    return { type: "other", description: description };
                }
                function peg$computePosDetails(pos) {
                    var details = peg$posDetailsCache[pos];
                    var p;
                    if (details) {
                        return details;
                    }
                    else {
                        p = pos - 1;
                        while (!peg$posDetailsCache[p]) {
                            p--;
                        }
                        details = peg$posDetailsCache[p];
                        details = {
                            line: details.line,
                            column: details.column
                        };
                        while (p < pos) {
                            if (input.charCodeAt(p) === 10) {
                                details.line++;
                                details.column = 1;
                            }
                            else {
                                details.column++;
                            }
                            p++;
                        }
                        peg$posDetailsCache[pos] = details;
                        return details;
                    }
                }
                function peg$computeLocation(startPos, endPos, offset) {
                    var startPosDetails = peg$computePosDetails(startPos);
                    var endPosDetails = peg$computePosDetails(endPos);
                    var res = {
                        source: peg$source,
                        start: {
                            offset: startPos,
                            line: startPosDetails.line,
                            column: startPosDetails.column
                        },
                        end: {
                            offset: endPos,
                            line: endPosDetails.line,
                            column: endPosDetails.column
                        }
                    };
                    if (offset && peg$source && (typeof peg$source.offset === "function")) {
                        res.start = peg$source.offset(res.start);
                        res.end = peg$source.offset(res.end);
                    }
                    return res;
                }
                function peg$fail(expected) {
                    if (peg$currPos < peg$maxFailPos) {
                        return;
                    }
                    if (peg$currPos > peg$maxFailPos) {
                        peg$maxFailPos = peg$currPos;
                        peg$maxFailExpected = [];
                    }
                    peg$maxFailExpected.push(expected);
                }
                function peg$buildStructuredError(expected, found, location) {
                    return new peg$SyntaxError(peg$SyntaxError.buildMessage(expected, found), expected, found, location);
                }
                function peg$parsegames() {
                    var s0, s2, s3, s4, s5, s7;
                    s0 = peg$currPos;
                    peg$parsews();
                    s2 = peg$currPos;
                    s3 = peg$parsegame();
                    if (s3 !== peg$FAILED) {
                        s4 = [];
                        s5 = peg$currPos;
                        peg$parsews();
                        s7 = peg$parsegame();
                        if (s7 !== peg$FAILED) {
                            peg$savedPos = s5;
                            s5 = peg$f0(s3, s7);
                        }
                        else {
                            peg$currPos = s5;
                            s5 = peg$FAILED;
                        }
                        while (s5 !== peg$FAILED) {
                            s4.push(s5);
                            s5 = peg$currPos;
                            peg$parsews();
                            s7 = peg$parsegame();
                            if (s7 !== peg$FAILED) {
                                peg$savedPos = s5;
                                s5 = peg$f0(s3, s7);
                            }
                            else {
                                peg$currPos = s5;
                                s5 = peg$FAILED;
                            }
                        }
                        peg$savedPos = s2;
                        s2 = peg$f1(s3, s4);
                    }
                    else {
                        peg$currPos = s2;
                        s2 = peg$FAILED;
                    }
                    if (s2 === peg$FAILED) {
                        s2 = null;
                    }
                    peg$savedPos = s0;
                    s0 = peg$f2(s2);
                    return s0;
                }
                function peg$parsegame() {
                    var s0, s1, s2, s3;
                    s0 = peg$currPos;
                    s1 = peg$parsetags();
                    s2 = peg$parsecomments();
                    if (s2 === peg$FAILED) {
                        s2 = null;
                    }
                    s3 = peg$parsepgn();
                    if (s3 !== peg$FAILED) {
                        peg$savedPos = s0;
                        s0 = peg$f3(s1, s2, s3);
                    }
                    else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                    }
                    return s0;
                }
                function peg$parsetags() {
                    var s0, s2, s3, s4, s5, s7;
                    s0 = peg$currPos;
                    peg$parsews();
                    s2 = peg$currPos;
                    s3 = peg$parsetag();
                    if (s3 !== peg$FAILED) {
                        s4 = [];
                        s5 = peg$currPos;
                        peg$parsews();
                        s7 = peg$parsetag();
                        if (s7 !== peg$FAILED) {
                            peg$savedPos = s5;
                            s5 = peg$f4(s3, s7);
                        }
                        else {
                            peg$currPos = s5;
                            s5 = peg$FAILED;
                        }
                        while (s5 !== peg$FAILED) {
                            s4.push(s5);
                            s5 = peg$currPos;
                            peg$parsews();
                            s7 = peg$parsetag();
                            if (s7 !== peg$FAILED) {
                                peg$savedPos = s5;
                                s5 = peg$f4(s3, s7);
                            }
                            else {
                                peg$currPos = s5;
                                s5 = peg$FAILED;
                            }
                        }
                        peg$savedPos = s2;
                        s2 = peg$f5(s3, s4);
                    }
                    else {
                        peg$currPos = s2;
                        s2 = peg$FAILED;
                    }
                    if (s2 === peg$FAILED) {
                        s2 = null;
                    }
                    s3 = peg$parsews();
                    peg$savedPos = s0;
                    s0 = peg$f6(s2);
                    return s0;
                }
                function peg$parsetag() {
                    var s0, s1, s3, s5;
                    s0 = peg$currPos;
                    s1 = peg$parsebl();
                    if (s1 !== peg$FAILED) {
                        peg$parsews();
                        s3 = peg$parsetagKeyValue();
                        if (s3 !== peg$FAILED) {
                            peg$parsews();
                            s5 = peg$parsebr();
                            if (s5 !== peg$FAILED) {
                                peg$savedPos = s0;
                                s0 = peg$f7(s3);
                            }
                            else {
                                peg$currPos = s0;
                                s0 = peg$FAILED;
                            }
                        }
                        else {
                            peg$currPos = s0;
                            s0 = peg$FAILED;
                        }
                    }
                    else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                    }
                    return s0;
                }
                function peg$parsetagKeyValue() {
                    var s0, s1, s2, s3, s4;
                    s0 = peg$currPos;
                    s1 = peg$parseeventKey();
                    if (s1 !== peg$FAILED) {
                        s2 = peg$parsews();
                        s3 = peg$parsestring();
                        if (s3 !== peg$FAILED) {
                            peg$savedPos = s0;
                            s0 = peg$f8(s3);
                        }
                        else {
                            peg$currPos = s0;
                            s0 = peg$FAILED;
                        }
                    }
                    else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                    }
                    if (s0 === peg$FAILED) {
                        s0 = peg$currPos;
                        s1 = peg$parsesiteKey();
                        if (s1 !== peg$FAILED) {
                            s2 = peg$parsews();
                            s3 = peg$parsestring();
                            if (s3 !== peg$FAILED) {
                                peg$savedPos = s0;
                                s0 = peg$f9(s3);
                            }
                            else {
                                peg$currPos = s0;
                                s0 = peg$FAILED;
                            }
                        }
                        else {
                            peg$currPos = s0;
                            s0 = peg$FAILED;
                        }
                        if (s0 === peg$FAILED) {
                            s0 = peg$currPos;
                            s1 = peg$parsedateKey();
                            if (s1 !== peg$FAILED) {
                                s2 = peg$parsews();
                                s3 = peg$parsedateString();
                                if (s3 !== peg$FAILED) {
                                    peg$savedPos = s0;
                                    s0 = peg$f10(s3);
                                }
                                else {
                                    peg$currPos = s0;
                                    s0 = peg$FAILED;
                                }
                            }
                            else {
                                peg$currPos = s0;
                                s0 = peg$FAILED;
                            }
                            if (s0 === peg$FAILED) {
                                s0 = peg$currPos;
                                s1 = peg$parseroundKey();
                                if (s1 !== peg$FAILED) {
                                    s2 = peg$parsews();
                                    s3 = peg$parsestring();
                                    if (s3 !== peg$FAILED) {
                                        peg$savedPos = s0;
                                        s0 = peg$f11(s3);
                                    }
                                    else {
                                        peg$currPos = s0;
                                        s0 = peg$FAILED;
                                    }
                                }
                                else {
                                    peg$currPos = s0;
                                    s0 = peg$FAILED;
                                }
                                if (s0 === peg$FAILED) {
                                    s0 = peg$currPos;
                                    s1 = peg$parsewhiteTitleKey();
                                    if (s1 !== peg$FAILED) {
                                        s2 = peg$parsews();
                                        s3 = peg$parsestring();
                                        if (s3 !== peg$FAILED) {
                                            peg$savedPos = s0;
                                            s0 = peg$f12(s3);
                                        }
                                        else {
                                            peg$currPos = s0;
                                            s0 = peg$FAILED;
                                        }
                                    }
                                    else {
                                        peg$currPos = s0;
                                        s0 = peg$FAILED;
                                    }
                                    if (s0 === peg$FAILED) {
                                        s0 = peg$currPos;
                                        s1 = peg$parseblackTitleKey();
                                        if (s1 !== peg$FAILED) {
                                            s2 = peg$parsews();
                                            s3 = peg$parsestring();
                                            if (s3 !== peg$FAILED) {
                                                peg$savedPos = s0;
                                                s0 = peg$f13(s3);
                                            }
                                            else {
                                                peg$currPos = s0;
                                                s0 = peg$FAILED;
                                            }
                                        }
                                        else {
                                            peg$currPos = s0;
                                            s0 = peg$FAILED;
                                        }
                                        if (s0 === peg$FAILED) {
                                            s0 = peg$currPos;
                                            s1 = peg$parsewhiteEloKey();
                                            if (s1 !== peg$FAILED) {
                                                s2 = peg$parsews();
                                                s3 = peg$parseintegerOrDashString();
                                                if (s3 !== peg$FAILED) {
                                                    peg$savedPos = s0;
                                                    s0 = peg$f14(s3);
                                                }
                                                else {
                                                    peg$currPos = s0;
                                                    s0 = peg$FAILED;
                                                }
                                            }
                                            else {
                                                peg$currPos = s0;
                                                s0 = peg$FAILED;
                                            }
                                            if (s0 === peg$FAILED) {
                                                s0 = peg$currPos;
                                                s1 = peg$parseblackEloKey();
                                                if (s1 !== peg$FAILED) {
                                                    s2 = peg$parsews();
                                                    s3 = peg$parseintegerOrDashString();
                                                    if (s3 !== peg$FAILED) {
                                                        peg$savedPos = s0;
                                                        s0 = peg$f15(s3);
                                                    }
                                                    else {
                                                        peg$currPos = s0;
                                                        s0 = peg$FAILED;
                                                    }
                                                }
                                                else {
                                                    peg$currPos = s0;
                                                    s0 = peg$FAILED;
                                                }
                                                if (s0 === peg$FAILED) {
                                                    s0 = peg$currPos;
                                                    s1 = peg$parsewhiteUSCFKey();
                                                    if (s1 !== peg$FAILED) {
                                                        s2 = peg$parsews();
                                                        s3 = peg$parseintegerString();
                                                        if (s3 !== peg$FAILED) {
                                                            peg$savedPos = s0;
                                                            s0 = peg$f16(s3);
                                                        }
                                                        else {
                                                            peg$currPos = s0;
                                                            s0 = peg$FAILED;
                                                        }
                                                    }
                                                    else {
                                                        peg$currPos = s0;
                                                        s0 = peg$FAILED;
                                                    }
                                                    if (s0 === peg$FAILED) {
                                                        s0 = peg$currPos;
                                                        s1 = peg$parseblackUSCFKey();
                                                        if (s1 !== peg$FAILED) {
                                                            s2 = peg$parsews();
                                                            s3 = peg$parseintegerString();
                                                            if (s3 !== peg$FAILED) {
                                                                peg$savedPos = s0;
                                                                s0 = peg$f17(s3);
                                                            }
                                                            else {
                                                                peg$currPos = s0;
                                                                s0 = peg$FAILED;
                                                            }
                                                        }
                                                        else {
                                                            peg$currPos = s0;
                                                            s0 = peg$FAILED;
                                                        }
                                                        if (s0 === peg$FAILED) {
                                                            s0 = peg$currPos;
                                                            s1 = peg$parsewhiteNAKey();
                                                            if (s1 !== peg$FAILED) {
                                                                s2 = peg$parsews();
                                                                s3 = peg$parsestring();
                                                                if (s3 !== peg$FAILED) {
                                                                    peg$savedPos = s0;
                                                                    s0 = peg$f18(s3);
                                                                }
                                                                else {
                                                                    peg$currPos = s0;
                                                                    s0 = peg$FAILED;
                                                                }
                                                            }
                                                            else {
                                                                peg$currPos = s0;
                                                                s0 = peg$FAILED;
                                                            }
                                                            if (s0 === peg$FAILED) {
                                                                s0 = peg$currPos;
                                                                s1 = peg$parseblackNAKey();
                                                                if (s1 !== peg$FAILED) {
                                                                    s2 = peg$parsews();
                                                                    s3 = peg$parsestring();
                                                                    if (s3 !== peg$FAILED) {
                                                                        peg$savedPos = s0;
                                                                        s0 = peg$f19(s3);
                                                                    }
                                                                    else {
                                                                        peg$currPos = s0;
                                                                        s0 = peg$FAILED;
                                                                    }
                                                                }
                                                                else {
                                                                    peg$currPos = s0;
                                                                    s0 = peg$FAILED;
                                                                }
                                                                if (s0 === peg$FAILED) {
                                                                    s0 = peg$currPos;
                                                                    s1 = peg$parsewhiteTypeKey();
                                                                    if (s1 !== peg$FAILED) {
                                                                        s2 = peg$parsews();
                                                                        s3 = peg$parsestring();
                                                                        if (s3 !== peg$FAILED) {
                                                                            peg$savedPos = s0;
                                                                            s0 = peg$f20(s3);
                                                                        }
                                                                        else {
                                                                            peg$currPos = s0;
                                                                            s0 = peg$FAILED;
                                                                        }
                                                                    }
                                                                    else {
                                                                        peg$currPos = s0;
                                                                        s0 = peg$FAILED;
                                                                    }
                                                                    if (s0 === peg$FAILED) {
                                                                        s0 = peg$currPos;
                                                                        s1 = peg$parseblackTypeKey();
                                                                        if (s1 !== peg$FAILED) {
                                                                            s2 = peg$parsews();
                                                                            s3 = peg$parsestring();
                                                                            if (s3 !== peg$FAILED) {
                                                                                peg$savedPos = s0;
                                                                                s0 = peg$f21(s3);
                                                                            }
                                                                            else {
                                                                                peg$currPos = s0;
                                                                                s0 = peg$FAILED;
                                                                            }
                                                                        }
                                                                        else {
                                                                            peg$currPos = s0;
                                                                            s0 = peg$FAILED;
                                                                        }
                                                                        if (s0 === peg$FAILED) {
                                                                            s0 = peg$currPos;
                                                                            s1 = peg$parsewhiteKey();
                                                                            if (s1 !== peg$FAILED) {
                                                                                s2 = peg$parsews();
                                                                                s3 = peg$parsestring();
                                                                                if (s3 !== peg$FAILED) {
                                                                                    peg$savedPos = s0;
                                                                                    s0 = peg$f22(s3);
                                                                                }
                                                                                else {
                                                                                    peg$currPos = s0;
                                                                                    s0 = peg$FAILED;
                                                                                }
                                                                            }
                                                                            else {
                                                                                peg$currPos = s0;
                                                                                s0 = peg$FAILED;
                                                                            }
                                                                            if (s0 === peg$FAILED) {
                                                                                s0 = peg$currPos;
                                                                                s1 = peg$parseblackKey();
                                                                                if (s1 !== peg$FAILED) {
                                                                                    s2 = peg$parsews();
                                                                                    s3 = peg$parsestring();
                                                                                    if (s3 !== peg$FAILED) {
                                                                                        peg$savedPos = s0;
                                                                                        s0 = peg$f23(s3);
                                                                                    }
                                                                                    else {
                                                                                        peg$currPos = s0;
                                                                                        s0 = peg$FAILED;
                                                                                    }
                                                                                }
                                                                                else {
                                                                                    peg$currPos = s0;
                                                                                    s0 = peg$FAILED;
                                                                                }
                                                                                if (s0 === peg$FAILED) {
                                                                                    s0 = peg$currPos;
                                                                                    s1 = peg$parseresultKey();
                                                                                    if (s1 !== peg$FAILED) {
                                                                                        s2 = peg$parsews();
                                                                                        s3 = peg$parseresult();
                                                                                        if (s3 !== peg$FAILED) {
                                                                                            peg$savedPos = s0;
                                                                                            s0 = peg$f24(s3);
                                                                                        }
                                                                                        else {
                                                                                            peg$currPos = s0;
                                                                                            s0 = peg$FAILED;
                                                                                        }
                                                                                    }
                                                                                    else {
                                                                                        peg$currPos = s0;
                                                                                        s0 = peg$FAILED;
                                                                                    }
                                                                                    if (s0 === peg$FAILED) {
                                                                                        s0 = peg$currPos;
                                                                                        s1 = peg$parseeventDateKey();
                                                                                        if (s1 !== peg$FAILED) {
                                                                                            s2 = peg$parsews();
                                                                                            s3 = peg$parsedateString();
                                                                                            if (s3 !== peg$FAILED) {
                                                                                                peg$savedPos = s0;
                                                                                                s0 = peg$f25(s3);
                                                                                            }
                                                                                            else {
                                                                                                peg$currPos = s0;
                                                                                                s0 = peg$FAILED;
                                                                                            }
                                                                                        }
                                                                                        else {
                                                                                            peg$currPos = s0;
                                                                                            s0 = peg$FAILED;
                                                                                        }
                                                                                        if (s0 === peg$FAILED) {
                                                                                            s0 = peg$currPos;
                                                                                            s1 = peg$parseeventSponsorKey();
                                                                                            if (s1 !== peg$FAILED) {
                                                                                                s2 = peg$parsews();
                                                                                                s3 = peg$parsestring();
                                                                                                if (s3 !== peg$FAILED) {
                                                                                                    peg$savedPos = s0;
                                                                                                    s0 = peg$f26(s3);
                                                                                                }
                                                                                                else {
                                                                                                    peg$currPos = s0;
                                                                                                    s0 = peg$FAILED;
                                                                                                }
                                                                                            }
                                                                                            else {
                                                                                                peg$currPos = s0;
                                                                                                s0 = peg$FAILED;
                                                                                            }
                                                                                            if (s0 === peg$FAILED) {
                                                                                                s0 = peg$currPos;
                                                                                                s1 = peg$parsesectionKey();
                                                                                                if (s1 !== peg$FAILED) {
                                                                                                    s2 = peg$parsews();
                                                                                                    s3 = peg$parsestring();
                                                                                                    if (s3 !== peg$FAILED) {
                                                                                                        peg$savedPos = s0;
                                                                                                        s0 = peg$f27(s3);
                                                                                                    }
                                                                                                    else {
                                                                                                        peg$currPos = s0;
                                                                                                        s0 = peg$FAILED;
                                                                                                    }
                                                                                                }
                                                                                                else {
                                                                                                    peg$currPos = s0;
                                                                                                    s0 = peg$FAILED;
                                                                                                }
                                                                                                if (s0 === peg$FAILED) {
                                                                                                    s0 = peg$currPos;
                                                                                                    s1 = peg$parsestageKey();
                                                                                                    if (s1 !== peg$FAILED) {
                                                                                                        s2 = peg$parsews();
                                                                                                        s3 = peg$parsestring();
                                                                                                        if (s3 !== peg$FAILED) {
                                                                                                            peg$savedPos = s0;
                                                                                                            s0 = peg$f28(s3);
                                                                                                        }
                                                                                                        else {
                                                                                                            peg$currPos = s0;
                                                                                                            s0 = peg$FAILED;
                                                                                                        }
                                                                                                    }
                                                                                                    else {
                                                                                                        peg$currPos = s0;
                                                                                                        s0 = peg$FAILED;
                                                                                                    }
                                                                                                    if (s0 === peg$FAILED) {
                                                                                                        s0 = peg$currPos;
                                                                                                        s1 = peg$parseboardKey();
                                                                                                        if (s1 !== peg$FAILED) {
                                                                                                            s2 = peg$parsews();
                                                                                                            s3 = peg$parseintegerString();
                                                                                                            if (s3 !== peg$FAILED) {
                                                                                                                peg$savedPos = s0;
                                                                                                                s0 = peg$f29(s3);
                                                                                                            }
                                                                                                            else {
                                                                                                                peg$currPos = s0;
                                                                                                                s0 = peg$FAILED;
                                                                                                            }
                                                                                                        }
                                                                                                        else {
                                                                                                            peg$currPos = s0;
                                                                                                            s0 = peg$FAILED;
                                                                                                        }
                                                                                                        if (s0 === peg$FAILED) {
                                                                                                            s0 = peg$currPos;
                                                                                                            s1 = peg$parseopeningKey();
                                                                                                            if (s1 !== peg$FAILED) {
                                                                                                                s2 = peg$parsews();
                                                                                                                s3 = peg$parsestring();
                                                                                                                if (s3 !== peg$FAILED) {
                                                                                                                    peg$savedPos = s0;
                                                                                                                    s0 = peg$f30(s3);
                                                                                                                }
                                                                                                                else {
                                                                                                                    peg$currPos = s0;
                                                                                                                    s0 = peg$FAILED;
                                                                                                                }
                                                                                                            }
                                                                                                            else {
                                                                                                                peg$currPos = s0;
                                                                                                                s0 = peg$FAILED;
                                                                                                            }
                                                                                                            if (s0 === peg$FAILED) {
                                                                                                                s0 = peg$currPos;
                                                                                                                s1 = peg$parsevariationKey();
                                                                                                                if (s1 !== peg$FAILED) {
                                                                                                                    s2 = peg$parsews();
                                                                                                                    s3 = peg$parsestring();
                                                                                                                    if (s3 !== peg$FAILED) {
                                                                                                                        peg$savedPos = s0;
                                                                                                                        s0 = peg$f31(s3);
                                                                                                                    }
                                                                                                                    else {
                                                                                                                        peg$currPos = s0;
                                                                                                                        s0 = peg$FAILED;
                                                                                                                    }
                                                                                                                }
                                                                                                                else {
                                                                                                                    peg$currPos = s0;
                                                                                                                    s0 = peg$FAILED;
                                                                                                                }
                                                                                                                if (s0 === peg$FAILED) {
                                                                                                                    s0 = peg$currPos;
                                                                                                                    s1 = peg$parsesubVariationKey();
                                                                                                                    if (s1 !== peg$FAILED) {
                                                                                                                        s2 = peg$parsews();
                                                                                                                        s3 = peg$parsestring();
                                                                                                                        if (s3 !== peg$FAILED) {
                                                                                                                            peg$savedPos = s0;
                                                                                                                            s0 = peg$f32(s3);
                                                                                                                        }
                                                                                                                        else {
                                                                                                                            peg$currPos = s0;
                                                                                                                            s0 = peg$FAILED;
                                                                                                                        }
                                                                                                                    }
                                                                                                                    else {
                                                                                                                        peg$currPos = s0;
                                                                                                                        s0 = peg$FAILED;
                                                                                                                    }
                                                                                                                    if (s0 === peg$FAILED) {
                                                                                                                        s0 = peg$currPos;
                                                                                                                        s1 = peg$parseecoKey();
                                                                                                                        if (s1 !== peg$FAILED) {
                                                                                                                            s2 = peg$parsews();
                                                                                                                            s3 = peg$parsestring();
                                                                                                                            if (s3 !== peg$FAILED) {
                                                                                                                                peg$savedPos = s0;
                                                                                                                                s0 = peg$f33(s3);
                                                                                                                            }
                                                                                                                            else {
                                                                                                                                peg$currPos = s0;
                                                                                                                                s0 = peg$FAILED;
                                                                                                                            }
                                                                                                                        }
                                                                                                                        else {
                                                                                                                            peg$currPos = s0;
                                                                                                                            s0 = peg$FAILED;
                                                                                                                        }
                                                                                                                        if (s0 === peg$FAILED) {
                                                                                                                            s0 = peg$currPos;
                                                                                                                            s1 = peg$parsenicKey();
                                                                                                                            if (s1 !== peg$FAILED) {
                                                                                                                                s2 = peg$parsews();
                                                                                                                                s3 = peg$parsestring();
                                                                                                                                if (s3 !== peg$FAILED) {
                                                                                                                                    peg$savedPos = s0;
                                                                                                                                    s0 = peg$f34(s3);
                                                                                                                                }
                                                                                                                                else {
                                                                                                                                    peg$currPos = s0;
                                                                                                                                    s0 = peg$FAILED;
                                                                                                                                }
                                                                                                                            }
                                                                                                                            else {
                                                                                                                                peg$currPos = s0;
                                                                                                                                s0 = peg$FAILED;
                                                                                                                            }
                                                                                                                            if (s0 === peg$FAILED) {
                                                                                                                                s0 = peg$currPos;
                                                                                                                                s1 = peg$parsetimeKey();
                                                                                                                                if (s1 !== peg$FAILED) {
                                                                                                                                    s2 = peg$parsews();
                                                                                                                                    s3 = peg$parsetimeString();
                                                                                                                                    if (s3 !== peg$FAILED) {
                                                                                                                                        peg$savedPos = s0;
                                                                                                                                        s0 = peg$f35(s3);
                                                                                                                                    }
                                                                                                                                    else {
                                                                                                                                        peg$currPos = s0;
                                                                                                                                        s0 = peg$FAILED;
                                                                                                                                    }
                                                                                                                                }
                                                                                                                                else {
                                                                                                                                    peg$currPos = s0;
                                                                                                                                    s0 = peg$FAILED;
                                                                                                                                }
                                                                                                                                if (s0 === peg$FAILED) {
                                                                                                                                    s0 = peg$currPos;
                                                                                                                                    s1 = peg$parseutcTimeKey();
                                                                                                                                    if (s1 !== peg$FAILED) {
                                                                                                                                        s2 = peg$parsews();
                                                                                                                                        s3 = peg$parsetimeString();
                                                                                                                                        if (s3 !== peg$FAILED) {
                                                                                                                                            peg$savedPos = s0;
                                                                                                                                            s0 = peg$f36(s3);
                                                                                                                                        }
                                                                                                                                        else {
                                                                                                                                            peg$currPos = s0;
                                                                                                                                            s0 = peg$FAILED;
                                                                                                                                        }
                                                                                                                                    }
                                                                                                                                    else {
                                                                                                                                        peg$currPos = s0;
                                                                                                                                        s0 = peg$FAILED;
                                                                                                                                    }
                                                                                                                                    if (s0 === peg$FAILED) {
                                                                                                                                        s0 = peg$currPos;
                                                                                                                                        s1 = peg$parseutcDateKey();
                                                                                                                                        if (s1 !== peg$FAILED) {
                                                                                                                                            s2 = peg$parsews();
                                                                                                                                            s3 = peg$parsedateString();
                                                                                                                                            if (s3 !== peg$FAILED) {
                                                                                                                                                peg$savedPos = s0;
                                                                                                                                                s0 = peg$f37(s3);
                                                                                                                                            }
                                                                                                                                            else {
                                                                                                                                                peg$currPos = s0;
                                                                                                                                                s0 = peg$FAILED;
                                                                                                                                            }
                                                                                                                                        }
                                                                                                                                        else {
                                                                                                                                            peg$currPos = s0;
                                                                                                                                            s0 = peg$FAILED;
                                                                                                                                        }
                                                                                                                                        if (s0 === peg$FAILED) {
                                                                                                                                            s0 = peg$currPos;
                                                                                                                                            s1 = peg$parsetimeControlKey();
                                                                                                                                            if (s1 !== peg$FAILED) {
                                                                                                                                                s2 = peg$parsews();
                                                                                                                                                s3 = peg$parsetimeControl();
                                                                                                                                                if (s3 !== peg$FAILED) {
                                                                                                                                                    peg$savedPos = s0;
                                                                                                                                                    s0 = peg$f38(s3);
                                                                                                                                                }
                                                                                                                                                else {
                                                                                                                                                    peg$currPos = s0;
                                                                                                                                                    s0 = peg$FAILED;
                                                                                                                                                }
                                                                                                                                            }
                                                                                                                                            else {
                                                                                                                                                peg$currPos = s0;
                                                                                                                                                s0 = peg$FAILED;
                                                                                                                                            }
                                                                                                                                            if (s0 === peg$FAILED) {
                                                                                                                                                s0 = peg$currPos;
                                                                                                                                                s1 = peg$parsesetUpKey();
                                                                                                                                                if (s1 !== peg$FAILED) {
                                                                                                                                                    s2 = peg$parsews();
                                                                                                                                                    s3 = peg$parsestring();
                                                                                                                                                    if (s3 !== peg$FAILED) {
                                                                                                                                                        peg$savedPos = s0;
                                                                                                                                                        s0 = peg$f39(s3);
                                                                                                                                                    }
                                                                                                                                                    else {
                                                                                                                                                        peg$currPos = s0;
                                                                                                                                                        s0 = peg$FAILED;
                                                                                                                                                    }
                                                                                                                                                }
                                                                                                                                                else {
                                                                                                                                                    peg$currPos = s0;
                                                                                                                                                    s0 = peg$FAILED;
                                                                                                                                                }
                                                                                                                                                if (s0 === peg$FAILED) {
                                                                                                                                                    s0 = peg$currPos;
                                                                                                                                                    s1 = peg$parsefenKey();
                                                                                                                                                    if (s1 !== peg$FAILED) {
                                                                                                                                                        s2 = peg$parsews();
                                                                                                                                                        s3 = peg$parsestring();
                                                                                                                                                        if (s3 !== peg$FAILED) {
                                                                                                                                                            peg$savedPos = s0;
                                                                                                                                                            s0 = peg$f40(s3);
                                                                                                                                                        }
                                                                                                                                                        else {
                                                                                                                                                            peg$currPos = s0;
                                                                                                                                                            s0 = peg$FAILED;
                                                                                                                                                        }
                                                                                                                                                    }
                                                                                                                                                    else {
                                                                                                                                                        peg$currPos = s0;
                                                                                                                                                        s0 = peg$FAILED;
                                                                                                                                                    }
                                                                                                                                                    if (s0 === peg$FAILED) {
                                                                                                                                                        s0 = peg$currPos;
                                                                                                                                                        s1 = peg$parseterminationKey();
                                                                                                                                                        if (s1 !== peg$FAILED) {
                                                                                                                                                            s2 = peg$parsews();
                                                                                                                                                            s3 = peg$parsestring();
                                                                                                                                                            if (s3 !== peg$FAILED) {
                                                                                                                                                                peg$savedPos = s0;
                                                                                                                                                                s0 = peg$f41(s3);
                                                                                                                                                            }
                                                                                                                                                            else {
                                                                                                                                                                peg$currPos = s0;
                                                                                                                                                                s0 = peg$FAILED;
                                                                                                                                                            }
                                                                                                                                                        }
                                                                                                                                                        else {
                                                                                                                                                            peg$currPos = s0;
                                                                                                                                                            s0 = peg$FAILED;
                                                                                                                                                        }
                                                                                                                                                        if (s0 === peg$FAILED) {
                                                                                                                                                            s0 = peg$currPos;
                                                                                                                                                            s1 = peg$parseannotatorKey();
                                                                                                                                                            if (s1 !== peg$FAILED) {
                                                                                                                                                                s2 = peg$parsews();
                                                                                                                                                                s3 = peg$parsestring();
                                                                                                                                                                if (s3 !== peg$FAILED) {
                                                                                                                                                                    peg$savedPos = s0;
                                                                                                                                                                    s0 = peg$f42(s3);
                                                                                                                                                                }
                                                                                                                                                                else {
                                                                                                                                                                    peg$currPos = s0;
                                                                                                                                                                    s0 = peg$FAILED;
                                                                                                                                                                }
                                                                                                                                                            }
                                                                                                                                                            else {
                                                                                                                                                                peg$currPos = s0;
                                                                                                                                                                s0 = peg$FAILED;
                                                                                                                                                            }
                                                                                                                                                            if (s0 === peg$FAILED) {
                                                                                                                                                                s0 = peg$currPos;
                                                                                                                                                                s1 = peg$parsemodeKey();
                                                                                                                                                                if (s1 !== peg$FAILED) {
                                                                                                                                                                    s2 = peg$parsews();
                                                                                                                                                                    s3 = peg$parsestring();
                                                                                                                                                                    if (s3 !== peg$FAILED) {
                                                                                                                                                                        peg$savedPos = s0;
                                                                                                                                                                        s0 = peg$f43(s3);
                                                                                                                                                                    }
                                                                                                                                                                    else {
                                                                                                                                                                        peg$currPos = s0;
                                                                                                                                                                        s0 = peg$FAILED;
                                                                                                                                                                    }
                                                                                                                                                                }
                                                                                                                                                                else {
                                                                                                                                                                    peg$currPos = s0;
                                                                                                                                                                    s0 = peg$FAILED;
                                                                                                                                                                }
                                                                                                                                                                if (s0 === peg$FAILED) {
                                                                                                                                                                    s0 = peg$currPos;
                                                                                                                                                                    s1 = peg$parseplyCountKey();
                                                                                                                                                                    if (s1 !== peg$FAILED) {
                                                                                                                                                                        s2 = peg$parsews();
                                                                                                                                                                        s3 = peg$parseintegerString();
                                                                                                                                                                        if (s3 !== peg$FAILED) {
                                                                                                                                                                            peg$savedPos = s0;
                                                                                                                                                                            s0 = peg$f44(s3);
                                                                                                                                                                        }
                                                                                                                                                                        else {
                                                                                                                                                                            peg$currPos = s0;
                                                                                                                                                                            s0 = peg$FAILED;
                                                                                                                                                                        }
                                                                                                                                                                    }
                                                                                                                                                                    else {
                                                                                                                                                                        peg$currPos = s0;
                                                                                                                                                                        s0 = peg$FAILED;
                                                                                                                                                                    }
                                                                                                                                                                    if (s0 === peg$FAILED) {
                                                                                                                                                                        s0 = peg$currPos;
                                                                                                                                                                        s1 = peg$parsevariantKey();
                                                                                                                                                                        if (s1 !== peg$FAILED) {
                                                                                                                                                                            s2 = peg$parsews();
                                                                                                                                                                            s3 = peg$parsestring();
                                                                                                                                                                            if (s3 !== peg$FAILED) {
                                                                                                                                                                                peg$savedPos = s0;
                                                                                                                                                                                s0 = peg$f45(s3);
                                                                                                                                                                            }
                                                                                                                                                                            else {
                                                                                                                                                                                peg$currPos = s0;
                                                                                                                                                                                s0 = peg$FAILED;
                                                                                                                                                                            }
                                                                                                                                                                        }
                                                                                                                                                                        else {
                                                                                                                                                                            peg$currPos = s0;
                                                                                                                                                                            s0 = peg$FAILED;
                                                                                                                                                                        }
                                                                                                                                                                        if (s0 === peg$FAILED) {
                                                                                                                                                                            s0 = peg$currPos;
                                                                                                                                                                            s1 = peg$parsewhiteRatingDiffKey();
                                                                                                                                                                            if (s1 !== peg$FAILED) {
                                                                                                                                                                                s2 = peg$parsews();
                                                                                                                                                                                s3 = peg$parsestring();
                                                                                                                                                                                if (s3 !== peg$FAILED) {
                                                                                                                                                                                    peg$savedPos = s0;
                                                                                                                                                                                    s0 = peg$f46(s3);
                                                                                                                                                                                }
                                                                                                                                                                                else {
                                                                                                                                                                                    peg$currPos = s0;
                                                                                                                                                                                    s0 = peg$FAILED;
                                                                                                                                                                                }
                                                                                                                                                                            }
                                                                                                                                                                            else {
                                                                                                                                                                                peg$currPos = s0;
                                                                                                                                                                                s0 = peg$FAILED;
                                                                                                                                                                            }
                                                                                                                                                                            if (s0 === peg$FAILED) {
                                                                                                                                                                                s0 = peg$currPos;
                                                                                                                                                                                s1 = peg$parseblackRatingDiffKey();
                                                                                                                                                                                if (s1 !== peg$FAILED) {
                                                                                                                                                                                    s2 = peg$parsews();
                                                                                                                                                                                    s3 = peg$parsestring();
                                                                                                                                                                                    if (s3 !== peg$FAILED) {
                                                                                                                                                                                        peg$savedPos = s0;
                                                                                                                                                                                        s0 = peg$f47(s3);
                                                                                                                                                                                    }
                                                                                                                                                                                    else {
                                                                                                                                                                                        peg$currPos = s0;
                                                                                                                                                                                        s0 = peg$FAILED;
                                                                                                                                                                                    }
                                                                                                                                                                                }
                                                                                                                                                                                else {
                                                                                                                                                                                    peg$currPos = s0;
                                                                                                                                                                                    s0 = peg$FAILED;
                                                                                                                                                                                }
                                                                                                                                                                                if (s0 === peg$FAILED) {
                                                                                                                                                                                    s0 = peg$currPos;
                                                                                                                                                                                    s1 = peg$parsewhiteFideIdKey();
                                                                                                                                                                                    if (s1 !== peg$FAILED) {
                                                                                                                                                                                        s2 = peg$parsews();
                                                                                                                                                                                        s3 = peg$parsestring();
                                                                                                                                                                                        if (s3 !== peg$FAILED) {
                                                                                                                                                                                            peg$savedPos = s0;
                                                                                                                                                                                            s0 = peg$f48(s3);
                                                                                                                                                                                        }
                                                                                                                                                                                        else {
                                                                                                                                                                                            peg$currPos = s0;
                                                                                                                                                                                            s0 = peg$FAILED;
                                                                                                                                                                                        }
                                                                                                                                                                                    }
                                                                                                                                                                                    else {
                                                                                                                                                                                        peg$currPos = s0;
                                                                                                                                                                                        s0 = peg$FAILED;
                                                                                                                                                                                    }
                                                                                                                                                                                    if (s0 === peg$FAILED) {
                                                                                                                                                                                        s0 = peg$currPos;
                                                                                                                                                                                        s1 = peg$parseblackFideIdKey();
                                                                                                                                                                                        if (s1 !== peg$FAILED) {
                                                                                                                                                                                            s2 = peg$parsews();
                                                                                                                                                                                            s3 = peg$parsestring();
                                                                                                                                                                                            if (s3 !== peg$FAILED) {
                                                                                                                                                                                                peg$savedPos = s0;
                                                                                                                                                                                                s0 = peg$f49(s3);
                                                                                                                                                                                            }
                                                                                                                                                                                            else {
                                                                                                                                                                                                peg$currPos = s0;
                                                                                                                                                                                                s0 = peg$FAILED;
                                                                                                                                                                                            }
                                                                                                                                                                                        }
                                                                                                                                                                                        else {
                                                                                                                                                                                            peg$currPos = s0;
                                                                                                                                                                                            s0 = peg$FAILED;
                                                                                                                                                                                        }
                                                                                                                                                                                        if (s0 === peg$FAILED) {
                                                                                                                                                                                            s0 = peg$currPos;
                                                                                                                                                                                            s1 = peg$parsewhiteTeamKey();
                                                                                                                                                                                            if (s1 !== peg$FAILED) {
                                                                                                                                                                                                s2 = peg$parsews();
                                                                                                                                                                                                s3 = peg$parsestring();
                                                                                                                                                                                                if (s3 !== peg$FAILED) {
                                                                                                                                                                                                    peg$savedPos = s0;
                                                                                                                                                                                                    s0 = peg$f50(s3);
                                                                                                                                                                                                }
                                                                                                                                                                                                else {
                                                                                                                                                                                                    peg$currPos = s0;
                                                                                                                                                                                                    s0 = peg$FAILED;
                                                                                                                                                                                                }
                                                                                                                                                                                            }
                                                                                                                                                                                            else {
                                                                                                                                                                                                peg$currPos = s0;
                                                                                                                                                                                                s0 = peg$FAILED;
                                                                                                                                                                                            }
                                                                                                                                                                                            if (s0 === peg$FAILED) {
                                                                                                                                                                                                s0 = peg$currPos;
                                                                                                                                                                                                s1 = peg$parseblackTeamKey();
                                                                                                                                                                                                if (s1 !== peg$FAILED) {
                                                                                                                                                                                                    s2 = peg$parsews();
                                                                                                                                                                                                    s3 = peg$parsestring();
                                                                                                                                                                                                    if (s3 !== peg$FAILED) {
                                                                                                                                                                                                        peg$savedPos = s0;
                                                                                                                                                                                                        s0 = peg$f51(s3);
                                                                                                                                                                                                    }
                                                                                                                                                                                                    else {
                                                                                                                                                                                                        peg$currPos = s0;
                                                                                                                                                                                                        s0 = peg$FAILED;
                                                                                                                                                                                                    }
                                                                                                                                                                                                }
                                                                                                                                                                                                else {
                                                                                                                                                                                                    peg$currPos = s0;
                                                                                                                                                                                                    s0 = peg$FAILED;
                                                                                                                                                                                                }
                                                                                                                                                                                                if (s0 === peg$FAILED) {
                                                                                                                                                                                                    s0 = peg$currPos;
                                                                                                                                                                                                    s1 = peg$parseclockKey();
                                                                                                                                                                                                    if (s1 !== peg$FAILED) {
                                                                                                                                                                                                        s2 = peg$parsews();
                                                                                                                                                                                                        s3 = peg$parsecolorClockTimeQ();
                                                                                                                                                                                                        if (s3 !== peg$FAILED) {
                                                                                                                                                                                                            peg$savedPos = s0;
                                                                                                                                                                                                            s0 = peg$f52(s3);
                                                                                                                                                                                                        }
                                                                                                                                                                                                        else {
                                                                                                                                                                                                            peg$currPos = s0;
                                                                                                                                                                                                            s0 = peg$FAILED;
                                                                                                                                                                                                        }
                                                                                                                                                                                                    }
                                                                                                                                                                                                    else {
                                                                                                                                                                                                        peg$currPos = s0;
                                                                                                                                                                                                        s0 = peg$FAILED;
                                                                                                                                                                                                    }
                                                                                                                                                                                                    if (s0 === peg$FAILED) {
                                                                                                                                                                                                        s0 = peg$currPos;
                                                                                                                                                                                                        s1 = peg$parsewhiteClockKey();
                                                                                                                                                                                                        if (s1 !== peg$FAILED) {
                                                                                                                                                                                                            s2 = peg$parsews();
                                                                                                                                                                                                            s3 = peg$parseclockTimeQ();
                                                                                                                                                                                                            if (s3 !== peg$FAILED) {
                                                                                                                                                                                                                peg$savedPos = s0;
                                                                                                                                                                                                                s0 = peg$f53(s3);
                                                                                                                                                                                                            }
                                                                                                                                                                                                            else {
                                                                                                                                                                                                                peg$currPos = s0;
                                                                                                                                                                                                                s0 = peg$FAILED;
                                                                                                                                                                                                            }
                                                                                                                                                                                                        }
                                                                                                                                                                                                        else {
                                                                                                                                                                                                            peg$currPos = s0;
                                                                                                                                                                                                            s0 = peg$FAILED;
                                                                                                                                                                                                        }
                                                                                                                                                                                                        if (s0 === peg$FAILED) {
                                                                                                                                                                                                            s0 = peg$currPos;
                                                                                                                                                                                                            s1 = peg$parseblackClockKey();
                                                                                                                                                                                                            if (s1 !== peg$FAILED) {
                                                                                                                                                                                                                s2 = peg$parsews();
                                                                                                                                                                                                                s3 = peg$parseclockTimeQ();
                                                                                                                                                                                                                if (s3 !== peg$FAILED) {
                                                                                                                                                                                                                    peg$savedPos = s0;
                                                                                                                                                                                                                    s0 = peg$f54(s3);
                                                                                                                                                                                                                }
                                                                                                                                                                                                                else {
                                                                                                                                                                                                                    peg$currPos = s0;
                                                                                                                                                                                                                    s0 = peg$FAILED;
                                                                                                                                                                                                                }
                                                                                                                                                                                                            }
                                                                                                                                                                                                            else {
                                                                                                                                                                                                                peg$currPos = s0;
                                                                                                                                                                                                                s0 = peg$FAILED;
                                                                                                                                                                                                            }
                                                                                                                                                                                                            if (s0 === peg$FAILED) {
                                                                                                                                                                                                                s0 = peg$currPos;
                                                                                                                                                                                                                s1 = peg$currPos;
                                                                                                                                                                                                                peg$silentFails++;
                                                                                                                                                                                                                s2 = peg$parsevalidatedKey();
                                                                                                                                                                                                                peg$silentFails--;
                                                                                                                                                                                                                if (s2 !== peg$FAILED) {
                                                                                                                                                                                                                    peg$currPos = s1;
                                                                                                                                                                                                                    s1 = undefined;
                                                                                                                                                                                                                }
                                                                                                                                                                                                                else {
                                                                                                                                                                                                                    s1 = peg$FAILED;
                                                                                                                                                                                                                }
                                                                                                                                                                                                                if (s1 !== peg$FAILED) {
                                                                                                                                                                                                                    s2 = peg$parsestringNoQuot();
                                                                                                                                                                                                                    s3 = peg$parsews();
                                                                                                                                                                                                                    s4 = peg$parsestring();
                                                                                                                                                                                                                    if (s4 !== peg$FAILED) {
                                                                                                                                                                                                                        peg$savedPos = s0;
                                                                                                                                                                                                                        s0 = peg$f55(s2, s4);
                                                                                                                                                                                                                    }
                                                                                                                                                                                                                    else {
                                                                                                                                                                                                                        peg$currPos = s0;
                                                                                                                                                                                                                        s0 = peg$FAILED;
                                                                                                                                                                                                                    }
                                                                                                                                                                                                                }
                                                                                                                                                                                                                else {
                                                                                                                                                                                                                    peg$currPos = s0;
                                                                                                                                                                                                                    s0 = peg$FAILED;
                                                                                                                                                                                                                }
                                                                                                                                                                                                                if (s0 === peg$FAILED) {
                                                                                                                                                                                                                    s0 = peg$currPos;
                                                                                                                                                                                                                    s1 = peg$currPos;
                                                                                                                                                                                                                    peg$silentFails++;
                                                                                                                                                                                                                    s2 = peg$parsevalidatedKey();
                                                                                                                                                                                                                    peg$silentFails--;
                                                                                                                                                                                                                    if (s2 === peg$FAILED) {
                                                                                                                                                                                                                        s1 = undefined;
                                                                                                                                                                                                                    }
                                                                                                                                                                                                                    else {
                                                                                                                                                                                                                        peg$currPos = s1;
                                                                                                                                                                                                                        s1 = peg$FAILED;
                                                                                                                                                                                                                    }
                                                                                                                                                                                                                    if (s1 !== peg$FAILED) {
                                                                                                                                                                                                                        s2 = peg$parsestringNoQuot();
                                                                                                                                                                                                                        s3 = peg$parsews();
                                                                                                                                                                                                                        s4 = peg$parsestring();
                                                                                                                                                                                                                        if (s4 !== peg$FAILED) {
                                                                                                                                                                                                                            peg$savedPos = s0;
                                                                                                                                                                                                                            s0 = peg$f56(s2, s4);
                                                                                                                                                                                                                        }
                                                                                                                                                                                                                        else {
                                                                                                                                                                                                                            peg$currPos = s0;
                                                                                                                                                                                                                            s0 = peg$FAILED;
                                                                                                                                                                                                                        }
                                                                                                                                                                                                                    }
                                                                                                                                                                                                                    else {
                                                                                                                                                                                                                        peg$currPos = s0;
                                                                                                                                                                                                                        s0 = peg$FAILED;
                                                                                                                                                                                                                    }
                                                                                                                                                                                                                }
                                                                                                                                                                                                            }
                                                                                                                                                                                                        }
                                                                                                                                                                                                    }
                                                                                                                                                                                                }
                                                                                                                                                                                            }
                                                                                                                                                                                        }
                                                                                                                                                                                    }
                                                                                                                                                                                }
                                                                                                                                                                            }
                                                                                                                                                                        }
                                                                                                                                                                    }
                                                                                                                                                                }
                                                                                                                                                            }
                                                                                                                                                        }
                                                                                                                                                    }
                                                                                                                                                }
                                                                                                                                            }
                                                                                                                                        }
                                                                                                                                    }
                                                                                                                                }
                                                                                                                            }
                                                                                                                        }
                                                                                                                    }
                                                                                                                }
                                                                                                            }
                                                                                                        }
                                                                                                    }
                                                                                                }
                                                                                            }
                                                                                        }
                                                                                    }
                                                                                }
                                                                            }
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                    return s0;
                }
                function peg$parsevalidatedKey() {
                    var s0;
                    s0 = peg$parsedateKey();
                    if (s0 === peg$FAILED) {
                        s0 = peg$parsewhiteEloKey();
                        if (s0 === peg$FAILED) {
                            s0 = peg$parseblackEloKey();
                            if (s0 === peg$FAILED) {
                                s0 = peg$parsewhiteUSCFKey();
                                if (s0 === peg$FAILED) {
                                    s0 = peg$parseblackUSCFKey();
                                    if (s0 === peg$FAILED) {
                                        s0 = peg$parseresultKey();
                                        if (s0 === peg$FAILED) {
                                            s0 = peg$parseeventDateKey();
                                            if (s0 === peg$FAILED) {
                                                s0 = peg$parseboardKey();
                                                if (s0 === peg$FAILED) {
                                                    s0 = peg$parsetimeKey();
                                                    if (s0 === peg$FAILED) {
                                                        s0 = peg$parseutcTimeKey();
                                                        if (s0 === peg$FAILED) {
                                                            s0 = peg$parseutcDateKey();
                                                            if (s0 === peg$FAILED) {
                                                                s0 = peg$parsetimeControlKey();
                                                                if (s0 === peg$FAILED) {
                                                                    s0 = peg$parseplyCountKey();
                                                                    if (s0 === peg$FAILED) {
                                                                        s0 = peg$parseclockKey();
                                                                        if (s0 === peg$FAILED) {
                                                                            s0 = peg$parsewhiteClockKey();
                                                                            if (s0 === peg$FAILED) {
                                                                                s0 = peg$parseblackClockKey();
                                                                            }
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                    return s0;
                }
                function peg$parseeventKey() {
                    var s0;
                    if (input.substr(peg$currPos, 5) === peg$c0) {
                        s0 = peg$c0;
                        peg$currPos += 5;
                    }
                    else {
                        s0 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$e0);
                        }
                    }
                    if (s0 === peg$FAILED) {
                        if (input.substr(peg$currPos, 5) === peg$c1) {
                            s0 = peg$c1;
                            peg$currPos += 5;
                        }
                        else {
                            s0 = peg$FAILED;
                            if (peg$silentFails === 0) {
                                peg$fail(peg$e1);
                            }
                        }
                    }
                    return s0;
                }
                function peg$parsesiteKey() {
                    var s0;
                    if (input.substr(peg$currPos, 4) === peg$c2) {
                        s0 = peg$c2;
                        peg$currPos += 4;
                    }
                    else {
                        s0 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$e2);
                        }
                    }
                    if (s0 === peg$FAILED) {
                        if (input.substr(peg$currPos, 4) === peg$c3) {
                            s0 = peg$c3;
                            peg$currPos += 4;
                        }
                        else {
                            s0 = peg$FAILED;
                            if (peg$silentFails === 0) {
                                peg$fail(peg$e3);
                            }
                        }
                    }
                    return s0;
                }
                function peg$parsedateKey() {
                    var s0;
                    if (input.substr(peg$currPos, 4) === peg$c4) {
                        s0 = peg$c4;
                        peg$currPos += 4;
                    }
                    else {
                        s0 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$e4);
                        }
                    }
                    if (s0 === peg$FAILED) {
                        if (input.substr(peg$currPos, 4) === peg$c5) {
                            s0 = peg$c5;
                            peg$currPos += 4;
                        }
                        else {
                            s0 = peg$FAILED;
                            if (peg$silentFails === 0) {
                                peg$fail(peg$e5);
                            }
                        }
                    }
                    return s0;
                }
                function peg$parseroundKey() {
                    var s0;
                    if (input.substr(peg$currPos, 5) === peg$c6) {
                        s0 = peg$c6;
                        peg$currPos += 5;
                    }
                    else {
                        s0 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$e6);
                        }
                    }
                    if (s0 === peg$FAILED) {
                        if (input.substr(peg$currPos, 5) === peg$c7) {
                            s0 = peg$c7;
                            peg$currPos += 5;
                        }
                        else {
                            s0 = peg$FAILED;
                            if (peg$silentFails === 0) {
                                peg$fail(peg$e7);
                            }
                        }
                    }
                    return s0;
                }
                function peg$parsewhiteKey() {
                    var s0;
                    if (input.substr(peg$currPos, 5) === peg$c8) {
                        s0 = peg$c8;
                        peg$currPos += 5;
                    }
                    else {
                        s0 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$e8);
                        }
                    }
                    if (s0 === peg$FAILED) {
                        if (input.substr(peg$currPos, 5) === peg$c9) {
                            s0 = peg$c9;
                            peg$currPos += 5;
                        }
                        else {
                            s0 = peg$FAILED;
                            if (peg$silentFails === 0) {
                                peg$fail(peg$e9);
                            }
                        }
                    }
                    return s0;
                }
                function peg$parseblackKey() {
                    var s0;
                    if (input.substr(peg$currPos, 5) === peg$c10) {
                        s0 = peg$c10;
                        peg$currPos += 5;
                    }
                    else {
                        s0 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$e10);
                        }
                    }
                    if (s0 === peg$FAILED) {
                        if (input.substr(peg$currPos, 5) === peg$c11) {
                            s0 = peg$c11;
                            peg$currPos += 5;
                        }
                        else {
                            s0 = peg$FAILED;
                            if (peg$silentFails === 0) {
                                peg$fail(peg$e11);
                            }
                        }
                    }
                    return s0;
                }
                function peg$parseresultKey() {
                    var s0;
                    if (input.substr(peg$currPos, 6) === peg$c12) {
                        s0 = peg$c12;
                        peg$currPos += 6;
                    }
                    else {
                        s0 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$e12);
                        }
                    }
                    if (s0 === peg$FAILED) {
                        if (input.substr(peg$currPos, 6) === peg$c13) {
                            s0 = peg$c13;
                            peg$currPos += 6;
                        }
                        else {
                            s0 = peg$FAILED;
                            if (peg$silentFails === 0) {
                                peg$fail(peg$e13);
                            }
                        }
                    }
                    return s0;
                }
                function peg$parsewhiteTitleKey() {
                    var s0;
                    if (input.substr(peg$currPos, 10) === peg$c14) {
                        s0 = peg$c14;
                        peg$currPos += 10;
                    }
                    else {
                        s0 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$e14);
                        }
                    }
                    if (s0 === peg$FAILED) {
                        if (input.substr(peg$currPos, 10) === peg$c15) {
                            s0 = peg$c15;
                            peg$currPos += 10;
                        }
                        else {
                            s0 = peg$FAILED;
                            if (peg$silentFails === 0) {
                                peg$fail(peg$e15);
                            }
                        }
                        if (s0 === peg$FAILED) {
                            if (input.substr(peg$currPos, 10) === peg$c16) {
                                s0 = peg$c16;
                                peg$currPos += 10;
                            }
                            else {
                                s0 = peg$FAILED;
                                if (peg$silentFails === 0) {
                                    peg$fail(peg$e16);
                                }
                            }
                            if (s0 === peg$FAILED) {
                                if (input.substr(peg$currPos, 10) === peg$c17) {
                                    s0 = peg$c17;
                                    peg$currPos += 10;
                                }
                                else {
                                    s0 = peg$FAILED;
                                    if (peg$silentFails === 0) {
                                        peg$fail(peg$e17);
                                    }
                                }
                            }
                        }
                    }
                    return s0;
                }
                function peg$parseblackTitleKey() {
                    var s0;
                    if (input.substr(peg$currPos, 10) === peg$c18) {
                        s0 = peg$c18;
                        peg$currPos += 10;
                    }
                    else {
                        s0 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$e18);
                        }
                    }
                    if (s0 === peg$FAILED) {
                        if (input.substr(peg$currPos, 10) === peg$c19) {
                            s0 = peg$c19;
                            peg$currPos += 10;
                        }
                        else {
                            s0 = peg$FAILED;
                            if (peg$silentFails === 0) {
                                peg$fail(peg$e19);
                            }
                        }
                        if (s0 === peg$FAILED) {
                            if (input.substr(peg$currPos, 10) === peg$c20) {
                                s0 = peg$c20;
                                peg$currPos += 10;
                            }
                            else {
                                s0 = peg$FAILED;
                                if (peg$silentFails === 0) {
                                    peg$fail(peg$e20);
                                }
                            }
                            if (s0 === peg$FAILED) {
                                if (input.substr(peg$currPos, 10) === peg$c21) {
                                    s0 = peg$c21;
                                    peg$currPos += 10;
                                }
                                else {
                                    s0 = peg$FAILED;
                                    if (peg$silentFails === 0) {
                                        peg$fail(peg$e21);
                                    }
                                }
                            }
                        }
                    }
                    return s0;
                }
                function peg$parsewhiteEloKey() {
                    var s0;
                    if (input.substr(peg$currPos, 8) === peg$c22) {
                        s0 = peg$c22;
                        peg$currPos += 8;
                    }
                    else {
                        s0 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$e22);
                        }
                    }
                    if (s0 === peg$FAILED) {
                        if (input.substr(peg$currPos, 8) === peg$c23) {
                            s0 = peg$c23;
                            peg$currPos += 8;
                        }
                        else {
                            s0 = peg$FAILED;
                            if (peg$silentFails === 0) {
                                peg$fail(peg$e23);
                            }
                        }
                        if (s0 === peg$FAILED) {
                            if (input.substr(peg$currPos, 8) === peg$c24) {
                                s0 = peg$c24;
                                peg$currPos += 8;
                            }
                            else {
                                s0 = peg$FAILED;
                                if (peg$silentFails === 0) {
                                    peg$fail(peg$e24);
                                }
                            }
                            if (s0 === peg$FAILED) {
                                if (input.substr(peg$currPos, 8) === peg$c25) {
                                    s0 = peg$c25;
                                    peg$currPos += 8;
                                }
                                else {
                                    s0 = peg$FAILED;
                                    if (peg$silentFails === 0) {
                                        peg$fail(peg$e25);
                                    }
                                }
                                if (s0 === peg$FAILED) {
                                    if (input.substr(peg$currPos, 8) === peg$c26) {
                                        s0 = peg$c26;
                                        peg$currPos += 8;
                                    }
                                    else {
                                        s0 = peg$FAILED;
                                        if (peg$silentFails === 0) {
                                            peg$fail(peg$e26);
                                        }
                                    }
                                }
                            }
                        }
                    }
                    return s0;
                }
                function peg$parseblackEloKey() {
                    var s0;
                    if (input.substr(peg$currPos, 8) === peg$c27) {
                        s0 = peg$c27;
                        peg$currPos += 8;
                    }
                    else {
                        s0 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$e27);
                        }
                    }
                    if (s0 === peg$FAILED) {
                        if (input.substr(peg$currPos, 8) === peg$c28) {
                            s0 = peg$c28;
                            peg$currPos += 8;
                        }
                        else {
                            s0 = peg$FAILED;
                            if (peg$silentFails === 0) {
                                peg$fail(peg$e28);
                            }
                        }
                        if (s0 === peg$FAILED) {
                            if (input.substr(peg$currPos, 8) === peg$c29) {
                                s0 = peg$c29;
                                peg$currPos += 8;
                            }
                            else {
                                s0 = peg$FAILED;
                                if (peg$silentFails === 0) {
                                    peg$fail(peg$e29);
                                }
                            }
                            if (s0 === peg$FAILED) {
                                if (input.substr(peg$currPos, 8) === peg$c30) {
                                    s0 = peg$c30;
                                    peg$currPos += 8;
                                }
                                else {
                                    s0 = peg$FAILED;
                                    if (peg$silentFails === 0) {
                                        peg$fail(peg$e30);
                                    }
                                }
                                if (s0 === peg$FAILED) {
                                    if (input.substr(peg$currPos, 8) === peg$c31) {
                                        s0 = peg$c31;
                                        peg$currPos += 8;
                                    }
                                    else {
                                        s0 = peg$FAILED;
                                        if (peg$silentFails === 0) {
                                            peg$fail(peg$e31);
                                        }
                                    }
                                }
                            }
                        }
                    }
                    return s0;
                }
                function peg$parsewhiteUSCFKey() {
                    var s0;
                    if (input.substr(peg$currPos, 9) === peg$c32) {
                        s0 = peg$c32;
                        peg$currPos += 9;
                    }
                    else {
                        s0 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$e32);
                        }
                    }
                    if (s0 === peg$FAILED) {
                        if (input.substr(peg$currPos, 9) === peg$c33) {
                            s0 = peg$c33;
                            peg$currPos += 9;
                        }
                        else {
                            s0 = peg$FAILED;
                            if (peg$silentFails === 0) {
                                peg$fail(peg$e33);
                            }
                        }
                        if (s0 === peg$FAILED) {
                            if (input.substr(peg$currPos, 9) === peg$c34) {
                                s0 = peg$c34;
                                peg$currPos += 9;
                            }
                            else {
                                s0 = peg$FAILED;
                                if (peg$silentFails === 0) {
                                    peg$fail(peg$e34);
                                }
                            }
                            if (s0 === peg$FAILED) {
                                if (input.substr(peg$currPos, 9) === peg$c35) {
                                    s0 = peg$c35;
                                    peg$currPos += 9;
                                }
                                else {
                                    s0 = peg$FAILED;
                                    if (peg$silentFails === 0) {
                                        peg$fail(peg$e35);
                                    }
                                }
                                if (s0 === peg$FAILED) {
                                    if (input.substr(peg$currPos, 9) === peg$c36) {
                                        s0 = peg$c36;
                                        peg$currPos += 9;
                                    }
                                    else {
                                        s0 = peg$FAILED;
                                        if (peg$silentFails === 0) {
                                            peg$fail(peg$e36);
                                        }
                                    }
                                }
                            }
                        }
                    }
                    return s0;
                }
                function peg$parseblackUSCFKey() {
                    var s0;
                    if (input.substr(peg$currPos, 9) === peg$c37) {
                        s0 = peg$c37;
                        peg$currPos += 9;
                    }
                    else {
                        s0 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$e37);
                        }
                    }
                    if (s0 === peg$FAILED) {
                        if (input.substr(peg$currPos, 9) === peg$c38) {
                            s0 = peg$c38;
                            peg$currPos += 9;
                        }
                        else {
                            s0 = peg$FAILED;
                            if (peg$silentFails === 0) {
                                peg$fail(peg$e38);
                            }
                        }
                        if (s0 === peg$FAILED) {
                            if (input.substr(peg$currPos, 9) === peg$c39) {
                                s0 = peg$c39;
                                peg$currPos += 9;
                            }
                            else {
                                s0 = peg$FAILED;
                                if (peg$silentFails === 0) {
                                    peg$fail(peg$e39);
                                }
                            }
                            if (s0 === peg$FAILED) {
                                if (input.substr(peg$currPos, 9) === peg$c40) {
                                    s0 = peg$c40;
                                    peg$currPos += 9;
                                }
                                else {
                                    s0 = peg$FAILED;
                                    if (peg$silentFails === 0) {
                                        peg$fail(peg$e40);
                                    }
                                }
                                if (s0 === peg$FAILED) {
                                    if (input.substr(peg$currPos, 9) === peg$c41) {
                                        s0 = peg$c41;
                                        peg$currPos += 9;
                                    }
                                    else {
                                        s0 = peg$FAILED;
                                        if (peg$silentFails === 0) {
                                            peg$fail(peg$e41);
                                        }
                                    }
                                }
                            }
                        }
                    }
                    return s0;
                }
                function peg$parsewhiteNAKey() {
                    var s0;
                    if (input.substr(peg$currPos, 7) === peg$c42) {
                        s0 = peg$c42;
                        peg$currPos += 7;
                    }
                    else {
                        s0 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$e42);
                        }
                    }
                    if (s0 === peg$FAILED) {
                        if (input.substr(peg$currPos, 7) === peg$c43) {
                            s0 = peg$c43;
                            peg$currPos += 7;
                        }
                        else {
                            s0 = peg$FAILED;
                            if (peg$silentFails === 0) {
                                peg$fail(peg$e43);
                            }
                        }
                        if (s0 === peg$FAILED) {
                            if (input.substr(peg$currPos, 7) === peg$c44) {
                                s0 = peg$c44;
                                peg$currPos += 7;
                            }
                            else {
                                s0 = peg$FAILED;
                                if (peg$silentFails === 0) {
                                    peg$fail(peg$e44);
                                }
                            }
                            if (s0 === peg$FAILED) {
                                if (input.substr(peg$currPos, 7) === peg$c45) {
                                    s0 = peg$c45;
                                    peg$currPos += 7;
                                }
                                else {
                                    s0 = peg$FAILED;
                                    if (peg$silentFails === 0) {
                                        peg$fail(peg$e45);
                                    }
                                }
                                if (s0 === peg$FAILED) {
                                    if (input.substr(peg$currPos, 7) === peg$c46) {
                                        s0 = peg$c46;
                                        peg$currPos += 7;
                                    }
                                    else {
                                        s0 = peg$FAILED;
                                        if (peg$silentFails === 0) {
                                            peg$fail(peg$e46);
                                        }
                                    }
                                    if (s0 === peg$FAILED) {
                                        if (input.substr(peg$currPos, 7) === peg$c47) {
                                            s0 = peg$c47;
                                            peg$currPos += 7;
                                        }
                                        else {
                                            s0 = peg$FAILED;
                                            if (peg$silentFails === 0) {
                                                peg$fail(peg$e47);
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                    return s0;
                }
                function peg$parseblackNAKey() {
                    var s0;
                    if (input.substr(peg$currPos, 7) === peg$c48) {
                        s0 = peg$c48;
                        peg$currPos += 7;
                    }
                    else {
                        s0 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$e48);
                        }
                    }
                    if (s0 === peg$FAILED) {
                        if (input.substr(peg$currPos, 7) === peg$c49) {
                            s0 = peg$c49;
                            peg$currPos += 7;
                        }
                        else {
                            s0 = peg$FAILED;
                            if (peg$silentFails === 0) {
                                peg$fail(peg$e49);
                            }
                        }
                        if (s0 === peg$FAILED) {
                            if (input.substr(peg$currPos, 7) === peg$c50) {
                                s0 = peg$c50;
                                peg$currPos += 7;
                            }
                            else {
                                s0 = peg$FAILED;
                                if (peg$silentFails === 0) {
                                    peg$fail(peg$e50);
                                }
                            }
                            if (s0 === peg$FAILED) {
                                if (input.substr(peg$currPos, 7) === peg$c51) {
                                    s0 = peg$c51;
                                    peg$currPos += 7;
                                }
                                else {
                                    s0 = peg$FAILED;
                                    if (peg$silentFails === 0) {
                                        peg$fail(peg$e51);
                                    }
                                }
                                if (s0 === peg$FAILED) {
                                    if (input.substr(peg$currPos, 7) === peg$c52) {
                                        s0 = peg$c52;
                                        peg$currPos += 7;
                                    }
                                    else {
                                        s0 = peg$FAILED;
                                        if (peg$silentFails === 0) {
                                            peg$fail(peg$e52);
                                        }
                                    }
                                    if (s0 === peg$FAILED) {
                                        if (input.substr(peg$currPos, 7) === peg$c53) {
                                            s0 = peg$c53;
                                            peg$currPos += 7;
                                        }
                                        else {
                                            s0 = peg$FAILED;
                                            if (peg$silentFails === 0) {
                                                peg$fail(peg$e53);
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                    return s0;
                }
                function peg$parsewhiteTypeKey() {
                    var s0;
                    if (input.substr(peg$currPos, 9) === peg$c54) {
                        s0 = peg$c54;
                        peg$currPos += 9;
                    }
                    else {
                        s0 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$e54);
                        }
                    }
                    if (s0 === peg$FAILED) {
                        if (input.substr(peg$currPos, 9) === peg$c55) {
                            s0 = peg$c55;
                            peg$currPos += 9;
                        }
                        else {
                            s0 = peg$FAILED;
                            if (peg$silentFails === 0) {
                                peg$fail(peg$e55);
                            }
                        }
                        if (s0 === peg$FAILED) {
                            if (input.substr(peg$currPos, 9) === peg$c56) {
                                s0 = peg$c56;
                                peg$currPos += 9;
                            }
                            else {
                                s0 = peg$FAILED;
                                if (peg$silentFails === 0) {
                                    peg$fail(peg$e56);
                                }
                            }
                            if (s0 === peg$FAILED) {
                                if (input.substr(peg$currPos, 9) === peg$c57) {
                                    s0 = peg$c57;
                                    peg$currPos += 9;
                                }
                                else {
                                    s0 = peg$FAILED;
                                    if (peg$silentFails === 0) {
                                        peg$fail(peg$e57);
                                    }
                                }
                            }
                        }
                    }
                    return s0;
                }
                function peg$parseblackTypeKey() {
                    var s0;
                    if (input.substr(peg$currPos, 9) === peg$c58) {
                        s0 = peg$c58;
                        peg$currPos += 9;
                    }
                    else {
                        s0 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$e58);
                        }
                    }
                    if (s0 === peg$FAILED) {
                        if (input.substr(peg$currPos, 9) === peg$c59) {
                            s0 = peg$c59;
                            peg$currPos += 9;
                        }
                        else {
                            s0 = peg$FAILED;
                            if (peg$silentFails === 0) {
                                peg$fail(peg$e59);
                            }
                        }
                        if (s0 === peg$FAILED) {
                            if (input.substr(peg$currPos, 9) === peg$c60) {
                                s0 = peg$c60;
                                peg$currPos += 9;
                            }
                            else {
                                s0 = peg$FAILED;
                                if (peg$silentFails === 0) {
                                    peg$fail(peg$e60);
                                }
                            }
                            if (s0 === peg$FAILED) {
                                if (input.substr(peg$currPos, 9) === peg$c61) {
                                    s0 = peg$c61;
                                    peg$currPos += 9;
                                }
                                else {
                                    s0 = peg$FAILED;
                                    if (peg$silentFails === 0) {
                                        peg$fail(peg$e61);
                                    }
                                }
                            }
                        }
                    }
                    return s0;
                }
                function peg$parseeventDateKey() {
                    var s0;
                    if (input.substr(peg$currPos, 9) === peg$c62) {
                        s0 = peg$c62;
                        peg$currPos += 9;
                    }
                    else {
                        s0 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$e62);
                        }
                    }
                    if (s0 === peg$FAILED) {
                        if (input.substr(peg$currPos, 9) === peg$c63) {
                            s0 = peg$c63;
                            peg$currPos += 9;
                        }
                        else {
                            s0 = peg$FAILED;
                            if (peg$silentFails === 0) {
                                peg$fail(peg$e63);
                            }
                        }
                        if (s0 === peg$FAILED) {
                            if (input.substr(peg$currPos, 9) === peg$c64) {
                                s0 = peg$c64;
                                peg$currPos += 9;
                            }
                            else {
                                s0 = peg$FAILED;
                                if (peg$silentFails === 0) {
                                    peg$fail(peg$e64);
                                }
                            }
                            if (s0 === peg$FAILED) {
                                if (input.substr(peg$currPos, 9) === peg$c65) {
                                    s0 = peg$c65;
                                    peg$currPos += 9;
                                }
                                else {
                                    s0 = peg$FAILED;
                                    if (peg$silentFails === 0) {
                                        peg$fail(peg$e65);
                                    }
                                }
                            }
                        }
                    }
                    return s0;
                }
                function peg$parseeventSponsorKey() {
                    var s0;
                    if (input.substr(peg$currPos, 12) === peg$c66) {
                        s0 = peg$c66;
                        peg$currPos += 12;
                    }
                    else {
                        s0 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$e66);
                        }
                    }
                    if (s0 === peg$FAILED) {
                        if (input.substr(peg$currPos, 12) === peg$c67) {
                            s0 = peg$c67;
                            peg$currPos += 12;
                        }
                        else {
                            s0 = peg$FAILED;
                            if (peg$silentFails === 0) {
                                peg$fail(peg$e67);
                            }
                        }
                        if (s0 === peg$FAILED) {
                            if (input.substr(peg$currPos, 12) === peg$c68) {
                                s0 = peg$c68;
                                peg$currPos += 12;
                            }
                            else {
                                s0 = peg$FAILED;
                                if (peg$silentFails === 0) {
                                    peg$fail(peg$e68);
                                }
                            }
                            if (s0 === peg$FAILED) {
                                if (input.substr(peg$currPos, 12) === peg$c69) {
                                    s0 = peg$c69;
                                    peg$currPos += 12;
                                }
                                else {
                                    s0 = peg$FAILED;
                                    if (peg$silentFails === 0) {
                                        peg$fail(peg$e69);
                                    }
                                }
                            }
                        }
                    }
                    return s0;
                }
                function peg$parsesectionKey() {
                    var s0;
                    if (input.substr(peg$currPos, 7) === peg$c70) {
                        s0 = peg$c70;
                        peg$currPos += 7;
                    }
                    else {
                        s0 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$e70);
                        }
                    }
                    if (s0 === peg$FAILED) {
                        if (input.substr(peg$currPos, 7) === peg$c71) {
                            s0 = peg$c71;
                            peg$currPos += 7;
                        }
                        else {
                            s0 = peg$FAILED;
                            if (peg$silentFails === 0) {
                                peg$fail(peg$e71);
                            }
                        }
                    }
                    return s0;
                }
                function peg$parsestageKey() {
                    var s0;
                    if (input.substr(peg$currPos, 5) === peg$c72) {
                        s0 = peg$c72;
                        peg$currPos += 5;
                    }
                    else {
                        s0 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$e72);
                        }
                    }
                    if (s0 === peg$FAILED) {
                        if (input.substr(peg$currPos, 5) === peg$c73) {
                            s0 = peg$c73;
                            peg$currPos += 5;
                        }
                        else {
                            s0 = peg$FAILED;
                            if (peg$silentFails === 0) {
                                peg$fail(peg$e73);
                            }
                        }
                    }
                    return s0;
                }
                function peg$parseboardKey() {
                    var s0;
                    if (input.substr(peg$currPos, 5) === peg$c74) {
                        s0 = peg$c74;
                        peg$currPos += 5;
                    }
                    else {
                        s0 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$e74);
                        }
                    }
                    if (s0 === peg$FAILED) {
                        if (input.substr(peg$currPos, 5) === peg$c75) {
                            s0 = peg$c75;
                            peg$currPos += 5;
                        }
                        else {
                            s0 = peg$FAILED;
                            if (peg$silentFails === 0) {
                                peg$fail(peg$e75);
                            }
                        }
                    }
                    return s0;
                }
                function peg$parseopeningKey() {
                    var s0;
                    if (input.substr(peg$currPos, 7) === peg$c76) {
                        s0 = peg$c76;
                        peg$currPos += 7;
                    }
                    else {
                        s0 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$e76);
                        }
                    }
                    if (s0 === peg$FAILED) {
                        if (input.substr(peg$currPos, 7) === peg$c77) {
                            s0 = peg$c77;
                            peg$currPos += 7;
                        }
                        else {
                            s0 = peg$FAILED;
                            if (peg$silentFails === 0) {
                                peg$fail(peg$e77);
                            }
                        }
                    }
                    return s0;
                }
                function peg$parsevariationKey() {
                    var s0;
                    if (input.substr(peg$currPos, 9) === peg$c78) {
                        s0 = peg$c78;
                        peg$currPos += 9;
                    }
                    else {
                        s0 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$e78);
                        }
                    }
                    if (s0 === peg$FAILED) {
                        if (input.substr(peg$currPos, 9) === peg$c79) {
                            s0 = peg$c79;
                            peg$currPos += 9;
                        }
                        else {
                            s0 = peg$FAILED;
                            if (peg$silentFails === 0) {
                                peg$fail(peg$e79);
                            }
                        }
                    }
                    return s0;
                }
                function peg$parsesubVariationKey() {
                    var s0;
                    if (input.substr(peg$currPos, 12) === peg$c80) {
                        s0 = peg$c80;
                        peg$currPos += 12;
                    }
                    else {
                        s0 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$e80);
                        }
                    }
                    if (s0 === peg$FAILED) {
                        if (input.substr(peg$currPos, 12) === peg$c81) {
                            s0 = peg$c81;
                            peg$currPos += 12;
                        }
                        else {
                            s0 = peg$FAILED;
                            if (peg$silentFails === 0) {
                                peg$fail(peg$e81);
                            }
                        }
                        if (s0 === peg$FAILED) {
                            if (input.substr(peg$currPos, 12) === peg$c82) {
                                s0 = peg$c82;
                                peg$currPos += 12;
                            }
                            else {
                                s0 = peg$FAILED;
                                if (peg$silentFails === 0) {
                                    peg$fail(peg$e82);
                                }
                            }
                            if (s0 === peg$FAILED) {
                                if (input.substr(peg$currPos, 12) === peg$c83) {
                                    s0 = peg$c83;
                                    peg$currPos += 12;
                                }
                                else {
                                    s0 = peg$FAILED;
                                    if (peg$silentFails === 0) {
                                        peg$fail(peg$e83);
                                    }
                                }
                            }
                        }
                    }
                    return s0;
                }
                function peg$parseecoKey() {
                    var s0;
                    if (input.substr(peg$currPos, 3) === peg$c84) {
                        s0 = peg$c84;
                        peg$currPos += 3;
                    }
                    else {
                        s0 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$e84);
                        }
                    }
                    if (s0 === peg$FAILED) {
                        if (input.substr(peg$currPos, 3) === peg$c85) {
                            s0 = peg$c85;
                            peg$currPos += 3;
                        }
                        else {
                            s0 = peg$FAILED;
                            if (peg$silentFails === 0) {
                                peg$fail(peg$e85);
                            }
                        }
                        if (s0 === peg$FAILED) {
                            if (input.substr(peg$currPos, 3) === peg$c86) {
                                s0 = peg$c86;
                                peg$currPos += 3;
                            }
                            else {
                                s0 = peg$FAILED;
                                if (peg$silentFails === 0) {
                                    peg$fail(peg$e86);
                                }
                            }
                        }
                    }
                    return s0;
                }
                function peg$parsenicKey() {
                    var s0;
                    if (input.substr(peg$currPos, 3) === peg$c87) {
                        s0 = peg$c87;
                        peg$currPos += 3;
                    }
                    else {
                        s0 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$e87);
                        }
                    }
                    if (s0 === peg$FAILED) {
                        if (input.substr(peg$currPos, 3) === peg$c88) {
                            s0 = peg$c88;
                            peg$currPos += 3;
                        }
                        else {
                            s0 = peg$FAILED;
                            if (peg$silentFails === 0) {
                                peg$fail(peg$e88);
                            }
                        }
                        if (s0 === peg$FAILED) {
                            if (input.substr(peg$currPos, 3) === peg$c89) {
                                s0 = peg$c89;
                                peg$currPos += 3;
                            }
                            else {
                                s0 = peg$FAILED;
                                if (peg$silentFails === 0) {
                                    peg$fail(peg$e89);
                                }
                            }
                        }
                    }
                    return s0;
                }
                function peg$parsetimeKey() {
                    var s0;
                    if (input.substr(peg$currPos, 4) === peg$c90) {
                        s0 = peg$c90;
                        peg$currPos += 4;
                    }
                    else {
                        s0 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$e90);
                        }
                    }
                    if (s0 === peg$FAILED) {
                        if (input.substr(peg$currPos, 4) === peg$c91) {
                            s0 = peg$c91;
                            peg$currPos += 4;
                        }
                        else {
                            s0 = peg$FAILED;
                            if (peg$silentFails === 0) {
                                peg$fail(peg$e91);
                            }
                        }
                    }
                    return s0;
                }
                function peg$parseutcTimeKey() {
                    var s0;
                    if (input.substr(peg$currPos, 7) === peg$c92) {
                        s0 = peg$c92;
                        peg$currPos += 7;
                    }
                    else {
                        s0 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$e92);
                        }
                    }
                    if (s0 === peg$FAILED) {
                        if (input.substr(peg$currPos, 7) === peg$c93) {
                            s0 = peg$c93;
                            peg$currPos += 7;
                        }
                        else {
                            s0 = peg$FAILED;
                            if (peg$silentFails === 0) {
                                peg$fail(peg$e93);
                            }
                        }
                        if (s0 === peg$FAILED) {
                            if (input.substr(peg$currPos, 7) === peg$c94) {
                                s0 = peg$c94;
                                peg$currPos += 7;
                            }
                            else {
                                s0 = peg$FAILED;
                                if (peg$silentFails === 0) {
                                    peg$fail(peg$e94);
                                }
                            }
                            if (s0 === peg$FAILED) {
                                if (input.substr(peg$currPos, 7) === peg$c95) {
                                    s0 = peg$c95;
                                    peg$currPos += 7;
                                }
                                else {
                                    s0 = peg$FAILED;
                                    if (peg$silentFails === 0) {
                                        peg$fail(peg$e95);
                                    }
                                }
                                if (s0 === peg$FAILED) {
                                    if (input.substr(peg$currPos, 7) === peg$c96) {
                                        s0 = peg$c96;
                                        peg$currPos += 7;
                                    }
                                    else {
                                        s0 = peg$FAILED;
                                        if (peg$silentFails === 0) {
                                            peg$fail(peg$e96);
                                        }
                                    }
                                    if (s0 === peg$FAILED) {
                                        if (input.substr(peg$currPos, 7) === peg$c97) {
                                            s0 = peg$c97;
                                            peg$currPos += 7;
                                        }
                                        else {
                                            s0 = peg$FAILED;
                                            if (peg$silentFails === 0) {
                                                peg$fail(peg$e97);
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                    return s0;
                }
                function peg$parseutcDateKey() {
                    var s0;
                    if (input.substr(peg$currPos, 7) === peg$c98) {
                        s0 = peg$c98;
                        peg$currPos += 7;
                    }
                    else {
                        s0 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$e98);
                        }
                    }
                    if (s0 === peg$FAILED) {
                        if (input.substr(peg$currPos, 7) === peg$c99) {
                            s0 = peg$c99;
                            peg$currPos += 7;
                        }
                        else {
                            s0 = peg$FAILED;
                            if (peg$silentFails === 0) {
                                peg$fail(peg$e99);
                            }
                        }
                        if (s0 === peg$FAILED) {
                            if (input.substr(peg$currPos, 7) === peg$c100) {
                                s0 = peg$c100;
                                peg$currPos += 7;
                            }
                            else {
                                s0 = peg$FAILED;
                                if (peg$silentFails === 0) {
                                    peg$fail(peg$e100);
                                }
                            }
                            if (s0 === peg$FAILED) {
                                if (input.substr(peg$currPos, 7) === peg$c101) {
                                    s0 = peg$c101;
                                    peg$currPos += 7;
                                }
                                else {
                                    s0 = peg$FAILED;
                                    if (peg$silentFails === 0) {
                                        peg$fail(peg$e101);
                                    }
                                }
                                if (s0 === peg$FAILED) {
                                    if (input.substr(peg$currPos, 7) === peg$c102) {
                                        s0 = peg$c102;
                                        peg$currPos += 7;
                                    }
                                    else {
                                        s0 = peg$FAILED;
                                        if (peg$silentFails === 0) {
                                            peg$fail(peg$e102);
                                        }
                                    }
                                    if (s0 === peg$FAILED) {
                                        if (input.substr(peg$currPos, 7) === peg$c103) {
                                            s0 = peg$c103;
                                            peg$currPos += 7;
                                        }
                                        else {
                                            s0 = peg$FAILED;
                                            if (peg$silentFails === 0) {
                                                peg$fail(peg$e103);
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                    return s0;
                }
                function peg$parsetimeControlKey() {
                    var s0;
                    if (input.substr(peg$currPos, 11) === peg$c104) {
                        s0 = peg$c104;
                        peg$currPos += 11;
                    }
                    else {
                        s0 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$e104);
                        }
                    }
                    if (s0 === peg$FAILED) {
                        if (input.substr(peg$currPos, 11) === peg$c105) {
                            s0 = peg$c105;
                            peg$currPos += 11;
                        }
                        else {
                            s0 = peg$FAILED;
                            if (peg$silentFails === 0) {
                                peg$fail(peg$e105);
                            }
                        }
                        if (s0 === peg$FAILED) {
                            if (input.substr(peg$currPos, 11) === peg$c106) {
                                s0 = peg$c106;
                                peg$currPos += 11;
                            }
                            else {
                                s0 = peg$FAILED;
                                if (peg$silentFails === 0) {
                                    peg$fail(peg$e106);
                                }
                            }
                            if (s0 === peg$FAILED) {
                                if (input.substr(peg$currPos, 11) === peg$c107) {
                                    s0 = peg$c107;
                                    peg$currPos += 11;
                                }
                                else {
                                    s0 = peg$FAILED;
                                    if (peg$silentFails === 0) {
                                        peg$fail(peg$e107);
                                    }
                                }
                            }
                        }
                    }
                    return s0;
                }
                function peg$parsesetUpKey() {
                    var s0;
                    if (input.substr(peg$currPos, 5) === peg$c108) {
                        s0 = peg$c108;
                        peg$currPos += 5;
                    }
                    else {
                        s0 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$e108);
                        }
                    }
                    if (s0 === peg$FAILED) {
                        if (input.substr(peg$currPos, 5) === peg$c109) {
                            s0 = peg$c109;
                            peg$currPos += 5;
                        }
                        else {
                            s0 = peg$FAILED;
                            if (peg$silentFails === 0) {
                                peg$fail(peg$e109);
                            }
                        }
                        if (s0 === peg$FAILED) {
                            if (input.substr(peg$currPos, 5) === peg$c110) {
                                s0 = peg$c110;
                                peg$currPos += 5;
                            }
                            else {
                                s0 = peg$FAILED;
                                if (peg$silentFails === 0) {
                                    peg$fail(peg$e110);
                                }
                            }
                            if (s0 === peg$FAILED) {
                                if (input.substr(peg$currPos, 5) === peg$c111) {
                                    s0 = peg$c111;
                                    peg$currPos += 5;
                                }
                                else {
                                    s0 = peg$FAILED;
                                    if (peg$silentFails === 0) {
                                        peg$fail(peg$e111);
                                    }
                                }
                            }
                        }
                    }
                    return s0;
                }
                function peg$parsefenKey() {
                    var s0;
                    if (input.substr(peg$currPos, 3) === peg$c112) {
                        s0 = peg$c112;
                        peg$currPos += 3;
                    }
                    else {
                        s0 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$e112);
                        }
                    }
                    if (s0 === peg$FAILED) {
                        if (input.substr(peg$currPos, 3) === peg$c113) {
                            s0 = peg$c113;
                            peg$currPos += 3;
                        }
                        else {
                            s0 = peg$FAILED;
                            if (peg$silentFails === 0) {
                                peg$fail(peg$e113);
                            }
                        }
                        if (s0 === peg$FAILED) {
                            if (input.substr(peg$currPos, 3) === peg$c114) {
                                s0 = peg$c114;
                                peg$currPos += 3;
                            }
                            else {
                                s0 = peg$FAILED;
                                if (peg$silentFails === 0) {
                                    peg$fail(peg$e114);
                                }
                            }
                        }
                    }
                    return s0;
                }
                function peg$parseterminationKey() {
                    var s0;
                    if (input.substr(peg$currPos, 11) === peg$c115) {
                        s0 = peg$c115;
                        peg$currPos += 11;
                    }
                    else {
                        s0 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$e115);
                        }
                    }
                    if (s0 === peg$FAILED) {
                        if (input.substr(peg$currPos, 11) === peg$c116) {
                            s0 = peg$c116;
                            peg$currPos += 11;
                        }
                        else {
                            s0 = peg$FAILED;
                            if (peg$silentFails === 0) {
                                peg$fail(peg$e116);
                            }
                        }
                    }
                    return s0;
                }
                function peg$parseannotatorKey() {
                    var s0;
                    if (input.substr(peg$currPos, 9) === peg$c117) {
                        s0 = peg$c117;
                        peg$currPos += 9;
                    }
                    else {
                        s0 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$e117);
                        }
                    }
                    if (s0 === peg$FAILED) {
                        if (input.substr(peg$currPos, 9) === peg$c118) {
                            s0 = peg$c118;
                            peg$currPos += 9;
                        }
                        else {
                            s0 = peg$FAILED;
                            if (peg$silentFails === 0) {
                                peg$fail(peg$e118);
                            }
                        }
                    }
                    return s0;
                }
                function peg$parsemodeKey() {
                    var s0;
                    if (input.substr(peg$currPos, 4) === peg$c119) {
                        s0 = peg$c119;
                        peg$currPos += 4;
                    }
                    else {
                        s0 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$e119);
                        }
                    }
                    if (s0 === peg$FAILED) {
                        if (input.substr(peg$currPos, 4) === peg$c120) {
                            s0 = peg$c120;
                            peg$currPos += 4;
                        }
                        else {
                            s0 = peg$FAILED;
                            if (peg$silentFails === 0) {
                                peg$fail(peg$e120);
                            }
                        }
                    }
                    return s0;
                }
                function peg$parseplyCountKey() {
                    var s0;
                    if (input.substr(peg$currPos, 8) === peg$c121) {
                        s0 = peg$c121;
                        peg$currPos += 8;
                    }
                    else {
                        s0 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$e121);
                        }
                    }
                    if (s0 === peg$FAILED) {
                        if (input.substr(peg$currPos, 8) === peg$c122) {
                            s0 = peg$c122;
                            peg$currPos += 8;
                        }
                        else {
                            s0 = peg$FAILED;
                            if (peg$silentFails === 0) {
                                peg$fail(peg$e122);
                            }
                        }
                        if (s0 === peg$FAILED) {
                            if (input.substr(peg$currPos, 8) === peg$c123) {
                                s0 = peg$c123;
                                peg$currPos += 8;
                            }
                            else {
                                s0 = peg$FAILED;
                                if (peg$silentFails === 0) {
                                    peg$fail(peg$e123);
                                }
                            }
                            if (s0 === peg$FAILED) {
                                if (input.substr(peg$currPos, 8) === peg$c124) {
                                    s0 = peg$c124;
                                    peg$currPos += 8;
                                }
                                else {
                                    s0 = peg$FAILED;
                                    if (peg$silentFails === 0) {
                                        peg$fail(peg$e124);
                                    }
                                }
                            }
                        }
                    }
                    return s0;
                }
                function peg$parsevariantKey() {
                    var s0;
                    if (input.substr(peg$currPos, 7) === peg$c125) {
                        s0 = peg$c125;
                        peg$currPos += 7;
                    }
                    else {
                        s0 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$e125);
                        }
                    }
                    if (s0 === peg$FAILED) {
                        if (input.substr(peg$currPos, 7) === peg$c126) {
                            s0 = peg$c126;
                            peg$currPos += 7;
                        }
                        else {
                            s0 = peg$FAILED;
                            if (peg$silentFails === 0) {
                                peg$fail(peg$e126);
                            }
                        }
                    }
                    return s0;
                }
                function peg$parsewhiteRatingDiffKey() {
                    var s0;
                    if (input.substr(peg$currPos, 15) === peg$c127) {
                        s0 = peg$c127;
                        peg$currPos += 15;
                    }
                    else {
                        s0 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$e127);
                        }
                    }
                    return s0;
                }
                function peg$parseblackRatingDiffKey() {
                    var s0;
                    if (input.substr(peg$currPos, 15) === peg$c128) {
                        s0 = peg$c128;
                        peg$currPos += 15;
                    }
                    else {
                        s0 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$e128);
                        }
                    }
                    return s0;
                }
                function peg$parsewhiteFideIdKey() {
                    var s0;
                    if (input.substr(peg$currPos, 11) === peg$c129) {
                        s0 = peg$c129;
                        peg$currPos += 11;
                    }
                    else {
                        s0 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$e129);
                        }
                    }
                    return s0;
                }
                function peg$parseblackFideIdKey() {
                    var s0;
                    if (input.substr(peg$currPos, 11) === peg$c130) {
                        s0 = peg$c130;
                        peg$currPos += 11;
                    }
                    else {
                        s0 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$e130);
                        }
                    }
                    return s0;
                }
                function peg$parsewhiteTeamKey() {
                    var s0;
                    if (input.substr(peg$currPos, 9) === peg$c131) {
                        s0 = peg$c131;
                        peg$currPos += 9;
                    }
                    else {
                        s0 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$e131);
                        }
                    }
                    return s0;
                }
                function peg$parseblackTeamKey() {
                    var s0;
                    if (input.substr(peg$currPos, 9) === peg$c132) {
                        s0 = peg$c132;
                        peg$currPos += 9;
                    }
                    else {
                        s0 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$e132);
                        }
                    }
                    return s0;
                }
                function peg$parseclockKey() {
                    var s0;
                    if (input.substr(peg$currPos, 5) === peg$c133) {
                        s0 = peg$c133;
                        peg$currPos += 5;
                    }
                    else {
                        s0 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$e133);
                        }
                    }
                    return s0;
                }
                function peg$parsewhiteClockKey() {
                    var s0;
                    if (input.substr(peg$currPos, 10) === peg$c134) {
                        s0 = peg$c134;
                        peg$currPos += 10;
                    }
                    else {
                        s0 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$e134);
                        }
                    }
                    return s0;
                }
                function peg$parseblackClockKey() {
                    var s0;
                    if (input.substr(peg$currPos, 10) === peg$c135) {
                        s0 = peg$c135;
                        peg$currPos += 10;
                    }
                    else {
                        s0 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$e135);
                        }
                    }
                    return s0;
                }
                function peg$parsews() {
                    var s0, s1;
                    peg$silentFails++;
                    s0 = [];
                    if (peg$r0.test(input.charAt(peg$currPos))) {
                        s1 = input.charAt(peg$currPos);
                        peg$currPos++;
                    }
                    else {
                        s1 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$e137);
                        }
                    }
                    while (s1 !== peg$FAILED) {
                        s0.push(s1);
                        if (peg$r0.test(input.charAt(peg$currPos))) {
                            s1 = input.charAt(peg$currPos);
                            peg$currPos++;
                        }
                        else {
                            s1 = peg$FAILED;
                            if (peg$silentFails === 0) {
                                peg$fail(peg$e137);
                            }
                        }
                    }
                    peg$silentFails--;
                    s1 = peg$FAILED;
                    if (peg$silentFails === 0) {
                        peg$fail(peg$e136);
                    }
                    return s0;
                }
                function peg$parsewsp() {
                    var s0, s1;
                    s0 = [];
                    if (peg$r0.test(input.charAt(peg$currPos))) {
                        s1 = input.charAt(peg$currPos);
                        peg$currPos++;
                    }
                    else {
                        s1 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$e137);
                        }
                    }
                    if (s1 !== peg$FAILED) {
                        while (s1 !== peg$FAILED) {
                            s0.push(s1);
                            if (peg$r0.test(input.charAt(peg$currPos))) {
                                s1 = input.charAt(peg$currPos);
                                peg$currPos++;
                            }
                            else {
                                s1 = peg$FAILED;
                                if (peg$silentFails === 0) {
                                    peg$fail(peg$e137);
                                }
                            }
                        }
                    }
                    else {
                        s0 = peg$FAILED;
                    }
                    return s0;
                }
                function peg$parseeol() {
                    var s0, s1;
                    s0 = [];
                    if (peg$r1.test(input.charAt(peg$currPos))) {
                        s1 = input.charAt(peg$currPos);
                        peg$currPos++;
                    }
                    else {
                        s1 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$e138);
                        }
                    }
                    if (s1 !== peg$FAILED) {
                        while (s1 !== peg$FAILED) {
                            s0.push(s1);
                            if (peg$r1.test(input.charAt(peg$currPos))) {
                                s1 = input.charAt(peg$currPos);
                                peg$currPos++;
                            }
                            else {
                                s1 = peg$FAILED;
                                if (peg$silentFails === 0) {
                                    peg$fail(peg$e138);
                                }
                            }
                        }
                    }
                    else {
                        s0 = peg$FAILED;
                    }
                    return s0;
                }
                function peg$parsestringNoQuot() {
                    var s0, s1, s2;
                    s0 = peg$currPos;
                    s1 = [];
                    if (peg$r2.test(input.charAt(peg$currPos))) {
                        s2 = input.charAt(peg$currPos);
                        peg$currPos++;
                    }
                    else {
                        s2 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$e140);
                        }
                    }
                    while (s2 !== peg$FAILED) {
                        s1.push(s2);
                        if (peg$r2.test(input.charAt(peg$currPos))) {
                            s2 = input.charAt(peg$currPos);
                            peg$currPos++;
                        }
                        else {
                            s2 = peg$FAILED;
                            if (peg$silentFails === 0) {
                                peg$fail(peg$e140);
                            }
                        }
                    }
                    peg$savedPos = s0;
                    s1 = peg$f58(s1);
                    s0 = s1;
                    return s0;
                }
                function peg$parsequotation_mark() {
                    var s0;
                    if (input.charCodeAt(peg$currPos) === 34) {
                        s0 = peg$c137;
                        peg$currPos++;
                    }
                    else {
                        s0 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$e141);
                        }
                    }
                    return s0;
                }
                function peg$parsestring() {
                    var s0, s1, s3, s4, s5;
                    s0 = peg$currPos;
                    if (input.charCodeAt(peg$currPos) === 34) {
                        s1 = peg$c137;
                        peg$currPos++;
                    }
                    else {
                        s1 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$e141);
                        }
                    }
                    if (s1 !== peg$FAILED) {
                        peg$parse_();
                        s3 = [];
                        s4 = peg$parsestringChar();
                        while (s4 !== peg$FAILED) {
                            s3.push(s4);
                            s4 = peg$parsestringChar();
                        }
                        s4 = peg$parse_();
                        if (input.charCodeAt(peg$currPos) === 34) {
                            s5 = peg$c137;
                            peg$currPos++;
                        }
                        else {
                            s5 = peg$FAILED;
                            if (peg$silentFails === 0) {
                                peg$fail(peg$e141);
                            }
                        }
                        if (s5 !== peg$FAILED) {
                            peg$savedPos = s0;
                            s0 = peg$f59(s3);
                        }
                        else {
                            peg$currPos = s0;
                            s0 = peg$FAILED;
                        }
                    }
                    else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                    }
                    return s0;
                }
                function peg$parsestringChar() {
                    var s0, s1, s2, s3;
                    if (peg$r3.test(input.charAt(peg$currPos))) {
                        s0 = input.charAt(peg$currPos);
                        peg$currPos++;
                    }
                    else {
                        s0 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$e142);
                        }
                    }
                    if (s0 === peg$FAILED) {
                        s0 = peg$currPos;
                        s1 = peg$parseEscape();
                        if (s1 !== peg$FAILED) {
                            s2 = peg$currPos;
                            if (input.charCodeAt(peg$currPos) === 92) {
                                s3 = peg$c138;
                                peg$currPos++;
                            }
                            else {
                                s3 = peg$FAILED;
                                if (peg$silentFails === 0) {
                                    peg$fail(peg$e143);
                                }
                            }
                            if (s3 !== peg$FAILED) {
                                peg$savedPos = s2;
                                s3 = peg$f60();
                            }
                            s2 = s3;
                            if (s2 === peg$FAILED) {
                                s2 = peg$currPos;
                                if (input.charCodeAt(peg$currPos) === 34) {
                                    s3 = peg$c137;
                                    peg$currPos++;
                                }
                                else {
                                    s3 = peg$FAILED;
                                    if (peg$silentFails === 0) {
                                        peg$fail(peg$e141);
                                    }
                                }
                                if (s3 !== peg$FAILED) {
                                    peg$savedPos = s2;
                                    s3 = peg$f61();
                                }
                                s2 = s3;
                            }
                            if (s2 !== peg$FAILED) {
                                peg$savedPos = s0;
                                s0 = peg$f62(s2);
                            }
                            else {
                                peg$currPos = s0;
                                s0 = peg$FAILED;
                            }
                        }
                        else {
                            peg$currPos = s0;
                            s0 = peg$FAILED;
                        }
                    }
                    return s0;
                }
                function peg$parse_() {
                    var s0, s1;
                    peg$silentFails++;
                    s0 = [];
                    if (peg$r0.test(input.charAt(peg$currPos))) {
                        s1 = input.charAt(peg$currPos);
                        peg$currPos++;
                    }
                    else {
                        s1 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$e137);
                        }
                    }
                    while (s1 !== peg$FAILED) {
                        s0.push(s1);
                        if (peg$r0.test(input.charAt(peg$currPos))) {
                            s1 = input.charAt(peg$currPos);
                            peg$currPos++;
                        }
                        else {
                            s1 = peg$FAILED;
                            if (peg$silentFails === 0) {
                                peg$fail(peg$e137);
                            }
                        }
                    }
                    peg$silentFails--;
                    s1 = peg$FAILED;
                    if (peg$silentFails === 0) {
                        peg$fail(peg$e136);
                    }
                    return s0;
                }
                function peg$parseEscape() {
                    var s0;
                    if (input.charCodeAt(peg$currPos) === 92) {
                        s0 = peg$c138;
                        peg$currPos++;
                    }
                    else {
                        s0 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$e143);
                        }
                    }
                    return s0;
                }
                function peg$parsedateString() {
                    var s0, s1, s2, s3, s4, s5, s6, s7, s8;
                    s0 = peg$currPos;
                    s1 = peg$parsequotation_mark();
                    if (s1 !== peg$FAILED) {
                        s2 = peg$currPos;
                        if (peg$r4.test(input.charAt(peg$currPos))) {
                            s3 = input.charAt(peg$currPos);
                            peg$currPos++;
                        }
                        else {
                            s3 = peg$FAILED;
                            if (peg$silentFails === 0) {
                                peg$fail(peg$e144);
                            }
                        }
                        if (s3 !== peg$FAILED) {
                            if (peg$r4.test(input.charAt(peg$currPos))) {
                                s4 = input.charAt(peg$currPos);
                                peg$currPos++;
                            }
                            else {
                                s4 = peg$FAILED;
                                if (peg$silentFails === 0) {
                                    peg$fail(peg$e144);
                                }
                            }
                            if (s4 !== peg$FAILED) {
                                if (peg$r4.test(input.charAt(peg$currPos))) {
                                    s5 = input.charAt(peg$currPos);
                                    peg$currPos++;
                                }
                                else {
                                    s5 = peg$FAILED;
                                    if (peg$silentFails === 0) {
                                        peg$fail(peg$e144);
                                    }
                                }
                                if (s5 !== peg$FAILED) {
                                    if (peg$r4.test(input.charAt(peg$currPos))) {
                                        s6 = input.charAt(peg$currPos);
                                        peg$currPos++;
                                    }
                                    else {
                                        s6 = peg$FAILED;
                                        if (peg$silentFails === 0) {
                                            peg$fail(peg$e144);
                                        }
                                    }
                                    if (s6 !== peg$FAILED) {
                                        s3 = [s3, s4, s5, s6];
                                        s2 = s3;
                                    }
                                    else {
                                        peg$currPos = s2;
                                        s2 = peg$FAILED;
                                    }
                                }
                                else {
                                    peg$currPos = s2;
                                    s2 = peg$FAILED;
                                }
                            }
                            else {
                                peg$currPos = s2;
                                s2 = peg$FAILED;
                            }
                        }
                        else {
                            peg$currPos = s2;
                            s2 = peg$FAILED;
                        }
                        if (s2 !== peg$FAILED) {
                            if (input.charCodeAt(peg$currPos) === 46) {
                                s3 = peg$c139;
                                peg$currPos++;
                            }
                            else {
                                s3 = peg$FAILED;
                                if (peg$silentFails === 0) {
                                    peg$fail(peg$e145);
                                }
                            }
                            if (s3 !== peg$FAILED) {
                                s4 = peg$currPos;
                                if (peg$r4.test(input.charAt(peg$currPos))) {
                                    s5 = input.charAt(peg$currPos);
                                    peg$currPos++;
                                }
                                else {
                                    s5 = peg$FAILED;
                                    if (peg$silentFails === 0) {
                                        peg$fail(peg$e144);
                                    }
                                }
                                if (s5 !== peg$FAILED) {
                                    if (peg$r4.test(input.charAt(peg$currPos))) {
                                        s6 = input.charAt(peg$currPos);
                                        peg$currPos++;
                                    }
                                    else {
                                        s6 = peg$FAILED;
                                        if (peg$silentFails === 0) {
                                            peg$fail(peg$e144);
                                        }
                                    }
                                    if (s6 !== peg$FAILED) {
                                        s5 = [s5, s6];
                                        s4 = s5;
                                    }
                                    else {
                                        peg$currPos = s4;
                                        s4 = peg$FAILED;
                                    }
                                }
                                else {
                                    peg$currPos = s4;
                                    s4 = peg$FAILED;
                                }
                                if (s4 !== peg$FAILED) {
                                    if (input.charCodeAt(peg$currPos) === 46) {
                                        s5 = peg$c139;
                                        peg$currPos++;
                                    }
                                    else {
                                        s5 = peg$FAILED;
                                        if (peg$silentFails === 0) {
                                            peg$fail(peg$e145);
                                        }
                                    }
                                    if (s5 !== peg$FAILED) {
                                        s6 = peg$currPos;
                                        if (peg$r4.test(input.charAt(peg$currPos))) {
                                            s7 = input.charAt(peg$currPos);
                                            peg$currPos++;
                                        }
                                        else {
                                            s7 = peg$FAILED;
                                            if (peg$silentFails === 0) {
                                                peg$fail(peg$e144);
                                            }
                                        }
                                        if (s7 !== peg$FAILED) {
                                            if (peg$r4.test(input.charAt(peg$currPos))) {
                                                s8 = input.charAt(peg$currPos);
                                                peg$currPos++;
                                            }
                                            else {
                                                s8 = peg$FAILED;
                                                if (peg$silentFails === 0) {
                                                    peg$fail(peg$e144);
                                                }
                                            }
                                            if (s8 !== peg$FAILED) {
                                                s7 = [s7, s8];
                                                s6 = s7;
                                            }
                                            else {
                                                peg$currPos = s6;
                                                s6 = peg$FAILED;
                                            }
                                        }
                                        else {
                                            peg$currPos = s6;
                                            s6 = peg$FAILED;
                                        }
                                        if (s6 !== peg$FAILED) {
                                            s7 = peg$parsequotation_mark();
                                            if (s7 !== peg$FAILED) {
                                                peg$savedPos = s0;
                                                s0 = peg$f63(s2, s4, s6);
                                            }
                                            else {
                                                peg$currPos = s0;
                                                s0 = peg$FAILED;
                                            }
                                        }
                                        else {
                                            peg$currPos = s0;
                                            s0 = peg$FAILED;
                                        }
                                    }
                                    else {
                                        peg$currPos = s0;
                                        s0 = peg$FAILED;
                                    }
                                }
                                else {
                                    peg$currPos = s0;
                                    s0 = peg$FAILED;
                                }
                            }
                            else {
                                peg$currPos = s0;
                                s0 = peg$FAILED;
                            }
                        }
                        else {
                            peg$currPos = s0;
                            s0 = peg$FAILED;
                        }
                    }
                    else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                    }
                    return s0;
                }
                function peg$parsetimeString() {
                    var s0, s1, s2, s3, s4, s5, s6, s7, s8;
                    s0 = peg$currPos;
                    s1 = peg$parsequotation_mark();
                    if (s1 !== peg$FAILED) {
                        s2 = [];
                        if (peg$r5.test(input.charAt(peg$currPos))) {
                            s3 = input.charAt(peg$currPos);
                            peg$currPos++;
                        }
                        else {
                            s3 = peg$FAILED;
                            if (peg$silentFails === 0) {
                                peg$fail(peg$e146);
                            }
                        }
                        if (s3 !== peg$FAILED) {
                            while (s3 !== peg$FAILED) {
                                s2.push(s3);
                                if (peg$r5.test(input.charAt(peg$currPos))) {
                                    s3 = input.charAt(peg$currPos);
                                    peg$currPos++;
                                }
                                else {
                                    s3 = peg$FAILED;
                                    if (peg$silentFails === 0) {
                                        peg$fail(peg$e146);
                                    }
                                }
                            }
                        }
                        else {
                            s2 = peg$FAILED;
                        }
                        if (s2 !== peg$FAILED) {
                            if (input.charCodeAt(peg$currPos) === 58) {
                                s3 = peg$c140;
                                peg$currPos++;
                            }
                            else {
                                s3 = peg$FAILED;
                                if (peg$silentFails === 0) {
                                    peg$fail(peg$e147);
                                }
                            }
                            if (s3 !== peg$FAILED) {
                                s4 = [];
                                if (peg$r5.test(input.charAt(peg$currPos))) {
                                    s5 = input.charAt(peg$currPos);
                                    peg$currPos++;
                                }
                                else {
                                    s5 = peg$FAILED;
                                    if (peg$silentFails === 0) {
                                        peg$fail(peg$e146);
                                    }
                                }
                                if (s5 !== peg$FAILED) {
                                    while (s5 !== peg$FAILED) {
                                        s4.push(s5);
                                        if (peg$r5.test(input.charAt(peg$currPos))) {
                                            s5 = input.charAt(peg$currPos);
                                            peg$currPos++;
                                        }
                                        else {
                                            s5 = peg$FAILED;
                                            if (peg$silentFails === 0) {
                                                peg$fail(peg$e146);
                                            }
                                        }
                                    }
                                }
                                else {
                                    s4 = peg$FAILED;
                                }
                                if (s4 !== peg$FAILED) {
                                    if (input.charCodeAt(peg$currPos) === 58) {
                                        s5 = peg$c140;
                                        peg$currPos++;
                                    }
                                    else {
                                        s5 = peg$FAILED;
                                        if (peg$silentFails === 0) {
                                            peg$fail(peg$e147);
                                        }
                                    }
                                    if (s5 !== peg$FAILED) {
                                        s6 = [];
                                        if (peg$r5.test(input.charAt(peg$currPos))) {
                                            s7 = input.charAt(peg$currPos);
                                            peg$currPos++;
                                        }
                                        else {
                                            s7 = peg$FAILED;
                                            if (peg$silentFails === 0) {
                                                peg$fail(peg$e146);
                                            }
                                        }
                                        if (s7 !== peg$FAILED) {
                                            while (s7 !== peg$FAILED) {
                                                s6.push(s7);
                                                if (peg$r5.test(input.charAt(peg$currPos))) {
                                                    s7 = input.charAt(peg$currPos);
                                                    peg$currPos++;
                                                }
                                                else {
                                                    s7 = peg$FAILED;
                                                    if (peg$silentFails === 0) {
                                                        peg$fail(peg$e146);
                                                    }
                                                }
                                            }
                                        }
                                        else {
                                            s6 = peg$FAILED;
                                        }
                                        if (s6 !== peg$FAILED) {
                                            s7 = peg$parsemillis();
                                            if (s7 === peg$FAILED) {
                                                s7 = null;
                                            }
                                            s8 = peg$parsequotation_mark();
                                            if (s8 !== peg$FAILED) {
                                                peg$savedPos = s0;
                                                s0 = peg$f64(s2, s4, s6, s7);
                                            }
                                            else {
                                                peg$currPos = s0;
                                                s0 = peg$FAILED;
                                            }
                                        }
                                        else {
                                            peg$currPos = s0;
                                            s0 = peg$FAILED;
                                        }
                                    }
                                    else {
                                        peg$currPos = s0;
                                        s0 = peg$FAILED;
                                    }
                                }
                                else {
                                    peg$currPos = s0;
                                    s0 = peg$FAILED;
                                }
                            }
                            else {
                                peg$currPos = s0;
                                s0 = peg$FAILED;
                            }
                        }
                        else {
                            peg$currPos = s0;
                            s0 = peg$FAILED;
                        }
                    }
                    else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                    }
                    return s0;
                }
                function peg$parsemillis() {
                    var s0, s1, s2, s3;
                    s0 = peg$currPos;
                    if (input.charCodeAt(peg$currPos) === 46) {
                        s1 = peg$c139;
                        peg$currPos++;
                    }
                    else {
                        s1 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$e145);
                        }
                    }
                    if (s1 !== peg$FAILED) {
                        s2 = [];
                        if (peg$r5.test(input.charAt(peg$currPos))) {
                            s3 = input.charAt(peg$currPos);
                            peg$currPos++;
                        }
                        else {
                            s3 = peg$FAILED;
                            if (peg$silentFails === 0) {
                                peg$fail(peg$e146);
                            }
                        }
                        if (s3 !== peg$FAILED) {
                            while (s3 !== peg$FAILED) {
                                s2.push(s3);
                                if (peg$r5.test(input.charAt(peg$currPos))) {
                                    s3 = input.charAt(peg$currPos);
                                    peg$currPos++;
                                }
                                else {
                                    s3 = peg$FAILED;
                                    if (peg$silentFails === 0) {
                                        peg$fail(peg$e146);
                                    }
                                }
                            }
                        }
                        else {
                            s2 = peg$FAILED;
                        }
                        if (s2 !== peg$FAILED) {
                            peg$savedPos = s0;
                            s0 = peg$f65(s2);
                        }
                        else {
                            peg$currPos = s0;
                            s0 = peg$FAILED;
                        }
                    }
                    else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                    }
                    return s0;
                }
                function peg$parsecolorClockTimeQ() {
                    var s0, s1, s2, s3;
                    s0 = peg$currPos;
                    s1 = peg$parsequotation_mark();
                    if (s1 !== peg$FAILED) {
                        s2 = peg$parsecolorClockTime();
                        if (s2 !== peg$FAILED) {
                            s3 = peg$parsequotation_mark();
                            if (s3 !== peg$FAILED) {
                                peg$savedPos = s0;
                                s0 = peg$f66(s2);
                            }
                            else {
                                peg$currPos = s0;
                                s0 = peg$FAILED;
                            }
                        }
                        else {
                            peg$currPos = s0;
                            s0 = peg$FAILED;
                        }
                    }
                    else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                    }
                    return s0;
                }
                function peg$parsecolorClockTime() {
                    var s0, s1, s2, s3;
                    s0 = peg$currPos;
                    s1 = peg$parseclockColor();
                    if (s1 !== peg$FAILED) {
                        if (input.charCodeAt(peg$currPos) === 47) {
                            s2 = peg$c141;
                            peg$currPos++;
                        }
                        else {
                            s2 = peg$FAILED;
                            if (peg$silentFails === 0) {
                                peg$fail(peg$e148);
                            }
                        }
                        if (s2 !== peg$FAILED) {
                            s3 = peg$parseclockTime();
                            if (s3 !== peg$FAILED) {
                                peg$savedPos = s0;
                                s0 = peg$f67(s1, s3);
                            }
                            else {
                                peg$currPos = s0;
                                s0 = peg$FAILED;
                            }
                        }
                        else {
                            peg$currPos = s0;
                            s0 = peg$FAILED;
                        }
                    }
                    else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                    }
                    return s0;
                }
                function peg$parseclockColor() {
                    var s0;
                    if (input.charCodeAt(peg$currPos) === 66) {
                        s0 = peg$c142;
                        peg$currPos++;
                    }
                    else {
                        s0 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$e149);
                        }
                    }
                    if (s0 === peg$FAILED) {
                        if (input.charCodeAt(peg$currPos) === 87) {
                            s0 = peg$c143;
                            peg$currPos++;
                        }
                        else {
                            s0 = peg$FAILED;
                            if (peg$silentFails === 0) {
                                peg$fail(peg$e150);
                            }
                        }
                        if (s0 === peg$FAILED) {
                            if (input.charCodeAt(peg$currPos) === 78) {
                                s0 = peg$c144;
                                peg$currPos++;
                            }
                            else {
                                s0 = peg$FAILED;
                                if (peg$silentFails === 0) {
                                    peg$fail(peg$e151);
                                }
                            }
                        }
                    }
                    return s0;
                }
                function peg$parseclockTimeQ() {
                    var s0, s1, s2, s3;
                    s0 = peg$currPos;
                    s1 = peg$parsequotation_mark();
                    if (s1 !== peg$FAILED) {
                        s2 = peg$parseclockTime();
                        if (s2 !== peg$FAILED) {
                            s3 = peg$parsequotation_mark();
                            if (s3 !== peg$FAILED) {
                                peg$savedPos = s0;
                                s0 = peg$f68(s2);
                            }
                            else {
                                peg$currPos = s0;
                                s0 = peg$FAILED;
                            }
                        }
                        else {
                            peg$currPos = s0;
                            s0 = peg$FAILED;
                        }
                    }
                    else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                    }
                    return s0;
                }
                function peg$parseclockTime() {
                    var s0, s1;
                    s0 = peg$currPos;
                    s1 = peg$parseclockValue1D();
                    if (s1 !== peg$FAILED) {
                        peg$savedPos = s0;
                        s1 = peg$f69(s1);
                    }
                    s0 = s1;
                    return s0;
                }
                function peg$parsetimeControl() {
                    var s0, s1, s2, s3;
                    s0 = peg$currPos;
                    s1 = peg$parsequotation_mark();
                    if (s1 !== peg$FAILED) {
                        s2 = peg$parsetcnqs();
                        s3 = peg$parsequotation_mark();
                        if (s3 !== peg$FAILED) {
                            peg$savedPos = s0;
                            s0 = peg$f70(s2);
                        }
                        else {
                            peg$currPos = s0;
                            s0 = peg$FAILED;
                        }
                    }
                    else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                    }
                    return s0;
                }
                function peg$parsetcnqs() {
                    var s0, s1, s2, s3, s4, s5, s6;
                    s0 = peg$currPos;
                    s1 = peg$currPos;
                    s2 = peg$parsetcnq();
                    if (s2 !== peg$FAILED) {
                        s3 = [];
                        s4 = peg$currPos;
                        if (input.charCodeAt(peg$currPos) === 58) {
                            s5 = peg$c140;
                            peg$currPos++;
                        }
                        else {
                            s5 = peg$FAILED;
                            if (peg$silentFails === 0) {
                                peg$fail(peg$e147);
                            }
                        }
                        if (s5 !== peg$FAILED) {
                            s6 = peg$parsetcnq();
                            if (s6 !== peg$FAILED) {
                                peg$savedPos = s4;
                                s4 = peg$f71(s2, s6);
                            }
                            else {
                                peg$currPos = s4;
                                s4 = peg$FAILED;
                            }
                        }
                        else {
                            peg$currPos = s4;
                            s4 = peg$FAILED;
                        }
                        while (s4 !== peg$FAILED) {
                            s3.push(s4);
                            s4 = peg$currPos;
                            if (input.charCodeAt(peg$currPos) === 58) {
                                s5 = peg$c140;
                                peg$currPos++;
                            }
                            else {
                                s5 = peg$FAILED;
                                if (peg$silentFails === 0) {
                                    peg$fail(peg$e147);
                                }
                            }
                            if (s5 !== peg$FAILED) {
                                s6 = peg$parsetcnq();
                                if (s6 !== peg$FAILED) {
                                    peg$savedPos = s4;
                                    s4 = peg$f71(s2, s6);
                                }
                                else {
                                    peg$currPos = s4;
                                    s4 = peg$FAILED;
                                }
                            }
                            else {
                                peg$currPos = s4;
                                s4 = peg$FAILED;
                            }
                        }
                        peg$savedPos = s1;
                        s1 = peg$f72(s2, s3);
                    }
                    else {
                        peg$currPos = s1;
                        s1 = peg$FAILED;
                    }
                    if (s1 === peg$FAILED) {
                        s1 = null;
                    }
                    peg$savedPos = s0;
                    s1 = peg$f73(s1);
                    s0 = s1;
                    return s0;
                }
                function peg$parsetcnq() {
                    var s0, s1, s2, s3, s4, s5;
                    s0 = peg$currPos;
                    if (input.charCodeAt(peg$currPos) === 63) {
                        s1 = peg$c145;
                        peg$currPos++;
                    }
                    else {
                        s1 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$e152);
                        }
                    }
                    if (s1 !== peg$FAILED) {
                        peg$savedPos = s0;
                        s1 = peg$f74();
                    }
                    s0 = s1;
                    if (s0 === peg$FAILED) {
                        s0 = peg$currPos;
                        if (input.charCodeAt(peg$currPos) === 45) {
                            s1 = peg$c146;
                            peg$currPos++;
                        }
                        else {
                            s1 = peg$FAILED;
                            if (peg$silentFails === 0) {
                                peg$fail(peg$e153);
                            }
                        }
                        if (s1 !== peg$FAILED) {
                            peg$savedPos = s0;
                            s1 = peg$f75();
                        }
                        s0 = s1;
                        if (s0 === peg$FAILED) {
                            s0 = peg$currPos;
                            s1 = peg$parseinteger();
                            if (s1 !== peg$FAILED) {
                                if (input.charCodeAt(peg$currPos) === 47) {
                                    s2 = peg$c141;
                                    peg$currPos++;
                                }
                                else {
                                    s2 = peg$FAILED;
                                    if (peg$silentFails === 0) {
                                        peg$fail(peg$e148);
                                    }
                                }
                                if (s2 !== peg$FAILED) {
                                    s3 = peg$parseinteger();
                                    if (s3 !== peg$FAILED) {
                                        if (input.charCodeAt(peg$currPos) === 43) {
                                            s4 = peg$c147;
                                            peg$currPos++;
                                        }
                                        else {
                                            s4 = peg$FAILED;
                                            if (peg$silentFails === 0) {
                                                peg$fail(peg$e154);
                                            }
                                        }
                                        if (s4 !== peg$FAILED) {
                                            s5 = peg$parseinteger();
                                            if (s5 !== peg$FAILED) {
                                                peg$savedPos = s0;
                                                s0 = peg$f76(s1, s3, s5);
                                            }
                                            else {
                                                peg$currPos = s0;
                                                s0 = peg$FAILED;
                                            }
                                        }
                                        else {
                                            peg$currPos = s0;
                                            s0 = peg$FAILED;
                                        }
                                    }
                                    else {
                                        peg$currPos = s0;
                                        s0 = peg$FAILED;
                                    }
                                }
                                else {
                                    peg$currPos = s0;
                                    s0 = peg$FAILED;
                                }
                            }
                            else {
                                peg$currPos = s0;
                                s0 = peg$FAILED;
                            }
                            if (s0 === peg$FAILED) {
                                s0 = peg$currPos;
                                s1 = peg$parseinteger();
                                if (s1 !== peg$FAILED) {
                                    if (input.charCodeAt(peg$currPos) === 47) {
                                        s2 = peg$c141;
                                        peg$currPos++;
                                    }
                                    else {
                                        s2 = peg$FAILED;
                                        if (peg$silentFails === 0) {
                                            peg$fail(peg$e148);
                                        }
                                    }
                                    if (s2 !== peg$FAILED) {
                                        s3 = peg$parseinteger();
                                        if (s3 !== peg$FAILED) {
                                            peg$savedPos = s0;
                                            s0 = peg$f77(s1, s3);
                                        }
                                        else {
                                            peg$currPos = s0;
                                            s0 = peg$FAILED;
                                        }
                                    }
                                    else {
                                        peg$currPos = s0;
                                        s0 = peg$FAILED;
                                    }
                                }
                                else {
                                    peg$currPos = s0;
                                    s0 = peg$FAILED;
                                }
                                if (s0 === peg$FAILED) {
                                    s0 = peg$currPos;
                                    s1 = peg$parseinteger();
                                    if (s1 !== peg$FAILED) {
                                        if (input.charCodeAt(peg$currPos) === 43) {
                                            s2 = peg$c147;
                                            peg$currPos++;
                                        }
                                        else {
                                            s2 = peg$FAILED;
                                            if (peg$silentFails === 0) {
                                                peg$fail(peg$e154);
                                            }
                                        }
                                        if (s2 !== peg$FAILED) {
                                            s3 = peg$parseinteger();
                                            if (s3 !== peg$FAILED) {
                                                peg$savedPos = s0;
                                                s0 = peg$f78(s1, s3);
                                            }
                                            else {
                                                peg$currPos = s0;
                                                s0 = peg$FAILED;
                                            }
                                        }
                                        else {
                                            peg$currPos = s0;
                                            s0 = peg$FAILED;
                                        }
                                    }
                                    else {
                                        peg$currPos = s0;
                                        s0 = peg$FAILED;
                                    }
                                    if (s0 === peg$FAILED) {
                                        s0 = peg$currPos;
                                        s1 = peg$parseinteger();
                                        if (s1 !== peg$FAILED) {
                                            peg$savedPos = s0;
                                            s1 = peg$f79(s1);
                                        }
                                        s0 = s1;
                                        if (s0 === peg$FAILED) {
                                            s0 = peg$currPos;
                                            if (input.charCodeAt(peg$currPos) === 42) {
                                                s1 = peg$c148;
                                                peg$currPos++;
                                            }
                                            else {
                                                s1 = peg$FAILED;
                                                if (peg$silentFails === 0) {
                                                    peg$fail(peg$e155);
                                                }
                                            }
                                            if (s1 !== peg$FAILED) {
                                                s2 = peg$parseinteger();
                                                if (s2 !== peg$FAILED) {
                                                    peg$savedPos = s0;
                                                    s0 = peg$f80(s2);
                                                }
                                                else {
                                                    peg$currPos = s0;
                                                    s0 = peg$FAILED;
                                                }
                                            }
                                            else {
                                                peg$currPos = s0;
                                                s0 = peg$FAILED;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                    return s0;
                }
                function peg$parseresult() {
                    var s0, s1, s2, s3;
                    s0 = peg$currPos;
                    s1 = peg$parsequotation_mark();
                    if (s1 !== peg$FAILED) {
                        s2 = peg$parseinnerResult();
                        if (s2 !== peg$FAILED) {
                            s3 = peg$parsequotation_mark();
                            if (s3 !== peg$FAILED) {
                                peg$savedPos = s0;
                                s0 = peg$f81(s2);
                            }
                            else {
                                peg$currPos = s0;
                                s0 = peg$FAILED;
                            }
                        }
                        else {
                            peg$currPos = s0;
                            s0 = peg$FAILED;
                        }
                    }
                    else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                    }
                    return s0;
                }
                function peg$parseinnerResult() {
                    var s0, s1;
                    s0 = peg$currPos;
                    if (input.substr(peg$currPos, 3) === peg$c149) {
                        s1 = peg$c149;
                        peg$currPos += 3;
                    }
                    else {
                        s1 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$e156);
                        }
                    }
                    if (s1 !== peg$FAILED) {
                        peg$savedPos = s0;
                        s1 = peg$f82(s1);
                    }
                    s0 = s1;
                    if (s0 === peg$FAILED) {
                        s0 = peg$currPos;
                        if (input.substr(peg$currPos, 3) === peg$c150) {
                            s1 = peg$c150;
                            peg$currPos += 3;
                        }
                        else {
                            s1 = peg$FAILED;
                            if (peg$silentFails === 0) {
                                peg$fail(peg$e157);
                            }
                        }
                        if (s1 !== peg$FAILED) {
                            peg$savedPos = s0;
                            s1 = peg$f83(s1);
                        }
                        s0 = s1;
                        if (s0 === peg$FAILED) {
                            s0 = peg$currPos;
                            if (input.substr(peg$currPos, 7) === peg$c151) {
                                s1 = peg$c151;
                                peg$currPos += 7;
                            }
                            else {
                                s1 = peg$FAILED;
                                if (peg$silentFails === 0) {
                                    peg$fail(peg$e158);
                                }
                            }
                            if (s1 !== peg$FAILED) {
                                peg$savedPos = s0;
                                s1 = peg$f84(s1);
                            }
                            s0 = s1;
                            if (s0 === peg$FAILED) {
                                s0 = peg$currPos;
                                if (input.charCodeAt(peg$currPos) === 42) {
                                    s1 = peg$c148;
                                    peg$currPos++;
                                }
                                else {
                                    s1 = peg$FAILED;
                                    if (peg$silentFails === 0) {
                                        peg$fail(peg$e155);
                                    }
                                }
                                if (s1 !== peg$FAILED) {
                                    peg$savedPos = s0;
                                    s1 = peg$f85(s1);
                                }
                                s0 = s1;
                            }
                        }
                    }
                    return s0;
                }
                function peg$parseintegerOrDashString() {
                    var s0, s1, s2, s3;
                    s0 = peg$currPos;
                    s1 = peg$parseintegerString();
                    if (s1 !== peg$FAILED) {
                        peg$savedPos = s0;
                        s1 = peg$f86(s1);
                    }
                    s0 = s1;
                    if (s0 === peg$FAILED) {
                        s0 = peg$currPos;
                        s1 = peg$parsequotation_mark();
                        if (s1 !== peg$FAILED) {
                            if (input.charCodeAt(peg$currPos) === 45) {
                                s2 = peg$c146;
                                peg$currPos++;
                            }
                            else {
                                s2 = peg$FAILED;
                                if (peg$silentFails === 0) {
                                    peg$fail(peg$e153);
                                }
                            }
                            if (s2 !== peg$FAILED) {
                                s3 = peg$parsequotation_mark();
                                if (s3 !== peg$FAILED) {
                                    peg$savedPos = s0;
                                    s0 = peg$f87();
                                }
                                else {
                                    peg$currPos = s0;
                                    s0 = peg$FAILED;
                                }
                            }
                            else {
                                peg$currPos = s0;
                                s0 = peg$FAILED;
                            }
                        }
                        else {
                            peg$currPos = s0;
                            s0 = peg$FAILED;
                        }
                        if (s0 === peg$FAILED) {
                            s0 = peg$currPos;
                            s1 = peg$parsequotation_mark();
                            if (s1 !== peg$FAILED) {
                                s2 = peg$parsequotation_mark();
                                if (s2 !== peg$FAILED) {
                                    peg$savedPos = s0;
                                    s0 = peg$f88();
                                }
                                else {
                                    peg$currPos = s0;
                                    s0 = peg$FAILED;
                                }
                            }
                            else {
                                peg$currPos = s0;
                                s0 = peg$FAILED;
                            }
                        }
                    }
                    return s0;
                }
                function peg$parseintegerString() {
                    var s0, s1, s2, s3;
                    s0 = peg$currPos;
                    s1 = peg$parsequotation_mark();
                    if (s1 !== peg$FAILED) {
                        s2 = [];
                        if (peg$r5.test(input.charAt(peg$currPos))) {
                            s3 = input.charAt(peg$currPos);
                            peg$currPos++;
                        }
                        else {
                            s3 = peg$FAILED;
                            if (peg$silentFails === 0) {
                                peg$fail(peg$e146);
                            }
                        }
                        if (s3 !== peg$FAILED) {
                            while (s3 !== peg$FAILED) {
                                s2.push(s3);
                                if (peg$r5.test(input.charAt(peg$currPos))) {
                                    s3 = input.charAt(peg$currPos);
                                    peg$currPos++;
                                }
                                else {
                                    s3 = peg$FAILED;
                                    if (peg$silentFails === 0) {
                                        peg$fail(peg$e146);
                                    }
                                }
                            }
                        }
                        else {
                            s2 = peg$FAILED;
                        }
                        if (s2 !== peg$FAILED) {
                            s3 = peg$parsequotation_mark();
                            if (s3 !== peg$FAILED) {
                                peg$savedPos = s0;
                                s0 = peg$f89(s2);
                            }
                            else {
                                peg$currPos = s0;
                                s0 = peg$FAILED;
                            }
                        }
                        else {
                            peg$currPos = s0;
                            s0 = peg$FAILED;
                        }
                    }
                    else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                    }
                    return s0;
                }
                function peg$parsepgn() {
                    var s0, s2, s4, s6, s8, s9, s11, s13, s14;
                    s0 = peg$currPos;
                    peg$parsews();
                    s2 = peg$parsecomments();
                    if (s2 === peg$FAILED) {
                        s2 = null;
                    }
                    peg$parsews();
                    s4 = peg$parsemoveNumber();
                    if (s4 === peg$FAILED) {
                        s4 = null;
                    }
                    peg$parsews();
                    s6 = peg$parsehalfMove();
                    if (s6 !== peg$FAILED) {
                        peg$parsews();
                        s8 = peg$parsenags();
                        if (s8 === peg$FAILED) {
                            s8 = null;
                        }
                        s9 = peg$parsedrawOffer();
                        if (s9 === peg$FAILED) {
                            s9 = null;
                        }
                        peg$parsews();
                        s11 = peg$parsecomments();
                        if (s11 === peg$FAILED) {
                            s11 = null;
                        }
                        peg$parsews();
                        s13 = peg$parsevariation();
                        if (s13 === peg$FAILED) {
                            s13 = null;
                        }
                        s14 = peg$parsepgn();
                        if (s14 === peg$FAILED) {
                            s14 = null;
                        }
                        peg$savedPos = s0;
                        s0 = peg$f90(s2, s4, s6, s8, s9, s11, s13, s14);
                    }
                    else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                    }
                    if (s0 === peg$FAILED) {
                        s0 = peg$currPos;
                        peg$parsews();
                        s2 = peg$parseendGame();
                        if (s2 !== peg$FAILED) {
                            peg$parsews();
                            peg$savedPos = s0;
                            s0 = peg$f91(s2);
                        }
                        else {
                            peg$currPos = s0;
                            s0 = peg$FAILED;
                        }
                    }
                    return s0;
                }
                function peg$parsedrawOffer() {
                    var s0, s1, s2, s3;
                    s0 = peg$currPos;
                    s1 = peg$parsepl();
                    if (s1 !== peg$FAILED) {
                        if (input.charCodeAt(peg$currPos) === 61) {
                            s2 = peg$c152;
                            peg$currPos++;
                        }
                        else {
                            s2 = peg$FAILED;
                            if (peg$silentFails === 0) {
                                peg$fail(peg$e159);
                            }
                        }
                        if (s2 !== peg$FAILED) {
                            s3 = peg$parsepr();
                            if (s3 !== peg$FAILED) {
                                s1 = [s1, s2, s3];
                                s0 = s1;
                            }
                            else {
                                peg$currPos = s0;
                                s0 = peg$FAILED;
                            }
                        }
                        else {
                            peg$currPos = s0;
                            s0 = peg$FAILED;
                        }
                    }
                    else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                    }
                    return s0;
                }
                function peg$parseendGame() {
                    var s0, s1;
                    s0 = peg$currPos;
                    s1 = peg$parseinnerResult();
                    if (s1 !== peg$FAILED) {
                        peg$savedPos = s0;
                        s1 = peg$f92(s1);
                    }
                    s0 = s1;
                    return s0;
                }
                function peg$parsecomments() {
                    var s0, s1, s2, s3, s5;
                    s0 = peg$currPos;
                    s1 = peg$parsecomment();
                    if (s1 !== peg$FAILED) {
                        s2 = [];
                        s3 = peg$currPos;
                        peg$parsews();
                        s5 = peg$parsecomment();
                        if (s5 !== peg$FAILED) {
                            peg$savedPos = s3;
                            s3 = peg$f93(s1, s5);
                        }
                        else {
                            peg$currPos = s3;
                            s3 = peg$FAILED;
                        }
                        while (s3 !== peg$FAILED) {
                            s2.push(s3);
                            s3 = peg$currPos;
                            peg$parsews();
                            s5 = peg$parsecomment();
                            if (s5 !== peg$FAILED) {
                                peg$savedPos = s3;
                                s3 = peg$f93(s1, s5);
                            }
                            else {
                                peg$currPos = s3;
                                s3 = peg$FAILED;
                            }
                        }
                        peg$savedPos = s0;
                        s0 = peg$f94(s1, s2);
                    }
                    else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                    }
                    return s0;
                }
                function peg$parsecomment() {
                    var s0, s1, s2, s3;
                    s0 = peg$currPos;
                    s1 = peg$parsecl();
                    if (s1 !== peg$FAILED) {
                        s2 = peg$parsecr();
                        if (s2 !== peg$FAILED) {
                            peg$savedPos = s0;
                            s0 = peg$f95();
                        }
                        else {
                            peg$currPos = s0;
                            s0 = peg$FAILED;
                        }
                    }
                    else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                    }
                    if (s0 === peg$FAILED) {
                        s0 = peg$currPos;
                        s1 = peg$parsecl();
                        if (s1 !== peg$FAILED) {
                            s2 = peg$parseinnerComment();
                            if (s2 !== peg$FAILED) {
                                s3 = peg$parsecr();
                                if (s3 !== peg$FAILED) {
                                    peg$savedPos = s0;
                                    s0 = peg$f96(s2);
                                }
                                else {
                                    peg$currPos = s0;
                                    s0 = peg$FAILED;
                                }
                            }
                            else {
                                peg$currPos = s0;
                                s0 = peg$FAILED;
                            }
                        }
                        else {
                            peg$currPos = s0;
                            s0 = peg$FAILED;
                        }
                        if (s0 === peg$FAILED) {
                            s0 = peg$currPos;
                            s1 = peg$parsecommentEndOfLine();
                            if (s1 !== peg$FAILED) {
                                peg$savedPos = s0;
                                s1 = peg$f97(s1);
                            }
                            s0 = s1;
                        }
                    }
                    return s0;
                }
                function peg$parseinnerComment() {
                    var s0, s1, s2, s3, s4, s5, s6, s7, s8, s9, s10, s11, s12;
                    s0 = peg$currPos;
                    s1 = peg$parsews();
                    s2 = peg$parsebl();
                    if (s2 !== peg$FAILED) {
                        if (input.substr(peg$currPos, 4) === peg$c153) {
                            s3 = peg$c153;
                            peg$currPos += 4;
                        }
                        else {
                            s3 = peg$FAILED;
                            if (peg$silentFails === 0) {
                                peg$fail(peg$e160);
                            }
                        }
                        if (s3 !== peg$FAILED) {
                            s4 = peg$parsewsp();
                            if (s4 !== peg$FAILED) {
                                s5 = peg$parsecolorFields();
                                if (s5 === peg$FAILED) {
                                    s5 = null;
                                }
                                s6 = peg$parsews();
                                s7 = peg$parsebr();
                                if (s7 !== peg$FAILED) {
                                    s8 = peg$parsews();
                                    s9 = [];
                                    s10 = peg$currPos;
                                    s11 = peg$parseinnerComment();
                                    if (s11 !== peg$FAILED) {
                                        peg$savedPos = s10;
                                        s11 = peg$f98(s5, s11);
                                    }
                                    s10 = s11;
                                    while (s10 !== peg$FAILED) {
                                        s9.push(s10);
                                        s10 = peg$currPos;
                                        s11 = peg$parseinnerComment();
                                        if (s11 !== peg$FAILED) {
                                            peg$savedPos = s10;
                                            s11 = peg$f98(s5, s11);
                                        }
                                        s10 = s11;
                                    }
                                    peg$savedPos = s0;
                                    s0 = peg$f99(s5, s9);
                                }
                                else {
                                    peg$currPos = s0;
                                    s0 = peg$FAILED;
                                }
                            }
                            else {
                                peg$currPos = s0;
                                s0 = peg$FAILED;
                            }
                        }
                        else {
                            peg$currPos = s0;
                            s0 = peg$FAILED;
                        }
                    }
                    else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                    }
                    if (s0 === peg$FAILED) {
                        s0 = peg$currPos;
                        s1 = peg$parsews();
                        s2 = peg$parsebl();
                        if (s2 !== peg$FAILED) {
                            if (input.substr(peg$currPos, 4) === peg$c154) {
                                s3 = peg$c154;
                                peg$currPos += 4;
                            }
                            else {
                                s3 = peg$FAILED;
                                if (peg$silentFails === 0) {
                                    peg$fail(peg$e161);
                                }
                            }
                            if (s3 !== peg$FAILED) {
                                s4 = peg$parsewsp();
                                if (s4 !== peg$FAILED) {
                                    s5 = peg$parsecolorArrows();
                                    if (s5 === peg$FAILED) {
                                        s5 = null;
                                    }
                                    s6 = peg$parsews();
                                    s7 = peg$parsebr();
                                    if (s7 !== peg$FAILED) {
                                        s8 = peg$parsews();
                                        s9 = [];
                                        s10 = peg$currPos;
                                        s11 = peg$parseinnerComment();
                                        if (s11 !== peg$FAILED) {
                                            peg$savedPos = s10;
                                            s11 = peg$f100(s5, s11);
                                        }
                                        s10 = s11;
                                        while (s10 !== peg$FAILED) {
                                            s9.push(s10);
                                            s10 = peg$currPos;
                                            s11 = peg$parseinnerComment();
                                            if (s11 !== peg$FAILED) {
                                                peg$savedPos = s10;
                                                s11 = peg$f100(s5, s11);
                                            }
                                            s10 = s11;
                                        }
                                        peg$savedPos = s0;
                                        s0 = peg$f101(s5, s9);
                                    }
                                    else {
                                        peg$currPos = s0;
                                        s0 = peg$FAILED;
                                    }
                                }
                                else {
                                    peg$currPos = s0;
                                    s0 = peg$FAILED;
                                }
                            }
                            else {
                                peg$currPos = s0;
                                s0 = peg$FAILED;
                            }
                        }
                        else {
                            peg$currPos = s0;
                            s0 = peg$FAILED;
                        }
                        if (s0 === peg$FAILED) {
                            s0 = peg$currPos;
                            s1 = peg$parsews();
                            s2 = peg$parsebl();
                            if (s2 !== peg$FAILED) {
                                if (input.charCodeAt(peg$currPos) === 37) {
                                    s3 = peg$c155;
                                    peg$currPos++;
                                }
                                else {
                                    s3 = peg$FAILED;
                                    if (peg$silentFails === 0) {
                                        peg$fail(peg$e162);
                                    }
                                }
                                if (s3 !== peg$FAILED) {
                                    s4 = peg$parseclockCommand1D();
                                    if (s4 !== peg$FAILED) {
                                        s5 = peg$parsewsp();
                                        if (s5 !== peg$FAILED) {
                                            s6 = peg$parseclockValue1D();
                                            if (s6 !== peg$FAILED) {
                                                s7 = peg$parsews();
                                                s8 = peg$parsebr();
                                                if (s8 !== peg$FAILED) {
                                                    s9 = peg$parsews();
                                                    s10 = [];
                                                    s11 = peg$currPos;
                                                    s12 = peg$parseinnerComment();
                                                    if (s12 !== peg$FAILED) {
                                                        peg$savedPos = s11;
                                                        s12 = peg$f102(s4, s6, s12);
                                                    }
                                                    s11 = s12;
                                                    while (s11 !== peg$FAILED) {
                                                        s10.push(s11);
                                                        s11 = peg$currPos;
                                                        s12 = peg$parseinnerComment();
                                                        if (s12 !== peg$FAILED) {
                                                            peg$savedPos = s11;
                                                            s12 = peg$f102(s4, s6, s12);
                                                        }
                                                        s11 = s12;
                                                    }
                                                    peg$savedPos = s0;
                                                    s0 = peg$f103(s4, s6, s10);
                                                }
                                                else {
                                                    peg$currPos = s0;
                                                    s0 = peg$FAILED;
                                                }
                                            }
                                            else {
                                                peg$currPos = s0;
                                                s0 = peg$FAILED;
                                            }
                                        }
                                        else {
                                            peg$currPos = s0;
                                            s0 = peg$FAILED;
                                        }
                                    }
                                    else {
                                        peg$currPos = s0;
                                        s0 = peg$FAILED;
                                    }
                                }
                                else {
                                    peg$currPos = s0;
                                    s0 = peg$FAILED;
                                }
                            }
                            else {
                                peg$currPos = s0;
                                s0 = peg$FAILED;
                            }
                            if (s0 === peg$FAILED) {
                                s0 = peg$currPos;
                                s1 = peg$parsews();
                                s2 = peg$parsebl();
                                if (s2 !== peg$FAILED) {
                                    if (input.charCodeAt(peg$currPos) === 37) {
                                        s3 = peg$c155;
                                        peg$currPos++;
                                    }
                                    else {
                                        s3 = peg$FAILED;
                                        if (peg$silentFails === 0) {
                                            peg$fail(peg$e162);
                                        }
                                    }
                                    if (s3 !== peg$FAILED) {
                                        s4 = peg$parseclockCommand2D();
                                        if (s4 !== peg$FAILED) {
                                            s5 = peg$parsewsp();
                                            if (s5 !== peg$FAILED) {
                                                s6 = peg$parseclockValue2D();
                                                if (s6 !== peg$FAILED) {
                                                    s7 = peg$parsews();
                                                    s8 = peg$parsebr();
                                                    if (s8 !== peg$FAILED) {
                                                        s9 = peg$parsews();
                                                        s10 = [];
                                                        s11 = peg$currPos;
                                                        s12 = peg$parseinnerComment();
                                                        if (s12 !== peg$FAILED) {
                                                            peg$savedPos = s11;
                                                            s12 = peg$f104(s4, s6, s12);
                                                        }
                                                        s11 = s12;
                                                        while (s11 !== peg$FAILED) {
                                                            s10.push(s11);
                                                            s11 = peg$currPos;
                                                            s12 = peg$parseinnerComment();
                                                            if (s12 !== peg$FAILED) {
                                                                peg$savedPos = s11;
                                                                s12 = peg$f104(s4, s6, s12);
                                                            }
                                                            s11 = s12;
                                                        }
                                                        peg$savedPos = s0;
                                                        s0 = peg$f105(s4, s6, s10);
                                                    }
                                                    else {
                                                        peg$currPos = s0;
                                                        s0 = peg$FAILED;
                                                    }
                                                }
                                                else {
                                                    peg$currPos = s0;
                                                    s0 = peg$FAILED;
                                                }
                                            }
                                            else {
                                                peg$currPos = s0;
                                                s0 = peg$FAILED;
                                            }
                                        }
                                        else {
                                            peg$currPos = s0;
                                            s0 = peg$FAILED;
                                        }
                                    }
                                    else {
                                        peg$currPos = s0;
                                        s0 = peg$FAILED;
                                    }
                                }
                                else {
                                    peg$currPos = s0;
                                    s0 = peg$FAILED;
                                }
                                if (s0 === peg$FAILED) {
                                    s0 = peg$currPos;
                                    s1 = peg$parsews();
                                    s2 = peg$parsebl();
                                    if (s2 !== peg$FAILED) {
                                        if (input.substr(peg$currPos, 5) === peg$c156) {
                                            s3 = peg$c156;
                                            peg$currPos += 5;
                                        }
                                        else {
                                            s3 = peg$FAILED;
                                            if (peg$silentFails === 0) {
                                                peg$fail(peg$e163);
                                            }
                                        }
                                        if (s3 !== peg$FAILED) {
                                            s4 = peg$parsewsp();
                                            if (s4 !== peg$FAILED) {
                                                s5 = peg$parsestringNoQuot();
                                                s6 = peg$parsews();
                                                s7 = peg$parsebr();
                                                if (s7 !== peg$FAILED) {
                                                    s8 = peg$parsews();
                                                    s9 = [];
                                                    s10 = peg$currPos;
                                                    s11 = peg$parseinnerComment();
                                                    if (s11 !== peg$FAILED) {
                                                        peg$savedPos = s10;
                                                        s11 = peg$f106(s5, s11);
                                                    }
                                                    s10 = s11;
                                                    while (s10 !== peg$FAILED) {
                                                        s9.push(s10);
                                                        s10 = peg$currPos;
                                                        s11 = peg$parseinnerComment();
                                                        if (s11 !== peg$FAILED) {
                                                            peg$savedPos = s10;
                                                            s11 = peg$f106(s5, s11);
                                                        }
                                                        s10 = s11;
                                                    }
                                                    peg$savedPos = s0;
                                                    s0 = peg$f107(s5, s9);
                                                }
                                                else {
                                                    peg$currPos = s0;
                                                    s0 = peg$FAILED;
                                                }
                                            }
                                            else {
                                                peg$currPos = s0;
                                                s0 = peg$FAILED;
                                            }
                                        }
                                        else {
                                            peg$currPos = s0;
                                            s0 = peg$FAILED;
                                        }
                                    }
                                    else {
                                        peg$currPos = s0;
                                        s0 = peg$FAILED;
                                    }
                                    if (s0 === peg$FAILED) {
                                        s0 = peg$currPos;
                                        s1 = peg$parsews();
                                        s2 = peg$parsebl();
                                        if (s2 !== peg$FAILED) {
                                            if (input.charCodeAt(peg$currPos) === 37) {
                                                s3 = peg$c155;
                                                peg$currPos++;
                                            }
                                            else {
                                                s3 = peg$FAILED;
                                                if (peg$silentFails === 0) {
                                                    peg$fail(peg$e162);
                                                }
                                            }
                                            if (s3 !== peg$FAILED) {
                                                s4 = peg$parsestringNoQuot();
                                                s5 = peg$parsewsp();
                                                if (s5 !== peg$FAILED) {
                                                    s6 = [];
                                                    s7 = peg$parsenbr();
                                                    if (s7 !== peg$FAILED) {
                                                        while (s7 !== peg$FAILED) {
                                                            s6.push(s7);
                                                            s7 = peg$parsenbr();
                                                        }
                                                    }
                                                    else {
                                                        s6 = peg$FAILED;
                                                    }
                                                    if (s6 !== peg$FAILED) {
                                                        s7 = peg$parsebr();
                                                        if (s7 !== peg$FAILED) {
                                                            s8 = peg$parsews();
                                                            s9 = [];
                                                            s10 = peg$currPos;
                                                            s11 = peg$parseinnerComment();
                                                            if (s11 !== peg$FAILED) {
                                                                peg$savedPos = s10;
                                                                s11 = peg$f108(s4, s6, s11);
                                                            }
                                                            s10 = s11;
                                                            while (s10 !== peg$FAILED) {
                                                                s9.push(s10);
                                                                s10 = peg$currPos;
                                                                s11 = peg$parseinnerComment();
                                                                if (s11 !== peg$FAILED) {
                                                                    peg$savedPos = s10;
                                                                    s11 = peg$f108(s4, s6, s11);
                                                                }
                                                                s10 = s11;
                                                            }
                                                            peg$savedPos = s0;
                                                            s0 = peg$f109(s4, s6, s9);
                                                        }
                                                        else {
                                                            peg$currPos = s0;
                                                            s0 = peg$FAILED;
                                                        }
                                                    }
                                                    else {
                                                        peg$currPos = s0;
                                                        s0 = peg$FAILED;
                                                    }
                                                }
                                                else {
                                                    peg$currPos = s0;
                                                    s0 = peg$FAILED;
                                                }
                                            }
                                            else {
                                                peg$currPos = s0;
                                                s0 = peg$FAILED;
                                            }
                                        }
                                        else {
                                            peg$currPos = s0;
                                            s0 = peg$FAILED;
                                        }
                                        if (s0 === peg$FAILED) {
                                            s0 = peg$currPos;
                                            s1 = [];
                                            s2 = peg$parsenonCommand();
                                            if (s2 !== peg$FAILED) {
                                                while (s2 !== peg$FAILED) {
                                                    s1.push(s2);
                                                    s2 = peg$parsenonCommand();
                                                }
                                            }
                                            else {
                                                s1 = peg$FAILED;
                                            }
                                            if (s1 !== peg$FAILED) {
                                                s2 = [];
                                                s3 = peg$currPos;
                                                s4 = peg$parsews();
                                                s5 = peg$parseinnerComment();
                                                if (s5 !== peg$FAILED) {
                                                    peg$savedPos = s3;
                                                    s3 = peg$f110(s1, s5);
                                                }
                                                else {
                                                    peg$currPos = s3;
                                                    s3 = peg$FAILED;
                                                }
                                                while (s3 !== peg$FAILED) {
                                                    s2.push(s3);
                                                    s3 = peg$currPos;
                                                    s4 = peg$parsews();
                                                    s5 = peg$parseinnerComment();
                                                    if (s5 !== peg$FAILED) {
                                                        peg$savedPos = s3;
                                                        s3 = peg$f110(s1, s5);
                                                    }
                                                    else {
                                                        peg$currPos = s3;
                                                        s3 = peg$FAILED;
                                                    }
                                                }
                                                peg$savedPos = s0;
                                                s0 = peg$f111(s1, s2);
                                            }
                                            else {
                                                peg$currPos = s0;
                                                s0 = peg$FAILED;
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                    return s0;
                }
                function peg$parsenonCommand() {
                    var s0, s1, s2, s3;
                    s0 = peg$currPos;
                    s1 = peg$currPos;
                    peg$silentFails++;
                    if (input.substr(peg$currPos, 2) === peg$c157) {
                        s2 = peg$c157;
                        peg$currPos += 2;
                    }
                    else {
                        s2 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$e164);
                        }
                    }
                    peg$silentFails--;
                    if (s2 === peg$FAILED) {
                        s1 = undefined;
                    }
                    else {
                        peg$currPos = s1;
                        s1 = peg$FAILED;
                    }
                    if (s1 !== peg$FAILED) {
                        s2 = peg$currPos;
                        peg$silentFails++;
                        if (input.charCodeAt(peg$currPos) === 125) {
                            s3 = peg$c158;
                            peg$currPos++;
                        }
                        else {
                            s3 = peg$FAILED;
                            if (peg$silentFails === 0) {
                                peg$fail(peg$e165);
                            }
                        }
                        peg$silentFails--;
                        if (s3 === peg$FAILED) {
                            s2 = undefined;
                        }
                        else {
                            peg$currPos = s2;
                            s2 = peg$FAILED;
                        }
                        if (s2 !== peg$FAILED) {
                            if (input.length > peg$currPos) {
                                s3 = input.charAt(peg$currPos);
                                peg$currPos++;
                            }
                            else {
                                s3 = peg$FAILED;
                                if (peg$silentFails === 0) {
                                    peg$fail(peg$e166);
                                }
                            }
                            if (s3 !== peg$FAILED) {
                                peg$savedPos = s0;
                                s0 = peg$f112(s3);
                            }
                            else {
                                peg$currPos = s0;
                                s0 = peg$FAILED;
                            }
                        }
                        else {
                            peg$currPos = s0;
                            s0 = peg$FAILED;
                        }
                    }
                    else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                    }
                    return s0;
                }
                function peg$parsenbr() {
                    var s0, s1, s2;
                    s0 = peg$currPos;
                    s1 = peg$currPos;
                    peg$silentFails++;
                    s2 = peg$parsebr();
                    peg$silentFails--;
                    if (s2 === peg$FAILED) {
                        s1 = undefined;
                    }
                    else {
                        peg$currPos = s1;
                        s1 = peg$FAILED;
                    }
                    if (s1 !== peg$FAILED) {
                        if (input.length > peg$currPos) {
                            s2 = input.charAt(peg$currPos);
                            peg$currPos++;
                        }
                        else {
                            s2 = peg$FAILED;
                            if (peg$silentFails === 0) {
                                peg$fail(peg$e166);
                            }
                        }
                        if (s2 !== peg$FAILED) {
                            peg$savedPos = s0;
                            s0 = peg$f113(s2);
                        }
                        else {
                            peg$currPos = s0;
                            s0 = peg$FAILED;
                        }
                    }
                    else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                    }
                    return s0;
                }
                function peg$parsecommentEndOfLine() {
                    var s0, s1, s2, s3;
                    s0 = peg$currPos;
                    s1 = peg$parsesemicolon();
                    if (s1 !== peg$FAILED) {
                        s2 = [];
                        if (peg$r6.test(input.charAt(peg$currPos))) {
                            s3 = input.charAt(peg$currPos);
                            peg$currPos++;
                        }
                        else {
                            s3 = peg$FAILED;
                            if (peg$silentFails === 0) {
                                peg$fail(peg$e167);
                            }
                        }
                        while (s3 !== peg$FAILED) {
                            s2.push(s3);
                            if (peg$r6.test(input.charAt(peg$currPos))) {
                                s3 = input.charAt(peg$currPos);
                                peg$currPos++;
                            }
                            else {
                                s3 = peg$FAILED;
                                if (peg$silentFails === 0) {
                                    peg$fail(peg$e167);
                                }
                            }
                        }
                        s3 = peg$parseeol();
                        if (s3 !== peg$FAILED) {
                            peg$savedPos = s0;
                            s0 = peg$f114(s2);
                        }
                        else {
                            peg$currPos = s0;
                            s0 = peg$FAILED;
                        }
                    }
                    else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                    }
                    return s0;
                }
                function peg$parsecolorFields() {
                    var s0, s1, s3, s4, s5, s6, s7;
                    s0 = peg$currPos;
                    s1 = peg$parsecolorField();
                    if (s1 !== peg$FAILED) {
                        peg$parsews();
                        s3 = [];
                        s4 = peg$currPos;
                        if (input.charCodeAt(peg$currPos) === 44) {
                            s5 = peg$c159;
                            peg$currPos++;
                        }
                        else {
                            s5 = peg$FAILED;
                            if (peg$silentFails === 0) {
                                peg$fail(peg$e168);
                            }
                        }
                        if (s5 !== peg$FAILED) {
                            s6 = peg$parsews();
                            s7 = peg$parsecolorField();
                            if (s7 !== peg$FAILED) {
                                s5 = [s5, s6, s7];
                                s4 = s5;
                            }
                            else {
                                peg$currPos = s4;
                                s4 = peg$FAILED;
                            }
                        }
                        else {
                            peg$currPos = s4;
                            s4 = peg$FAILED;
                        }
                        while (s4 !== peg$FAILED) {
                            s3.push(s4);
                            s4 = peg$currPos;
                            if (input.charCodeAt(peg$currPos) === 44) {
                                s5 = peg$c159;
                                peg$currPos++;
                            }
                            else {
                                s5 = peg$FAILED;
                                if (peg$silentFails === 0) {
                                    peg$fail(peg$e168);
                                }
                            }
                            if (s5 !== peg$FAILED) {
                                s6 = peg$parsews();
                                s7 = peg$parsecolorField();
                                if (s7 !== peg$FAILED) {
                                    s5 = [s5, s6, s7];
                                    s4 = s5;
                                }
                                else {
                                    peg$currPos = s4;
                                    s4 = peg$FAILED;
                                }
                            }
                            else {
                                peg$currPos = s4;
                                s4 = peg$FAILED;
                            }
                        }
                        peg$savedPos = s0;
                        s0 = peg$f115(s1, s3);
                    }
                    else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                    }
                    return s0;
                }
                function peg$parsecolorField() {
                    var s0, s1, s2;
                    s0 = peg$currPos;
                    s1 = peg$parsecolor();
                    if (s1 !== peg$FAILED) {
                        s2 = peg$parsefield();
                        if (s2 !== peg$FAILED) {
                            peg$savedPos = s0;
                            s0 = peg$f116(s1, s2);
                        }
                        else {
                            peg$currPos = s0;
                            s0 = peg$FAILED;
                        }
                    }
                    else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                    }
                    return s0;
                }
                function peg$parsecolorArrows() {
                    var s0, s1, s3, s4, s5, s6, s7;
                    s0 = peg$currPos;
                    s1 = peg$parsecolorArrow();
                    if (s1 !== peg$FAILED) {
                        peg$parsews();
                        s3 = [];
                        s4 = peg$currPos;
                        if (input.charCodeAt(peg$currPos) === 44) {
                            s5 = peg$c159;
                            peg$currPos++;
                        }
                        else {
                            s5 = peg$FAILED;
                            if (peg$silentFails === 0) {
                                peg$fail(peg$e168);
                            }
                        }
                        if (s5 !== peg$FAILED) {
                            s6 = peg$parsews();
                            s7 = peg$parsecolorArrow();
                            if (s7 !== peg$FAILED) {
                                s5 = [s5, s6, s7];
                                s4 = s5;
                            }
                            else {
                                peg$currPos = s4;
                                s4 = peg$FAILED;
                            }
                        }
                        else {
                            peg$currPos = s4;
                            s4 = peg$FAILED;
                        }
                        while (s4 !== peg$FAILED) {
                            s3.push(s4);
                            s4 = peg$currPos;
                            if (input.charCodeAt(peg$currPos) === 44) {
                                s5 = peg$c159;
                                peg$currPos++;
                            }
                            else {
                                s5 = peg$FAILED;
                                if (peg$silentFails === 0) {
                                    peg$fail(peg$e168);
                                }
                            }
                            if (s5 !== peg$FAILED) {
                                s6 = peg$parsews();
                                s7 = peg$parsecolorArrow();
                                if (s7 !== peg$FAILED) {
                                    s5 = [s5, s6, s7];
                                    s4 = s5;
                                }
                                else {
                                    peg$currPos = s4;
                                    s4 = peg$FAILED;
                                }
                            }
                            else {
                                peg$currPos = s4;
                                s4 = peg$FAILED;
                            }
                        }
                        peg$savedPos = s0;
                        s0 = peg$f117(s1, s3);
                    }
                    else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                    }
                    return s0;
                }
                function peg$parsecolorArrow() {
                    var s0, s1, s2, s3;
                    s0 = peg$currPos;
                    s1 = peg$parsecolor();
                    if (s1 !== peg$FAILED) {
                        s2 = peg$parsefield();
                        if (s2 !== peg$FAILED) {
                            s3 = peg$parsefield();
                            if (s3 !== peg$FAILED) {
                                peg$savedPos = s0;
                                s0 = peg$f118(s1, s2, s3);
                            }
                            else {
                                peg$currPos = s0;
                                s0 = peg$FAILED;
                            }
                        }
                        else {
                            peg$currPos = s0;
                            s0 = peg$FAILED;
                        }
                    }
                    else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                    }
                    return s0;
                }
                function peg$parsecolor() {
                    var s0, s1;
                    s0 = peg$currPos;
                    if (input.charCodeAt(peg$currPos) === 89) {
                        s1 = peg$c160;
                        peg$currPos++;
                    }
                    else {
                        s1 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$e169);
                        }
                    }
                    if (s1 !== peg$FAILED) {
                        peg$savedPos = s0;
                        s1 = peg$f119();
                    }
                    s0 = s1;
                    if (s0 === peg$FAILED) {
                        s0 = peg$currPos;
                        if (input.charCodeAt(peg$currPos) === 71) {
                            s1 = peg$c161;
                            peg$currPos++;
                        }
                        else {
                            s1 = peg$FAILED;
                            if (peg$silentFails === 0) {
                                peg$fail(peg$e170);
                            }
                        }
                        if (s1 !== peg$FAILED) {
                            peg$savedPos = s0;
                            s1 = peg$f120();
                        }
                        s0 = s1;
                        if (s0 === peg$FAILED) {
                            s0 = peg$currPos;
                            if (input.charCodeAt(peg$currPos) === 82) {
                                s1 = peg$c162;
                                peg$currPos++;
                            }
                            else {
                                s1 = peg$FAILED;
                                if (peg$silentFails === 0) {
                                    peg$fail(peg$e171);
                                }
                            }
                            if (s1 !== peg$FAILED) {
                                peg$savedPos = s0;
                                s1 = peg$f121();
                            }
                            s0 = s1;
                            if (s0 === peg$FAILED) {
                                s0 = peg$currPos;
                                if (input.charCodeAt(peg$currPos) === 66) {
                                    s1 = peg$c142;
                                    peg$currPos++;
                                }
                                else {
                                    s1 = peg$FAILED;
                                    if (peg$silentFails === 0) {
                                        peg$fail(peg$e149);
                                    }
                                }
                                if (s1 !== peg$FAILED) {
                                    peg$savedPos = s0;
                                    s1 = peg$f122();
                                }
                                s0 = s1;
                            }
                        }
                    }
                    return s0;
                }
                function peg$parsefield() {
                    var s0, s1, s2;
                    s0 = peg$currPos;
                    s1 = peg$parsecolumn();
                    if (s1 !== peg$FAILED) {
                        s2 = peg$parserow();
                        if (s2 !== peg$FAILED) {
                            peg$savedPos = s0;
                            s0 = peg$f123(s1, s2);
                        }
                        else {
                            peg$currPos = s0;
                            s0 = peg$FAILED;
                        }
                    }
                    else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                    }
                    return s0;
                }
                function peg$parsecl() {
                    var s0;
                    if (input.charCodeAt(peg$currPos) === 123) {
                        s0 = peg$c163;
                        peg$currPos++;
                    }
                    else {
                        s0 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$e172);
                        }
                    }
                    return s0;
                }
                function peg$parsecr() {
                    var s0;
                    if (input.charCodeAt(peg$currPos) === 125) {
                        s0 = peg$c158;
                        peg$currPos++;
                    }
                    else {
                        s0 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$e165);
                        }
                    }
                    return s0;
                }
                function peg$parsebl() {
                    var s0;
                    if (input.charCodeAt(peg$currPos) === 91) {
                        s0 = peg$c164;
                        peg$currPos++;
                    }
                    else {
                        s0 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$e173);
                        }
                    }
                    return s0;
                }
                function peg$parsebr() {
                    var s0;
                    if (input.charCodeAt(peg$currPos) === 93) {
                        s0 = peg$c165;
                        peg$currPos++;
                    }
                    else {
                        s0 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$e174);
                        }
                    }
                    return s0;
                }
                function peg$parsesemicolon() {
                    var s0;
                    if (input.charCodeAt(peg$currPos) === 59) {
                        s0 = peg$c166;
                        peg$currPos++;
                    }
                    else {
                        s0 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$e175);
                        }
                    }
                    return s0;
                }
                function peg$parseclockCommand1D() {
                    var s0, s1;
                    s0 = peg$currPos;
                    if (input.substr(peg$currPos, 3) === peg$c167) {
                        s1 = peg$c167;
                        peg$currPos += 3;
                    }
                    else {
                        s1 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$e176);
                        }
                    }
                    if (s1 !== peg$FAILED) {
                        peg$savedPos = s0;
                        s1 = peg$f128();
                    }
                    s0 = s1;
                    if (s0 === peg$FAILED) {
                        s0 = peg$currPos;
                        if (input.substr(peg$currPos, 3) === peg$c168) {
                            s1 = peg$c168;
                            peg$currPos += 3;
                        }
                        else {
                            s1 = peg$FAILED;
                            if (peg$silentFails === 0) {
                                peg$fail(peg$e177);
                            }
                        }
                        if (s1 !== peg$FAILED) {
                            peg$savedPos = s0;
                            s1 = peg$f129();
                        }
                        s0 = s1;
                        if (s0 === peg$FAILED) {
                            s0 = peg$currPos;
                            if (input.substr(peg$currPos, 3) === peg$c169) {
                                s1 = peg$c169;
                                peg$currPos += 3;
                            }
                            else {
                                s1 = peg$FAILED;
                                if (peg$silentFails === 0) {
                                    peg$fail(peg$e178);
                                }
                            }
                            if (s1 !== peg$FAILED) {
                                peg$savedPos = s0;
                                s1 = peg$f130();
                            }
                            s0 = s1;
                        }
                    }
                    return s0;
                }
                function peg$parseclockCommand2D() {
                    var s0, s1;
                    s0 = peg$currPos;
                    if (input.substr(peg$currPos, 3) === peg$c170) {
                        s1 = peg$c170;
                        peg$currPos += 3;
                    }
                    else {
                        s1 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$e179);
                        }
                    }
                    if (s1 !== peg$FAILED) {
                        peg$savedPos = s0;
                        s1 = peg$f131();
                    }
                    s0 = s1;
                    return s0;
                }
                function peg$parseclockValue1D() {
                    var s0, s1, s2, s3, s4;
                    s0 = peg$currPos;
                    s1 = peg$parsehoursMinutes();
                    if (s1 === peg$FAILED) {
                        s1 = null;
                    }
                    s2 = peg$parsedigit();
                    if (s2 !== peg$FAILED) {
                        s3 = peg$parsedigit();
                        if (s3 === peg$FAILED) {
                            s3 = null;
                        }
                        s4 = peg$parsemillis();
                        if (s4 === peg$FAILED) {
                            s4 = null;
                        }
                        peg$savedPos = s0;
                        s0 = peg$f132(s1, s2, s3, s4);
                    }
                    else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                    }
                    return s0;
                }
                function peg$parseclockValue2D() {
                    var s0, s1, s2, s3;
                    s0 = peg$currPos;
                    s1 = peg$parsehoursMinutes();
                    if (s1 === peg$FAILED) {
                        s1 = null;
                    }
                    s2 = peg$parsedigit();
                    if (s2 !== peg$FAILED) {
                        s3 = peg$parsedigit();
                        if (s3 === peg$FAILED) {
                            s3 = null;
                        }
                        peg$savedPos = s0;
                        s0 = peg$f133(s1, s2, s3);
                    }
                    else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                    }
                    return s0;
                }
                function peg$parsehoursMinutes() {
                    var s0, s1, s2;
                    s0 = peg$currPos;
                    s1 = peg$parsehoursClock();
                    if (s1 !== peg$FAILED) {
                        s2 = peg$parseminutesClock();
                        if (s2 === peg$FAILED) {
                            s2 = null;
                        }
                        peg$savedPos = s0;
                        s0 = peg$f134(s1, s2);
                    }
                    else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                    }
                    return s0;
                }
                function peg$parsehoursClock() {
                    var s0, s1, s2, s3;
                    s0 = peg$currPos;
                    s1 = peg$parsedigit();
                    if (s1 !== peg$FAILED) {
                        s2 = peg$parsedigit();
                        if (s2 === peg$FAILED) {
                            s2 = null;
                        }
                        if (input.charCodeAt(peg$currPos) === 58) {
                            s3 = peg$c140;
                            peg$currPos++;
                        }
                        else {
                            s3 = peg$FAILED;
                            if (peg$silentFails === 0) {
                                peg$fail(peg$e147);
                            }
                        }
                        if (s3 !== peg$FAILED) {
                            peg$savedPos = s0;
                            s0 = peg$f135(s1, s2);
                        }
                        else {
                            peg$currPos = s0;
                            s0 = peg$FAILED;
                        }
                    }
                    else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                    }
                    return s0;
                }
                function peg$parseminutesClock() {
                    var s0, s1, s2, s3;
                    s0 = peg$currPos;
                    s1 = peg$parsedigit();
                    if (s1 !== peg$FAILED) {
                        s2 = peg$parsedigit();
                        if (s2 === peg$FAILED) {
                            s2 = null;
                        }
                        if (input.charCodeAt(peg$currPos) === 58) {
                            s3 = peg$c140;
                            peg$currPos++;
                        }
                        else {
                            s3 = peg$FAILED;
                            if (peg$silentFails === 0) {
                                peg$fail(peg$e147);
                            }
                        }
                        if (s3 !== peg$FAILED) {
                            peg$savedPos = s0;
                            s0 = peg$f136(s1, s2);
                        }
                        else {
                            peg$currPos = s0;
                            s0 = peg$FAILED;
                        }
                    }
                    else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                    }
                    return s0;
                }
                function peg$parsedigit() {
                    var s0, s1;
                    s0 = peg$currPos;
                    if (peg$r5.test(input.charAt(peg$currPos))) {
                        s1 = input.charAt(peg$currPos);
                        peg$currPos++;
                    }
                    else {
                        s1 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$e146);
                        }
                    }
                    if (s1 !== peg$FAILED) {
                        peg$savedPos = s0;
                        s1 = peg$f137(s1);
                    }
                    s0 = s1;
                    return s0;
                }
                function peg$parsevariation() {
                    var s0, s1, s2, s3, s5;
                    s0 = peg$currPos;
                    s1 = peg$parsepl();
                    if (s1 !== peg$FAILED) {
                        s2 = peg$parsepgn();
                        if (s2 !== peg$FAILED) {
                            s3 = peg$parsepr();
                            if (s3 !== peg$FAILED) {
                                peg$parsews();
                                s5 = peg$parsevariation();
                                if (s5 === peg$FAILED) {
                                    s5 = null;
                                }
                                peg$savedPos = s0;
                                s0 = peg$f138(s2, s5);
                            }
                            else {
                                peg$currPos = s0;
                                s0 = peg$FAILED;
                            }
                        }
                        else {
                            peg$currPos = s0;
                            s0 = peg$FAILED;
                        }
                    }
                    else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                    }
                    return s0;
                }
                function peg$parsepl() {
                    var s0;
                    if (input.charCodeAt(peg$currPos) === 40) {
                        s0 = peg$c171;
                        peg$currPos++;
                    }
                    else {
                        s0 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$e180);
                        }
                    }
                    return s0;
                }
                function peg$parsepr() {
                    var s0;
                    if (input.charCodeAt(peg$currPos) === 41) {
                        s0 = peg$c172;
                        peg$currPos++;
                    }
                    else {
                        s0 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$e181);
                        }
                    }
                    return s0;
                }
                function peg$parsemoveNumber() {
                    var s0, s1, s2, s3, s4;
                    s0 = peg$currPos;
                    s1 = peg$parseinteger();
                    if (s1 !== peg$FAILED) {
                        s2 = [];
                        s3 = peg$parsewhiteSpace();
                        while (s3 !== peg$FAILED) {
                            s2.push(s3);
                            s3 = peg$parsewhiteSpace();
                        }
                        s3 = [];
                        s4 = peg$parsedot();
                        while (s4 !== peg$FAILED) {
                            s3.push(s4);
                            s4 = peg$parsedot();
                        }
                        peg$savedPos = s0;
                        s0 = peg$f139(s1);
                    }
                    else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                    }
                    return s0;
                }
                function peg$parsedot() {
                    var s0;
                    if (input.charCodeAt(peg$currPos) === 46) {
                        s0 = peg$c139;
                        peg$currPos++;
                    }
                    else {
                        s0 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$e145);
                        }
                    }
                    return s0;
                }
                function peg$parseinteger() {
                    var s0, s1, s2;
                    peg$silentFails++;
                    s0 = peg$currPos;
                    s1 = [];
                    if (peg$r5.test(input.charAt(peg$currPos))) {
                        s2 = input.charAt(peg$currPos);
                        peg$currPos++;
                    }
                    else {
                        s2 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$e146);
                        }
                    }
                    if (s2 !== peg$FAILED) {
                        while (s2 !== peg$FAILED) {
                            s1.push(s2);
                            if (peg$r5.test(input.charAt(peg$currPos))) {
                                s2 = input.charAt(peg$currPos);
                                peg$currPos++;
                            }
                            else {
                                s2 = peg$FAILED;
                                if (peg$silentFails === 0) {
                                    peg$fail(peg$e146);
                                }
                            }
                        }
                    }
                    else {
                        s1 = peg$FAILED;
                    }
                    if (s1 !== peg$FAILED) {
                        peg$savedPos = s0;
                        s1 = peg$f140(s1);
                    }
                    s0 = s1;
                    peg$silentFails--;
                    if (s0 === peg$FAILED) {
                        s1 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$e182);
                        }
                    }
                    return s0;
                }
                function peg$parsewhiteSpace() {
                    var s0, s1, s2;
                    s0 = peg$currPos;
                    s1 = [];
                    if (input.charCodeAt(peg$currPos) === 32) {
                        s2 = peg$c173;
                        peg$currPos++;
                    }
                    else {
                        s2 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$e183);
                        }
                    }
                    if (s2 !== peg$FAILED) {
                        while (s2 !== peg$FAILED) {
                            s1.push(s2);
                            if (input.charCodeAt(peg$currPos) === 32) {
                                s2 = peg$c173;
                                peg$currPos++;
                            }
                            else {
                                s2 = peg$FAILED;
                                if (peg$silentFails === 0) {
                                    peg$fail(peg$e183);
                                }
                            }
                        }
                    }
                    else {
                        s1 = peg$FAILED;
                    }
                    if (s1 !== peg$FAILED) {
                        peg$savedPos = s0;
                        s1 = peg$f141();
                    }
                    s0 = s1;
                    return s0;
                }
                function peg$parsehalfMove() {
                    var s0, s1, s2, s3, s4, s5, s6, s7, s8;
                    s0 = peg$currPos;
                    s1 = peg$parsefigure();
                    if (s1 === peg$FAILED) {
                        s1 = null;
                    }
                    s2 = peg$currPos;
                    peg$silentFails++;
                    s3 = peg$parsecheckdisc();
                    peg$silentFails--;
                    if (s3 !== peg$FAILED) {
                        peg$currPos = s2;
                        s2 = undefined;
                    }
                    else {
                        s2 = peg$FAILED;
                    }
                    if (s2 !== peg$FAILED) {
                        s3 = peg$parsediscriminator();
                        if (s3 !== peg$FAILED) {
                            s4 = peg$parsestrike();
                            if (s4 === peg$FAILED) {
                                s4 = null;
                            }
                            s5 = peg$parsecolumn();
                            if (s5 !== peg$FAILED) {
                                s6 = peg$parserow();
                                if (s6 !== peg$FAILED) {
                                    s7 = peg$parsepromotion();
                                    if (s7 === peg$FAILED) {
                                        s7 = null;
                                    }
                                    s8 = peg$parsecheck();
                                    if (s8 === peg$FAILED) {
                                        s8 = null;
                                    }
                                    peg$parsews();
                                    if (input.substr(peg$currPos, 4) === peg$c174) {
                                        peg$currPos += 4;
                                    }
                                    else {
                                        if (peg$silentFails === 0) {
                                            peg$fail(peg$e184);
                                        }
                                    }
                                    peg$savedPos = s0;
                                    s0 = peg$f142(s1, s3, s4, s5, s6, s7, s8);
                                }
                                else {
                                    peg$currPos = s0;
                                    s0 = peg$FAILED;
                                }
                            }
                            else {
                                peg$currPos = s0;
                                s0 = peg$FAILED;
                            }
                        }
                        else {
                            peg$currPos = s0;
                            s0 = peg$FAILED;
                        }
                    }
                    else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                    }
                    if (s0 === peg$FAILED) {
                        s0 = peg$currPos;
                        s1 = peg$parsefigure();
                        if (s1 === peg$FAILED) {
                            s1 = null;
                        }
                        s2 = peg$parsecolumn();
                        if (s2 !== peg$FAILED) {
                            s3 = peg$parserow();
                            if (s3 !== peg$FAILED) {
                                s4 = peg$parsestrikeOrDash();
                                if (s4 === peg$FAILED) {
                                    s4 = null;
                                }
                                s5 = peg$parsecolumn();
                                if (s5 !== peg$FAILED) {
                                    s6 = peg$parserow();
                                    if (s6 !== peg$FAILED) {
                                        s7 = peg$parsepromotion();
                                        if (s7 === peg$FAILED) {
                                            s7 = null;
                                        }
                                        s8 = peg$parsecheck();
                                        if (s8 === peg$FAILED) {
                                            s8 = null;
                                        }
                                        peg$savedPos = s0;
                                        s0 = peg$f143(s1, s2, s3, s4, s5, s6, s7, s8);
                                    }
                                    else {
                                        peg$currPos = s0;
                                        s0 = peg$FAILED;
                                    }
                                }
                                else {
                                    peg$currPos = s0;
                                    s0 = peg$FAILED;
                                }
                            }
                            else {
                                peg$currPos = s0;
                                s0 = peg$FAILED;
                            }
                        }
                        else {
                            peg$currPos = s0;
                            s0 = peg$FAILED;
                        }
                        if (s0 === peg$FAILED) {
                            s0 = peg$currPos;
                            s1 = peg$parsefigure();
                            if (s1 === peg$FAILED) {
                                s1 = null;
                            }
                            s2 = peg$parsestrike();
                            if (s2 === peg$FAILED) {
                                s2 = null;
                            }
                            s3 = peg$parsecolumn();
                            if (s3 !== peg$FAILED) {
                                s4 = peg$parserow();
                                if (s4 !== peg$FAILED) {
                                    s5 = peg$parsepromotion();
                                    if (s5 === peg$FAILED) {
                                        s5 = null;
                                    }
                                    s6 = peg$parsecheck();
                                    if (s6 === peg$FAILED) {
                                        s6 = null;
                                    }
                                    peg$savedPos = s0;
                                    s0 = peg$f144(s1, s2, s3, s4, s5, s6);
                                }
                                else {
                                    peg$currPos = s0;
                                    s0 = peg$FAILED;
                                }
                            }
                            else {
                                peg$currPos = s0;
                                s0 = peg$FAILED;
                            }
                            if (s0 === peg$FAILED) {
                                s0 = peg$currPos;
                                if (input.substr(peg$currPos, 5) === peg$c175) {
                                    s1 = peg$c175;
                                    peg$currPos += 5;
                                }
                                else {
                                    s1 = peg$FAILED;
                                    if (peg$silentFails === 0) {
                                        peg$fail(peg$e185);
                                    }
                                }
                                if (s1 !== peg$FAILED) {
                                    s2 = peg$parsecheck();
                                    if (s2 === peg$FAILED) {
                                        s2 = null;
                                    }
                                    peg$savedPos = s0;
                                    s0 = peg$f145(s2);
                                }
                                else {
                                    peg$currPos = s0;
                                    s0 = peg$FAILED;
                                }
                                if (s0 === peg$FAILED) {
                                    s0 = peg$currPos;
                                    if (input.substr(peg$currPos, 3) === peg$c176) {
                                        s1 = peg$c176;
                                        peg$currPos += 3;
                                    }
                                    else {
                                        s1 = peg$FAILED;
                                        if (peg$silentFails === 0) {
                                            peg$fail(peg$e186);
                                        }
                                    }
                                    if (s1 !== peg$FAILED) {
                                        s2 = peg$parsecheck();
                                        if (s2 === peg$FAILED) {
                                            s2 = null;
                                        }
                                        peg$savedPos = s0;
                                        s0 = peg$f146(s2);
                                    }
                                    else {
                                        peg$currPos = s0;
                                        s0 = peg$FAILED;
                                    }
                                    if (s0 === peg$FAILED) {
                                        s0 = peg$currPos;
                                        s1 = peg$parsefigure();
                                        if (s1 !== peg$FAILED) {
                                            if (input.charCodeAt(peg$currPos) === 64) {
                                                s2 = peg$c177;
                                                peg$currPos++;
                                            }
                                            else {
                                                s2 = peg$FAILED;
                                                if (peg$silentFails === 0) {
                                                    peg$fail(peg$e187);
                                                }
                                            }
                                            if (s2 !== peg$FAILED) {
                                                s3 = peg$parsecolumn();
                                                if (s3 !== peg$FAILED) {
                                                    s4 = peg$parserow();
                                                    if (s4 !== peg$FAILED) {
                                                        peg$savedPos = s0;
                                                        s0 = peg$f147(s1, s3, s4);
                                                    }
                                                    else {
                                                        peg$currPos = s0;
                                                        s0 = peg$FAILED;
                                                    }
                                                }
                                                else {
                                                    peg$currPos = s0;
                                                    s0 = peg$FAILED;
                                                }
                                            }
                                            else {
                                                peg$currPos = s0;
                                                s0 = peg$FAILED;
                                            }
                                        }
                                        else {
                                            peg$currPos = s0;
                                            s0 = peg$FAILED;
                                        }
                                    }
                                }
                            }
                        }
                    }
                    return s0;
                }
                function peg$parsecheck() {
                    var s0, s1, s2, s3;
                    s0 = peg$currPos;
                    s1 = peg$currPos;
                    s2 = peg$currPos;
                    peg$silentFails++;
                    if (input.substr(peg$currPos, 2) === peg$c178) {
                        s3 = peg$c178;
                        peg$currPos += 2;
                    }
                    else {
                        s3 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$e188);
                        }
                    }
                    peg$silentFails--;
                    if (s3 === peg$FAILED) {
                        s2 = undefined;
                    }
                    else {
                        peg$currPos = s2;
                        s2 = peg$FAILED;
                    }
                    if (s2 !== peg$FAILED) {
                        if (input.charCodeAt(peg$currPos) === 43) {
                            s3 = peg$c147;
                            peg$currPos++;
                        }
                        else {
                            s3 = peg$FAILED;
                            if (peg$silentFails === 0) {
                                peg$fail(peg$e154);
                            }
                        }
                        if (s3 !== peg$FAILED) {
                            s2 = [s2, s3];
                            s1 = s2;
                        }
                        else {
                            peg$currPos = s1;
                            s1 = peg$FAILED;
                        }
                    }
                    else {
                        peg$currPos = s1;
                        s1 = peg$FAILED;
                    }
                    if (s1 !== peg$FAILED) {
                        peg$savedPos = s0;
                        s1 = peg$f148(s1);
                    }
                    s0 = s1;
                    if (s0 === peg$FAILED) {
                        s0 = peg$currPos;
                        s1 = peg$currPos;
                        s2 = peg$currPos;
                        peg$silentFails++;
                        if (input.substr(peg$currPos, 3) === peg$c179) {
                            s3 = peg$c179;
                            peg$currPos += 3;
                        }
                        else {
                            s3 = peg$FAILED;
                            if (peg$silentFails === 0) {
                                peg$fail(peg$e189);
                            }
                        }
                        peg$silentFails--;
                        if (s3 === peg$FAILED) {
                            s2 = undefined;
                        }
                        else {
                            peg$currPos = s2;
                            s2 = peg$FAILED;
                        }
                        if (s2 !== peg$FAILED) {
                            if (input.charCodeAt(peg$currPos) === 35) {
                                s3 = peg$c180;
                                peg$currPos++;
                            }
                            else {
                                s3 = peg$FAILED;
                                if (peg$silentFails === 0) {
                                    peg$fail(peg$e190);
                                }
                            }
                            if (s3 !== peg$FAILED) {
                                s2 = [s2, s3];
                                s1 = s2;
                            }
                            else {
                                peg$currPos = s1;
                                s1 = peg$FAILED;
                            }
                        }
                        else {
                            peg$currPos = s1;
                            s1 = peg$FAILED;
                        }
                        if (s1 !== peg$FAILED) {
                            peg$savedPos = s0;
                            s1 = peg$f149(s1);
                        }
                        s0 = s1;
                    }
                    return s0;
                }
                function peg$parsepromotion() {
                    var s0, s2;
                    s0 = peg$currPos;
                    if (input.charCodeAt(peg$currPos) === 61) {
                        peg$currPos++;
                    }
                    else {
                        if (peg$silentFails === 0) {
                            peg$fail(peg$e159);
                        }
                    }
                    s2 = peg$parsepromFigure();
                    if (s2 !== peg$FAILED) {
                        peg$savedPos = s0;
                        s0 = peg$f150(s2);
                    }
                    else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                    }
                    return s0;
                }
                function peg$parsenags() {
                    var s0, s1, s3;
                    s0 = peg$currPos;
                    s1 = peg$parsenag();
                    if (s1 !== peg$FAILED) {
                        peg$parsews();
                        s3 = peg$parsenags();
                        if (s3 === peg$FAILED) {
                            s3 = null;
                        }
                        peg$savedPos = s0;
                        s0 = peg$f151(s1, s3);
                    }
                    else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                    }
                    return s0;
                }
                function peg$parsenag() {
                    var s0, s1, s2;
                    s0 = peg$currPos;
                    if (input.charCodeAt(peg$currPos) === 36) {
                        s1 = peg$c181;
                        peg$currPos++;
                    }
                    else {
                        s1 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$e191);
                        }
                    }
                    if (s1 !== peg$FAILED) {
                        s2 = peg$parseinteger();
                        if (s2 !== peg$FAILED) {
                            peg$savedPos = s0;
                            s0 = peg$f152(s2);
                        }
                        else {
                            peg$currPos = s0;
                            s0 = peg$FAILED;
                        }
                    }
                    else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                    }
                    if (s0 === peg$FAILED) {
                        s0 = peg$currPos;
                        if (input.substr(peg$currPos, 2) === peg$c182) {
                            s1 = peg$c182;
                            peg$currPos += 2;
                        }
                        else {
                            s1 = peg$FAILED;
                            if (peg$silentFails === 0) {
                                peg$fail(peg$e192);
                            }
                        }
                        if (s1 !== peg$FAILED) {
                            peg$savedPos = s0;
                            s1 = peg$f153();
                        }
                        s0 = s1;
                        if (s0 === peg$FAILED) {
                            s0 = peg$currPos;
                            if (input.substr(peg$currPos, 2) === peg$c183) {
                                s1 = peg$c183;
                                peg$currPos += 2;
                            }
                            else {
                                s1 = peg$FAILED;
                                if (peg$silentFails === 0) {
                                    peg$fail(peg$e193);
                                }
                            }
                            if (s1 !== peg$FAILED) {
                                peg$savedPos = s0;
                                s1 = peg$f154();
                            }
                            s0 = s1;
                            if (s0 === peg$FAILED) {
                                s0 = peg$currPos;
                                if (input.substr(peg$currPos, 2) === peg$c184) {
                                    s1 = peg$c184;
                                    peg$currPos += 2;
                                }
                                else {
                                    s1 = peg$FAILED;
                                    if (peg$silentFails === 0) {
                                        peg$fail(peg$e194);
                                    }
                                }
                                if (s1 !== peg$FAILED) {
                                    peg$savedPos = s0;
                                    s1 = peg$f155();
                                }
                                s0 = s1;
                                if (s0 === peg$FAILED) {
                                    s0 = peg$currPos;
                                    if (input.substr(peg$currPos, 2) === peg$c185) {
                                        s1 = peg$c185;
                                        peg$currPos += 2;
                                    }
                                    else {
                                        s1 = peg$FAILED;
                                        if (peg$silentFails === 0) {
                                            peg$fail(peg$e195);
                                        }
                                    }
                                    if (s1 !== peg$FAILED) {
                                        peg$savedPos = s0;
                                        s1 = peg$f156();
                                    }
                                    s0 = s1;
                                    if (s0 === peg$FAILED) {
                                        s0 = peg$currPos;
                                        if (input.charCodeAt(peg$currPos) === 33) {
                                            s1 = peg$c186;
                                            peg$currPos++;
                                        }
                                        else {
                                            s1 = peg$FAILED;
                                            if (peg$silentFails === 0) {
                                                peg$fail(peg$e196);
                                            }
                                        }
                                        if (s1 !== peg$FAILED) {
                                            peg$savedPos = s0;
                                            s1 = peg$f157();
                                        }
                                        s0 = s1;
                                        if (s0 === peg$FAILED) {
                                            s0 = peg$currPos;
                                            if (input.charCodeAt(peg$currPos) === 63) {
                                                s1 = peg$c145;
                                                peg$currPos++;
                                            }
                                            else {
                                                s1 = peg$FAILED;
                                                if (peg$silentFails === 0) {
                                                    peg$fail(peg$e152);
                                                }
                                            }
                                            if (s1 !== peg$FAILED) {
                                                peg$savedPos = s0;
                                                s1 = peg$f158();
                                            }
                                            s0 = s1;
                                            if (s0 === peg$FAILED) {
                                                s0 = peg$currPos;
                                                if (input.charCodeAt(peg$currPos) === 8252) {
                                                    s1 = peg$c187;
                                                    peg$currPos++;
                                                }
                                                else {
                                                    s1 = peg$FAILED;
                                                    if (peg$silentFails === 0) {
                                                        peg$fail(peg$e197);
                                                    }
                                                }
                                                if (s1 !== peg$FAILED) {
                                                    peg$savedPos = s0;
                                                    s1 = peg$f159();
                                                }
                                                s0 = s1;
                                                if (s0 === peg$FAILED) {
                                                    s0 = peg$currPos;
                                                    if (input.charCodeAt(peg$currPos) === 8263) {
                                                        s1 = peg$c188;
                                                        peg$currPos++;
                                                    }
                                                    else {
                                                        s1 = peg$FAILED;
                                                        if (peg$silentFails === 0) {
                                                            peg$fail(peg$e198);
                                                        }
                                                    }
                                                    if (s1 !== peg$FAILED) {
                                                        peg$savedPos = s0;
                                                        s1 = peg$f160();
                                                    }
                                                    s0 = s1;
                                                    if (s0 === peg$FAILED) {
                                                        s0 = peg$currPos;
                                                        if (input.charCodeAt(peg$currPos) === 8265) {
                                                            s1 = peg$c189;
                                                            peg$currPos++;
                                                        }
                                                        else {
                                                            s1 = peg$FAILED;
                                                            if (peg$silentFails === 0) {
                                                                peg$fail(peg$e199);
                                                            }
                                                        }
                                                        if (s1 !== peg$FAILED) {
                                                            peg$savedPos = s0;
                                                            s1 = peg$f161();
                                                        }
                                                        s0 = s1;
                                                        if (s0 === peg$FAILED) {
                                                            s0 = peg$currPos;
                                                            if (input.charCodeAt(peg$currPos) === 8264) {
                                                                s1 = peg$c190;
                                                                peg$currPos++;
                                                            }
                                                            else {
                                                                s1 = peg$FAILED;
                                                                if (peg$silentFails === 0) {
                                                                    peg$fail(peg$e200);
                                                                }
                                                            }
                                                            if (s1 !== peg$FAILED) {
                                                                peg$savedPos = s0;
                                                                s1 = peg$f162();
                                                            }
                                                            s0 = s1;
                                                            if (s0 === peg$FAILED) {
                                                                s0 = peg$currPos;
                                                                if (input.charCodeAt(peg$currPos) === 9633) {
                                                                    s1 = peg$c191;
                                                                    peg$currPos++;
                                                                }
                                                                else {
                                                                    s1 = peg$FAILED;
                                                                    if (peg$silentFails === 0) {
                                                                        peg$fail(peg$e201);
                                                                    }
                                                                }
                                                                if (s1 !== peg$FAILED) {
                                                                    peg$savedPos = s0;
                                                                    s1 = peg$f163();
                                                                }
                                                                s0 = s1;
                                                                if (s0 === peg$FAILED) {
                                                                    s0 = peg$currPos;
                                                                    if (input.charCodeAt(peg$currPos) === 61) {
                                                                        s1 = peg$c152;
                                                                        peg$currPos++;
                                                                    }
                                                                    else {
                                                                        s1 = peg$FAILED;
                                                                        if (peg$silentFails === 0) {
                                                                            peg$fail(peg$e159);
                                                                        }
                                                                    }
                                                                    if (s1 !== peg$FAILED) {
                                                                        peg$savedPos = s0;
                                                                        s1 = peg$f164();
                                                                    }
                                                                    s0 = s1;
                                                                    if (s0 === peg$FAILED) {
                                                                        s0 = peg$currPos;
                                                                        if (input.charCodeAt(peg$currPos) === 8734) {
                                                                            s1 = peg$c192;
                                                                            peg$currPos++;
                                                                        }
                                                                        else {
                                                                            s1 = peg$FAILED;
                                                                            if (peg$silentFails === 0) {
                                                                                peg$fail(peg$e202);
                                                                            }
                                                                        }
                                                                        if (s1 !== peg$FAILED) {
                                                                            peg$savedPos = s0;
                                                                            s1 = peg$f165();
                                                                        }
                                                                        s0 = s1;
                                                                        if (s0 === peg$FAILED) {
                                                                            s0 = peg$currPos;
                                                                            if (input.charCodeAt(peg$currPos) === 10866) {
                                                                                s1 = peg$c193;
                                                                                peg$currPos++;
                                                                            }
                                                                            else {
                                                                                s1 = peg$FAILED;
                                                                                if (peg$silentFails === 0) {
                                                                                    peg$fail(peg$e203);
                                                                                }
                                                                            }
                                                                            if (s1 !== peg$FAILED) {
                                                                                peg$savedPos = s0;
                                                                                s1 = peg$f166();
                                                                            }
                                                                            s0 = s1;
                                                                            if (s0 === peg$FAILED) {
                                                                                s0 = peg$currPos;
                                                                                if (input.charCodeAt(peg$currPos) === 10865) {
                                                                                    s1 = peg$c194;
                                                                                    peg$currPos++;
                                                                                }
                                                                                else {
                                                                                    s1 = peg$FAILED;
                                                                                    if (peg$silentFails === 0) {
                                                                                        peg$fail(peg$e204);
                                                                                    }
                                                                                }
                                                                                if (s1 !== peg$FAILED) {
                                                                                    peg$savedPos = s0;
                                                                                    s1 = peg$f167();
                                                                                }
                                                                                s0 = s1;
                                                                                if (s0 === peg$FAILED) {
                                                                                    s0 = peg$currPos;
                                                                                    if (input.charCodeAt(peg$currPos) === 177) {
                                                                                        s1 = peg$c195;
                                                                                        peg$currPos++;
                                                                                    }
                                                                                    else {
                                                                                        s1 = peg$FAILED;
                                                                                        if (peg$silentFails === 0) {
                                                                                            peg$fail(peg$e205);
                                                                                        }
                                                                                    }
                                                                                    if (s1 !== peg$FAILED) {
                                                                                        peg$savedPos = s0;
                                                                                        s1 = peg$f168();
                                                                                    }
                                                                                    s0 = s1;
                                                                                    if (s0 === peg$FAILED) {
                                                                                        s0 = peg$currPos;
                                                                                        if (input.charCodeAt(peg$currPos) === 8723) {
                                                                                            s1 = peg$c196;
                                                                                            peg$currPos++;
                                                                                        }
                                                                                        else {
                                                                                            s1 = peg$FAILED;
                                                                                            if (peg$silentFails === 0) {
                                                                                                peg$fail(peg$e206);
                                                                                            }
                                                                                        }
                                                                                        if (s1 !== peg$FAILED) {
                                                                                            peg$savedPos = s0;
                                                                                            s1 = peg$f169();
                                                                                        }
                                                                                        s0 = s1;
                                                                                        if (s0 === peg$FAILED) {
                                                                                            s0 = peg$currPos;
                                                                                            if (input.substr(peg$currPos, 2) === peg$c178) {
                                                                                                s1 = peg$c178;
                                                                                                peg$currPos += 2;
                                                                                            }
                                                                                            else {
                                                                                                s1 = peg$FAILED;
                                                                                                if (peg$silentFails === 0) {
                                                                                                    peg$fail(peg$e188);
                                                                                                }
                                                                                            }
                                                                                            if (s1 !== peg$FAILED) {
                                                                                                peg$savedPos = s0;
                                                                                                s1 = peg$f170();
                                                                                            }
                                                                                            s0 = s1;
                                                                                            if (s0 === peg$FAILED) {
                                                                                                s0 = peg$currPos;
                                                                                                if (input.substr(peg$currPos, 2) === peg$c197) {
                                                                                                    s1 = peg$c197;
                                                                                                    peg$currPos += 2;
                                                                                                }
                                                                                                else {
                                                                                                    s1 = peg$FAILED;
                                                                                                    if (peg$silentFails === 0) {
                                                                                                        peg$fail(peg$e207);
                                                                                                    }
                                                                                                }
                                                                                                if (s1 !== peg$FAILED) {
                                                                                                    peg$savedPos = s0;
                                                                                                    s1 = peg$f171();
                                                                                                }
                                                                                                s0 = s1;
                                                                                                if (s0 === peg$FAILED) {
                                                                                                    s0 = peg$currPos;
                                                                                                    if (input.charCodeAt(peg$currPos) === 10752) {
                                                                                                        s1 = peg$c198;
                                                                                                        peg$currPos++;
                                                                                                    }
                                                                                                    else {
                                                                                                        s1 = peg$FAILED;
                                                                                                        if (peg$silentFails === 0) {
                                                                                                            peg$fail(peg$e208);
                                                                                                        }
                                                                                                    }
                                                                                                    if (s1 !== peg$FAILED) {
                                                                                                        peg$savedPos = s0;
                                                                                                        s1 = peg$f172();
                                                                                                    }
                                                                                                    s0 = s1;
                                                                                                    if (s0 === peg$FAILED) {
                                                                                                        s0 = peg$currPos;
                                                                                                        if (input.charCodeAt(peg$currPos) === 10227) {
                                                                                                            s1 = peg$c199;
                                                                                                            peg$currPos++;
                                                                                                        }
                                                                                                        else {
                                                                                                            s1 = peg$FAILED;
                                                                                                            if (peg$silentFails === 0) {
                                                                                                                peg$fail(peg$e209);
                                                                                                            }
                                                                                                        }
                                                                                                        if (s1 !== peg$FAILED) {
                                                                                                            peg$savedPos = s0;
                                                                                                            s1 = peg$f173();
                                                                                                        }
                                                                                                        s0 = s1;
                                                                                                        if (s0 === peg$FAILED) {
                                                                                                            s0 = peg$currPos;
                                                                                                            if (input.charCodeAt(peg$currPos) === 8594) {
                                                                                                                s1 = peg$c200;
                                                                                                                peg$currPos++;
                                                                                                            }
                                                                                                            else {
                                                                                                                s1 = peg$FAILED;
                                                                                                                if (peg$silentFails === 0) {
                                                                                                                    peg$fail(peg$e210);
                                                                                                                }
                                                                                                            }
                                                                                                            if (s1 !== peg$FAILED) {
                                                                                                                peg$savedPos = s0;
                                                                                                                s1 = peg$f174();
                                                                                                            }
                                                                                                            s0 = s1;
                                                                                                            if (s0 === peg$FAILED) {
                                                                                                                s0 = peg$currPos;
                                                                                                                if (input.charCodeAt(peg$currPos) === 8593) {
                                                                                                                    s1 = peg$c201;
                                                                                                                    peg$currPos++;
                                                                                                                }
                                                                                                                else {
                                                                                                                    s1 = peg$FAILED;
                                                                                                                    if (peg$silentFails === 0) {
                                                                                                                        peg$fail(peg$e211);
                                                                                                                    }
                                                                                                                }
                                                                                                                if (s1 !== peg$FAILED) {
                                                                                                                    peg$savedPos = s0;
                                                                                                                    s1 = peg$f175();
                                                                                                                }
                                                                                                                s0 = s1;
                                                                                                                if (s0 === peg$FAILED) {
                                                                                                                    s0 = peg$currPos;
                                                                                                                    if (input.charCodeAt(peg$currPos) === 8646) {
                                                                                                                        s1 = peg$c202;
                                                                                                                        peg$currPos++;
                                                                                                                    }
                                                                                                                    else {
                                                                                                                        s1 = peg$FAILED;
                                                                                                                        if (peg$silentFails === 0) {
                                                                                                                            peg$fail(peg$e212);
                                                                                                                        }
                                                                                                                    }
                                                                                                                    if (s1 !== peg$FAILED) {
                                                                                                                        peg$savedPos = s0;
                                                                                                                        s1 = peg$f176();
                                                                                                                    }
                                                                                                                    s0 = s1;
                                                                                                                    if (s0 === peg$FAILED) {
                                                                                                                        s0 = peg$currPos;
                                                                                                                        if (input.charCodeAt(peg$currPos) === 68) {
                                                                                                                            s1 = peg$c203;
                                                                                                                            peg$currPos++;
                                                                                                                        }
                                                                                                                        else {
                                                                                                                            s1 = peg$FAILED;
                                                                                                                            if (peg$silentFails === 0) {
                                                                                                                                peg$fail(peg$e213);
                                                                                                                            }
                                                                                                                        }
                                                                                                                        if (s1 !== peg$FAILED) {
                                                                                                                            peg$savedPos = s0;
                                                                                                                            s1 = peg$f177();
                                                                                                                        }
                                                                                                                        s0 = s1;
                                                                                                                    }
                                                                                                                }
                                                                                                            }
                                                                                                        }
                                                                                                    }
                                                                                                }
                                                                                            }
                                                                                        }
                                                                                    }
                                                                                }
                                                                            }
                                                                        }
                                                                    }
                                                                }
                                                            }
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }
                            }
                        }
                    }
                    return s0;
                }
                function peg$parsediscriminator() {
                    var s0;
                    s0 = peg$parsecolumn();
                    if (s0 === peg$FAILED) {
                        s0 = peg$parserow();
                    }
                    return s0;
                }
                function peg$parsecheckdisc() {
                    var s0, s1, s2, s3, s4;
                    s0 = peg$currPos;
                    s1 = peg$parsediscriminator();
                    if (s1 !== peg$FAILED) {
                        s2 = peg$parsestrike();
                        if (s2 === peg$FAILED) {
                            s2 = null;
                        }
                        s3 = peg$parsecolumn();
                        if (s3 !== peg$FAILED) {
                            s4 = peg$parserow();
                            if (s4 !== peg$FAILED) {
                                s1 = [s1, s2, s3, s4];
                                s0 = s1;
                            }
                            else {
                                peg$currPos = s0;
                                s0 = peg$FAILED;
                            }
                        }
                        else {
                            peg$currPos = s0;
                            s0 = peg$FAILED;
                        }
                    }
                    else {
                        peg$currPos = s0;
                        s0 = peg$FAILED;
                    }
                    return s0;
                }
                function peg$parsefigure() {
                    var s0;
                    if (peg$r7.test(input.charAt(peg$currPos))) {
                        s0 = input.charAt(peg$currPos);
                        peg$currPos++;
                    }
                    else {
                        s0 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$e214);
                        }
                    }
                    return s0;
                }
                function peg$parsepromFigure() {
                    var s0;
                    if (peg$r8.test(input.charAt(peg$currPos))) {
                        s0 = input.charAt(peg$currPos);
                        peg$currPos++;
                    }
                    else {
                        s0 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$e215);
                        }
                    }
                    return s0;
                }
                function peg$parsecolumn() {
                    var s0;
                    if (peg$r9.test(input.charAt(peg$currPos))) {
                        s0 = input.charAt(peg$currPos);
                        peg$currPos++;
                    }
                    else {
                        s0 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$e216);
                        }
                    }
                    return s0;
                }
                function peg$parserow() {
                    var s0;
                    if (peg$r10.test(input.charAt(peg$currPos))) {
                        s0 = input.charAt(peg$currPos);
                        peg$currPos++;
                    }
                    else {
                        s0 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$e217);
                        }
                    }
                    return s0;
                }
                function peg$parsestrike() {
                    var s0;
                    if (input.charCodeAt(peg$currPos) === 120) {
                        s0 = peg$c204;
                        peg$currPos++;
                    }
                    else {
                        s0 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$e218);
                        }
                    }
                    return s0;
                }
                function peg$parsestrikeOrDash() {
                    var s0;
                    if (input.charCodeAt(peg$currPos) === 120) {
                        s0 = peg$c204;
                        peg$currPos++;
                    }
                    else {
                        s0 = peg$FAILED;
                        if (peg$silentFails === 0) {
                            peg$fail(peg$e218);
                        }
                    }
                    if (s0 === peg$FAILED) {
                        if (input.charCodeAt(peg$currPos) === 45) {
                            s0 = peg$c146;
                            peg$currPos++;
                        }
                        else {
                            s0 = peg$FAILED;
                            if (peg$silentFails === 0) {
                                peg$fail(peg$e153);
                            }
                        }
                    }
                    return s0;
                }
                var messages = [];
                function addMessage(json) {
                    var o = Object.assign(json, location());
                    messages.push(o);
                    return o;
                }
                function makeInteger(o) {
                    return parseInt(o.join(""), 10);
                }
                function mi(o) {
                    return o.join("").match(/\?/) ? o.join("") : makeInteger(o);
                }
                function merge(array) {
                    var ret = {};
                    array.forEach(function (json) {
                        for (var key in json) {
                            if (Array.isArray(json[key])) {
                                ret[key] = ret[key] ? ret[key].concat(json[key]) : json[key];
                            }
                            else {
                                ret[key] = ret[key] ? trimEnd(ret[key]) + " " + trimStart(json[key]) : json[key];
                            }
                        }
                    });
                    return ret;
                }
                function trimStart(st) {
                    if (typeof st !== "string")
                        return st;
                    var r = /^\s+/;
                    return st.replace(r, '');
                }
                function trimEnd(st) {
                    if (typeof st !== "string")
                        return st;
                    var r = /\s+$/;
                    return st.replace(r, '');
                }
                peg$result = peg$startRuleFunction();
                if (peg$result !== peg$FAILED && peg$currPos === input.length) {
                    return peg$result;
                }
                else {
                    if (peg$result !== peg$FAILED && peg$currPos < input.length) {
                        peg$fail(peg$endExpectation());
                    }
                    throw peg$buildStructuredError(peg$maxFailExpected, peg$maxFailPos < input.length ? input.charAt(peg$maxFailPos) : null, peg$maxFailPos < input.length
                        ? peg$computeLocation(peg$maxFailPos, peg$maxFailPos + 1)
                        : peg$computeLocation(peg$maxFailPos, peg$maxFailPos));
                }
            }
            return {
                SyntaxError: peg$SyntaxError,
                parse: peg$parse
            };
        });
    }(_pgnParser));
    var PegParser = _pgnParserExports;
    function parse(input, options) {
        if (!options || (options.startRule === 'games')) {
            return parseGames(input, options);
        }
        else {
            return parseGame(input, options);
        }
    }
    function parseGame(input, options = { startRule: "game" }) {
        input = input.trim();
        let result = PegParser.parse(input, options);
        let res2 = { moves: [], messages: [] };
        if (options.startRule === "pgn") {
            let moves = result;
            res2.moves = moves;
        }
        else if (options.startRule === "tags") {
            let tags = result;
            res2.tags = tags;
        }
        else {
            res2 = result;
        }
        return postParseGame(res2, input, options);
    }
    function postParseGame(_parseTree, _input, _options) {
        function handleGameResult(parseTree) {
            if (_options.startRule !== 'tags') {
                let move = parseTree.moves[parseTree.moves.length - 1];
                if (typeof move == 'string') {
                    parseTree.moves.pop();
                    if (parseTree.tags) {
                        let tmp = parseTree.tags["Result"];
                        if (tmp) {
                            if (move !== tmp) {
                                parseTree.messages.push({ key: "Result", value: tmp, message: "Result in tags is different to result in SAN" });
                            }
                        }
                        parseTree.tags["Result"] = move;
                    }
                }
            }
            return parseTree;
        }
        function handleTurn(parseResult) {
            function handleTurnGame(_game) {
                function getTurnFromFEN(fen) {
                    return fen.split(/\s+/)[1];
                }
                function setTurn(_move, _currentTurn) {
                    function switchTurn(currentTurn) {
                        return currentTurn === 'w' ? 'b' : 'w';
                    }
                    _move.turn = _currentTurn;
                    if (_move.variations) {
                        _move.variations.forEach(function (variation) {
                            let varTurn = _currentTurn;
                            variation.forEach(varMove => varTurn = setTurn(varMove, varTurn));
                        });
                    }
                    return switchTurn(_currentTurn);
                }
                const START = 'rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR w KQkq - 0 1';
                let fen = _options.fen || (_game.tags && _game.tags['FEN']) || START;
                let currentTurn = getTurnFromFEN(fen);
                _game.moves.forEach(move => currentTurn = setTurn(move, currentTurn));
                return _game;
            }
            if (!parseResult.moves) {
                return parseResult;
            }
            return handleTurnGame(parseResult);
        }
        return handleTurn(handleGameResult(_parseTree));
    }
    function parseGames(input, options = { startRule: "games" }) {
        function handleGamesAnomaly(parseTree) {
            if (!Array.isArray(parseTree))
                return [];
            if (parseTree.length === 0)
                return parseTree;
            let last = parseTree.pop();
            if ((last.tags !== undefined) || (last.moves.length > 0)) {
                parseTree.push(last);
            }
            return parseTree;
        }
        function postParseGames(parseTrees, input, options = { startRule: "games" }) {
            return handleGamesAnomaly(parseTrees);
        }
        const gamesOptions = Object.assign({ startRule: "games" }, options);
        let result = PegParser.parse(input, gamesOptions);
        if (!result) {
            return [];
        }
        postParseGames(result, input, gamesOptions);
        result.forEach((pt) => {
            postParseGame(pt, input, gamesOptions);
        });
        return result;
    }
    const normalizeLineEndings = (str, normalized = '\n') => str.replace(/\r?\n/g, normalized);
    function split(input, options = { startRule: "games" }) {
        let result = normalizeLineEndings(input).split("\n\n");
        let res = [];
        let g = { tags: '', pgn: '', all: '' };
        result.forEach(function (part) {
            if (part.startsWith('[')) {
                g.tags = part;
            }
            else if (part) {
                g.pgn = part;
                let game = g.tags ? g.tags + "\n\n" + g.pgn : g.pgn;
                g.all = game;
                res.push(g);
                g = { tags: '', pgn: '', all: '' };
            }
        });
        return res;
    }
    exports.parse = parse;
    exports.parseGame = parseGame;
    exports.parseGames = parseGames;
    exports.split = split;
    Object.defineProperty(exports, '__esModule', { value: true });
}));
