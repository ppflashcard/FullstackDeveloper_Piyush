type ApiError = {
  error?: string;
};

export async function parseJsonResponse<T>(response: Response): Promise<T> {
  const text = await response.text();

  if (!text) {
    throw new Error(
      response.ok
        ? "Empty response from server"
        : `Server error (${response.status}). Try restarting the dev server.`,
    );
  }

  try {
    return JSON.parse(text) as T;
  } catch {
    throw new Error(
      response.ok
        ? "Invalid response from server"
        : `Server error (${response.status}). Try restarting the dev server.`,
    );
  }
}

export async function getApiError(response: Response): Promise<string> {
  try {
    const data = await parseJsonResponse<ApiError>(response);
    return data.error ?? `Request failed (${response.status})`;
  } catch (error) {
    return error instanceof Error
      ? error.message
      : `Request failed (${response.status})`;
  }
}
