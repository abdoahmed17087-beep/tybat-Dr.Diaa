export default async function handler(req, res) {
    const { message, preamble } = req.body;
    const API_KEY = process.env.api; // هنا Vercel هيقرأ المفتاح بأمان

    const response = await fetch("https://api.cohere.ai/v1/chat", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${API_KEY}`,
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ message, preamble, model: "command-r-08-2024" })
    });

    const data = await response.json();
    res.status(200).json(data);
}
