import { cn } from "@/renderer/utils";
import { forwardRef } from "react";
import type { DetailedHTMLProps, HTMLAttributes } from "react";

const TypographyH1 = forwardRef<
    HTMLHeadingElement,
    DetailedHTMLProps<HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>
>(({ className, ...props }, ref) => {
    return (
        <h1
            className={cn(
                "scroll-m-20 text-4xl font-extrabold tracking-tight lg:text-5xl",
                className,
            )}
            ref={ref}
            {...props}
        />
    );
});
TypographyH1.displayName = "TypographyH1";

const TypographyH2 = forwardRef<
    HTMLHeadingElement,
    DetailedHTMLProps<HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>
>(({ className, ...props }, ref) => {
    return (
        <h2
            className={cn(
                "scroll-m-20 text-3xl font-semibold tracking-tight first:mt-0",
                className,
            )}
            ref={ref}
            {...props}
        />
    );
});
TypographyH2.displayName = "TypographyH2";

const TypographyH3 = forwardRef<
    HTMLHeadingElement,
    DetailedHTMLProps<HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>
>(({ className, ...props }, ref) => {
    return (
        <h3
            className={cn(
                "scroll-m-20 text-2xl font-semibold tracking-tight",
                className,
            )}
            ref={ref}
            {...props}
        />
    );
});
TypographyH3.displayName = "TypographyH3";

const TypographyH4 = forwardRef<
    HTMLHeadingElement,
    DetailedHTMLProps<HTMLAttributes<HTMLHeadingElement>, HTMLHeadingElement>
>(({ className, ...props }, ref) => {
    return (
        <h4
            className={cn(
                "scroll-m-20 text-xl font-semibold tracking-tight",
                className,
            )}
            ref={ref}
            {...props}
        />
    );
});
TypographyH4.displayName = "TypographyH4";

const TypographyP = forwardRef<
    HTMLParagraphElement,
    DetailedHTMLProps<HTMLAttributes<HTMLParagraphElement>, HTMLParagraphElement>
>(({ className, ...props }, ref) => {
    return <p className={cn("leading-7", className)} ref={ref} {...props} />;
});
TypographyP.displayName = "TypographyP";

const TypographyLead = forwardRef<
    HTMLParagraphElement,
    DetailedHTMLProps<HTMLAttributes<HTMLParagraphElement>, HTMLParagraphElement>
>(({ className, ...props }, ref) => {
    return (
        <p
            className={cn("text-xl text-muted-foreground", className)}
            ref={ref}
            {...props}
        />
    );
});
TypographyLead.displayName = "TypographyLead";

const TypographyLarge = forwardRef<
    HTMLDivElement,
    DetailedHTMLProps<HTMLAttributes<HTMLDivElement>, HTMLDivElement>
>(({ className, ...props }, ref) => {
    return (
        <div
            className={cn("text-lg font-semibold", className)}
            ref={ref}
            {...props}
        />
    );
});
TypographyLarge.displayName = "TypographyLarge";

const TypographySmall = forwardRef<
    HTMLElement,
    DetailedHTMLProps<HTMLAttributes<HTMLElement>, HTMLElement>
>(({ className, ...props }, ref) => {
    return (
        <small
            className={cn("text-sm font-medium leading-none", className)}
            ref={ref}
            {...props}
        />
    );
});
TypographySmall.displayName = "TypographySmall";

const TypographyMuted = forwardRef<
    HTMLParagraphElement,
    DetailedHTMLProps<HTMLAttributes<HTMLParagraphElement>, HTMLParagraphElement>
>(({ className, ...props }, ref) => {
    return (
        <p
            className={cn("text-sm text-muted-foreground", className)}
            ref={ref}
            {...props}
        />
    );
});
TypographyMuted.displayName = "TypographyMuted";

export {
    TypographyH1,
    TypographyH2,
    TypographyH3,
    TypographyH4,
    TypographyP,
    TypographyLead,
    TypographyLarge,
    TypographyMuted,
    TypographySmall,
};