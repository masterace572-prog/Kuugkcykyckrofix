"use client";

import * as React from "react";
import { useActionState } from "react";
import { toast } from "sonner";
import { updateServerSettings } from "@/lib/actions/settings";
import type { AppSettings } from "@/lib/settings";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const initialState = { ok: false, message: "" };

export function ServerSettingsForm({ settings }: { settings: AppSettings }) {
  const [state, formAction, pending] = useActionState(updateServerSettings, initialState);

  React.useEffect(() => {
    if (state.ok && state.message) toast.success(state.message);
    else if (!state.ok && state.message) toast.error(state.message);
  }, [state]);

  return (
    <form action={formAction} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Mod identity</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="modname">Mod name</Label>
            <Input id="modname" name="modname" defaultValue={settings.modname} />
          </div>
          <div className="space-y-2">
            <Label htmlFor="telegram">Telegram</Label>
            <Input id="telegram" name="telegram" defaultValue={settings.telegram} />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Floating text</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="floating_text">Floating text</Label>
            <Input
              id="floating_text"
              name="floating_text"
              defaultValue={settings.floating_text}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="floating_status">Floating status</Label>
            <Input
              id="floating_status"
              name="floating_status"
              defaultValue={settings.floating_status}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="flex items-center justify-between p-5">
          <div>
            <p className="text-sm font-medium">Maintenance mode</p>
            <p className="text-sm text-muted-foreground">
              When enabled, the connect endpoint rejects all activations.
            </p>
          </div>
          <label className="relative inline-flex cursor-pointer items-center">
            <input
              type="checkbox"
              name="maintenance"
              defaultChecked={settings.maintenance}
              className="peer sr-only"
            />
            <div className="h-6 w-11 rounded-full bg-muted transition-colors peer-checked:bg-primary after:absolute after:left-0.5 after:top-0.5 after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-transform peer-checked:after:translate-x-5" />
          </label>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button type="submit" loading={pending}>
          Save settings
        </Button>
      </div>
    </form>
  );
}
