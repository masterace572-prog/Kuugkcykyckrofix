"use client";

import * as React from "react";
import { Download, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  deleteAllKeys,
  deleteExpiredKeys,
  deleteKey,
  deleteUnusedKeys,
} from "@/lib/actions/keys";
import { getDurationOption, getGameLabel } from "@/lib/config";
import { formatDate } from "@/lib/utils";
import type { LicenseKey } from "@/lib/types";
import { countDevices } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { GenerateDialog } from "@/components/keys/generate-dialog";
import { EditDialog } from "@/components/keys/edit-dialog";

type StatusFilter = "all" | "active" | "inactive" | "expired" | "unused";
type Sort = "newest" | "oldest" | "key-asc";

const PAGE_SIZE = 10;

function statusOf(k: LicenseKey): { label: string; tone: "success" | "danger" | "warning" | "neutral" } {
  if (k.status === 0) return { label: "Inactive", tone: "neutral" };
  if (!k.expired_date) return { label: "Unused", tone: "warning" };
  if (new Date(k.expired_date).getTime() < Date.now()) {
    return { label: "Expired", tone: "danger" };
  }
  return { label: "Active", tone: "success" };
}

export function KeysClient({
  keys,
  isAdmin,
}: {
  keys: LicenseKey[];
  isAdmin: boolean;
}) {
  const [search, setSearch] = React.useState("");
  const [status, setStatus] = React.useState<StatusFilter>("all");
  const [sort, setSort] = React.useState<Sort>("newest");
  const [page, setPage] = React.useState(1);
  const [generateOpen, setGenerateOpen] = React.useState(false);
  const [editTarget, setEditTarget] = React.useState<LicenseKey | null>(null);
  const [busy, setBusy] = React.useState<string | null>(null);

  const filtered = React.useMemo(() => {
    let list = keys;
    if (search.trim()) {
      const q = search.trim().toLowerCase();
      list = list.filter(
        (k) =>
          k.user_key.toLowerCase().includes(q) ||
          k.registrator?.toLowerCase().includes(q)
      );
    }
    list = list.filter((k) => {
      const s = statusOf(k);
      switch (status) {
        case "active":
          return s.label === "Active";
        case "inactive":
          return s.label === "Inactive";
        case "expired":
          return s.label === "Expired";
        case "unused":
          return s.label === "Unused";
        default:
          return true;
      }
    });
    list = [...list].sort((a, b) => {
      if (sort === "newest") return (b.created_at ?? "").localeCompare(a.created_at ?? "");
      if (sort === "oldest") return (a.created_at ?? "").localeCompare(b.created_at ?? "");
      return a.user_key.localeCompare(b.user_key);
    });
    return list;
  }, [keys, search, status, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const pageItems = filtered.slice((safePage - 1) * PAGE_SIZE, safePage * PAGE_SIZE);

  async function runAction(key: string, fn: () => Promise<{ ok: boolean; message: string }>) {
    setBusy(key);
    try {
      const res = await fn();
      if (res.ok) toast.success(res.message);
      else toast.error(res.message);
    } catch {
      toast.error("Something went wrong.");
    } finally {
      setBusy(null);
    }
  }

  function downloadKeys() {
    const content = filtered.map((k) => k.user_key).join("\n");
    const blob = new Blob([content + "\n"], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "keys.txt";
    a.click();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Keys</h1>
          <p className="text-sm text-muted-foreground">
            {filtered.length} key{filtered.length === 1 ? "" : "s"}
            {isAdmin ? " in total" : " assigned to you"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={downloadKeys} disabled={filtered.length === 0}>
            <Download className="h-4 w-4" />
            Download
          </Button>
          <Button onClick={() => setGenerateOpen(true)}>
            <Plus className="h-4 w-4" />
            Generate key
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search keys or registrator…"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-9"
          />
        </div>
        <Select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as StatusFilter);
            setPage(1);
          }}
          className="sm:w-44"
        >
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="unused">Unused</option>
          <option value="expired">Expired</option>
          <option value="inactive">Inactive</option>
        </Select>
        <Select
          value={sort}
          onChange={(e) => setSort(e.target.value as Sort)}
          className="sm:w-44"
        >
          <option value="newest">Newest first</option>
          <option value="oldest">Oldest first</option>
          <option value="key-asc">Key A–Z</option>
        </Select>
      </div>

      {keys.length > 0 ? (
        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="text-muted-foreground">Bulk actions:</span>
          <button
            className="text-destructive hover:underline disabled:opacity-50"
            disabled={busy !== null}
            onClick={() => {
              if (confirm("Delete all unused (never activated) keys?"))
                runAction("unused", deleteUnusedKeys);
            }}
          >
            Delete unused
          </button>
          <span className="text-muted-foreground">·</span>
          <button
            className="text-destructive hover:underline disabled:opacity-50"
            disabled={busy !== null}
            onClick={() => {
              if (confirm("Delete all expired keys?")) runAction("expired", deleteExpiredKeys);
            }}
          >
            Delete expired
          </button>
          <span className="text-muted-foreground">·</span>
          <button
            className="text-destructive hover:underline disabled:opacity-50"
            disabled={busy !== null}
            onClick={() => {
              if (confirm("Delete ALL keys? This cannot be undone."))
                runAction("all", deleteAllKeys);
            }}
          >
            Delete all
          </button>
        </div>
      ) : null}

      <div className="rounded-xl border border-border bg-card shadow-sm">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Key</TableHead>
              <TableHead>Game</TableHead>
              <TableHead>Duration</TableHead>
              <TableHead>Devices</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Expiry</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {pageItems.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-32 text-center text-muted-foreground">
                  No keys found.
                </TableCell>
              </TableRow>
            ) : (
              pageItems.map((k) => {
                const s = statusOf(k);
                const devices = countDevices(k.devices);
                return (
                  <TableRow key={k.id}>
                    <TableCell className="font-mono text-sm">{k.user_key}</TableCell>
                    <TableCell>{getGameLabel(k.game)}</TableCell>
                    <TableCell>
                      {getDurationOption(k.duration)?.label ?? `${k.duration}h`}
                    </TableCell>
                    <TableCell className="tabular-nums">
                      {devices.used}/{k.max_devices}
                    </TableCell>
                    <TableCell>
                      <Badge variant={s.tone}>{s.label}</Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {formatDate(k.expired_date)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="inline-flex items-center gap-1">
                        <button
                          onClick={() => setEditTarget(k)}
                          className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                          aria-label="Edit key"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`Delete key "${k.user_key}"?`))
                              runAction(`del-${k.id}`, () => deleteKey(k.id));
                          }}
                          className="rounded-md p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-destructive"
                          aria-label="Delete key"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      {filtered.length > PAGE_SIZE ? (
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            Showing {(safePage - 1) * PAGE_SIZE + 1}–
            {Math.min(safePage * PAGE_SIZE, filtered.length)} of {filtered.length}
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={safePage <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <span className="tabular-nums text-muted-foreground">
              {safePage} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              disabled={safePage >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      ) : null}

      <GenerateDialog open={generateOpen} onOpenChange={setGenerateOpen} />
      <EditDialog
        keyData={editTarget}
        open={editTarget !== null}
        onOpenChange={(o) => {
          if (!o) setEditTarget(null);
        }}
      />
    </div>
  );
}
