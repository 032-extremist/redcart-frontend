import axios from "axios";

export const getApiErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError(error)) {
    const message = (error.response?.data as { message?: string } | undefined)?.message;
    if (message) {
      return message;
    }
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
};

export const getApiValidationErrors = (error: unknown) => {
  if (!axios.isAxiosError(error)) {
    return {} as Record<string, string>;
  }

  const payload = error.response?.data as
    | {
        errors?: Array<{ path?: string; message?: string }>;
      }
    | undefined;

  if (!Array.isArray(payload?.errors)) {
    return {} as Record<string, string>;
  }

  const entries = payload.errors
    .filter((item) => typeof item?.path === "string" && typeof item?.message === "string")
    .map((item) => [String(item.path), String(item.message)] as const);

  return Object.fromEntries(entries);
};
