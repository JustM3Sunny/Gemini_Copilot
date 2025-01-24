import * as vscode from 'vscode';
import { GoogleGenerativeAI } from '@google/generative-ai';

export class InlineSuggestionsProvider implements vscode.InlineCompletionItemProvider {
    constructor(private readonly genAI: GoogleGenerativeAI) {}

    async provideInlineCompletionItems(
        document: vscode.TextDocument,
        position: vscode.Position,
        context: vscode.InlineCompletionContext,
        token: vscode.CancellationToken
    ): Promise<vscode.InlineCompletionItem[]> {
        try {
            // Get current line and previous few lines for context
            const linePrefix = document.lineAt(position.line).text.substring(0, position.character);
            const previousLines = document.getText(new vscode.Range(
                new vscode.Position(Math.max(0, position.line - 5), 0),
                position
            ));

            const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
            const prompt = `Complete the following code. Only provide the completion, no explanations:
                Context:
                ${previousLines}
                Current line:
                ${linePrefix}`;

            const result = await model.generateContent(prompt);
            const suggestion = result.response.text().trim();

            if (suggestion) {
                return [new vscode.InlineCompletionItem(suggestion)];
            }
        } catch (error) {
            console.error('Error generating inline suggestion:', error);
        }

        return [];
    }
}