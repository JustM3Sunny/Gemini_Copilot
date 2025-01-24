import { GoogleGenerativeAI } from '@google/generative-ai';

export class DocumentationGenerator {
    constructor(private readonly genAI: GoogleGenerativeAI) {}

    async generate(code: string): Promise<string | undefined> {
        try {
            const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
            const result = await model.generateContent(
                `Generate comprehensive JSDoc documentation for the following code: ${code}`
            );
            return result.response.text();
        } catch (error) {
            console.error('Error generating documentation:', error);
            return undefined;
        }
    }
}