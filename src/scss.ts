import {
    getSCSSLanguageService,
    LanguageService,
    Position,
    Stylesheet,
} from "vscode-css-languageservice";
import { TextDocument } from "vscode-languageserver-textdocument";

let scssServer: LanguageService | null = null;
const sheetMap: Map<string, Stylesheet> = new Map();

export function openScssTextdocument(document: TextDocument) {
    if (!scssServer) {
        scssServer = getSCSSLanguageService();
    }
    sheetMap.set(document.uri, scssServer.parseStylesheet(document));
}

export function changeScssTextdocument(document: TextDocument) {
    sheetMap.set(document.uri, scssServer!.parseStylesheet(document));
}

export function closeScssTextdocument(document: TextDocument) {
    sheetMap.delete(document.uri);
}

export function doHoverOnScss(document: TextDocument, position: Position) {
    const sheet = sheetMap.get(document.uri)!;
    return scssServer!.doHover(document, position, sheet);
}

export function doCompleteOnScss(document: TextDocument, position: Position) {
    const sheet = sheetMap.get(document.uri)!;
    return scssServer!.doComplete(document, position, sheet);
}

export function doValidateScss(document: TextDocument) {
    const sheet = sheetMap.get(document.uri)!;
    return scssServer!.doValidation(document, sheet);
}
