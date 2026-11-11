import * as AuthSession from "expo-auth-session";
import * as SecureStore from "expo-secure-store";
import * as WebBrowser from "expo-web-browser";

import { API_URL } from "../constants/config";
import { GOOGLE_WEB_CLIENT_ID } from "../constants/google";

WebBrowser.maybeCompleteAuthSession();

const discovery = {
  authorizationEndpoint:
    "https://accounts.google.com/o/oauth2/v2/auth",
  tokenEndpoint:
    "https://oauth2.googleapis.com/token",
  revocationEndpoint:
    "https://oauth2.googleapis.com/revoke",
};

export async function googleLogin() {
  const redirectUri = AuthSession.makeRedirectUri({
    scheme: "skillprep",
    path: "auth",
  });

  console.log("Google redirect URI:", redirectUri);

  const request = new AuthSession.AuthRequest({
    clientId: GOOGLE_WEB_CLIENT_ID,
    responseType: AuthSession.ResponseType.IdToken,
    scopes: ["openid", "profile", "email"],
    redirectUri,
    extraParams: {
      nonce: Math.random().toString(36).substring(2),
    },
  });

  await request.makeAuthUrlAsync(discovery);

  const result = await request.promptAsync(discovery);

  if (result.type !== "success") {
    throw new Error("Google login was cancelled");
  }

  const idToken =
    result.params?.id_token;

  if (!idToken) {
    throw new Error("Google ID token not received");
  }

  const response = await fetch(
    `${API_URL}/auth/google`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        credential: idToken,
      }),
    }
  );

  const data = await response.json();

  if (!response.ok) {
    throw new Error(
      data.message || "Google login failed"
    );
  }

  await SecureStore.setItemAsync(
    "accessToken",
    data.accessToken
  );

  await SecureStore.setItemAsync(
    "refreshToken",
    data.refreshToken
  );

  if (data.user) {
    await SecureStore.setItemAsync(
      "user",
      JSON.stringify(data.user)
    );
  }

  return data;
}