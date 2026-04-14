import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import image from "../../assets/images/success.svg"
import "./success.css";

const API_BASE = import.meta.env.VITE_API_URL || "https://martico-server.vercel.app/api";

const Success = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const navigate = useNavigate();
  const [orderNumber, setOrderNumber] = useState("");
  const [isConfirming, setIsConfirming] = useState(false);
  const [confirmError, setConfirmError] = useState("");

  useEffect(() => {
    const clearCartAndConfirm = async () => {
      const userId = localStorage.getItem("userId") || localStorage.getItem("guestUserId");

      try {
        setIsConfirming(true);
        setConfirmError("");
        const res = await fetch(`${API_BASE}/payment/confirm`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId, userId })
        });
        const data = await res.json();
        if (res.ok && data?.success) {
          window.dispatchEvent(new Event("cartUpdated"));
          toast.success("Order placed successfully!");
          setOrderNumber(data?.order?.orderNumber || "");
        } else {
          const message = data?.message || "Order confirmation failed.";
          setConfirmError(message);
          toast.error(message);
        }
      } catch (err) {
        console.error("Error confirming order:", err);
        setConfirmError("Order confirmation failed.");
        toast.error("Order confirmation failed.");
      } finally {
        setIsConfirming(false);
      }
    };

    if (sessionId) clearCartAndConfirm();
  }, [sessionId]);

  return (
    <div className="successpage">
      <div style={{ textAlign: "center", padding: "20px"}}>     
        <div>
           <img src={image} alt="Success"  style={{ height: "580px" }}/>
           <h1 className="ml-4">Payment Successful!</h1>
        </div>
        <p>Your order has been placed. Check your email for details.</p>
        {isConfirming && <p>Saving your order...</p>}
        {confirmError && <p>{confirmError}</p>}
        {orderNumber && <p>Order Number: {orderNumber}</p>}
        <button className="payBtn" onClick={() => navigate("/")} >
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default Success;
