
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import { 
  AUDITOR_SYSTEM_INSTRUCTION as FALLBACK_AUDITOR, 
  ENGINEER_SYSTEM_INSTRUCTION as FALLBACK_ENGINEER,
  CHATBOT_SYSTEM_INSTRUCTION as FALLBACK_CHATBOT
} from '../constants';

const COLLECTION = 'system_configs';
const DOC_ID = 'current_prompt';

interface SystemPrompts {
  auditor: string;
  engineer: string;
  chatbot: string;
  updatedAt: number;
  version: string;
}

// Facade to get prompts either from Cloud (Firestore) or Fallback (Constants)
export const promptService = {
  
  // Fetch logic
  getAllPrompts: async (): Promise<SystemPrompts> => {
    try {
      const docRef = doc(db, COLLECTION, DOC_ID);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        return docSnap.data() as SystemPrompts;
      }
    } catch (error) {
      console.warn("Offline or Config not found. Using V28 Hardcoded Fallback.");
    }

    // Return Fallback if DB fails
    return {
      auditor: FALLBACK_AUDITOR,
      engineer: FALLBACK_ENGINEER,
      chatbot: FALLBACK_CHATBOT,
      updatedAt: Date.now(),
      version: 'V28.0 (Local Fallback)'
    };
  },

  // Save logic (For Admin Panel)
  updatePrompts: async (prompts: Partial<SystemPrompts>) => {
    try {
      const docRef = doc(db, COLLECTION, DOC_ID);
      await setDoc(docRef, {
        ...prompts,
        updatedAt: Date.now()
      }, { merge: true });
      return true;
    } catch (error) {
      console.error("Failed to update prompts", error);
      throw error;
    }
  },

  // Individual getters
  getAuditorPrompt: async () => (await promptService.getAllPrompts()).auditor,
  getEngineerPrompt: async () => (await promptService.getAllPrompts()).engineer,
  getChatbotPrompt: async () => (await promptService.getAllPrompts()).chatbot,
};
