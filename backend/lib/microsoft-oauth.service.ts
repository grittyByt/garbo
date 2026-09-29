import { ConfidentialClientApplication, Configuration } from "@azure/msal-node";

const tenantId = process.env.MICROSOFT_TENANT_ID;
const clientId = process.env.MICROSOFT_CLIENT_ID;
const clientSecret = process.env.MICROSOFT_CLIENT_SECRET;

if (!tenantId || !clientId || !clientSecret) {
    throw new Error("Microsoft OAuth environment variables are missing");
}

const msalConfig: Configuration = {
    auth: {
        clientId,
        authority: `https://login.microsoftonline.com/${tenantId}`,
        clientSecret,
    },
};

const msalClient = new ConfidentialClientApplication(msalConfig);

export async function getMicrosoftAccessToken(): Promise<string> {

    const result =
        await msalClient.acquireTokenByClientCredential({
            scopes: [ "https://outlook.office365.com/.default" ],
        });

    if (!result?.accessToken) {
        throw new Error("Microsoft did not return an SMTP access token");
    }

    return result.accessToken;
}