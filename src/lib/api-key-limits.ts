export const MAX_ACTIVE_API_KEYS = 10;

export class ApiKeyLimitError extends Error {
  constructor() {
    super(
      `You can only have ${MAX_ACTIVE_API_KEYS} active API keys. Delete one to create a new key.`,
    );
    this.name = "ApiKeyLimitError";
  }
}
