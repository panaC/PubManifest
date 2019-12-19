/**
 * Typescript interfaces representing the objects generated by the algorithm.
 *
 * The interface definition
 * follows, essentially, the [WebIDL appendix](https://www.w3.org/TR/pub-manifest/#internal-rep-data-model) of the spec; see there for more on the individual terms.
 */

/**
 * This is just a type alias, i.e., a URL is simply a string, but it is better for the class documentations...
 */
export type URL = string;

/**
 * The notion of "recognizable types" appears in the processing algorithm section, although not
 * in the main core
 */
export type RecognizedTypes = Person | Organization | LinkedResource;

/**
 * Superclass for a [[Person]] or an [[Organization]].
 */
export interface Entity {
    type?      : string[];
    name       : LocalizableString[];
    id?        : string;
    url?       : string;
    identifier?: string[];
    [propName: string] : any;
};

/**
 * Interface for a Person.
 */
export interface Person extends Entity {};

/**
 * Interface for an Organization.
 */
export interface Organization extends Entity {};

/**
 * Localizable string; it mimics the JSON-LD structures for string values
 */
export interface LocalizableString {
    value     : string;
    language? : string;
    direction?: string;
};

export enum ProgressionDirection {
    ltr = 'ltr',
    rtl = 'rtl',
};

/**
 * A generic Linked Resource
 */
export interface LinkedResource {
    url               : URL;
    encodingFormat?   : string;
    name?             : LocalizableString[];
    description?      : LocalizableString;
    rel?              : string[];
    integrity?        : string;
    duration?         : string;
    alternate?        : LinkedResource[];
    [propName: string]: any;
};

/**
 * One Table of Content's entry. Contains data extracted from an `<a>` element (`url`, `type`, `rel`),
 * as well as the name of the entry, plus an array of possible entries of the next layer in the tree.
 */
export interface TocEntry {
    name   : string;
    url    : string;
    type   : string;
    rel    : string[];
    entries: TocEntry[];
}

/**
 * Table of Content
 */
export interface ToC {
    name   : string;
    entries: TocEntry[];
}

/**
 * The complete interface for a processed representation of the data model
 */
export interface PublicationManifest {
    type?                : string[];
    id?                  : URL;
    profile              : string;
    conformsTo           : string[];

    accessMode?          : string[];
    accessModeSufficient?: string[];
    accessibilityFeature?: string[];
    accessibilityHazard? : string[];
    accessibilitySummary?: LocalizableString [];
    artist?              : Entity[];
    author?              : Entity[];
    colorist?            : Entity[];
    contributor?         : Entity[];
    creator?             : Entity[];
    editor?              : Entity[];
    illustrator?         : Entity[];
    inker?               : Entity[];
    letterer?            : Entity[];
    penciler?            : Entity[];
    publisher?           : Entity[];
    readBy?              : Entity[];
    translator?          : Entity[];

    url?               : URL[];
    duration?          : string;
    inLanguage?        : string[];
    dateModified?      : string;
    datePublished?     : string;
    abridged?          : boolean;
    readingProgression?: ProgressionDirection;
    name               : LocalizableString[];
    readingOrder       : LinkedResource[];
    resources?         : LinkedResource[];
    links?             : LinkedResource[];
    uniqueResources    : URL[];

    toc?               : ToC;

    [propName: string] : any;
};
