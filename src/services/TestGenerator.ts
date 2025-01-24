import { GoogleGenerativeAI } from '@google/generative-ai';

export class TestGenerator {
    constructor(private readonly genAI: GoogleGenerativeAI) {}

    async generate(code: string): Promise<string | undefined> {
        try {
            const model = this.genAI.getGenerativeModel({ model: 'gemini-pro' });
            const result = await model.generateContent(
                `Generate comprehensive test cases for this code using the appropriate testing framework. 
                Only provide the test code, no explanations: ${code}`
            );
            return result.response.text();
        } catch (error) {
            console.error('Error generating tests:', error);
            return undefined;
        }
    }
}