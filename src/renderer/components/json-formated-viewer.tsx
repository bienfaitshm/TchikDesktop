import * as React from "react";

/**
 * Props interface for the FormattedJsonViewer component.
 */
export interface FormattedJsonViewerProps {
  /** JSON object or payload to render. */
  data: unknown;
  /** Optional additional CSS class names for custom layout constraints. */
  className?: string;
}

/**
 * Renders structured JSON data inside a styled, scrollable monospace container.
 * @param props - Component options including target data payload and layout class overrides.
 * @returns Preformatted text block displaying serialized JSON.
 */
export const FormattedJsonViewer: React.FC<FormattedJsonViewerProps> = ({
  data,
  className = "",
}) => {
  if (data === undefined || data === null) {
    return null;
  }

  const formattedJson = JSON.stringify(data, null, 2);

  return (
    <pre
      className={`overflow-auto rounded-md border border-slate-800 bg-slate-950 p-4 font-mono text-xs text-slate-100 shadow-inner max-h-96 ${className}`}
    >
      <code className="whitespace-pre">{formattedJson}</code>
    </pre>
  );
};

FormattedJsonViewer.displayName = "FormattedJsonViewer";
