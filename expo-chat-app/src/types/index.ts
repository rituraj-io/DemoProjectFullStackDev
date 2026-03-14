/**
 * Shared type definitions for the chat message app.
 */


/** A single message with its AI-generated summary and approval state */
export interface Message {
    /** Unique identifier from the API or generated locally */
    id: number;

    /** Original message content (the full quote/text) */
    content: string;

    /** Who sent the message */
    author: string;

    /** AI-generated brief summary of the message */
    summary: string;

    /** Timestamp when the message arrived */
    receivedAt: Date;
}


/** Raw response shape from dummyjson.com/quotes */
export interface QuoteResponse {
    id: number;
    quote: string;
    author: string;
}


/** Navigation param lists for type-safe routing */
export type MessagesStackParamList = {
    MessagesList: undefined;
    MessageDetail: { message: Message };
};

export type HandledStackParamList = {
    HandledList: undefined;
    HandledDetail: { message: Message };
};

export type RootTabParamList = {
    MessagesTab: undefined;
    HandledTab: undefined;
};
