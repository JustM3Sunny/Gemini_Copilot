import { GoogleGenerativeAI } from '@google/generative-ai';

export class RefactoringService {
    constructor(private readonly genAI: GoogleGenerativeAI) {}

    async refactor(code: string): Promise<string | undefined> {
        try {
            const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
            const result = await model.generateContent(
                `Refactor this code to improve readability, performance, and maintainability. 
                Only provide the refactored code, no explanations: ${code}`
            );
            return result.response.text();
        } catch (error) {
            console.error('Error refactoring code:', error);
            return undefined;
        }
    }
}