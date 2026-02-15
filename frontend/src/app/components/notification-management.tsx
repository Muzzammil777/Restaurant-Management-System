import { useState, useEffect, useMemo } from "react";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/app/components/ui/card";
import { Badge } from "@/app/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/app/components/ui/table";
import { notificationsApi, billingApi, ordersApi } from "@/utils/api";
import { toast } from "sonner";

interface Notification {
  _id: string;
  type: string;
  title: string;
  message: string;
  recipient: string;
  channel: string;
  status: string;
  created_at: string;
  orderId?: string;
  paymentId?: string;
  expiresAt?: string;
}

export function NotificationManagement() {
  const navigateToTab = (tab: string) => {
    window.dispatchEvent(new CustomEvent("rms:navigate-tab", { detail: tab }));
  };

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [markingAsRead, setMarkingAsRead] = useState(false);

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleRetryPayment = async (paymentId?: string, expiresAt?: string) => {
    if (!paymentId) {
      toast.error("Payment ID not found");
      return;
    }

    // Check if the retry window has expired
    if (expiresAt) {
      const expiresAtDate = new Date(expiresAt);
      const now = new Date();
      if (now > expiresAtDate) {
        toast.error("Payment retry window has expired. Order was cancelled.");
        fetchNotifications();
        return;
      }
    }

    try {
      await billingApi.retryPayment(paymentId);
      toast.success("Payment retry initiated successfully");
      fetchNotifications();
    } catch (error: any) {
      toast.error(error.message || "Failed to retry payment");
    }
  };

  const fetchNotifications = async () => {
    try {
      const result = await notificationsApi.list();
      // Ensure we always set an array
      const data = result.data || [];
      setNotifications(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error fetching notifications:", error);
      toast.error("Failed to load notifications");
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  };

  // SORT LATEST FIRST
  const sortedNotifications = useMemo(() => {
    if (!Array.isArray(notifications)) return [];
    return [...notifications].sort(
      (a, b) =>
        new Date(b.created_at).getTime() -
        new Date(a.created_at).getTime()
    );
  }, [notifications]);

  // APPLY FILTERS
  const filteredNotifications = useMemo(() => {
    return sortedNotifications.filter((n) => {
      const matchesType =
        typeFilter === "all" || n.type === typeFilter;

      const matchesStatus =
        statusFilter === "all" || n.status === statusFilter;

      const matchesDate =
        dateFilter === "all" ||
        (dateFilter === "today" &&
          new Date(n.created_at).toDateString() ===
            new Date().toDateString()) ||
        (dateFilter === "last7" &&
          new Date(n.created_at).getTime() >
            Date.now() - 7 * 24 * 60 * 60 * 1000);

      return matchesType && matchesStatus && matchesDate;
    });
  }, [sortedNotifications, typeFilter, statusFilter, dateFilter]);

  // SUMMARY
  const totalCount = notifications.length;
  const unreadCount = notifications.filter(
    (n) => n.status === "unread"
  ).length;
  const readCount = notifications.filter(
    (n) => n.status === "read"
  ).length;

  if (loading) {
    return <div className="p-6">Loading notifications...</div>;
  }

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-semibold">Notifications</h2>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-3 gap-6">
        <Card 
          className="h-32 shadow-md cursor-pointer hover:shadow-lg transition-shadow" 
          onClick={() => setStatusFilter("all")}
        >
          <CardContent className="p-6 flex flex-col justify-center">
            <p className="text-lg text-gray-500">Total</p>
            <p className="text-4xl font-bold">{totalCount}</p>
          </CardContent>
        </Card>

        <Card 
          className="h-32 shadow-md cursor-pointer hover:shadow-lg transition-shadow" 
          onClick={() => setStatusFilter("unread")}
        >
          <CardContent className="p-6 flex flex-col justify-center">
            <p className="text-lg text-gray-500">Unread</p>
            <p className="text-4xl font-bold text-orange-600">
              {unreadCount}
            </p>
          </CardContent>
        </Card>

        <Card 
          className="h-32 shadow-md cursor-pointer hover:shadow-lg transition-shadow" 
          onClick={() => setStatusFilter("read")}
        >
          <CardContent className="p-6 flex flex-col justify-center">
            <p className="text-lg text-gray-500">Read</p>
            <p className="text-4xl font-bold text-green-600">
              {readCount}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* FILTER BAR */}
      <Card>
        <CardContent className="p-4 flex gap-4">
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="border rounded px-2 py-1"
          >
            <option value="all">All Types</option>
            <option value="order">Order</option>
            <option value="order-cancelled">Order Cancelled</option>
            <option value="payment-failed">Payment Failed</option>
            <option value="payment">Payment</option>
            <option value="stock">Stock</option>
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border rounded px-2 py-1"
          >
            <option value="all">All Status</option>
            <option value="read">Read</option>
            <option value="unread">Unread</option>
          </select>

          <select
            value={dateFilter}
            onChange={(e) => setDateFilter(e.target.value)}
            className="border rounded px-2 py-1"
          >
            <option value="all">All Dates</option>
            <option value="today">Today</option>
            <option value="last7">Last 7 Days</option>
          </select>
        </CardContent>
      </Card>

      {/* MARK ALL BUTTON */}
      <div className="flex justify-end">
        <button
          onClick={async () => {
            try {
              setMarkingAsRead(true);
              await notificationsApi.markAllRead();
              toast.success("All notifications marked as read");
              // Refetch to get updated data from server
              await fetchNotifications();
            } catch (error) {
              console.error("Failed to mark all as read:", error);
              toast.error("Failed to mark notifications as read");
            } finally {
              setMarkingAsRead(false);
            }
          }}
          disabled={markingAsRead || unreadCount === 0}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {markingAsRead ? "Marking..." : "Mark All As Read"}
        </button>
      </div>

      {/* TABLE */}
      <Card>
        <CardHeader>
          <CardTitle>Notification History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Type</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredNotifications.map((n) => (
                <TableRow
                  key={n._id}
                  className="hover:bg-gray-50"
                >
                  <TableCell>{n.type}</TableCell>
                  <TableCell>{n.title}</TableCell>
                  <TableCell>{n.message}</TableCell>

                  <TableCell>
                    <Badge
                      className={
                        n.status === "unread"
                          ? "bg-orange-500 text-white"
                          : "bg-green-600 text-white"
                      }
                    >
                      {n.status}
                    </Badge>
                  </TableCell>

                  <TableCell>
                    {new Date(n.created_at).toLocaleString()}
                  </TableCell>

                  <TableCell>
                    <div className="flex gap-2 items-center">
                      {n.status === "unread" && (
                        <button
                          onClick={async () => {
                            try {
                              await notificationsApi.markAsRead(n._id);
                              toast.success("Marked as read");
                              await fetchNotifications();
                            } catch (error) {
                              console.error("Failed to mark as read:", error);
                              toast.error("Failed to mark as read");
                            }
                          }}
                          className="text-xs px-2 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                        >
                          Mark Read
                        </button>
                      )}
                      
                      {n.type === "order" && (
                        <button
                          className="text-blue-600 hover:underline text-sm"
                          onClick={() => navigateToTab("orders")}
                        >
                          View Order
                        </button>
                      )}

                      {n.type === "order-cancelled" && (
                        <button
                          className="text-red-600 hover:underline text-sm"
                          onClick={() => navigateToTab("orders")}
                        >
                          View Orders
                        </button>
                      )}

                      {(n.type === "payment" || n.type === "payment-failed") && (
                        <>
                          {n.expiresAt && new Date() > new Date(n.expiresAt) ? (
                            <span className="text-red-500 text-sm font-medium">
                              Order Cancelled (Expired)
                            </span>
                          ) : (
                            <button
                              className="text-blue-600 hover:underline text-sm"
                              onClick={() => handleRetryPayment(n.paymentId, n.expiresAt)}
                            >
                              Retry Payment
                            </button>
                          )}
                        </>
                      )}

                      {n.type === "stock" && (
                        <button
                          className="text-green-600 hover:underline text-sm"
                          onClick={() => navigateToTab("inventory")}
                        >
                          Open Inventory
                        </button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}