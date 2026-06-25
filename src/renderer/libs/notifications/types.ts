import type { MutateOptions } from "@tanstack/react-query";

export interface NotificationMessages {
  title: string;
  description?: string;
}

export interface NotificationConfig {
  enabled?: boolean;
  title?: string;
  description?: string;
}

export interface UseMutationNotificationOptions {
  success?: NotificationConfig;
  error?: NotificationConfig & {
    formatError?: (error: unknown) => string;
  };
}

export type MutateOptionsWithNotifications<
  TData,
  TError,
  TVariables,
  TContext,
> = MutateOptions<TData, TError, TVariables, TContext> & {
  notifications?: UseMutationNotificationOptions;
};
