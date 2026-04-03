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

const ORDERS_API_BASE = "martico-server.vercel.app/api/orders";

// Mock orders for demo (will be replaced with API data)
const mockOrders = [
  {
    _id: "ord-001",
    orderId: "ORD-1042",
    createdAt: "2026-03-15T10:30:00Z",
    status: "delivered",
    totalAmount: 128.0,
    items: [
      { productId: { name: "Premium Wireless Headphones", image: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=200" } },
      { productId: { name: "USB-C Charging Cable", image: "https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=200" } }
    ],
    shippingAddress: { city: "New York", country: "USA" }
  },
  {
    _id: "ord-002",
    orderId: "ORD-1043",
    createdAt: "2026-03-10T14:20:00Z",
    status: "shipped",
    totalAmount: 79.99,
    items: [
      { productId: { name: "Smart Watch Pro", image: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=200" } }
    ],
    shippingAddress: { city: "Los Angeles", country: "USA" }
  },
  {
    _id: "ord-003",
    orderId: "ORD-1044",
    createdAt: "2026-03-08T09:15:00Z",
    status: "processing",
    totalAmount: 249.5,
    items: [
      { productId: { name: "Laptop Stand", image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=200" } },
      { productId: { name: "Wireless Mouse", image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=200" } },
      { productId: { name: "Keyboard Cover", image: "https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=200" } }
    ],
    shippingAddress: { city: "Chicago", country: "USA" }
  },
  {
    _id: "ord-004",
    orderId: "ORD-1045",
    createdAt: "2026-03-05T16:45:00Z",
    status: "pending",
    totalAmount: 59.99,
    items: [
      { productId: { name: "Phone Case Premium", image: "https://images.unsplash.com/photo-1601784551446-20c9e07cdbdb?w=200" } }
    ],
    shippingAddress: { city: "Miami", country: "USA" }
  },
  {
    _id: "ord-005",
    orderId: "ORD-1046",
    createdAt: "2026-02-28T11:00:00Z",
    status: "cancelled",
    totalAmount: 189.0,
    items: [
      { productId: { name: "Bluetooth Speaker", image: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=200" } }
    ],
    shippingAddress: { city: "Seattle", country: "USA" }
  }
];

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
    shipped: "Shipped",
    delivered: "Delivered",
    completed: "Completed",
    cancelled: "Cancelled"
  };
  return labels[status] || status;
};

const Orders = () => {
  const [orders, setOrders] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [menuAnchorEl, setMenuAnchorEl] = useState(null);
  const [activeMenuOrder, setActiveMenuOrder] = useState(null);
  const [detailsOrder, setDetailsOrder] = useState(null);

  const userId = localStorage.getItem("userId") || localStorage.getItem("guestUserId");

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError("");

      // Try to fetch from API
      const res = await fetch(`${ORDERS_API_BASE}/user/${userId}`);
      
      if (res.ok) {
        const json = await res.json();
        if (json.success && json.data) {
          setOrders(json.data);
          return;
        }
      }
      
      // Fallback to mock data for demo
      setOrders(mockOrders);
    } catch (err) {
      console.log("Using mock orders data");
      setOrders(mockOrders);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [userId]);

  const stats = useMemo(() => {
    return {
      total: orders.length,
      pending: orders.filter(o => o.status === "pending").length,
      processing: orders.filter(o => o.status === "processing" || o.status === "shipped").length,
      completed: orders.filter(o => o.status === "delivered" || o.status === "completed").length
    };
  }, [orders]);

  const filterTabs = ["All Orders", "Pending", "Processing", "Completed", "Cancelled"];
  
  const getFilteredOrders = () => {
    switch (tabValue) {
      case 1:
        return orders.filter(o => o.status === "pending");
      case 2:
        return orders.filter(o => ["processing", "shipped"].includes(o.status));
      case 3:
        return orders.filter(o => ["delivered", "completed"].includes(o.status));
      case 4:
        return orders.filter(o => o.status === "cancelled");
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
        {/* Top Actions */}
        <div className="ordersTopActions">
          <Link to="/" className="ordersBackBtn">
            <ArrowLeft size={18} />
            Back to Home
          </Link>
        </div>

        {/* Hero Section */}
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

        {/* Summary Cards */}
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

        {/* Filter Tabs */}
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

        {/* Orders List - Row Style */}
        {loading ? (
          <div className="ordersLoading">
            <div className="ordersLoadingSpinner"></div>
            <p>Loading your orders...</p>
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
                const orderId = order.orderId || order._id;
                const items = order.items || [];
                const previewItems = items.slice(0, 3);
                const remainingCount = items.length - previewItems.length;
                const firstItemName = items[0]?.productId?.name || "Order items";
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
                        {previewItems.map((item, idx) => (
                          <img
                            key={idx}
                            src={item.productId?.image || "https://via.placeholder.com/56"}
                            alt={item.productId?.name || "Product"}
                            className="orderItemThumb"
                            title={item.productId?.name}
                          />
                        ))}
                        {remainingCount > 0 && <div className="orderItemCount">+{remainingCount}</div>}
                      </div>
                      <div className="orderProductMeta">
                        <p>{firstItemName}</p>
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
                      <span className={`orderStatusBadge ${order.status}`}>
                        {getStatusIcon(order.status)}
                        {getStatusLabel(order.status)}
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
            product Details {detailsOrder ? `- ${detailsOrder.orderId || detailsOrder._id}` : ""}
          </DialogTitle>
          <DialogContent dividers>
            <div className="orderDetailsList">
              {(detailsOrder?.items || []).map((item, idx) => {
                const product = item.productId || {};
                const quantity = item.quantity || item.qty || 1;

                return (
                  <article className="orderDetailsItem" key={`${product._id || product.name || "item"}-${idx}`}>
                    <img
                      src={product.image || "https://via.placeholder.com/120"}
                      alt={product.name || "Product"}
                      className="orderDetailsImage"
                    />
                    <div className="orderDetailsInfo">
                      <h4>{product.name || "Unnamed Product"}</h4>
                      <p>Quantity: {quantity}</p>
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
