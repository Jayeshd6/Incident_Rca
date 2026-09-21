import { BASE_URL } from "./config.mjs";

export async function post(path, body) {
  if (!body.length) {
    return { accepted: 0 };
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`POST ${path} failed: ${response.status} ${errorText}`);
  }

  return response.json();
}