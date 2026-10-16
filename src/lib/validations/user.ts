import { z } from "zod";

/**
 * Zod schema for username validation
 * Rules:
 * - 3 to 20 characters
 * - Only alphanumeric characters and underscores (a-z, A-Z, 0-9, _)
 * - Trimmed automatically
 */
export const usernameSchema = z
  .string("Username is required.")
  .trim()
  .min(3, "Username must be at least 3 characters.")
  .max(20, "Username must not exceed 20 characters.")
  .regex(
    /^[a-zA-Z0-9_]+$/,
    "Username can only contain letters, numbers, and underscores."
  );

export const setUsernameSchema = z.object({
  username: usernameSchema,
});

export const checkUsernameQuerySchema = z.object({
  username: usernameSchema,
});

export type UsernameInput = z.infer<typeof usernameSchema>;
