"use client";

import * as React from "react";
import { useActionState } from "react";
import { toast } from "sonner";
import { updateUser } from "@/lib/actions/admin";
import type { Profile } from "@/lib/types";
import { Dialog, DialogHeader, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

const initialState = { ok: false, message: "" };

export function UserEditDialog({
  user,
  open,
  onOpenChange,
}: {
  user: Profile | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [state, formAction, pending] = useActionState(updateUser, initialState);

  React.useEffect(() => {
    if (state.ok && state.message) {
      toast.success(state.message);
      onOpenChange(false);
    } else if (!state.ok && state.message) {
      toast.error(state.message);
    }
  }, [state, onOpenChange]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogHeader
        title="Edit user"
        description={user ? user.username : undefined}
      />
      <DialogContent>
        {user ? (
          <form action={formAction} className="space-y-4">
            <input type="hidden" name="id" value={user.id} />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="username">Username</Label>
                <Input id="username" name="username" defaultValue={user.username} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="fullname">Full name</Label>
                <Input
                  id="fullname"
                  name="fullname"
                  defaultValue={user.fullname ?? ""}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="level">Role</Label>
                <Select id="level" name="level" defaultValue={String(user.level)}>
                  <option value="2">Reseller</option>
                  <option value="1">Admin</option>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select id="status" name="status" defaultValue={String(user.status)}>
                  <option value="1">Active</option>
                  <option value="0">Disabled</option>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="saldo">Balance</Label>
                <Input
                  id="saldo"
                  name="saldo"
                  type="number"
                  min={0}
                  step="0.01"
                  defaultValue={user.saldo}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="uplink">Uplink (referrer)</Label>
                <Input id="uplink" name="uplink" defaultValue={user.uplink ?? ""} />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-1">
              <Button type="button" variant="ghost" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" loading={pending}>
                Save changes
              </Button>
            </div>
          </form>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}
