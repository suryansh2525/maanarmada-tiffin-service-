import { getAllMenuItems } from "@/lib/menu-queries";
import { CreateMenuItemForm } from "./create-form";
import { MenuItemRow } from "./menu-item-row";

export default async function MenuItemsPage() {
  const items = await getAllMenuItems();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold text-text-primary">Menu items</h1>
        <p className="mt-1 text-text-secondary">
          Your catalogue — assign items to the weekly menu per day and meal slot.
        </p>
      </div>

      <CreateMenuItemForm />

      <div className="space-y-3">
        <h2 className="text-lg font-semibold text-text-primary">
          All items ({items.length})
        </h2>
        {items.length === 0 ? (
          <p className="text-text-secondary">No items yet. Add your first dish above.</p>
        ) : (
          <div className="grid gap-3">
            {items.map((item) => (
              <MenuItemRow key={item.id} item={item} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
