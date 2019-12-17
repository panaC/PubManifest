"use strict";
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (Object.hasOwnProperty.call(mod, k)) result[k] = mod[k];
    result["default"] = mod;
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const utilities_1 = require("./utilities");
const discovery_1 = require("./discovery");
const urlHandler = __importStar(require("url"));
/** Sectioning Content Elements, see  https://html.spec.whatwg.org/multipage/dom.html#sectioning-content-2 */
const sectioning_content_elements = ['ARTICLE', 'ASIDE', 'NAV', 'SECTION'];
/** Sectioning Root Elements, https://html.spec.whatwg.org/multipage/sections.html#sectioning-root */
const sectioning_root_elements = ['BLOCKQUOTE', 'BODY', 'DETAILS', 'DIALOG', 'FIELDSET', 'FIGURE', 'TD'];
/** Per spec, Sectioning elements are skipped, see step 4.7 */
const skipped_elements = [...sectioning_content_elements, ...sectioning_root_elements];
const heading_content_elements = ['H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'HGROUP'];
const list_elements = ['UL', 'OL'];
const list_item_elements = ['LI'];
const anchor_elements = ['A'];
/** Internal type to control the exact flow in [[core_element_cycle]] */
var traverse;
(function (traverse) {
    traverse[traverse["exit"] = 0] = "exit";
    traverse[traverse["proceed"] = 1] = "proceed";
})(traverse || (traverse = {}));
;
/**
 * Depth-first traversal of a DOM tree: for each interesting child element:
 *
 * 1. it calls the `enter` function, which also returns a [[traverse]] value
 * 2. unless the result of the previous step is to to exit right away, goes down to the children recursively
 * 3. calls the `exit` function
 *
 * All these actions happen on elements that are of interest for the process. If that is not the case, just go to children without entering `enter` and `exit`.
 *
 * @param element - element to handle
 * @param enter - 'enter element' call-back
 * @param exit - 'exit element' call-back
 */
function core_element_cycle(element, enter, exit) {
    element.childNodes.forEach((child) => {
        if (enter(child) === traverse.proceed) {
            core_element_cycle(child, enter, exit);
        }
        exit(child);
    });
}
;
/**
 * Get the text content of an element.
 * The spec gives a choice between using the text content of an element or
 * the result of doing an accessible name calculation. For now, simply do the
 * former.
 *
 * Also, in all cases the function is called, the assignment of the result is `null` instead of an empty string, so this is returned.
 *
 * @param element - element whose text content is collected
 * @return - text content, null if the text is empty
 */
function text_content(element) {
    //@@@ Maybe it should be innerText for a proper HTML file? To be tested!
    const txt = element.textContent;
    return (txt === '') ? null : txt;
}
/**
 * Extract the Table of Content data from the HTML source.
 *
 * This is the implementation of the core [§C.3 User Agent Processing algorithm](https://www.w3.org/TR/pub-manifest/#app-toc-ua) of the specification.
 *
 * @param nav - the DOM `<nav>` element to extract the data from
 * @returns - the Table of Content structure; if there are no valid entries, the function returns `null`
 */
function extract_TOC(nav) {
    // The real 'meat' is in the six functions below.
    // Everything else is scaffolding...
    const enter_heading_content = (entry) => {
        // Step 4.1
        if (toc.name === '' && branches.length === 0) {
            // this will return null instead of the empty string as defined in the spec
            toc.name = text_content(entry);
        }
        return traverse.exit;
    };
    const enter_list_element = (entry) => {
        // Step 4.2
        // Step 4.2.1.
        if (toc.name === '')
            toc.name = null;
        if (current_toc_branch !== null) {
            // Step 4.2.2.
            if (current_toc_branch.entries === null || current_toc_branch.entries.length !== 0) {
                return traverse.exit;
            }
            else {
                branches.push(current_toc_branch);
                current_toc_branch = null;
            }
        }
        else if (branches.length === 0) {
            // Step 4.2.3.
            if (toc.entries === null || toc.entries.length !== 0) {
                return traverse.exit;
            }
        }
        return traverse.proceed;
    };
    const exit_list_element = (entry) => {
        // Step 4.3
        if (branches.length !== 0) {
            current_toc_branch = branches.pop();
        }
        else if (toc.entries.length === 0) {
            toc.entries = null;
        }
    };
    const enter_list_item_element = (entry) => {
        // Step 4.4
        current_toc_branch = {
            name: "",
            url: "",
            type: "",
            rel: null,
            entries: [],
        };
        return traverse.proceed;
    };
    const exit_list_item_element = (entry) => {
        // Step 4.5.1
        if (current_toc_branch.entries.length === 0) {
            current_toc_branch.entries = null;
        }
        // Step 4.5.2
        if (current_toc_branch.name === '') {
            if (current_toc_branch.entries !== null) {
                current_toc_branch.name = null;
            }
            else {
                current_toc_branch = null;
                return;
            }
        }
        // Step 4.5.3
        if (branches.length !== 0) {
            branches[branches.length - 1].entries.push(current_toc_branch);
        }
        else {
            toc.entries.push(current_toc_branch);
        }
        current_toc_branch = null;
    };
    const enter_anchor_element = (entry) => {
        if (current_toc_branch !== null) {
            // Step 4.6.1
            if (current_toc_branch.name !== '') {
                return traverse.exit;
            }
            else {
                // Step 4.6.2.1
                // the function returns null instead of an empty string, as required by the spec
                current_toc_branch.name = text_content(entry);
                const anchor = entry;
                // @@@ TODO: check the URL!!!!
                // Step 4.6.2.2
                current_toc_branch.url = anchor.hasAttribute('href') ? anchor.href : null;
                // Step 4.6.2.3
                current_toc_branch.type = anchor.hasAttribute('type') ? anchor.type.trim() : null;
                // Step 4.6.2.4
                if (anchor.hasAttribute('rel')) {
                    const rel = anchor.rel.trim().split(' ');
                    current_toc_branch.rel = (rel.length !== 0) ? rel : null;
                }
                else {
                    current_toc_branch.rel = null;
                }
            }
        }
        return traverse.exit;
    };
    const enter_element = (entry) => {
        if (heading_content_elements.includes((entry.tagName))) {
            // Step 4.1
            return enter_heading_content(entry);
        }
        else if (list_elements.includes(entry.tagName)) {
            // Step 4.2
            return enter_list_element(entry);
        }
        else if (list_item_elements.includes(entry.tagName)) {
            // Step 4.4
            return enter_list_item_element(entry);
        }
        else if (anchor_elements.includes(entry.tagName)) {
            // Step 4.6
            return enter_anchor_element(entry);
        }
        else if (skipped_elements.includes(entry.tagName) || entry.hidden === true) {
            // Step 4.7
            return traverse.exit;
        }
        else {
            // Step 4.8
            return traverse.proceed;
        }
    };
    const exit_element = (entry) => {
        if (list_elements.includes(entry.tagName)) {
            // Step 4.3
            exit_list_element(entry);
        }
        else if (list_item_elements.includes(entry.tagName)) {
            // Step 4.5
            exit_list_item_element(entry);
        }
        // Step 4.8
    };
    const toc = {
        name: '',
        entries: []
    };
    let current_toc_branch = null;
    const branches = [];
    // Depth first traversal of the nav element with the enter/exit functions above
    core_element_cycle(nav, enter_element, exit_element);
    // Return either a real ToC or undefined...
    return toc.entries.length !== 0 ? toc : null;
}
/**
 * Extract the ToC, if available, via the manifest information. This is the implementation of
 * the [§C.3 User Agent Processing algorithm](https://www.w3.org/TR/pub-manifest/#app-toc-ua) of the specification: after finding the relevant element
 * that is supposed to contain the ToC, the heavy lifting is done in [[extract_TOC]].
 *
 * The function is asynchronous because, possibly, the HTML resource, containing the ToC, must be fetched.
 *
 * @async
 * @param manifest - the processed manifest
 */
async function generate_TOC(manifest) {
    // Try to see if there is a ToC element among the resources:
    const linked_resources = (manifest.resources) ? [...manifest.readingOrder, ...manifest.resources] : manifest.readingOrder;
    const resource = linked_resources.find((link) => (link.rel && link.rel.includes('contents')));
    if (resource !== undefined && resource.url !== '') {
        const parsed = urlHandler.parse(resource.url);
        const fragment = parsed.hash;
        delete parsed.hash;
        const absolute_url = urlHandler.format(parsed);
        /* TODO: There can be an optimization step here: if the Global document url is the same as this absolute url, then there is no reason to go through another fetch */
        // Try to get hold of the HTML resource
        let html_dom = null;
        try {
            const dom = await discovery_1.fetch_html(absolute_url);
            html_dom = dom.window.document;
        }
        catch (e) {
            utilities_1.Global.logger.log_light_validation_error(`Problems fetching ToC resource (${e.message})`);
            return null;
        }
        // Branch out on whether there is a fragment ID or not...
        if (fragment !== '') {
            const nav = html_dom.getElementById(fragment);
            if (nav.hasAttribute('role') && nav.getAttribute('role').trim().split(' ').includes('doc-toc')) {
                // There is indeed a toc element, we can proceed to extract the content
                return extract_TOC(nav);
            }
            // If we get there, there is no valid TOC, so we fall through the whole branch to the closure of the function
        }
        else {
            const nav = html_dom.querySelector('*[role*="doc-toc"]');
            if (nav !== null) {
                return extract_TOC(nav);
            }
            // If we get there, there is no valid TOC, so we fall through the whole branch to the closure of the function
        }
    }
    // If we got that far, we have a problem...
    return null;
}
exports.generate_TOC = generate_TOC;
//----------------------------- Temporary testing area ---------------------------------
// const html_content = `
// <nav role="doc-toc">
// <h2>Contents</h2>
// <ol>
//    <li><a href="xmas_carol.html">Marley's Ghost</a></li>
//    <li><a>The First of Three Spirits</a></li>
//    <li><a>The Second of Three Spirits</a></li>
//    <li><a>The Last of the Spirits</a></li>
//    <li><a>The End of It</a></li>
// </ol>
// </nav>
// `
// import * as jsdom      from 'jsdom';
// import * as yaml from 'yaml';
// function main() {
//     const dom = new jsdom.JSDOM(html_content, { url: 'http://www.example.org'});
//     const document = dom.window.document;
//     const nav = document.querySelector('*[role*="doc-toc"]') as HTMLElement;
//     const toc = extract_TOC(nav);
//     console.log(yaml.stringify(toc));
// }
// main();
//# sourceMappingURL=toc.js.map