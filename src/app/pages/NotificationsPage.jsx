import React, { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { api } from "../api";
import { toast } from "sonner";

export function NotificationsPage({ userRole }) {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(Boolean(userRole));
  const [error, setError] = useState("");

  const markRead = async (item) => {
    try {
      await api.markNotificationRead(item.id);
      setItems((current) => current.map((notification) => notification.id === item.id ? { ...notification, isRead: true } : notification));
    } catch (requestError) {
      toast.error(requestError.message || "Could not update this notification.");
    }
  };

  useEffect(() => {
    let active = true;
    if (!userRole) { setItems([]); setLoading(false); return undefined; }
    
    const fetchNotifs = () => {
      setLoading(true);
      setError("");
      api.notifications()
        .then((notifications) => { if (active) setItems(notifications || []); })
        .catch((requestError) => { if (active) setError(requestError.message || "Could not load notifications."); })
        .finally(() => { if (active) setLoading(false); });
    };

    fetchNotifs();
    const handleSync = () => fetchNotifs();
    window.addEventListener("interndesk:sync", handleSync);
    window.addEventListener("storage", handleSync);
    return () => {
      active = false;
      window.removeEventListener("interndesk:sync", handleSync);
      window.removeEventListener("storage", handleSync);
    };
  }, [userRole]);

  return <main className="min-h-screen bg-secondary px-4 py-6"><div className="max-w-[1128px] mx-auto">
    <h1 className="text-xl font-bold text-foreground mb-4">Notifications</h1>
    {!userRole && <p className="mb-3 text-sm text-muted-foreground">Sign in to view your notifications.</p>}
    {error && <p role="alert" className="mb-3 text-sm text-red-600">{error}</p>}
    {loading ? <p className="py-8 text-center text-sm text-muted-foreground">Loading notifications…</p> : error || !userRole ? null : items.length === 0 ? <div className="bg-white border border-border rounded-xl p-8 text-center"><Bell className="w-8 h-8 mx-auto mb-3 text-muted-foreground" /><p className="text-sm text-muted-foreground">No notifications yet.</p></div> : <div className="bg-white border border-border rounded-xl p-4">{items.map((item) => <article key={item.id} className="p-3 border-b border-border last:border-0"><div className="flex items-center justify-between gap-3"><p className="text-sm font-medium text-foreground">{item.title}</p>{!item.isRead && <button type="button" onClick={() => markRead(item)} className="shrink-0 text-xs font-medium text-primary hover:underline">Mark read</button>}</div><p className="text-sm text-muted-foreground mt-1">{item.message}</p><time className="text-xs text-muted-foreground mt-1 block">{item.createdAt ? new Date(item.createdAt).toLocaleString() : ""}</time></article>)}</div>}
  </div></main>;
}
