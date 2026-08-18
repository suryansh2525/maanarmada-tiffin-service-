"use client";

import { useState } from "react";
import { toggleMenuItemActive, updateMenuItem } from "@/actions/menu";
import { formatPrice } from "@/lib/menu";
import type { MenuItem } from "@/types/database";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";

export function MenuItemRow({ item }: { item: MenuItem }) {
  const [editing, setEditing] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const result = await updateMenuItem(item.id, formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    setEditing(false);
    setLoading(false);
  }

  async function handleToggle() {
    setLoading(true);
    await toggleMenuItemActive(item.id, !item.is_active);
    setLoading(false);
  }

  if (editing) {
    return (
      <Card>
        <CardContent className="py-4">
          <form onSubmit={handleUpdate} className="space-y-3">
            <Input label="Name" name="name" defaultValue={item.name} required />
            <Textarea
              label="Description"
              name="description"
              defaultValue={item.description ?? ""}
            />
            <Input
              label="Price (₹)"
              name="price"
              type="number"
              min="0"
              step="1"
              defaultValue={item.price}
              required
            />
            <label className="flex items-center gap-2 text-sm text-text-secondary">
              <input
                type="checkbox"
                name="is_active"
                defaultChecked={item.is_active}
                className="rounded border-border"
              />
              Active on menu
            </label>
            {error && <p className="text-sm text-error">{error}</p>}
            <div className="flex gap-2">
              <Button type="submit" size="sm" disabled={loading}>
                Save
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => setEditing(false)}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-4 py-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="font-medium text-text-primary">{item.name}</h3>
            <Badge variant={item.is_active ? "success" : "muted"}>
              {item.is_active ? "Active" : "Inactive"}
            </Badge>
          </div>
          {item.description && (
            <p className="mt-1 text-sm text-text-secondary">{item.description}</p>
          )}
        </div>
        <div className="flex shrink-0 flex-col items-end gap-2">
          <span className="font-semibold text-brand">{formatPrice(item.price)}</span>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setEditing(true)}
              disabled={loading}
            >
              Edit
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={handleToggle}
              disabled={loading}
            >
              {item.is_active ? "Deactivate" : "Activate"}
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
