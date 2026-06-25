import * as brevo from "@getbrevo/brevo";

import env from "./env";

declare global {
  var _brevoClient: brevo.TransactionalEmailsApi | undefined;
}

export function getBrevo(): brevo.TransactionalEmailsApi {
  if (global._brevoClient) return global._brevoClient;

  const client = new brevo.TransactionalEmailsApi();
  client.setApiKey(brevo.TransactionalEmailsApiApiKeys.apiKey, env.brevoApiKey);
  global._brevoClient = client;

  console.log("Brevo connected successfully");
  return client;
}
