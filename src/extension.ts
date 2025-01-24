import * as vscode from 'vscode';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { ChatPanel } from './panels/ChatPanel';
import { InlineSuggestionsProvider } from './providers/InlineSuggestionsProvider';
import { CodeGenerator } from './services/CodeGenerator';
import { DocumentationGenerator } from './services/DocumentationGenerator';
import { TestGenerator } from './services/TestGenerator';
import { RefactoringService } from './services/RefactoringService';

let genAI: GoogleGenerativeAI;

export function activate(context: vscode.ExtensionContext) {
    const config = vscode.workspace.getConfiguration('gemini-copilot');
    const apiKey = config.get<string>('apiKey');

    if (!apiKey) {
        vscode.window.showErrorMessage('Please set your Gemini API key in settings');
        return;
    }

    genAI = new GoogleGenerativeAI(apiKey);

    // Initialize services
    const codeGenerator = new CodeGenerator(genAI);
    const documentationGenerator = new DocumentationGenerator(genAI);
    const testGenerator = new TestGenerator(genAI);
    const refactoringService = new RefactoringService(genAI);
    const inlineSuggestionsProvider = new InlineSuggestionsProvider(genAI);

    // Register commands
    context.subscriptions.push(
        vscode.commands.registerCommand('gemini-copilot.toggleInlineSuggestions', () => {
            const enabled = !config.get<boolean>('inlineSuggestionsEnabled');
            config.update('inlineSuggestionsEnabled', enabled, true);
            vscode.window.showInformationMessage(
                `Inline suggestions ${enabled ? 'enabled' : 'disabled'}`
            );
        }),

        vscode.commands.registerCommand('gemini-copilot.generateCode', async () => {
            const prompt = await vscode.window.showInputBox({
                prompt: 'Describe the code you want to generate',
                placeHolder: 'E.g., Create a React component for a todo list'
            });

            if (prompt) {
                const code = await codeGenerator.generate(prompt);
                if (code) {
                    const document = await vscode.workspace.openTextDocument({
                        content: code,
                        language: 'typescript'
                    });
                    await vscode.window.showTextDocument(document);
                }
            }
        }),

        vscode.commands.registerCommand('gemini-copilot.toggleChatPanel', () => {
            ChatPanel.createOrShow(context.extensionUri, genAI);
        }),

        vscode.commands.registerCommand('gemini-copilot.refactorCode', async () => {
            const editor = vscode.window.activeTextEditor;
            if (editor) {
                const selection = editor.selection;
                const text = editor.document.getText(selection);
                if (text) {
                    const refactoredCode = await refactoringService.refactor(text);
                    if (refactoredCode) {
                        editor.edit(editBuilder => {
                            editBuilder.replace(selection, refactoredCode);
                        });
                    }
                }
            }
        }),

        vscode.commands.registerCommand('gemini-copilot.generateDocs', async () => {
            const editor = vscode.window.activeTextEditor;
            if (editor) {
                const selection = editor.selection;
                const text = editor.document.getText(selection);
                if (text) {
                    const docs = await documentationGenerator.generate(text);
                    if (docs) {
                        editor.edit(editBuilder => {
                            editBuilder.insert(selection.start, docs + '\n');
                        });
                    }
                }
            }
        }),

        vscode.commands.registerCommand('gemini-copilot.generateTests', async () => {
            const editor = vscode.window.activeTextEditor;
            if (editor) {
                const selection = editor.selection;
                const text = editor.document.getText(selection);
                if (text) {
                    const tests = await testGenerator.generate(text);
                    if (tests) {
                        const document = await vscode.workspace.openTextDocument({
                            content: tests,
                            language: 'typescript'
                        });
                        await vscode.window.showTextDocument(document);
                    }
                }
            }
        })
    );

    // Register providers
    if (config.get<boolean>('inlineSuggestionsEnabled')) {
        context.subscriptions.push(
            vscode.languages.registerInlineCompletionItemProvider(
                { pattern: '**' },
                inlineSuggestionsProvider
            )
        );
    }
}

export function deactivate() {}