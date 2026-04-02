import { useState } from "react";
import { Link } from "react-router-dom";
import { ShieldCheck, Truck, Wallet, CreditCard } from "lucide-react";
import  CardSummary from "../../components/CardSummary";
import "./Checkout.css";
import { toast } from "react-toastify";

const Checkout = () => {
  const [delivery, setDelivery] = useState("standard");
  const [payment, setPayment] = useState("");
  const [paymentError, setPaymentError] = useState(false);
  const [cartItems, setCartItems] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleFormInput = (event) => {
    const target = event.target;
    if (target && target.classList && target.classList.contains("fieldError")) {
      target.classList.remove("fieldError");
    }
  };
  const getCartUserId = () => {
  return localStorage.getItem("userId") || localStorage.getItem("guestUserId");
 };

  const handlePay = async () => {
    const form = document.querySelector(".checkoutForm");
    if (!form) return;

    const fields = Array.from(form.querySelectorAll(".formField"));
    const emptyLabels = [];

    fields.forEach((field) => {
      const input = field.querySelector("input, select, textarea");
      const labelEl = field.querySelector("label");
      const labelText = labelEl ? labelEl.textContent.trim() : "";

      if (
        input &&
        !input.value.trim() &&
        !labelText.toLowerCase().includes("optional")
      ) {
        input.classList.add("fieldError");
        emptyLabels.push(labelText || "Required Field");
      }
    });

    if (emptyLabels.length > 0) {
      toast.error(`Please fill: ${emptyLabels.join(", ")}`);
      return;
    }

    // ✅ values get karna
    const getValue = (label) => {
      const field = [...fields].find((f) =>
        f.querySelector("label")?.textContent.includes(label)
      );
      return field?.querySelector("input, textarea")?.value || "";
    };

    const orderData = {
      userId: getCartUserId(),
      contact: {
        email: getValue("Email"),
        phone: getValue("Phone"),
      },

      shippingAddress: {
        fullName: getValue("Full Name"),
        company: getValue("Company"),
        street: getValue("Street"),
        apartment: getValue("Apartment"),
        city: getValue("City"),
        state: getValue("State"),
        zipCode: getValue("Zip"),
        country: getValue("Country"),
      },
        deliveryMethod: delivery,
        paymentMethod: payment,
        items: cartItems.map((item) => ({
        productId: item.productId || item._id,
        name: item.name,
        image: item.image,
        price: item.price,
        quantity: item.quantity || 1,
      })),

      subtotal: cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0),
      deliveryFee: delivery === "express" ? 9.99 : 0,
      totalAmount:
        cartItems.reduce((acc, item) => acc + item.price * item.quantity, 0) +
        (delivery === "express" ? 9.99 : 0),

      orderNotes: getValue("Order Notes"),
    };

    setIsProcessing(true);

    try {
      // ✅ COD case
      if (payment === "cod") {
        const res = await fetch("http://localhost:4000/api/order/create-order", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(orderData),
        });

        const data = await res.json();

        if (data.success) {
          toast.success("Order placed successfully!");
          setCartItems([]); // cart empty
        } else {
          toast.error(data.message || "Order failed");
        }

        setIsProcessing(false);
        return;
      }

      // ✅ Card Payment (Stripe)
      const response = await fetch(
        "http://localhost:4000/api/payment/checkout",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(orderData), // 👈 full data send
        }
      );

      const data = await response.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        toast.error("Payment failed");
        setIsProcessing(false);
      }
    } catch (error) {
      console.error("Payment Error:", error);
      toast.error("Something went wrong with the payment.");
      setIsProcessing(false);
    }
  };

  return (
    <section className="checkoutPage">
      <div className="container checkoutContainer">
        <div className="checkoutTop">
          <div>
            <p className="checkoutTag">Secure Checkout</p>
            <h2>Complete Your Order</h2>
            <p className="checkoutSubtext">
              Fast, safe payments with instant order confirmation.
            </p>
          </div>
          <Link to="/card" className="checkoutBackBtn">Back to Cart</Link>
        </div>

        <div className="checkoutGrid">
          <form className="checkoutForm" onInput={handleFormInput}>
            <div className="checkoutCard">
              <div className="cardHeader">
                <h3>Contact</h3>
                <span className="cardHint">We will send updates here.</span>
              </div>
              <div className="formGrid">
                <div className="formField">
                  <label>Email Address</label>
                  <input type="email" placeholder="you@email.com" />
                </div>
                <div className="formField">
                  <label>Phone Number</label>
                  <input type="tel" placeholder="+1 555 000 2345" />
                </div>
              </div>
            </div>

            <div className="checkoutCard">
              <div className="cardHeader">
                <h3>Shipping Address</h3>
                <span className="cardHint">Where should we deliver?</span>
              </div>
              <div className="formGrid">
                <div className="formField">
                  <label>Full Name</label>
                  <input type="text" placeholder="Jane Cooper" />
                </div>
                <div className="formField">
                  <label>Company (Optional)</label>
                  <input type="text" placeholder="Company name" />
                </div>
                <div className="formField full">
                  <label>Street Address</label>
                  <input type="text" placeholder="123 Market Street" />
                </div>
                <div className="formField full">
                  <label>Apartment / Suite</label>
                  <input type="text" placeholder="Floor, suite, unit" />
                </div>
                <div className="formField">
                  <label>City</label>
                  <input type="text" placeholder="San Francisco" />
                </div>
                <div className="formField">
                  <label>State</label>
                  <input type="text" placeholder="CA" />
                </div>
                <div className="formField">
                  <label>Zip Code</label>
                  <input type="text" placeholder="00000" />
                </div>
                <div className="formField">
                  <label>Country</label>
                  <input type="text" placeholder="Country Name" />
                </div>
              </div>
            </div>

            <div className="checkoutCard">
              <div className="cardHeader">
                <h3>Delivery</h3>
                <span className="cardHint">Choose your shipping speed.</span>
              </div>
              <div className="optionGrid">
                <label className={`optionCard ${delivery === "standard" ? "active" : ""}`}>
                  <input
                    type="radio"
                    name="delivery"
                    value="standard"
                    checked={delivery === "standard"}
                    onChange={() => setDelivery("standard")}
                  />
                  <div>
                    <strong>Standard Delivery</strong>
                    <p>3-5 business days · Free</p>
                  </div>
                  <Truck size={18} />
                </label>
                <label className={`optionCard ${delivery === "express" ? "active" : ""}`}>
                  <input
                    type="radio"
                    name="delivery"
                    value="express"
                    checked={delivery === "express"}
                    onChange={() => setDelivery("express")}
                  />
                  <div>
                    <strong>Express Delivery</strong>
                    <p>Next day · $9.99</p>
                  </div>
                  <Truck size={18} />
                </label>
              </div>
            </div>

            <div className="checkoutCard">
              <div className="cardHeader">
                <h3>Payment</h3>
                <span className="cardHint">All transactions are encrypted.</span>
              </div>
              <div className={`optionGrid ${paymentError ? "paymentError" : ""}`}>
                <label className={`optionCard ${payment === "card" ? "active" : ""}`}>
                  <input
                    type="radio"
                    name="payment"
                    value="card"
                    checked={payment === "card"}
                    onChange={() => {
                      setPayment("card");
                      setPaymentError(false);
                    }}
                  />
                  <div>
                    <strong>Credit / Debit Card</strong>
                    <p>Visa, Mastercard, Amex</p>
                  </div>
                  <CreditCard size={18} />
                </label>
                <label className={`optionCard ${payment === "cod" ? "active" : ""}`}>
                  <input
                    type="radio"
                    name="payment"
                    value="cod"
                    checked={payment === "cod"}
                    onChange={() => {
                      setPayment("cod");
                      setPaymentError(false);
                    }}
                  />
                  <div>
                    <strong>Cash on Delivery</strong>
                    <p>Pay when you receive</p>
                  </div>
                  <Wallet size={18} />
                </label>
              </div>

              {payment === "cod" && (
                <div className="codBox">
                  <div className="codTitle">Cash on Delivery rules</div>
                  <ul className="codList">
                    <li>Have exact cash ready at delivery for a faster handoff.</li>
                    <li>Orders can be confirmed by a quick verification call or SMS.</li>
                    <li>Unsuccessful delivery attempts may trigger a reschedule fee.</li>
                  </ul>
                  <button
                    type="button"
                    className="codCompleteBtn"
                    onClick={handlePay}
                  >
                    Order Completed
                  </button>
                </div>
              )}
            </div>

            <div className="checkoutCard">
              <div className="cardHeader">
                <h3>Order Notes</h3>
                <span className="cardHint">Optional instructions for delivery.</span>
              </div>
              <div className="formField full">
                <textarea rows="3" placeholder="Leave at the door, call on arrival, etc." />
              </div>
            </div>
          </form>
          <CardSummary 
            onPay={handlePay} 
            setCartItemsInParent={setCartItems}
            isProcessing={isProcessing} 
            paymentMethod={payment} 
          />
        </div>
      </div>
    </section>
  );
};

export default Checkout;
