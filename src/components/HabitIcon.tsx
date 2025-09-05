import { 
  Star, 
  Droplets, 
  Pill, 
  Heart, 
  Moon, 
  Smartphone, 
  BookOpen,
  Trophy,
  Target,
  Activity,
  Coffee,
  Apple,
  Dumbbell,
  Zap,
  Brain,
  Leaf,
  Sun,
  Clock,
  CheckCircle
} from "lucide-react";

interface HabitIconProps {
  iconName: string;
  className?: string;
}

const iconMap = {
  star: Star,
  droplets: Droplets,
  pill: Pill,
  heart: Heart,
  moon: Moon,
  smartphone: Smartphone,
  'book-open': BookOpen,
  trophy: Trophy,
  target: Target,
  activity: Activity,
  coffee: Coffee,
  apple: Apple,
  dumbbell: Dumbbell,
  zap: Zap,
  brain: Brain,
  leaf: Leaf,
  sun: Sun,
  clock: Clock,
  'check-circle': CheckCircle,
};

export function HabitIcon({ iconName, className = "h-4 w-4" }: HabitIconProps) {
  const IconComponent = iconMap[iconName as keyof typeof iconMap] || Star;
  
  return <IconComponent className={className} />;
}