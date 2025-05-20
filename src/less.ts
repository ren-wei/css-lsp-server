import {
    getLESSLanguageService,
    LanguageService,
    Position,
    Stylesheet,
} from "vscode-css-languageservice";
import { TextDocument } from "vscode-languageserver-textdocument";

let lessServer: LanguageService | null = null;
const sheetMap: Map<string, Stylesheet> = new Map();

export function openLessTextdocument(document: TextDocument) {
    if (!lessServer) {
        lessServer = getLESSLanguageService();
    }
    sheetMap.set(document.uri, lessServer.parseStylesheet(document));
}

export function changeLessTextdocument(document: TextDocument) {
    sheetMap.set(document.uri, lessServer!.parseStylesheet(document));
}

export function closeLessTextdocument(document: TextDocument) {
    sheetMap.delete(document.uri);
}

export function doHoverOnLess(document: TextDocument, position: Position) {
    const sheet = sheetMap.get(document.uri)!;
    return lessServer!.doHover(document, position, sheet);
}

export function doCompleteOnLess(document: TextDocument, position: Position) {
    const sheet = sheetMap.get(document.uri)!;
    return lessServer!.doComplete(document, position, sheet);
}

export function doValidateLess(document: TextDocument) {
    const sheet = sheetMap.get(document.uri)!;
    return lessServer!.doValidation(document, sheet);
}
