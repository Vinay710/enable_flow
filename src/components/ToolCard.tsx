import { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";

interface ToolCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  category: string;
  color: string;
  path: string;
}

const ToolCard = ({ title, description, icon: Icon, category, color, path }: ToolCardProps) => {
  return (
    <Link to={path} className="block">
      <div className="tool-card group h-full">
        <div className="flex items-start gap-4">
          <div 
            className="w-12 h-12 rounded-lg flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-110"
            style={{ backgroundColor: `hsl(var(--${color}) / 0.1)` }}
          >
            <Icon 
              className="h-6 w-6" 
              style={{ color: `hsl(var(--${color}))` }}
            />
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                {title}
              </h3>
            </div>
            
            <p className="text-muted-foreground text-sm line-clamp-2 mb-3">
              {description}
            </p>
            
            <span 
              className="category-badge text-xs"
              style={{ 
                backgroundColor: `hsl(var(--${color}) / 0.1)`,
                color: `hsl(var(--${color}))`
              }}
            >
              {category}
            </span>
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <span className="text-sm font-medium text-primary">
            Open tool →
          </span>
        </div>
      </div>
    </Link>
  );
};

export default ToolCard;
