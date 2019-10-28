/**
 * Typescript interfaces representing the objects generated by the algorithm.
 *
 * The interface definition
 * follows, essentially, the [WebIDL appendix](https://www.w3.org/TR/pub-manifest/#internal-rep-data-model) of the spec; see there for more on the individual terms.
 */


/**
 * The notion of "recognizable types" appears in the processing algorithm section, although not
 * in the main core
 */
export type RecognizedTypes = Person | Organization | LinkedResource;

/**
 * Superclass for a [[Person]] or an [[Organization]].
 */
export interface Entity {
    type?       : string[];
    name        : LocalizableString[];
    id?         : string;
    url?        : string;
    identifier? : string[];
    // [propName: string] : any;
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
    value      : string;
    language?  : string;
    direction? : string;
};

export enum ProgressionDirection {
    ltr = 'ltr',
    rtl = 'rtl',
};

/**
 * A generic Linked Resource
 */
export interface LinkedResource {
    url                : string;
    encodingFormat?    : string;
    name?              : LocalizableString[];
    description?       : LocalizableString;
    rel?               : string[];
    integrity?         : string;
    length?            : number;
    alternate?         : LinkedResource[];
    // [propName: string] : any;
};

/**
 * The complete interface for a processed representation of the data model
 */
export interface PublicationManifest {
    type?                 : string[];
    id?                   : string;
    profile               : string;
    conformsTo            : string[];

    accessMode?           : string[];
    accessModeSufficient? : string[];
    accessibilityFeature? : string[];
    accessibilityHazard?  : string[];
    accessibilitySummary? : LocalizableString [];
    artist?               : Entity[];
    author?               : Entity[];
    colorist?             : Entity[];
    contributor?          : Entity[];
    creator?              : Entity[];
    editor?               : Entity[];
    illustrator?          : Entity[];
    inker?                : Entity[];
    letterer?             : Entity[];
    penciler?             : Entity[];
    publisher?            : Entity[];
    readBy?               : Entity[];
    translator?           : Entity[];

    url?                  : string[];
    duration?             : string;
    inLanguage?           : string[];
    dateModified?         : string;
    datePublished?        : string;
    abridged?             : boolean;
    readingProgression?   : ProgressionDirection;
    name                  : LocalizableString[];
    readingOrder          : LinkedResource[];
    resources?            : LinkedResource[];
    links?                : LinkedResource[];
    // [propName: string] : any;
};

