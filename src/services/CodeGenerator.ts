import { GoogleGenerativeAI } from '@google/generative-ai';

export class CodeGenerator {
    constructor(private readonly genAI: GoogleGenerativeAI) {}

    async generate(prompt: string): Promise<string | undefined> {
        try {
            const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
            const result = await model.generateContent(
                `Generate code based on this description. Only provide the code, no explanations: ${prompt}`
            );
            return result.response.text();
        } catch (error) {
            console.error('Error generating code:', error);
            return undefined;
        }
    }
}