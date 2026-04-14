import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  ArrowLeft,
  Package,
  CalendarDays,
  MapPin,
  ShoppingBag,
  Clock,
  Truck,
  CheckCircle,
  XCircle,
  EllipsisVertical
} from "lucide-react";
import Box from "@mui/material/Box";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import "./Orders.css";

const API_BASE = import.meta.env.VITE_API_URL || "https://martico-server.vercel.app/api";

const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
};

const getStatusIcon = (status) => {
  switch (status) {
    case "pending":
      return <Clock size={14} />;
    case "processing":
    case "confirmed":
      return <Package size={14} />;
    case "shipped":
      return <Truck size={14} />;
    case "delivered":
    case "completed":
      return <CheckCircle size={14} />;
    case "cancelled":
      return <XCircle size={14} />;
    default:
      return <Package size={14} />;
  }
};

const getStatusLabel = (status) => {
  const labels = {
    pending: "Pending",
    processing: "Processing",
    confirmed: "Confirmed",
    shipped: "Shipped",
    delivered: "Delivered",
    completed: "Completed",
    cancelled: "Cancelled"
  };
  return labels[status] || status;
};

const getItemDetails = (item) => {
  if (item.productId && typeof item.productId === 'object') {
    return {
      name: item.productId.name || "Product",
      image: item.productId.image || "https://via.placeholder.com/56",
    };
  }
  return {
    name: item.name || "Product",
    image: item.image || "https://via.placeholder.com/56",
  };
};

const getOrderStatus = (order) => {
  return order.fulfillmentStatus || order.status || "pending";
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [activeMenuOrder, setActiveMenuOrder] = useState(null);
  const [detailsOrder, setDetailsOrder] = useState(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");

      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/orders`, {
        headers: {
          "Content-Type": "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      });
      
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setOrders(json.data);
          return;
        }
      }
      
      setError("Failed to load orders");
      setOrders([]);
    } catch (err) {
      console.error("Error fetching orders:", err);
      setError("Failed to load orders");
      setOrders([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const stats = useMemo(() => {
    return {
      total: orders.length,
      pending: orders.filter(o => getOrderStatus(o) === "pending").length,
      processing: orders.filter(o => ["processing", "confirmed", "shipped"].includes(getOrderStatus(o))).length,
      completed: orders.filter(o => ["delivered", "completed"].includes(getOrderStatus(o))).length
    };
  }, [orders]);

  const filterTabs = ["All Orders", "Pending", "Processing", "Completed", "Cancelled"];
  
  const getFilteredOrders = () => {
    const status = getOrderStatus;
    switch (tabValue) {
      case 1:
        return orders.filter(o => status(o) === "pending");
      case 2:
        return orders.filter(o => ["processing", "confirmed", "shipped"].includes(status(o)));
      case 3:
        return orders.filter(o => ["delivered", "completed"].includes(status(o)));
      case 4:
        return orders.filter(o => status(o) === "cancelled");
      default:
        return orders;
    }
  };

  const filteredOrders = getFilteredOrders();

  const handleTabChange = (_, newValue) => {
    setTabValue(newValue);
  };

  const handleMenuOpen = (event, order) => {
    setMenuAnchorEl(event.currentTarget);
    setActiveMenuOrder(order);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
    setActiveMenuOrder(null);
  };

  const handleOpenOrderDetails = () => {
    if (!activeMenuOrder) return;
    setDetailsOrder(activeMenuOrder);
    handleMenuClose();
  };

  const handleCloseOrderDetails = () => {
    setDetailsOrder(null);
  };

  const handleDeleteOrder = () => {
    if (!activeMenuOrder) return;
    const deletingId = activeMenuOrder._id || activeMenuOrder.orderId;
    setOrders((prevOrders) =>
      prevOrders.filter((order) => (order._id || order.orderId) !== deletingId)
    );
    handleMenuClose();
  };

  return (
    <section className="ordersPage">
      <div className="ordersContainer">
        <div className="ordersTopActions">
          <Link to="/" className="ordersBackBtn">
            <ArrowLeft size={18} />
            Back to Home
          </Link>
        </div>

        <div className="ordersHero">
          <div className="ordersHeroContent">
            <p className="ordersTag">Your Shopping</p>
            <h2>My Orders</h2>
            <p>Track, manage, and view your order history</p>
          </div>
          <div className="ordersStats">
            <div className="ordersStat">
              <span>Total Orders</span>
              <strong>{stats.total}</strong>
            </div>
            <div className="ordersStat">
              <span>In Progress</span>
              <strong>{stats.processing}</strong>
            </div>
            <div className="ordersStat">
              <span>Completed</span>
              <strong>{stats.completed}</strong>
            </div>
          </div>
        </div>

        <div className="ordersSummary">
          <div className="summaryOrderCard">
            <div>
              <span>Pending Orders</span>
              <strong>{stats.pending}</strong>
            </div>
            <div className="summaryOrderIcon pending">
              <Clock size={22} />
            </div>
          </div>
          <div className="summaryOrderCard">
            <div>
              <span>Processing</span>
              <strong>{stats.processing}</strong>
            </div>
            <div className="summaryOrderIcon processing">
              <Package size={22} />
            </div>
          </div>
          <div className="summaryOrderCard">
            <div>
              <span>Completed</span>
              <strong>{stats.completed}</strong>
            </div>
            <div className="summaryOrderIcon completed">
              <CheckCircle size={22} />
            </div>
          </div>
        </div>

        <Box className="ordersFilterTabs">
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            aria-label="order status filters"
          >
            {filterTabs.map((label) => (
              <Tab key={label} label={label} />
            ))}
          </Tabs>
        </Box>

        {loading ? (
          <div className="ordersLoading">
            <div className="ordersLoadingSpinner"></div>
            <p>Loading your orders...</p>
          </div>
        ) : error ? (
          <div className="ordersEmpty">
            <div className="ordersEmptyIcon">
              <XCircle size={36} />
            </div>
            <h3>Error Loading Orders</h3>
            <p>{error}</p>
            <button className="ordersBrowseBtn" onClick={fetchOrders}>
              Retry
            </button>
          </div>
        ) : filteredOrders.length === 0 ? (
          <div className="ordersEmpty">
            <div className="ordersEmptyIcon">
              <Package size={36} />
            </div>
            <h3>No Orders Found</h3>
            <p>
              {tabValue === 0 
                ? "You haven't placed any orders yet." 
                : `No ${filterTabs[tabValue].toLowerCase()} orders at the moment.`}
            </p>
            <Link to="/" className="ordersBrowseBtn">
              Start Shopping
            </Link>
          </div>
        ) : (
          <div className="ordersBoard">
            <div className="ordersBoardHead">
              <span>Order ID</span>
              <span>Items</span>
              <span>Shipping</span>
              <span>Schedule</span>
              <span>Status</span>
              <span>Total</span>
              <span className="headActions" aria-hidden="true">
                <EllipsisVertical size={14} />
              </span>
            </div>

            <div className="ordersList">
              {filteredOrders.map((order) => {
                const orderId = order.orderNumber || order.orderId || order._id;
                const items = order.items || [];
                const previewItems = items.slice(0, 3);
                const remainingCount = items.length - previewItems.length;
                const firstItem = items[0] || {};
                const firstItemDetails = getItemDetails(firstItem);
                const shippingLocation = [order.shippingAddress?.city, order.shippingAddress?.country]
                  .filter(Boolean)
                  .join(", ");

                return (
                  <article className="orderRow" key={order._id || orderId}>
                    <div className="orderIdSection" data-label="Order ID">
                      <div className="orderRowId">{orderId}</div>
                      <div className="orderRowDate">
                        <CalendarDays size={12} />
                        {formatDate(order.createdAt)}
                      </div>
                    </div>

                    <div className="orderProductCell" data-label="Items">
                      <div className="orderItemsStack">
                        {previewItems.map((item, idx) => {
                          const itemDetails = getItemDetails(item);
                          return (
                            <img
                              key={idx}
                              src={itemDetails.image}
                              alt={itemDetails.name}
                              className="orderItemThumb"
                              title={itemDetails.name}
                            />
                          );
                        })}
                        {remainingCount > 0 && <div className="orderItemCount">+{remainingCount}</div>}
                      </div>
                      <div className="orderProductMeta">
                        <p>{firstItemDetails.name}</p>
                        <span>
                          <ShoppingBag size={13} />
                          {items.length} {items.length === 1 ? "item" : "items"}
                        </span>
                      </div>
                    </div>

                    <div className="orderRowShipping" data-label="Shipping">
                      <div className="orderShippingItem">
                        <MapPin size={14} />
                        {shippingLocation || "Address pending"}
                      </div>
                    </div>

                    <div className="orderScheduleCell" data-label="Schedule">
                      <span>Placed</span>
                      <strong>{formatDate(order.createdAt)}</strong>
                    </div>

                    <div className="orderRowStatus" data-label="Status">
                      <span className={`orderStatusBadge ${getOrderStatus(order)}`}>
                        {getStatusIcon(getOrderStatus(order))}
                        {getStatusLabel(getOrderStatus(order))}
                      </span>
                    </div>

                    <div className="orderRowTotal" data-label="Total">
                      <div className="orderTotalLabel">Amount</div>
                      <div className="orderTotalAmount">${Number(order.totalAmount).toFixed(2)}</div>
                    </div>

                    <div className="orderRowActions" data-label="Actions">
                      <button
                        type="button"
                        className="orderMenuTrigger"
                        aria-label={`Open order menu for ${orderId}`}
                        aria-haspopup="menu"
                        onClick={(event) => handleMenuOpen(event, order)}
                      >
                        <EllipsisVertical size={16} />
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        )}

        <Menu
          anchorEl={menuAnchorEl}
          open={Boolean(menuAnchorEl)}
          onClose={handleMenuClose}
          className="orderActionMenu"
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
        >
          <MenuItem component={Link} to="/" onClick={handleMenuClose}>
            Buy Again
          </MenuItem>
          <MenuItem onClick={handleOpenOrderDetails}>
            Product Details
          </MenuItem>
          <MenuItem onClick={handleDeleteOrder} className="deleteMenuItem">
            Delete
          </MenuItem>
        </Menu>

        <Dialog
          open={Boolean(detailsOrder)}
          onClose={handleCloseOrderDetails}
          className="orderDetailsDialog"
          fullWidth
          maxWidth="sm"
        >
          <DialogTitle>
            Order Details {detailsOrder ? `- ${detailsOrder.orderNumber || detailsOrder._id}` : ""}
          </DialogTitle>
          <DialogContent dividers>
            <div className="orderDetailsList">
              {(detailsOrder?.items || []).map((item, idx) => {
                const itemDetails = getItemDetails(item);
                const quantity = item.quantity || item.qty || 1;

                return (
                  <article className="orderDetailsItem" key={`${item.productId || idx}`}>
                    <img
                      src={itemDetails.image}
                      alt={itemDetails.name}
                      className="orderDetailsImage"
                    />
                    <div className="orderDetailsInfo">
                      <h4>{itemDetails.name}</h4>
                      <p>Quantity: {quantity}</p>
                      <p>Price: ${(item.price || 0).toFixed(2)}</p>
                    </div>
                  </article>
                );
              })}
              {(detailsOrder?.items || []).length === 0 && (
                <p className="orderDetailsEmpty">No items found for this order.</p>
              )}
            </div>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseOrderDetails} variant="contained">
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </div>
    </section>
  );
};

export default Orders;