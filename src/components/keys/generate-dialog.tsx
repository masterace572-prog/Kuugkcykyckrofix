"use client";

import * as React from "react";
import { useActionState } from "react";
import { toast } from "sonner";
import { generateKeys } from "@/lib/actions/keys";
import { GAMES, DURATIONS, keyCost } from "@/lib/config";
import { formatMoney } from "@/lib/utils";
import { Dialog, DialogHeader, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

const QUANTITIES = [1, 5, 10, 25, 50, 100];
const initialState = { ok: false, message: "" };

export function GenerateDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const [state, formAction, pending] = useActionState(generateKeys, initialState);

  const [game, setGame] = React.useState(Object.keys(GAMES)[0]);
  const [duration, setDuration] = React.useState(24);
  const [maxDevices, setMaxDevices] = React.useState(1);
  const [quantity, setQuantity] = React.useState(1);
  const [custom, setCustom] = React.useState(false);
  const [customLicense, setCustomLicense] = React.useState("");

  const perKey = keyCost(duration, maxDevices);
  const total = perKey * (custom ? 1 : quantity);

  React.useEffect(() => {
    if (!open) {
      setGame(Object.keys(GAMES)[0]);
      setDuration(24);
      setMaxDevices(1);
      setQuantity(1);
      setCustom(false);
      setCustomLicense("");
    }
  }, [open]);

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
        title="Generate keys"
        description="Create one or more license keys"
      />
      <DialogContent>
        <form action={formAction} className="space-y-4">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="game">Game</Label>
              <Select
                id="game"
                name="game"
                value={game}
                onChange={(e) => setGame(e.target.value)}
              >
                {Object.entries(GAMES).map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duration</Label>
              <Select
                id="duration"
                name="duration"
                value={duration}
                onChange={(e) => setDuration(Number(e.target.value))}
              >
                {DURATIONS.map((d) => (
                  <option key={d.hours} value={d.hours}>
                    {d.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="max_devices">Devices per key</Label>
              <Input
                id="max_devices"
                name="max_devices"
                type="number"
                min={1}
                max={50}
                value={maxDevices}
                onChange={(e) => setMaxDevices(Number(e.target.value))}
              />
            </div>
            {!custom ? (
              <div className="space-y-2">
                <Label htmlFor="quantity">Quantity</Label>
                <Select
                  id="quantity"
                  name="quantity"
                  value={quantity}
                  onChange={(e) => setQuantity(Number(e.target.value))}
                >
                  {QUANTITIES.map((q) => (
                    <option key={q} value={q}>
                      {q}
                    </option>
                  ))}
                </Select>
              </div>
            ) : null}
          </div>

          <label className="flex cursor-pointer items-center gap-2 text-sm">
            <input
              type="checkbox"
              name="custom"
              className="h-4 w-4 rounded border-input accent-[var(--primary)]"
              checked={custom}
              onChange={(e) => setCustom(e.target.checked)}
            />
            Use a custom key value
          </label>

          {custom ? (
            <div className="space-y-2">
              <Label htmlFor="custom_license">Custom key</Label>
              <Input
                id="custom_license"
                name="custom_license"
                placeholder="e.g. VIP12345"
                value={customLicense}
                onChange={(e) => setCustomLicense(e.target.value)}
              />
            </div>
          ) : null}

          <div className="flex items-center justify-between rounded-lg border border-border bg-muted/50 px-4 py-3 text-sm">
            <span className="text-muted-foreground">
              {custom ? "1 key" : `${quantity} key${quantity > 1 ? "s" : ""}`} ·{" "}
              {formatMoney(perKey)} each
            </span>
            <span className="font-semibold tabular-nums">{formatMoney(total)}</span>
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
              Generate
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
