import { createContext } from "react";

import { Message } from "../types";


/**
 * Shared context so both tabs (Messages + Handled) can access the same
 * message state without prop-drilling through navigation layers.
 */
export interface MessagesContextValue {
    inbox: Message[];
    handled: Message[];
    loading: boolean;
    error: string | null;
    approve: (id: number) => void;
    reject: (id: number) => void;
    refresh: () => Promise<void>;
}


export const MessagesContext = createContext<MessagesContextValue>({
    inbox: [],
    handled: [],
    loading: false,
    error: null,
    approve: () => {},
    reject: () => {},
    refresh: async () => {},
});
