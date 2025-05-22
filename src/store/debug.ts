import { atom } from 'jotai';

export interface PendingMessage {
  id: string;
  simName: string;
  content: string;
  timestamp: number;
  onApprove: (content: string) => void;
}

export const debugModeAtom = atom<boolean>(false);
export const pendingMessagesAtom = atom<PendingMessage[]>([]); 