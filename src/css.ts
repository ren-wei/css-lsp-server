import {
    getCSSLanguageService,
    LanguageService,
    Position,
    Stylesheet,
} from "vscode-css-languageservice";
import { TextDocument } from "vscode-languageserver-textdocument";

let cssServer: LanguageService | null = null;
const sheetMap: Map<string, Stylesheet> = new Map();

export function openCssTextdocument(document: TextDocument) {
    if (!cssServer) {
        cssServer = getCSSLanguageService();
    }
    sheetMap.set(document.uri, cssServer.parseStylesheet(document));
}

export function changeCssTextdocument(document: TextDocument) {
    sheetMap.set(document.uri, cssServer!.parseStylesheet(document));
}

export function closeCssTextdocument(document: TextDocument) {
    sheetMap.delete(document.uri);
}

export function doHoverOnCss(document: TextDocument, position: Position) {
    const sheet = sheetMap.get(document.uri)!;
    return cssServer!.doHover(document, position, sheet);
}

export function doCompleteOnCss(document: TextDocument, position: Position) {
    const sheet = sheetMap.get(document.uri)!;
    return cssServer!.doComplete(document, position, sheet);
}

export function doValidateCss(document: TextDocument) {
    const sheet = sheetMap.get(document.uri)!;
    return cssServer!.doValidation(document, sheet);
}
