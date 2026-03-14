import { useState, useEffect, useCallback } from "react";

import { Message } from "../types";
import { fetchMessages } from "../services/api";


/**
 * Manages the message lifecycle — inbox, handled (approved), and removal (rejected).
 * Fetches initial messages from the API and exposes actions for approve/reject.
 *
 * @returns State and actions for the message system
 */
export function useMessages() {
    const [inbox, setInbox] = useState<Message[]>([]);
    const [handled, setHandled] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);


    /** Fetch messages from the API on mount */
    useEffect(() => {
        loadMessages();
    }, []);


    /** Pulls fresh messages from the DummyJSON quotes API */
    const loadMessages = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const messages = await fetchMessages(5);
            setInbox(messages);
        } catch (err) {
            setError(
                err instanceof Error ? err.message : "Failed to load messages"
            );
        } finally {
            setLoading(false);
        }
    }, []);


    /**
     * Approves a message — moves it from inbox to handled list.
     * The message appears in the Handled tab without action buttons.
     *
     * @param id - The message ID to approve
     */
    const approve = useCallback((id: number) => {
        setInbox((prev) => {
            const message = prev.find((m) => m.id === id);
            if (message) {
                setHandled((h) => [message, ...h]);
            }
            return prev.filter((m) => m.id !== id);
        });
    }, []);


    /**
     * Rejects a message — removes it from the inbox entirely.
     * The message disappears from the UI with no trace.
     *
     * @param id - The message ID to reject
     */
    const reject = useCallback((id: number) => {
        setInbox((prev) => prev.filter((m) => m.id !== id));
    }, []);


    return { inbox, handled, loading, error, approve, reject, refresh: loadMessages };
}
