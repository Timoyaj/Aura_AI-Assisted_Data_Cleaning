import { useState, useEffect, useCallback } from 'react';
import { GOOGLE_API_KEY, GOOGLE_CLIENT_ID } from '../config';

// TypeScript declarations for Google APIs loaded from scripts
declare global {
  namespace google {
    namespace accounts {
      namespace oauth2 {
        interface TokenResponse {
          access_token: string;
        }
      }
    }
  }

  interface Window {
    gapi: any;
    google: any;
    tokenClient: any;
  }
}

interface UseGooglePickerOptions {
  onFilePicked: (file: { name: string; content: string }) => void;
  onAuthFailed?: () => void;
}

const SCOPES = 'https://www.googleapis.com/auth/drive.readonly';

export const useGooglePicker = ({ onFilePicked, onAuthFailed }: UseGooglePickerOptions) => {
  const [isGapiLoaded, setGapiLoaded] = useState(false);
  const [isGisLoaded, setGisLoaded] = useState(false);
  const [tokenClient, setTokenClient] = useState<any>(null);
  const [accessToken, setAccessToken] = useState<google.accounts.oauth2.TokenResponse | null>(null);

  const gapiLoaded = useCallback(() => {
    window.gapi.load('picker', () => setGapiLoaded(true));
  }, []);

  const gisLoaded = useCallback(() => {
    if (!GOOGLE_CLIENT_ID) {
      console.error("Google Client ID not found. Google Picker will be disabled.");
      setGisLoaded(true); // Mark as loaded to unblock the UI; openPicker will show the user alert.
      return;
    }
      
    const client = window.google.accounts.oauth2.initTokenClient({
      client_id: GOOGLE_CLIENT_ID,
      scope: SCOPES,
      callback: (tokenResponse: google.accounts.oauth2.TokenResponse) => {
        if (tokenResponse && tokenResponse.access_token) {
           setAccessToken(tokenResponse);
        } else if (onAuthFailed) {
            onAuthFailed();
        }
      },
      error_callback: () => {
         if (onAuthFailed) {
            onAuthFailed();
         }
      }
    });
    setTokenClient(client);
    setGisLoaded(true);
  }, [onAuthFailed]);

  useEffect(() => {
    const gapiScript = document.querySelector<HTMLScriptElement>('script[src="https://apis.google.com/js/api.js"]');
    const gisScript = document.querySelector<HTMLScriptElement>('script[src="https://accounts.google.com/gsi/client"]');
    
    if (window.gapi) gapiLoaded();
    else if (gapiScript) gapiScript.onload = gapiLoaded;

    if (window.google) gisLoaded();
    else if (gisScript) gisScript.onload = gisLoaded;
    
  }, [gapiLoaded, gisLoaded]);

  const createPicker = useCallback((token: string) => {
      const docsView = new window.google.picker.DocsView(window.google.picker.ViewId.DOCS)
        .setMimeTypes('text/csv,application/vnd.google-apps.spreadsheet');
      
      const picker = new window.google.picker.PickerBuilder()
        .setAppId(GOOGLE_CLIENT_ID!)
        .setOAuthToken(token)
        .addView(docsView)
        .setDeveloperKey(GOOGLE_API_KEY!)
        .setCallback((data: any) => {
          if (data.action === window.google.picker.Action.PICKED) {
            const doc = data.docs[0];
            const fileId = doc.id;
            const fileName = doc.name;
            
            let downloadUrl = `https://www.googleapis.com/drive/v3/files/${fileId}?alt=media`;
            if (doc.mimeType === 'application/vnd.google-apps.spreadsheet') {
               downloadUrl = `https://www.googleapis.com/drive/v3/files/${fileId}/export?mimeType=text/csv`;
            }

            fetch(downloadUrl, {
              headers: { 'Authorization': `Bearer ${token}` }
            })
            .then(res => res.text())
            .then(content => {
                onFilePicked({ name: fileName, content });
            })
            .catch(err => {
                console.error("Error fetching file content:", err);
                alert("Failed to fetch file content from Google Drive.");
            });
          }
        })
        .build();
      picker.setVisible(true);
  }, [onFilePicked]);
  
  useEffect(() => {
    if (accessToken) {
       createPicker(accessToken.access_token);
    }
  }, [accessToken, createPicker]);


  const openPicker = () => {
      if (!isGapiLoaded || !isGisLoaded) {
          alert('Google services are not ready yet. Please try again in a moment.');
          return;
      }
      
      if (!tokenClient) {
          alert("Google Drive import is not available due to a missing Client ID.");
          if(onAuthFailed) onAuthFailed();
          return;
      }

      if (!GOOGLE_API_KEY) {
          alert("Google Drive import is not configured. Missing API Key.");
          if(onAuthFailed) onAuthFailed();
          return;
      }

      // Prompt the user to grant access
      tokenClient.requestAccessToken({ prompt: '' });
  };
  
  return {
    openPicker,
    isReady: isGapiLoaded && isGisLoaded
  };
};