import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaTimes } from "react-icons/fa";
import { AiTwotoneDelete } from "react-icons/ai";
import Pro from "../../../assets/images/pro.jpg";
import Button from "@mui/material/Button";
import "./CardDrawer.css";

const CART_API_BASE = "http://localhost:4000/api/cart";

const toPrice = (value) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
};

const formatCurrency = (value) => `$${toPrice(value).toFixed(2)}`;
const truncateWords = (text, wordLimit = 3) => {
  if (!text) return "";
  const words = String(text).trim().split(/\s+/);
  if (words.length <= wordLimit) return words.join(" ");
  return `${words.slice(0, wordLimit).join(" ")}...`;
};

const CartDrawer = ({ onClose, onDelete }) => {
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState("");

  const userId = localStorage.getItem("userId") || localStorage.getItem("guestUserId");

  const fetchCartItems = async () => {
    if (!userId) {
      setCartItems([]);
      setError("Please sign in to view your cart.");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError("");
      const res = await fetch(`${CART_API_BASE}/user/${userId}`);
      const json = await res.json();

      if (!res.ok || !json?.success) {
        throw new Error(json?.message || "Failed to load cart items.");
      }

      setCartItems(Array.isArray(json.data) ? json.data : []);
    } catch (err) {
      setCartItems([]);
      setError(err.message || "Failed to load cart items.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCartItems();
  }, []);

  const handleDelete = async (id) => {
  try {
    setDeletingId(id);
    const res = await fetch(`${CART_API_BASE}/delete/${id}`, {
      method: "DELETE"
    });
    const json = await res.json();

    if (!res.ok || !json?.success) {
      throw new Error(json?.message || "Failed to delete cart item.");
    }

    setCartItems((prev) => prev.filter((item) => item._id !== id));

    // Notify header to update cart count
    window.dispatchEvent(new Event("cartUpdated"));

    if (typeof onDelete === "function") {
      onDelete(id);
    }
  } catch (err) {
    setError(err.message || "Failed to delete cart item.");
  } finally {
    setDeletingId("");
  }
  };

  const total = useMemo(
    () => cartItems.reduce((sum, item) => sum + toPrice(item.subtotal || (item.price * item.quantity)), 0),
    [cartItems]
  );

  const handleCheckout = () => {
    if (!cartItems.length) return;
    if (typeof onClose === "function") onClose();
    navigate("/checkout");
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="cart-drawer p-4 d-flex flex-column" onClick={(e) => e.stopPropagation()}>
        <div className="d-flex justify-content-between align-items-center border-bottom pb-3 mb-4">
          <h5 className="fw-bold mb-0">Shopping Cart ({cartItems.length})</h5>
        </div>

        {error && <p className="text-danger small mb-3">{error}</p>}

        <div className="cart-items-list">
          {loading && <p className="text-muted small">Loading cart items...</p>}

          {!loading && cartItems.length === 0 && (
            <p className="text-muted small">No items found in your cart.</p>
          )}

          {!loading && cartItems.map((item) => {
            const itemId = item._id;
            const itemImage = item.image || Pro;
            const itemName = truncateWords(item.name || "Product");
            const itemPrice = toPrice(item.price);
            const itemQty = toPrice(item.quantity) || 1;
            const itemSubtotal = toPrice(item.subtotal || (itemPrice * itemQty));

            return (
              <div key={itemId} className="cart-item-card d-flex align-items-center gap-3 mb-3">
                <img
                  src={itemImage}
                  alt={itemName}
                  className="cart-img"
                />

                <div className="flex-grow-1">
                  <h6 className="fw-bold small mb-1 ml-2">{itemName}</h6>

                  <p className="text-muted small mb-0 ml-2">
                    Qty: {itemQty} x {formatCurrency(itemPrice)}
                  </p>
                </div>

                <strong className="price">{formatCurrency(itemSubtotal)}</strong>

                <Button
                  className="delete-cart-btn circle"
                  onClick={() => handleDelete(itemId)}
                  disabled={deletingId === itemId}
                >
                  <AiTwotoneDelete />
                </Button>
              </div>
            );
          })}
        </div>

        <div className="mt-auto border-top pt-4">
          <div className="d-flex justify-content-between fs-5 fw-bold mb-4">
            <span>Total</span>
            <span>{formatCurrency(total)}</span>
          </div>

          <Button
            className="btn-primary-1 w-100 py-3 mb-3"
            disabled={!cartItems.length}
            onClick={handleCheckout}
          >
            Check Out Now
          </Button>

          <Button
            className="btn-outline-secondary w-100 "
            onClick={onClose}
          >
            Back to Shop
          </Button>
        </div>
      </div>
    </div>
  );
};

export default CartDrawer;
