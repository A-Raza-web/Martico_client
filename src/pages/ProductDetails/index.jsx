import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { toast } from "react-toastify";
import ProductInfo from "../../components/ProductDetails/ProductInfo";
import CartDrawer from "../../components/ProductDetails/CartDrawer";
import ReviewSection from "../../components/ProductDetails/ReviewSection";
import Reatedproduct from "../../components/ProductDetails/Reatedproduct";
import "./ProductDetails.css";

const getOrCreateCartUserId = () => {
  const loggedInUserId = localStorage.getItem("userId");
  if (loggedInUserId) return loggedInUserId;

  let guestUserId = localStorage.getItem("guestUserId");
  if (!guestUserId) {
    guestUserId = `guest_${Date.now()}`;
    localStorage.setItem("guestUserId", guestUserId);
  }

  return guestUserId;
};

const ProductDetails = () => {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [qty, setQty] = useState(1);
  const [showCart, setShowCart] = useState(false);
  const [cartLoading, setCartLoading] = useState
  (false);

  // Fetch product by ID
  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        const res = await fetch(`http://localhost:4000/api/products/${id}`);
        const json = await res.json();
        
        if (json.success) {
          setProduct(json.data);
        } else {
          setError(json.message || "Product not found");
        }
      } catch (err) {
        setError("Failed to load product");
        console.error("Error fetching product:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchProduct();
  }, [id]);
  // const fetchCartCount = async () => {
  // try {

  //   const userId = localStorage.getItem("userId");

  //   const res = await fetch(`http://localhost:4000/api/cart/count/${userId}`);

  //   const data = await res.json();

  //   if(data.success){
  //     setCartCount(data.count);
  //   }

  // } catch (error) {
  //   console.log("Cart count error:", error);
  // }
  // }; 
  // Add to cart
const handleAddToCart = async () => {
  try {
    setCartLoading(true);

    const userId = getOrCreateCartUserId();

    const cartItemData = {
      productId: product._id,
      userId,
      name: product.name,
      image: product.images && product.images[0] ? product.images[0].url : "",
      price: product.price,
      quantity: qty,
    };

    const response = await fetch("http://localhost:4000/api/cart/add", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(cartItemData),
    });

    const result = await response.json();

    if (result.success) {
      window.dispatchEvent(new Event("cartUpdated"));
      setShowCart(true);
      toast.success(result.message); // ✅ success snackbar
    } else {
      toast.error(result.message); // ✅ error snackbar
    }

  } catch (err) {
    console.error("Error adding to cart:", err);
    toast.error("Error adding product to cart. Please try again.");
  } finally {
    setCartLoading(false);
  }
};

  if (loading) {
    return (
      <div className="container py-5 text-center">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="container py-5 text-center">
        <h4>{error || "Product not found"}</h4>
      </div>
    );
  }

  return (
    <>
      <ProductInfo
        product={product}
        qty={qty}
        setQty={setQty}
        onAddToCart={handleAddToCart}
        cartLoading={cartLoading}
      />

      {showCart && (
        <CartDrawer
          onClose={() => setShowCart(false)}
        />
      )}

      <ReviewSection product={product} />
      <Reatedproduct product={product} />
    </>
  );
};

export default ProductDetails;
