import { getDownloadURL, ref, uploadBytes } from "firebase/storage";
import { storage } from "../firebase/config";

export class AudioStorageService {
    static async uploadAudio(audioBlob: Blob, fileName: string) : Promise<string> {
        try {
            const audioRef = ref(storage, `evalingua/${fileName}`);
            
            // Upload the file
            const snapshot = await uploadBytes(audioRef, audioBlob);

            const downloadURL = await getDownloadURL(snapshot.ref);
            console.log('File available at', downloadURL);
            return downloadURL;
        } catch (error) {
            console.error('Error uploading file', error);
            throw error;
        }
    }
}