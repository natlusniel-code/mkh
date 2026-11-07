import { Link } from "wouter";
import { Bell, CheckCheck } from "lucide-react";
import { trpc } from "@/_core/trpc";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { EmptyState, ErrorState, LoadingState, PageHeader } from "@/components/states";
import { useStore } from "@/lib/store";
import { cn } from "@/lib/utils";

export default function AdminNotifications() {
  const { toast } = useStore();
  const utils = trpc.useUtils();
  const query = trpc.admin.notifications.useQuery();
  const markM = trpc.admin.markNotificationsRead.useMutation({
    onSuccess: async () => {
      toast("All marked as read");
      await Promise.all([utils.admin.notifications.invalidate(), utils.auth.session.invalidate()]);
    },
  });

  return (
    <div className="space-y-5">
      <PageHeader
        title="Notifications"
        description="Operational alerts — new orders and payment references waiting for review."
        action={
          <Button variant="outline" onClick={() => markM.mutate()} disabled={markM.isPending}>
            <CheckCheck className="h-4 w-4" /> Mark all read
          </Button>
        }
      />

      {query.isLoading ? (
        <LoadingState />
      ) : query.isError ? (
        <ErrorState message={query.error.message} onRetry={() => query.refetch()} />
      ) : (query.data ?? []).length === 0 ? (
        <EmptyState icon={<Bell className="h-6 w-6" />} title="No notifications" description="New orders and payment submissions will appear here." />
      ) : (
        <ul className="space-y-2">
          {(query.data ?? []).map((n) => (
            <li key={n.id} className={cn("flex items-start justify-between gap-3 rounded-2xl border bg-card p-4 shadow-sm", !n.read && "border-primary/40 bg-primary-soft/40")}>
              <div className="min-w-0">
                <p className="text-sm font-semibold">{n.title}</p>
                {n.body ? <p className="mt-0.5 text-sm text-muted-foreground">{n.body}</p> : null}
                <p className="mt-1 text-xs text-muted-foreground">{new Date(n.createdAt).toLocaleString("en-NG")}</p>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {!n.read ? <Badge variant="default">New</Badge> : null}
                {n.link ? <Button asChild size="sm" variant="outline"><Link to={n.link}>Open</Link></Button> : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
