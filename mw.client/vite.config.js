import { fileURLToPath, URL } from 'node:url';

import { defineConfig } from 'vite';
import plugin from '@vitejs/plugin-react';
import fs from 'fs';
import path from 'path';
import child_process from 'child_process';
import { env } from 'process';

const baseFolder =
    env.APPDATA !== undefined && env.APPDATA !== ''
        ? `${env.APPDATA}/ASP.NET/https`
        : `${env.HOME}/.aspnet/https`;

const certificateName = "mw.client"; // Ensure this matches your certificate if different
const certFilePath = path.join(baseFolder, `${certificateName}.pem`);
const keyFilePath = path.join(baseFolder, `${certificateName}.key`);

// Check and create certificates if they don't exist
if (!fs.existsSync(baseFolder)) {
    fs.mkdirSync(baseFolder, { recursive: true });
}

if (!fs.existsSync(certFilePath) || !fs.existsSync(keyFilePath)) {
    console.log(`Attempting to create certificate in: ${baseFolder}`);
    const result = child_process.spawnSync('dotnet', [
        'dev-certs',
        'https',
        '--export-path',
        certFilePath,
        '--format',
        'Pem',
        '--no-password',
    ], { stdio: 'inherit' });

    if (result.status !== 0) {
        // Log the error if certificate creation fails
        console.error("Could not create certificate. dotnet dev-certs command failed.");
        if (result.error) {
            console.error("Spawn error:", result.error);
        }
        // Optionally throw an error or exit, depending on desired behavior
        throw new Error("Certificate creation failed.");
    }
    console.log(`Certificate created successfully: ${certFilePath}`);
} else {
    console.log(`Using existing certificate: ${certFilePath}`);
}


// Determine the target backend URL (ASP.NET Core app)
// Prioritize ASPNETCORE_HTTPS_PORT, then ASPNETCORE_URLS, fallback to 7037
const target = env.ASPNETCORE_HTTPS_PORT
    ? `https://localhost:${env.ASPNETCORE_HTTPS_PORT}`
    : env.ASPNETCORE_URLS
        ? env.ASPNETCORE_URLS.split(';')[0] // Use the first URL if multiple are defined
        : 'https://localhost:7037'; // Default fallback

console.log(`Proxy target configured for: ${target}`);

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [plugin()],
    resolve: {
        alias: {
            '@': fileURLToPath(new URL('./src', import.meta.url))
        }
    },
    server: {
        // Configure the proxy rules
        proxy: {
            // Proxy requests starting with /api to the backend server
            '^/api': {
                target: target, // The backend server URL determined above
                secure: false,  // Disable SSL certificate verification (necessary for dev certs)
                changeOrigin: true // Recommended to avoid potential CORS or host header issues
            },
            // Keep the existing rule if you still use /weatherforecast directly
            '^/weatherforecast': {
                target: target,
                secure: false,
                changeOrigin: true // Added for consistency
            }
        },
        port: 5173, // Your Vite development server port
        https: {
            key: fs.readFileSync(keyFilePath),
            cert: fs.readFileSync(certFilePath),
        }
    }
})