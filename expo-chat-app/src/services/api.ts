import { QuoteResponse, Message } from "../types";


/** Brief AI-style summaries to pair with fetched quotes */
const AI_SUMMARIES = [
    "Motivational insight about personal growth and mindset.",
    "Philosophical reflection on life priorities and purpose.",
    "Leadership wisdom on influence and decision-making.",
    "Perspective on resilience and overcoming challenges.",
    "Observation about creativity and unconventional thinking.",
    "Guidance on patience, timing, and long-term vision.",
    "Thought on human connection and empathy.",
    "Reflection on simplicity and focused living.",
    "Advice on courage and taking meaningful action.",
    "Insight on learning from failure and adaptation.",
];


/**
 * Generates a realistic relative timestamp within the last 48 hours.
 * Spreads messages across a believable time range.
 *
 * @param index - Position in the message list (earlier = more recent)
 * @returns Date object for the message timestamp
 */
function generateTimestamp(index: number): Date {
    const now = new Date();
    const hoursAgo = index * 6 + Math.floor(Math.random() * 4);
    return new Date(now.getTime() - hoursAgo * 60 * 60 * 1000);
}


/**
 * Fetches random quotes from DummyJSON and transforms them into Message objects.
 * Each quote gets a paired AI summary and a generated timestamp.
 *
 * @param count - Number of messages to fetch (default: 6)
 * @returns Array of Message objects ready for display
 */
export async function fetchMessages(count: number = 5): Promise<Message[]> {
    const response = await fetch(
        `https://dummyjson.com/quotes/random/${count}`
    );

    if (!response.ok) {
        throw new Error(`Failed to fetch quotes: ${response.status}`);
    }

    const quotes: QuoteResponse[] = await response.json();

    return quotes.map((quote, index) => ({
        id: quote.id,
        content: quote.quote,
        author: quote.author,
        summary: AI_SUMMARIES[index % AI_SUMMARIES.length],
        receivedAt: generateTimestamp(index),
    }));
}
