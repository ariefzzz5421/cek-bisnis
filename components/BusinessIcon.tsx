import {
  Coffee,
  Dumbbell,
  Gamepad2,
  Scissors,
  Shirt,
  ShoppingBasket,
  Store,
} from "lucide-react";
import type { BusinessId } from "@/lib/business-data";

const iconMap = {
  laundry: Shirt,
  kelontong: ShoppingBasket,
  franchise: Store,
  game: Gamepad2,
  gym: Dumbbell,
  coffee: Coffee,
  barber: Scissors,
};

export function BusinessIcon({ id, size = 24 }: { id: BusinessId; size?: number }) {
  const Icon = iconMap[id];
  return <Icon size={size} strokeWidth={1.8} />;
}
