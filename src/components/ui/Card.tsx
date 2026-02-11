import React from 'react';

interface CardProps {
  children: React.ReactNode;
  className?: string;
  padding?: 'none' | 'sm' | 'md' | 'lg';
  hover?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className = '',
  padding = 'md',
  hover = false,
}) => {
  const paddingStyles = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  return (
    <div
      className={`
        bg-card rounded-xl border border-border shadow-sm
        ${paddingStyles[padding]}
        ${hover ? 'hover:shadow-md hover:border-primary/20 transition-all duration-200' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  );
};

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  accentColor?: 'primary' | 'secondary' | 'success' | 'warning' | 'destructive' | 'accent';
  className?: string;
}

const accentColorMap: Record<string, { stripe: string; iconBg: string; iconText: string }> = {
  primary: { stripe: 'bg-primary', iconBg: 'bg-primary/5', iconText: 'text-primary' },
  secondary: { stripe: 'bg-secondary', iconBg: 'bg-secondary/5', iconText: 'text-secondary' },
  success: { stripe: 'bg-success', iconBg: 'bg-success/5', iconText: 'text-success' },
  warning: { stripe: 'bg-warning', iconBg: 'bg-warning/5', iconText: 'text-warning' },
  destructive: { stripe: 'bg-destructive', iconBg: 'bg-destructive/5', iconText: 'text-destructive' },
  accent: { stripe: 'bg-accent', iconBg: 'bg-accent/5', iconText: 'text-accent' },
};

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  subtitle,
  icon,
  trend,
  accentColor,
  className = '',
}) => {
  const colors = accentColor ? accentColorMap[accentColor] : null;

  return (
    <Card className={`overflow-hidden ${className}`} padding="none" hover>
      {colors && <div className={`h-1 ${colors.stripe}`} />}
      <div className={`${colors ? 'p-5' : 'p-6'}`}>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="mt-2 text-3xl font-bold text-foreground">{value}</p>
            {subtitle && (
              <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
            )}
            {trend && (
              <div className="mt-2 flex items-center gap-1">
                <span
                  className={`text-sm font-medium ${
                    trend.isPositive ? 'text-success' : 'text-destructive'
                  }`}
                >
                  {trend.isPositive ? '+' : ''}
                  {trend.value}%
                </span>
                <span className="text-xs text-muted-foreground">vs last month</span>
              </div>
            )}
          </div>
          {icon && (
            <div className={`flex-shrink-0 p-3 rounded-2xl ${colors ? colors.iconBg : 'bg-primary/5'} ${colors ? colors.iconText : 'text-primary'}`}>
              {icon}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

interface ContentCardProps {
  title: string;
  description?: string;
  children?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}

export const ContentCard: React.FC<ContentCardProps> = ({
  title,
  description,
  children,
  action,
  className = '',
}) => {
  return (
    <Card className={className}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-lg font-semibold text-foreground">{title}</h3>
          {description && (
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        {action && <div>{action}</div>}
      </div>
      {children}
    </Card>
  );
};

export default Card;
