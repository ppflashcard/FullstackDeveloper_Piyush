export const MAX_ACTIVE_API_KEYS = 10;
export const PLAN_CREDITS = 1000;

export class ApiKeyLimitError extends Error {
  constructor() {
    super(
      `You can only have ${MAX_ACTIVE_API_KEYS} active API keys. Delete one to create a new key.`,
    );
    this.name = "ApiKeyLimitError";
  }
}

export class ApiUsageLimitError extends Error {
  readonly totalUsage: number;
  readonly limit: number;

  constructor(totalUsage: number, limit: number = PLAN_CREDITS) {
    super(
      `Monthly API callout limit reached (${totalUsage.toLocaleString()} / ${limit.toLocaleString()} credits used). Upgrade your plan or wait for the next billing cycle.`,
    );
    this.name = "ApiUsageLimitError";
    this.totalUsage = totalUsage;
    this.limit = limit;
  }
}
