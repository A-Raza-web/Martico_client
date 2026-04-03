import { useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "react-toastify";
import image from "../../assets/images/success.svg"
import "./success.css";

const Success = () => {
  const [searchParams] = useSearchParams();
  const sessionId = searchParams.get("session_id");
  const navigate = useNavigate();

  useEffect(() => {
    const clearCartAndConfirm = async () => {
      const userId = localStorage.getItem("userId") || localStorage.getItem("guestUserId");

      try {
        const res = await fetch("martico-server.vercel.app/api/payment/confirm", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ sessionId, userId })
        });

        if (res.ok) {
          window.dispatchEvent(new Event("cartUpdated"));
          toast.success("Order placed successfully!");
        }
      } catch (err) {
        console.error("Error confirming order:", err);
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
        <button className="payBtn" onClick={() => navigate("/")} >
          Back to Home
        </button>
      </div>
    </div>
  );
};

export default Success;