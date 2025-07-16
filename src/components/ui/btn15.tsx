
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowUpRight } from "lucide-react";

interface Btn15Props extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    label?: string;
    icon?: React.ComponentType<{ className?: string }>;
    variant?: 'default' | 'success' | 'warning' | 'danger' | 'info';
    size?: 'sm' | 'default' | 'lg';
}

export default function Btn15({
    className,
    label = "Button",
    icon: Icon,
    variant = 'default',
    size = 'default',
    ...props
}: Btn15Props) {
    const getVariantStyles = () => {
        switch (variant) {
            case 'success':
                return "bg-gradient-to-r from-blue-600 to-indigo-700 hover:from-blue-700 hover:to-indigo-800 border-blue-500/30";
            case 'warning':
                return "bg-gradient-to-r from-pink-600 to-purple-700 hover:from-pink-700 hover:to-purple-800 border-pink-500/30";
            case 'danger':
                return "bg-gradient-to-r from-purple-600 to-pink-700 hover:from-purple-700 hover:to-pink-800 border-purple-500/30";
            case 'info':
                return "bg-gradient-to-r from-blue-500 to-cyan-600 hover:from-blue-600 hover:to-cyan-700 border-blue-400/30";
            default:
                return "bg-gradient-to-r from-blue-600 to-pink-600 hover:from-blue-700 hover:to-pink-700 border-blue-500/30";
        }
    };

    const getSizeStyles = () => {
        switch (size) {
            case 'sm':
                return "h-8 px-3 text-xs";
            case 'lg':
                return "h-12 px-6 text-base";
            default:
                return "h-10 px-4 text-sm";
        }
    };

    return (
        <Button
            className={cn(
                "relative overflow-hidden backdrop-blur-xl border rounded-xl transition-all duration-300 hover:scale-105 active:scale-95",
                getVariantStyles(),
                getSizeStyles(),
                "shadow-lg hover:shadow-xl text-white font-medium",
                className
            )}
            {...props}
        >
            {/* Glass shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -skew-x-12 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
            
            {/* Content */}
            <div className="relative flex items-center justify-center gap-2 z-10">
                <span className="text-white font-medium">{label}</span>
                {Icon ? (
                    <Icon className="w-4 h-4 text-white/90" />
                ) : (
                    <ArrowUpRight className="w-4 h-4 text-white/90" />
                )}
            </div>
        </Button>
    );
}
