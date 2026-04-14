import { useEffect, useMemo, useState } from "react";
import "./CardSummary.css"

const CART_API_BASE = "https://martico-server.vercel.app/api/cart";

const getCartUserId = () => {
  return localStorage.getItem("userId") || localStorage.getItem("guestUserId");
};

const toPrice = (value) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
};

const formatCurrency = (value) => `$${toPrice(value).toFixed(2)}`;
const truncateWords = (text, wordLimit = 3) => {
  if (!text) return "";
  const words = text.split(/\s+/);
  if (words.length <= wordLimit) return text;
  return `${words.slice(0, wordLimit).join(" ")}...`;
};

const CardSummary = ({ onPay, paymentMethod,isProcessing,setCartItemsInParent }) => {
  const [cartItems, setCartItems] = useState([]);  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  

  const fetchCartItems = async () => {
    const userId = getCartUserId();
    if (!userId) {
      setCartItems([]);
      if (setCartItemsInParent) setCartItemsInParent([]);
      setLoading(false);
      setError("No items found in your cart.");
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

      const items = Array.isArray(json.data) ? json.data : [];
      
      setCartItems(items); 

      if (setCartItemsInParent) {
        setCartItemsInParent(items);
      }

    } catch (err) {
      setCartItems([]);
      if (setCartItemsInParent) setCartItemsInParent([]); 
      setError(err.message || "Failed to load cart items.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCartItems();
    const handleUpdate = () => fetchCartItems();
    window.addEventListener("cartUpdated", handleUpdate);
    return () => window.removeEventListener("cartUpdated", handleUpdate);
  }, []);

  const subtotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + toPrice(item.subtotal || (item.price * item.quantity)), 0),
    [cartItems]
  );

  const shipping = 0;
  const discount = 0;
  const total = subtotal + shipping - discount;

  const isCardPayment = paymentMethod === "card";

  return (
    <div className="orderCard">
      <h3 className="orderTitle">Order details</h3>

      <div className="productList">
        {loading && <p className="summaryHint">Loading items...</p>}
        {!loading && error && <p className="summaryHint">{error}</p>}
        {!loading && !error && cartItems.length === 0 && (
          <p className="summaryHint">No items found in your cart.</p>
        )}

        {!loading && cartItems.map((item) => {
          const itemId = item._id || item.productId || item.name;
          const itemQty = toPrice(item.quantity) || 1;
          const itemPrice = toPrice(item.price);
          const itemSubtotal = toPrice(item.subtotal || (itemPrice * itemQty));
          return (
            <div className="order-summary">
            {order.items.map((item, index) => (
            <div key={index} className="order-item-row" style={{ display: 'flex', marginBottom: '10px' }}>
            <img 
            src={item.image} 
            alt={item.name} 
            style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '8px' }} 
            />
            <div className="item-details" style={{ marginLeft: '15px' }}>
            <h5>{item.name}</h5>
            <p>Qty: {item.quantity} | Price: ${item.price}</p>
            </div>
            </div>
            ))}
            </div>
          );
        })}
      </div>

      <div className="summaryLine">
        <span>Subtotal</span>
        <span>{formatCurrency(subtotal)}</span>
      </div>

      <div className="summaryLine">
        <span>Shipping</span>
        <span>{formatCurrency(shipping)}</span>
      </div>

      <div className="summaryLine discount">
        <span>Discount</span>
        <span>{formatCurrency(discount)}</span>
      </div>

      <div className="summaryLine total">
        <span>Total</span>
        <span>{formatCurrency(total)}</span>
      </div>

     <button
      className={`payBtn ${isProcessing ? "loading" : ""}`} 
      type="button"
      onClick={onPay}
      disabled={!isCardPayment || isProcessing} 
    >
      {isProcessing ? "Processing..." : `Pay $${total.toFixed(2)}`}
    </button>
    </div>
  );
};

export default CardSummary;