"use client";

import { useState } from "react";
import { createMenuItem } from "@/actions/menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

export function CreateMenuItemForm() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const formData = new FormData(e.currentTarget);
    const result = await createMenuItem(formData);

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    e.currentTarget.reset();
    setLoading(false);
  }

  return (
    <Card>
      <CardHeader>
        <h2 className="font-semibold text-text-primary">Add menu item</h2>
        <p className="text-sm text-text-muted">
          Reusable items you can assign to weekly menus
        </p>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input label="Name" name="name" required placeholder="e.g. Dal rice" />
          <Textarea
            label="Description"
            name="description"
            placeholder="Optional short description"
          />
          <Input
            label="Price (₹)"
            name="price"
            type="number"
            min="0"
            step="1"
            required
            placeholder="80"
          />
          {error && <p className="text-sm text-error">{error}</p>}
          <Button type="submit" disabled={loading}>
            {loading ? "Adding…" : "Add item"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
