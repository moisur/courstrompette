import { cn } from "@/lib/utils";

interface SectionProps {
    id?: string;
    children: React.ReactNode;
    variant?: 'default' | 'gray' | 'gradient';
    className?: string;
}

const variantStyles = {
    default: 'bg-white',
    gray: 'bg-gray-100',
    gradient: 'bg-gradient-to-b from-gray-50 to-gray-100',
};

export function Section({ id, children, variant = 'default', className }: SectionProps) {
    return (
        <section id={id} className={cn("py-20", variantStyles[variant], className)}>
            <div className="container mx-auto px-4">
                {children}
            </div>
        </section>
    );
}
