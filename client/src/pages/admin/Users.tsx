import { useState } from "react";
import { Search, ShieldCheck, ShieldOff, UserCog } from "lucide-react";
import { trpc } from "@/_core/trpc";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState, ErrorState, LoadingState, PageHeader } from "@/components/states";
import { useStore } from "@/lib/store";
import { formatNaira } from "@shared/markethub";

export default function AdminUsers() {
  const { toast } = useStore();
  const utils = trpc.useUtils();
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const query = trpc.admin.users.useQuery({ search: search || undefined, page });
  const roleM = trpc.admin.setUserRole.useMutation({
    onSuccess: async () => {
      toast("Role updated");
      await utils.admin.users.invalidate();
    },
    onError: (e) => toast(e.message, "error"),
  });
  const suspendM = trpc.admin.setUserSuspended.useMutation({
    onSuccess: async () => {
      toast("Account updated");
      await utils.admin.users.invalidate();
    },
    onError: (e) => toast(e.message, "error"),
  });

  return (
    <div className="space-y-5">
      <PageHeader title="Users" description="Customers and administrators. Promote a customer to admin, or suspend an account." />

      <div className="relative max-w-md">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          placeholder="Search by name or email…"
          className="pl-9"
        />
      </div>

      {query.isLoading ? (
        <LoadingState />
      ) : query.isError ? (
        <ErrorState message={query.error.message} onRetry={() => query.refetch()} />
      ) : (query.data?.items ?? []).length === 0 ? (
        <EmptyState title="No users found" description="No account matches that search." />
      ) : (
        <div className="rounded-2xl border bg-card shadow-sm">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Orders</TableHead>
                <TableHead>Spent</TableHead>
                <TableHead>Role</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {(query.data?.items ?? []).map((u) => (
                <TableRow key={u.id}>
                  <TableCell>
                    <span className="text-sm font-medium">{u.fullName ?? u.name ?? "—"}</span>
                    <p className="text-xs text-muted-foreground">{u.email}</p>
                    {u.phone ? <p className="text-xs text-muted-foreground">{u.phone}</p> : null}
                  </TableCell>
                  <TableCell className="text-sm">{u.orderCount}</TableCell>
                  <TableCell className="text-sm font-medium">{formatNaira(u.totalSpent)}</TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      <Badge variant={u.role === "admin" ? "default" : "muted"}>{u.role}</Badge>
                      {u.suspended ? <Badge variant="destructive">suspended</Badge> : null}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex justify-end gap-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => roleM.mutate({ id: u.id, role: u.role === "admin" ? "user" : "admin" })}
                      >
                        <UserCog className="h-4 w-4" /> {u.role === "admin" ? "Demote" : "Make admin"}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className={u.suspended ? "text-success" : "text-muted-foreground hover:text-destructive"}
                        onClick={() => suspendM.mutate({ id: u.id, suspended: !u.suspended })}
                      >
                        {u.suspended ? <ShieldCheck className="h-4 w-4" /> : <ShieldOff className="h-4 w-4" />}
                        {u.suspended ? "Restore" : "Suspend"}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {query.data && query.data.pageCount > 1 ? (
        <div className="flex items-center justify-center gap-2">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>Previous</Button>
          <span className="text-sm text-muted-foreground">Page {query.data.page} of {query.data.pageCount}</span>
          <Button variant="outline" size="sm" disabled={page >= query.data.pageCount} onClick={() => setPage((p) => p + 1)}>Next</Button>
        </div>
      ) : null}
    </div>
  );
}
