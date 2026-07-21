import * as React from "react";
import { cn } from "@/renderer/utils";
import { ScrollArea } from "@/renderer/components/ui/scroll-area";
import { Suspense } from "../libs/queries/suspense";
import { LoadingSpinner } from "../components/loaders/loading-spinner";

export type PageContainerProps = React.HTMLAttributes<HTMLDivElement>;

/**
 * Provides a full-height scrollable container for page layouts.
 * @param className - Optional CSS class names.
 * @param children - Child components to render within the scrollable container.
 * @returns Scrollable page container component.
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
          "mx-auto flex-1 w-full px-6 lg:px-10 lg:pt-5 max-w-(--breakpoint-xl)",
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
 * @param className - Optional CSS class names.
 * @param children - Header text content and action elements.
 * @returns Page header container.
 */
export const PageHeader: React.FC<PageHeaderProps> = ({
  className,
  children,
  ...props
}) => {
  return (
    <div
      className={cn("flex justify-between items-end gap-4 mb-10", className)}
      {...props}
    >
      {children}
    </div>
  );
};

export type PageHeaderTextContentProps = React.HTMLAttributes<HTMLElement>;

/**
 * Groups page title and description within a semantic header container.
 * @param className - Optional CSS class names.
 * @param children - Title and description elements.
 * @returns Semantic header text wrapper.
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
 * @param className - Optional CSS class names.
 * @param children - Action elements such as buttons or menus.
 * @returns Action slot container.
 */
export const PageHeadAction: React.FC<PageHeadActionProps> = ({
  className,
  children,
  ...props
}) => {
  return (
    <div className={cn("flex items-center gap-2", className)} {...props}>
      {children}
    </div>
  );
};

export type PageHeadTitleProps = React.HTMLAttributes<HTMLHeadingElement>;

/**
 * Primary page title heading element.
 * @param className - Optional CSS class names.
 * @param children - Text content for the title.
 * @returns Standardized primary page heading.
 */
export const PageHeadTitle: React.FC<PageHeadTitleProps> = ({
  className,
  children,
  ...props
}) => {
  return (
    <h1
      className={cn("text-2xl font-bold tracking-tight", className)}
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
 * @param className - Optional CSS class names.
 * @param children - Text content for the description.
 * @returns Standardized page description element.
 */
export const PageHeadDescription: React.FC<PageHeadDescriptionProps> = ({
  className,
  children,
  ...props
}) => {
  return (
    <p className={cn("text-sm text-muted-foreground", className)} {...props}>
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
 * @param fallback - Optional custom fallback UI shown while loading.
 * @param className - Optional CSS class names.
 * @param children - Page content elements.
 * @returns Suspense-wrapped content region.
 */
export const PageContent: React.FC<PageContentProps> = ({
  fallback,
  className,
  children,
  ...props
}) => {
  const defaultFallback = (
    <div className="flex-1 flex h-full w-full flex-col items-center justify-center gap-2 rounded-lg border border-dashed bg-muted/10">
      <LoadingSpinner className="text-primary" />
      <p className="text-sm text-muted-foreground animate-pulse">Loading...</p>
    </div>
  );

  return (
    <Suspense fallback={fallback ?? defaultFallback}>
      <div className={cn("flex-1 w-full", className)} {...props}>
        {children}
      </div>
    </Suspense>
  );
};
