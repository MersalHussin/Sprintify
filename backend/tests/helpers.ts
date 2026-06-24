import request, { type Test } from "supertest";

import { createApp } from "../src/app";

export const TOKENS = {
  manager: "Bearer manager-token",
  member: "Bearer member-token",
} as const;

export function testApp() {
  return request(createApp());
}

type AuthedClient = {
  get: (url: string) => Test;
  post: (url: string) => Test;
  put: (url: string) => Test;
  patch: (url: string) => Test;
  delete: (url: string) => Test;
};

export function authed(token: string): AuthedClient {
  const agent = request(createApp());
  const withAuth = (call: (url: string) => Test) => (url: string) =>
    call(url).set("Authorization", token);

  return {
    get: withAuth((url) => agent.get(url)),
    post: withAuth((url) => agent.post(url)),
    put: withAuth((url) => agent.put(url)),
    patch: withAuth((url) => agent.patch(url)),
    delete: withAuth((url) => agent.delete(url)),
  };
}
