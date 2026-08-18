export type UserRole = "customer" | "admin" | "delivery";
export type MealSlot = "breakfast" | "lunch" | "dinner";

export interface Profile {
  id: string;
  full_name: string | null;
  phone: string | null;
  role: UserRole;
  created_at: string;
  updated_at: string;
}

export interface MenuItem {
  id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface WeeklyMenuItem {
  id: string;
  day_of_week: number;
  meal_slot: MealSlot;
  menu_item_id: string;
  sort_order: number;
  created_at: string;
}

export interface DailyMenuItem {
  id: string;
  date: string;
  meal_slot: MealSlot;
  menu_item_id: string;
  is_available: boolean;
  sort_order: number;
  created_at: string;
}

export interface MealSlotConfig {
  meal_slot: MealSlot;
  label: string;
  cutoff_time: string;
  sort_order: number;
}

export interface KitchenSettings {
  id: number;
  kitchen_name: string;
  whatsapp_number: string | null;
  upi_id: string | null;
  upi_qr_url: string | null;
  updated_at: string;
}

export interface ResolvedMenuRow {
  meal_slot: MealSlot;
  menu_item_id: string;
  name: string;
  description: string | null;
  price: number;
  image_url: string | null;
  sort_order: number;
  source: "daily" | "weekly";
}

export const MEAL_SLOTS: MealSlot[] = ["breakfast", "lunch", "dinner"];

export const MEAL_SLOT_LABELS: Record<MealSlot, string> = {
  breakfast: "Breakfast",
  lunch: "Lunch",
  dinner: "Dinner",
};

export const DAY_LABELS = [
  "Sunday",
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
] as const;

export type OrderType = "one_off" | "subscription_cycle" | "subscription_delivery";
export type OrderStatus =
  | "awaiting_payment"
  | "payment_claimed"
  | "confirmed"
  | "done"
  | "closed"
  | "rejected";
export type PlanType = "weekly" | "monthly";
export type SubscriptionStatus =
  | "pending_payment"
  | "active"
  | "paused"
  | "cancelled";

export interface OrderItem {
  id: string;
  order_id: string;
  menu_item_id: string | null;
  meal_slot: MealSlot;
  name: string;
  quantity: number;
  unit_price: number;
}

export interface Order {
  id: string;
  order_number: number;
  customer_id: string | null;
  customer_name: string;
  customer_phone: string;
  order_type: OrderType;
  subscription_id: string | null;
  amount: number;
  status: OrderStatus;
  delivery_date: string;
  meal_slot: MealSlot | null;
  notes: string | null;
  claimed_at: string | null;
  confirmed_at: string | null;
  created_at: string;
  updated_at: string;
  order_items?: OrderItem[];
}

export interface Subscription {
  id: string;
  customer_id: string | null;
  customer_name: string;
  customer_phone: string;
  plan_type: PlanType;
  meal_slots: MealSlot[];
  current_cycle_start: string | null;
  current_cycle_end: string | null;
  status: SubscriptionStatus;
  created_at: string;
  updated_at: string;
}

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  awaiting_payment: "Awaiting payment",
  payment_claimed: "Pending verification",
  confirmed: "Confirmed",
  done: "Done",
  closed: "Closed",
  rejected: "Rejected",
};

export function displayOrderNumber(orderNumber: number): string {
  return `MA-${orderNumber}`;
}
