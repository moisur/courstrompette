import { cn } from "@/lib/utils";
import { GradientText } from "./GradientText";

interface SectionTitleProps {
    children: React.ReactNode;
    highlight?: string;
    className?: string;
}

export function SectionTitle({ children, highlight, className }: SectionTitleProps) {
    if (!highlight) {
        return (
            <h2 className={cn("text-3xl md:text-4xl font-bold text-center mb-12", className)}>
                {children}
            </h2>
        );
    }

    // Split children text around the highlight
    const text = children?.toString() || '';
    const parts = text.split(highlight);

    return (
        <h2 className={cn("text-3xl md:text-4xl font-bold text-center mb-12", className)}>
            {parts[0]}
            <GradientText className="pl-2">{highlight}</GradientText>
            {parts[1] || ''}
        </h2>
    );
}
