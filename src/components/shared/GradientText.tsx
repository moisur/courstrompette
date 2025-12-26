import { cn } from "@/lib/utils";

interface GradientTextProps {
    children: React.ReactNode;
    className?: string;
}

export function GradientText({ children, className }: GradientTextProps) {
    return (
        <span
            className={cn(
                "bg-gradient-to-br from-[#F16] from-35% to-[#F97316] bg-clip-text text-transparent dark:drop-shadow-[0_5px_5px_rgba(0,0,0,0.8)]",
                className
            )}
        >
            {children}
        </span>
    );
}
