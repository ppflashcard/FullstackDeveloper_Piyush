export type ApiKeyType = "dev" | "prod";

export type ApiKey = {
  id: string;
  name: string;
  key: string;
  type: ApiKeyType;
  usage: number;
  createdAt: string;
  updatedAt: string;
};

export type ApiKeyPublic = Omit<ApiKey, "key"> & {
  keyPreview: string;
};

export type CreateApiKeyInput = {
  name: string;
  type?: ApiKeyType;
};

export type UpdateApiKeyInput = {
  name: string;
  type?: ApiKeyType;
};
