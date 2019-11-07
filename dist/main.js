"use strict";
/**
 * This module is just a simple entry point, providing a rudimentary CLI.
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * For local testing: the base to the test URL-s. The CLI argument is appended to this URL as `test_{arg}.json` and is expected to point at
 * a bona fide publication manifest
 */
const process_1 = require("./process");
const utilities_1 = require("./utilities");
const manifest_discovery_1 = require("./manifest_discovery");
/**
 * Process a manifest:
 *
 * 1. discover the manifest, per [§4 Manifest Discovery](https://www.w3.org/TR/pub-manifest/#manifest-discovery)
 * 2. generate a publication manifest object, per [§5 Processing a Manifest](https://www.w3.org/TR/pub-manifest/#manifest-processing)
 *
 * @async
 * @param url - The address of either the JSON file or the Primary entry point in HTML
 * @return - the generated manifest object and a logger
 */
function process_manifest(url) {
    return __awaiter(this, void 0, void 0, function* () {
        const logger = new utilities_1.Logger();
        let manifest_object = {};
        let args;
        try {
            args = yield manifest_discovery_1.discover_manifest(url);
        }
        catch (err) {
            logger.log_fatal_error(`The manifest could not be discovered (${err.message})`);
            return { manifest_object, logger };
        }
        try {
            manifest_object = yield process_1.generate_internal_representation(args, logger);
        }
        catch (err) {
            logger.log_fatal_error(`Some extra error occurred during generation (${err.message})`);
        }
        return { manifest_object, logger };
    });
}
exports.process_manifest = process_manifest;
/* ====================================================================================================
 A rudimentary CLI for testing
====================================================================================================== */
/**
 * Base URL for the test suite
 */
const base = 'http://localhost:8001/LocalData/github/Publishing/PubManifest/tests/';
/**
 * For local testing: default if no argument is given on the command line.
 */
const default_test = 'lo';
/**
 * Start the general processing algorithm and, if successful, print the JSON representation of that returned class, as well as
 * the list of fatal and validation errors.
 *
 * @async
 * @param url URL to a json file
 */
function test(url) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const results = yield process_manifest(url);
            console.log(JSON.stringify(results.manifest_object, null, 4));
            console.log(results.logger.toString());
        }
        catch (e) {
            console.log(`Something went wrong: ${e.message}`);
            process.exit(1);
        }
    });
}
// Look at the process.argv for arguments
// print process.argv
const test_url = (process.argv[2] !== undefined) ? `${base}test_${process.argv[2]}.jsonld` : `${base}test_${default_test}.jsonld`;
test(test_url);
//# sourceMappingURL=main.js.map