import { LucideIcon, ArrowRight } from "lucide-react";

interface CategoryCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  toolCount: number;
  color: string;
  onClick: () => void;
}

const CategoryCard = ({ title, description, icon: Icon, toolCount, color, onClick }: CategoryCardProps) => {
  return (
    <div 
      onClick={onClick}
      className="tool-card cursor-pointer group"
    >
      <div 
        className="w-14 h-14 rounded-xl flex items-center justify-center mb-4 transition-transform duration-300 group-hover:scale-110"
        style={{ backgroundColor: `hsl(var(--${color}) / 0.1)` }}
      >
        <Icon 
          className="h-7 w-7 transition-colors duration-300" 
          style={{ color: `hsl(var(--${color}))` }}
        />
      </div>
      
      <h3 className="text-xl font-semibold mb-2 text-foreground group-hover:text-primary transition-colors">
        {title}
      </h3>
      
      <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
        {description}
      </p>
      
      <div className="flex items-center justify-between">
        <span 
          className="category-badge"
          style={{ 
            backgroundColor: `hsl(var(--${color}) / 0.1)`,
            color: `hsl(var(--${color}))`
          }}
        >
          {toolCount} tools →
        </span>
        <ArrowRight className="h-4 w-4 text-primary opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
    </div>
  );
};

export default CategoryCard;
