import React from 'react';
import { cn } from '../../lib/utils';
import { motion, HTMLMotionProps } from 'motion/react';

interface ButtonProps extends HTMLMotionProps<"button"> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'icon';
  className?: string;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    return (
      <motion.button
        ref={ref}
        whileTap={{ scale: 0.95 }}
        className={cn(
          "inline-flex items-center justify-center rounded-xl font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary disabled:pointer-events-none disabled:opacity-50",
          variant === 'primary' && "bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-[0_0_15px_rgba(59,130,246,0.3)] hover:shadow-[0_0_20px_rgba(59,130,246,0.5)] border border-blue-500/50",
          variant === 'secondary' && "bg-surface hover:bg-surface-hover text-white border border-white/10",
          variant === 'outline' && "border-2 border-primary/50 text-primary hover:bg-primary/10",
          variant === 'ghost' && "hover:bg-white/10 text-gray-300 hover:text-white",
          size === 'sm' && "h-8 px-3 text-xs",
          size === 'md' && "h-11 px-5 py-2 text-sm",
          size === 'lg' && "h-14 px-8 text-base",
          size === 'icon' && "h-10 w-10",
          className
        )}
        {...props}
      >
        {children}
      </motion.button>
    );
  }
);

Button.displayName = 'Button';
