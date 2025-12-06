import React from "react";
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { ClerkProvider, useAuth } from "@clerk/clerk-react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ConvexReactClient } from "convex/react";

const convexUrl = import.meta.env.VITE_CONVEX_URL;
const clerkKey = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;

if (!convexUrl) {
  console.error('❌ VITE_CONVEX_URL is not set!');
  console.error('Please check your .env.local file in the client directory.');
  console.error('It should contain: VITE_CONVEX_URL=https://your-deployment.convex.cloud');
}

if (!clerkKey) {
  console.warn('⚠️  VITE_CLERK_PUBLISHABLE_KEY is not set!');
  console.warn('Get your key from https://dashboard.clerk.com');
}

// Create Convex client - will show error if URL is missing
const convex = convexUrl ? new ConvexReactClient(convexUrl) : new ConvexReactClient('');

createRoot(document.getElementById("root")!).render(
    <React.StrictMode>
        <ClerkProvider publishableKey={import.meta.env.VITE_CLERK_PUBLISHABLE_KEY}>
            <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
                <App />
            </ConvexProviderWithClerk>
        </ClerkProvider>
    </React.StrictMode>
);
