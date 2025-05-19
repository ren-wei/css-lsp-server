import {
    createConnection,
    TextDocuments,
    ProposedFeatures,
    InitializeParams,
    DidChangeConfigurationNotification,
    TextDocumentSyncKind,
    InitializeResult,
    DocumentDiagnosticReportKind,
    type DocumentDiagnosticReport,
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
        } satisfies DocumentDiagnosticReport;
    } else {
        return {
            kind: DocumentDiagnosticReportKind.Full,
            items: [],
        } satisfies DocumentDiagnosticReport;
    }
});

connection.onDidChangeWatchedFiles((_change) => {
    connection.console.log("We received a file change event");
});

documents.onDidOpen((params) => {
    if (params.document.languageId === "css") {
        openCssTextdocument(params.document);
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
    }
});

documents.onDidClose((params) => {
    if (params.document.languageId === "css") {
        closeCssTextdocument(params.document);
    }
});

connection.onHover((params) => {
    const document = documents.get(params.textDocument.uri)!;
    if (document.languageId === "css") {
        return doHoverOnCss(document, params.position);
    }
    return null;
});

connection.onCompletion((params) => {
    const document = documents.get(params.textDocument.uri)!;
    if (document.languageId === "css") {
        return doCompleteOnCss(document, params.position);
    }
    return null;
});

documents.listen(connection);

connection.listen();
