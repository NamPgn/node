import admin from "firebase-admin";
import "dotenv/config";

// Helper function to properly format the private key
const formatPrivateKey = (privateKey: string | undefined): string => {
  if (!privateKey) {
    throw new Error("FIREBASE_PRIVATE_KEY environment variable is not set");
  }
  
  // Handle different formats of private key
  // Replace literal \n with actual newlines
  let formattedKey = privateKey.replace(/\\n/g, '\n');
  
  // If the key doesn't start with -----BEGIN, it might be base64 encoded
  if (!formattedKey.includes('-----BEGIN')) {
    // Try to decode base64 if it looks like base64
    if (/^[A-Za-z0-9+/=]+$/.test(formattedKey)) {
      try {
        formattedKey = Buffer.from(formattedKey, 'base64').toString('utf-8');
      } catch (error) {
        console.warn("Failed to decode private key as base64, using as-is");
      }
    }
  }
  
  // Ensure proper PEM format
  if (!formattedKey.includes('-----BEGIN PRIVATE KEY-----')) {
    throw new Error("Invalid private key format. Must be a valid PEM formatted private key.");
  }
  
  return formattedKey;
};

// Validate required environment variables
const validateFirebaseConfig = () => {
  const requiredVars = [
    'FIREBASE_PROJECT_ID',
    'FIREBASE_PRIVATE_KEY_ID', 
    'FIREBASE_PRIVATE_KEY',
    'FIREBASE_CLIENT_EMAIL',
    'FIREBASE_CLIENT_ID',
    'FIREBASE_AUTH_URI',
    'FIREBASE_TOKEN_URI',
    'FIREBASE_AUTH_PROVIDER_X509_CERT_URL',
    'FIREBASE_CLIENT_X509_CERT_URL',
    'STORAGE_BUCKET'
  ];
  
  const missingVars = requiredVars.filter(varName => !process.env[varName]);
  
  if (missingVars.length > 0) {
    throw new Error(`Missing required Firebase environment variables: ${missingVars.join(', ')}`);
  }
};

const serviceAccount = {
  type: "service_account",
  project_id: process.env.FIREBASE_PROJECT_ID,
  private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
  private_key: formatPrivateKey(process.env.FIREBASE_PRIVATE_KEY),
  client_email: process.env.FIREBASE_CLIENT_EMAIL,
  client_id: process.env.FIREBASE_CLIENT_ID,
  auth_uri: process.env.FIREBASE_AUTH_URI,
  token_uri: process.env.FIREBASE_TOKEN_URI,
  auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
  client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL,
};

export const initializeFirebase = () => {
  try {
    // Validate environment variables first
    validateFirebaseConfig();
    
    if (!admin.apps.length) {
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
        storageBucket: process.env.STORAGE_BUCKET,
      });
      console.log("✅ Firebase initialized successfully");
    }
  } catch (error) {
    console.error("❌ Firebase initialization failed:", error);
    throw error;
  }
}; 