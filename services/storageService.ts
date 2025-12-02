
import { ref, uploadString, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';
import { UploadedFile } from '../types';

export const storageService = {
  
  /**
   * Uploads a file to Google Cloud Storage.
   * Path Structure: inputs/{userId}/{projectId}/{timestamp}_{filename}
   */
  uploadProjectFile: async (file: UploadedFile, userId: string, projectId: string): Promise<string> => {
    if (!file.data) throw new Error("File data missing");

    try {
      const timestamp = Date.now();
      // Sanitize filename
      const safeName = file.name.replace(/[^a-z0-9.]/gi, '_').toLowerCase();
      const path = `inputs/${userId}/${projectId}/${timestamp}_${safeName}`;
      
      const storageRef = ref(storage, path);
      
      // Upload Base64 string
      await uploadString(storageRef, file.data, 'base64', {
        contentType: file.mimeType
      });

      // Get the Immutable URL
      const url = await getDownloadURL(storageRef);
      return url;
    } catch (error) {
      console.error("Storage Upload Failed:", error);
      // Fallback: In a real app, we'd throw. For the demo, we might return null 
      // but let's assume this is critical.
      throw new Error("Falha no upload seguro para a nuvem.");
    }
  }
};
