import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cva, type VariantProps } from 'class-variance-authority';

import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  IconPlus,
  IconSparkles,
  IconLayoutDashboard,
  IconArrowRight,
  IconRocket
} from '@tabler/icons-react';
import { cn } from '@/lib/utils';

// Variants for different layout styles
const layoutVariants = cva(
  "min-h-screen transition-all duration-300",
  {
    variants: {
      variant: {
        default: "bg-gradient-to-br from-gray-50 to-blue-50/30 dark:from-gray-900 dark:to-blue-950/20",
        minimal: "bg-transparent",
        gradient: "bg-gradient-to-br from-blue-500/5 via-purple-500/5 to-pink-500/5 dark:from-blue-500/10 dark:via-purple-500/10 dark:to-pink-500/10",
      },
      padding: {
        default: "px-4 py-6 sm:px-6 lg:px-8",
        compact: "px-4 py-4 sm:px-6",
        relaxed: "px-4 py-8 sm:px-8 lg:px-12",
      },
    },
    defaultVariants: {
      variant: "default",
      padding: "default",
    },
  }
);

interface ContentLayoutProps extends VariantProps<typeof layoutVariants> {
  children: React.ReactNode;
  iconTitle?: React.ReactNode;
  title?: string;
  description?: string;
  createTitle?: string;
  onCreateNew?: () => void;
  actionButton?: React.ReactNode;
  stats?: {
    label: string;
    value: string | number;
    icon?: React.ReactNode;
    trend?: 'up' | 'down' | 'neutral';
  }[];
  breadcrumbs?: React.ReactNode;
  headerAction?: React.ReactNode;
  showBackgroundPattern?: boolean;
}

export default function HRMSContentLayout(props: ContentLayoutProps) {
  const {
    children,
    title = '',
    iconTitle,
    description,
    createTitle,
    onCreateNew,
    actionButton,
    stats,
    breadcrumbs,
    headerAction,
    showBackgroundPattern = true,
    variant,
    padding,
  } = props;

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        duration: 0.5,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5,
        ease: "easeOut",
      },
    },
  };

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={containerVariants}
      className={cn(
        layoutVariants({ variant, padding }),
        // "relative overflow-x-hidden" // Changed from overflow-hidden to overflow-x-hidden
        "relative overflow-hidden"
      )}
    >
      {/* Background Pattern */}
      {showBackgroundPattern && (
        <div className="absolute inset-0 -z-10 opacity-5">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_1px_1px,oklch(var(--primary)/0.3)_1px,transparent_0)] bg-[length:24px_24px]"></div>
        </div>
      )}

      {/* Animated Background Elements */}
      <div className="absolute top-0 left-0 w-72 h-72 bg-blue-500/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl translate-x-1/2 translate-y-1/2"></div>

      <div className="relative z-10 max-w-full"> {/* Added max-w-full to prevent overflow */}
        {/* Breadcrumbs */}
        {breadcrumbs && (
          <motion.div variants={itemVariants} className="mb-6 max-w-full overflow-hidden">
            {breadcrumbs}
          </motion.div>
        )}

        <div className="w-full"> {/* Removed flex layout that was causing issues */}
          {/* Header Section */}
          {(title || stats) && (
            <motion.div
              variants={itemVariants}
              className="flex flex-col space-y-6 lg:space-y-0 lg:flex-row lg:items-start lg:justify-between py-6 lg:py-8 w-full overflow-hidden"
            >
              {/* Left Section - Title & Description */}
              <div className="flex-1 space-y-4 min-w-0"> {/* Added min-w-0 to prevent flex item overflow */}
                {title && (
                  <div className="space-y-3">
                    <div className="flex flex-col xs:flex-row xs:items-center gap-3">
                      <div className="flex items-center gap-3">
                        <div className="p-2 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl shadow-lg flex-shrink-0">
                          {iconTitle && iconTitle !== undefined ? iconTitle : (
                            <IconLayoutDashboard className="h-6 w-6 text-white" />
                          )}
                        </div>
                        <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold bg-gradient-to-r from-gray-800 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent break-words">
                          {title}
                        </h1>
                      </div>
                      {createTitle && (
                        <Badge
                          variant="secondary"
                          className="bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 px-3 py-1 text-sm hidden sm:flex items-center gap-1 flex-shrink-0"
                        >
                          <IconSparkles className="h-3 w-3" />
                          New
                        </Badge>
                      )}
                    </div>

                    {description && (
                      <p className="text-base sm:text-lg text-gray-600 dark:text-gray-400 leading-relaxed break-words">
                        {description}
                      </p>
                    )}
                  </div>
                )}

                {/* Stats Overview */}
                {stats && stats.length > 0 && (
                  <motion.div
                    variants={containerVariants}
                    className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 pt-4" // Reduced gap on mobile
                  >
                    {stats.map((stat, index) => (
                      <motion.div
                        key={stat.label}
                        variants={itemVariants}
                        custom={index}
                        className="bg-white/70 dark:bg-gray-800/70 backdrop-blur-sm rounded-xl sm:rounded-2xl p-3 sm:p-4 border border-gray-200/50 dark:border-gray-700/50 shadow-sm hover:shadow-md transition-all duration-300" // Removed hover:scale on mobile
                      >
                        <div className="flex items-center justify-between">
                          <div className="min-w-0 flex-1"> {/* Added min-w-0 and flex-1 */}
                            <p className="text-xs sm:text-sm font-medium text-gray-600 dark:text-gray-400 truncate">
                              {stat.label}
                            </p>
                            <p className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mt-1 truncate">
                              {stat.value}
                            </p>
                          </div>
                          {stat.icon && (
                            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-600 dark:text-blue-400 flex-shrink-0 ml-2">
                              {stat.icon}
                            </div>
                          )}
                        </div>
                        {stat.trend && (
                          <div className={`flex items-center gap-1 mt-2 text-xs ${
                            stat.trend === 'up' ? 'text-green-600' :
                              stat.trend === 'down' ? 'text-red-600' : 'text-gray-500'
                          }`}>
                            <IconArrowRight className={`h-3 w-3 ${
                              stat.trend === 'up' ? 'rotate-90' :
                                stat.trend === 'down' ? '-rotate-90' : ''
                            }`} />
                            {stat.trend === 'up' ? 'Increasing' :
                              stat.trend === 'down' ? 'Decreasing' : 'Stable'}
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </div>

              {/* Right Section - Actions */}
              <div className="flex flex-col sm:flex-row lg:flex-col gap-3 lg:items-end lg:space-y-3 flex-shrink-0 mt-4 lg:mt-0"> {/* Added flex-shrink-0 and margin top */}
                {/* Create Button */}
                {createTitle && onCreateNew && (
                  <motion.div variants={itemVariants} className="w-full sm:w-auto">
                    <Button
                      onClick={onCreateNew}
                      className="group relative bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-lg hover:shadow-xl transition-all duration-300 rounded-xl px-4 sm:px-6 py-3 font-semibold overflow-hidden w-full sm:w-auto" // Added responsive width
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
                      <IconPlus className="h-4 w-4 sm:h-5 sm:w-5 mr-2 group-hover:scale-110 transition-transform" />
                      <span className="truncate">{createTitle}</span>
                      <IconRocket className="h-3 w-3 sm:h-4 sm:w-4 ml-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all duration-300 flex-shrink-0" />
                    </Button>
                  </motion.div>
                )}

                {/* Additional Action Button */}
                {actionButton && (
                  <motion.div variants={itemVariants} className="w-full sm:w-auto">
                    {actionButton}
                  </motion.div>
                )}

                {/* Header Action */}
                {headerAction && (
                  <motion.div variants={itemVariants} className="w-full sm:w-auto">
                    {headerAction}
                  </motion.div>
                )}
              </div>
            </motion.div>
          )}

          {/* Content Section */}
          <motion.section
            variants={itemVariants}
            className="space-y-6 lg:space-y-8 w-full" // Reduced space on mobile
          >
            <AnimatePresence mode="wait">
              <motion.div
                key="content"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.3 }}
                className="space-y-4 lg:space-y-6 w-full" // Reduced space on mobile
              >
                {children}
              </motion.div>
            </AnimatePresence>
          </motion.section>
        </div>

        {/* Floating Action Button for Mobile */}
        {createTitle && onCreateNew && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.5, type: "spring" }}
            className="fixed bottom-6 right-6 z-50 lg:hidden"
          >
            <Button
              onClick={onCreateNew}
              size="icon"
              className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white shadow-2xl hover:shadow-3xl rounded-full transition-all duration-300 group"
            >
              <IconPlus className="h-5 w-5 sm:h-6 sm:w-6 group-hover:rotate-90 transition-transform duration-300" />
            </Button>
          </motion.div>
        )}
      </div>
    </motion.div>
  );
}
