"use client";

import * as React from "react";
import { cn } from "@/renderer/utils";
import { ScrollArea } from "@/renderer/components/ui/scroll-area";
import { Suspense } from "../libs/queries/suspense";
import { LoadingSpinner } from "../components/loaders/loading-spinner";

export type PageContainerProps = React.HTMLAttributes<HTMLDivElement>;

/**
 * Provides a full-height scrollable container for page layouts.
 * Uses ScrollArea to maintain clean custom scrollbars.
 */
export const PageContainer: React.FC<PageContainerProps> = ({
  className,
  children,
  ...props
}) => {
  return (
    <ScrollArea className="h-full w-full flex-1">
      <div
        className={cn(
          "mx-auto flex-1 w-full min-w-0 px-4 sm:px-6 lg:px-8 py-6 max-w-(--breakpoint-xl)",
          className,
        )}
        {...props}
      >
        {children}
      </div>
    </ScrollArea>
  );
};

export type PageHeaderProps = React.HTMLAttributes<HTMLDivElement>;

/**
 * Top-level header wrapper aligning header text and action slots.
 */
export const PageHeader: React.FC<PageHeaderProps> = ({
  className,
  children,
  ...props
}) => {
  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8 pb-4 border-b border-border/40",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export type PageHeaderTextContentProps = React.HTMLAttributes<HTMLElement>;

/**
 * Groups page title and description within a semantic header container.
 */
export const PageHeaderTextContent: React.FC<PageHeaderTextContentProps> = ({
  className,
  children,
  ...props
}) => {
  return (
    <header className={cn("space-y-1", className)} {...props}>
      {children}
    </header>
  );
};

export type PageHeadActionProps = React.HTMLAttributes<HTMLDivElement>;

/**
 * Slot container for header action controls and interactive elements.
 */
export const PageHeadAction: React.FC<PageHeadActionProps> = ({
  className,
  children,
  ...props
}) => {
  return (
    <div
      className={cn("flex items-center gap-2 shrink-0", className)}
      {...props}
    >
      {children}
    </div>
  );
};

export type PageHeadTitleProps = React.HTMLAttributes<HTMLHeadingElement>;

/**
 * Primary page title heading element.
 */
export const PageHeadTitle: React.FC<PageHeadTitleProps> = ({
  className,
  children,
  ...props
}) => {
  return (
    <h1
      className={cn(
        "text-xl font-bold tracking-tight text-foreground",
        className,
      )}
      {...props}
    >
      {children}
    </h1>
  );
};

export type PageHeadDescriptionProps =
  React.HTMLAttributes<HTMLParagraphElement>;

/**
 * Secondary contextual description paragraph for page headers.
 */
export const PageHeadDescription: React.FC<PageHeadDescriptionProps> = ({
  className,
  children,
  ...props
}) => {
  return (
    <p className={cn("text-xs text-muted-foreground", className)} {...props}>
      {children}
    </p>
  );
};

export type PageContentProps = React.HTMLAttributes<HTMLDivElement> & {
  /** Custom loading fallback component to display during suspense */
  fallback?: React.ReactNode;
};

/**
 * Main page content wrapper integrated with an asynchronous Suspense boundary.
 */
export const PageContent: React.FC<PageContentProps> = ({
  fallback,
  className,
  children,
  ...props
}) => {
  const defaultFallback = (
    <div className="flex-1 flex min-h-75 w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed bg-muted/10 p-8">
      <LoadingSpinner className="text-primary size-6" />
      <p className="text-sm text-muted-foreground animate-pulse">
        Chargement...
      </p>
    </div>
  );

  return (
    <Suspense fallback={fallback ?? defaultFallback}>
      <div
        className={cn("flex-1 w-full min-w-0 space-y-6", className)}
        {...props}
      >
        {children}
      </div>
    </Suspense>
  );
};
