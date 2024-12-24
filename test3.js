const { GoogleGenerativeAI } = require("@google/generative-ai");

async function generateContent() {
    try {
        const genAI = new GoogleGenerativeAI("AIzaSyDRgF-7cPQGUoaV7UiLMrYuAloG79CijME");
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const prompt = `is the title "NVIDIA AI Summit: Fireside Chat between Sh. Mukesh Ambani and Jensen Huang" related to "Techonology"? Say yes or no.`;

        const result = await model.generateContent(prompt);
        console.log(result.response.text());
    } catch (error) {
        console.error("Error generating content:", error);
    }
}

generateContent();