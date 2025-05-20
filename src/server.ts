import {
    createConnection,
    TextDocuments,
    ProposedFeatures,
    InitializeParams,
    TextDocumentSyncKind,
    InitializeResult,
    DocumentDiagnosticReportKind,
} from "vscode-languageserver/node";

import { TextDocument } from "vscode-languageserver-textdocument";

import {
    changeCssTextdocument,
    closeCssTextdocument,
    doCompleteOnCss,
    doHoverOnCss,
    doValidateCss,
    openCssTextdocument,
} from "./css";
import {
    changeScssTextdocument,
    closeScssTextdocument,
    doCompleteOnScss,
    doHoverOnScss,
    doValidateScss,
    openScssTextdocument,
} from "./scss";
import {
    changeLessTextdocument,
    closeLessTextdocument,
    doCompleteOnLess,
    doHoverOnLess,
    doValidateLess,
    openLessTextdocument,
} from "./less";

// Create a connection for the server, using Node's IPC as a transport.
// Also include all preview / proposed LSP features.
const connection = createConnection(ProposedFeatures.all);

// Create a simple text document manager.
const documents = new TextDocuments(TextDocument);

connection.onInitialize((params: InitializeParams) => {
    const result: InitializeResult = {
        capabilities: {
            textDocumentSync: TextDocumentSyncKind.Incremental,
            hoverProvider: true,
            // Tell the client that this server supports code completion.
            completionProvider: {
                resolveProvider: false,
            },
            diagnosticProvider: {
                interFileDependencies: false,
                workspaceDiagnostics: false,
            },
        },
    };
    return result;
});

connection.onInitialized(() => {
    // Register for all configuration changes.
    // connection.client.register(
    //     DidChangeConfigurationNotification.type,
    //     undefined,
    // );
});

connection.onDidChangeConfiguration((change) => {
    connection.languages.diagnostics.refresh();
});

connection.languages.diagnostics.on(async (params) => {
    const document = documents.get(params.textDocument.uri);
    if (document?.languageId === "css") {
        return {
            kind: DocumentDiagnosticReportKind.Full,
            items: doValidateCss(document),
        };
    } else if (document?.languageId === "scss") {
        return {
            kind: DocumentDiagnosticReportKind.Full,
            items: doValidateScss(document),
        };
    } else if (document?.languageId === "less") {
        return {
            kind: DocumentDiagnosticReportKind.Full,
            items: doValidateLess(document),
        };
    } else {
        return {
            kind: DocumentDiagnosticReportKind.Full,
            items: [],
        };
    }
});

documents.onDidOpen((params) => {
    if (params.document.languageId === "css") {
        openCssTextdocument(params.document);
    } else if (params.document.languageId === "scss") {
        openScssTextdocument(params.document);
    } else if (params.document.languageId === "less") {
        openLessTextdocument(params.document);
    }
});

// The content of a text document has changed. This event is emitted
// when the text document first opened or when its content has changed.
documents.onDidChangeContent((change) => {
    if (change.document.languageId === "css") {
        changeCssTextdocument(change.document);
        const diags = doValidateCss(change.document);
        connection.sendDiagnostics({
            uri: change.document.uri,
            version: change.document.version,
            diagnostics: diags,
        });
    } else if (change.document.languageId === "scss") {
        changeScssTextdocument(change.document);
        const diags = doValidateScss(change.document);
        connection.sendDiagnostics({
            uri: change.document.uri,
            version: change.document.version,
            diagnostics: diags,
        });
    } else if (change.document.languageId === "less") {
        changeLessTextdocument(change.document);
        const diags = doValidateLess(change.document);
        connection.sendDiagnostics({
            uri: change.document.uri,
            version: change.document.version,
            diagnostics: diags,
        });
    }
});

documents.onDidClose((params) => {
    if (params.document.languageId === "css") {
        closeCssTextdocument(params.document);
    } else if (params.document.languageId === "scss") {
        closeScssTextdocument(params.document);
    } else if (params.document.languageId === "less") {
        closeLessTextdocument(params.document);
    }
});

connection.onHover((params) => {
    const document = documents.get(params.textDocument.uri)!;
    if (document.languageId === "css") {
        return doHoverOnCss(document, params.position);
    } else if (document.languageId === "scss") {
        return doHoverOnScss(document, params.position);
    } else if (document.languageId === "less") {
        return doHoverOnLess(document, params.position);
    }
    return null;
});

connection.onCompletion((params) => {
    const document = documents.get(params.textDocument.uri)!;
    if (document.languageId === "css") {
        return doCompleteOnCss(document, params.position);
    } else if (document.languageId === "scss") {
        return doCompleteOnScss(document, params.position);
    } else if (document.languageId === "less") {
        return doCompleteOnLess(document, params.position);
    }
    return null;
});

documents.listen(connection);

connection.listen();
