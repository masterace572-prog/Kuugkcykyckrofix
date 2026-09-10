"use client";

import * as React from "react";
import { useActionState } from "react";
import { toast } from "sonner";
import { editKey } from "@/lib/actions/keys";
import { GAMES, DURATIONS } from "@/lib/config";
import type { LicenseKey } from "@/lib/types";
import { Dialog, DialogHeader, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

const initialState = { ok: false, message: "" };

function toLocalInput(value: string | null): string {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(
    d.getHours()
  )}:${pad(d.getMinutes())}`;
}

export function EditDialog({
  keyData,
  open,
  onOpenChange,
}: {
  keyData: LicenseKey | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [state, formAction, pending] = useActionState(editKey, initialState);

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
        title="Edit key"
        description={keyData ? keyData.user_key : undefined}
      />
      <DialogContent>
        {keyData ? (
          <form action={formAction} className="space-y-4">
            <input type="hidden" name="id" value={keyData.id} />

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="game">Game</Label>
                <Select id="game" name="game" defaultValue={keyData.game}>
                  {Object.entries(GAMES).map(([key, label]) => (
                    <option key={key} value={key}>
                      {label}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="user_key">Key value</Label>
                <Input
                  id="user_key"
                  name="user_key"
                  defaultValue={keyData.user_key}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="duration">Duration</Label>
                <Select
                  id="duration"
                  name="duration"
                  defaultValue={keyData.duration}
                >
                  {DURATIONS.map((d) => (
                    <option key={d.hours} value={d.hours}>
                      {d.label}
                    </option>
                  ))}
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="max_devices">Max devices</Label>
                <Input
                  id="max_devices"
                  name="max_devices"
                  type="number"
                  min={1}
                  defaultValue={keyData.max_devices}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="status">Status</Label>
                <Select id="status" name="status" defaultValue={String(keyData.status)}>
                  <option value="1">Active</option>
                  <option value="0">Inactive</option>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="expired_date">Expiry date</Label>
                <Input
                  id="expired_date"
                  name="expired_date"
                  type="datetime-local"
                  defaultValue={toLocalInput(keyData.expired_date)}
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-1">
              <Button
                type="button"
                variant="ghost"
                onClick={() => onOpenChange(false)}
              >
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
