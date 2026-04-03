import { useState, useEffect, useRef } from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import { AiFillStar, AiOutlineStar } from "react-icons/ai";
import { IoMdLock, IoMdCloseCircle } from "react-icons/io";
import { GrClose } from "react-icons/gr";
import QuantityBtn from "../Quantitybtn";
import "./ProductModel.css";
import { addToMyList, getMyListIds, removeFromMyList } from "../../utils/myList";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

const CART_API_BASE = "martico-server.vercel.app/api/cart";

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

const truncateWords = (text, wordLimit = 8) => {
  if (!text) return "";
  const words = String(text).trim().split(/\s+/);
  if (words.length <= wordLimit) return words.join(" ");
  return `${words.slice(0, wordLimit).join(" ")}...`;
};

const ProductModel = ({ open, onClose, product }) => {
  const navigate = useNavigate();
  const [activeImg, setActiveImg] = useState(null);
  const [zoomStyle, setZoomStyle] = useState({});
  const imgContainerRef = useRef(null);
  const [qty, setQty] = useState(1);
  const [cartLoading, setCartLoading] = useState(false);
  const [myListLoading, setMyListLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    if (product) {
      // Get the first image from images array or fall back to img property
      if (product.images && product.images.length > 0) {
        setActiveImg(product.images[0].url);
      } else if (product.img) {
        setActiveImg(product.img);
      } else {
        setActiveImg(null);
      }
    }
  }, [product]);

  useEffect(() => {
    const productId = product?._id || product?.id;
    if (!productId) {
      setIsSaved(false);
      return;
    }
    setIsSaved(getMyListIds().includes(String(productId)));
  }, [product]);

  useEffect(() => {
    const handleUpdate = () => {
      const productId = product?._id || product?.id;
      if (!productId) return;
      setIsSaved(getMyListIds().includes(String(productId)));
    };
    window.addEventListener("myListUpdated", handleUpdate);
    return () => window.removeEventListener("myListUpdated", handleUpdate);
  }, [product]);

  if (!product) return null;

  // Handle different data formats (API vs static)
  const productName = truncateWords(product.name || '', 8);
  const productBrand = product.brand || '';
  const productDesc = product.description || product.desc || '';
  const productPrice = product.newPrice ?? product.price ?? 0;
  const productOldPrice = product.oldPrice ?? ((product.price ?? 0) * 1.2);
  const productInStock = (product.countInStock ?? product.inStock ?? 0) > 0;
  const productRating = product.rating ?? 0;
  const maxQty = (product.countInStock ?? 99) || 99;

  // Zoom handlers
  const handleMouseMove = (e) => {
    const { left, top, width, height } = imgContainerRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({ transformOrigin: `${x}% ${y}%`, transform: "scale(2)" });
  };
  const handleMouseLeave = () => setZoomStyle({ transform: "scale(1)", transformOrigin: "center center" });

  // Render stars
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) stars.push(<AiFillStar key={i} className="starIcon" />);
      else stars.push(<AiOutlineStar key={i} className="starIcon outline" />);
    }
    return stars;
  };

  const handleAddToCart = async () => {
    if (!product) return;

    try {
      setCartLoading(true);
      const userId = getOrCreateCartUserId();

      const cartItemData = {
        productId: product._id,
        userId,
        name: product.name || "",
        image: product.images && product.images[0] ? product.images[0].url : (product.img || ""),
        price: productPrice,
        quantity: qty
      };

      const response = await fetch(`${CART_API_BASE}/add`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(cartItemData)
      });

      const result = await response.json();

      if (!response.ok || !result?.success) {
        throw new Error(result?.message || "Failed to add product to cart.");
      }

      window.dispatchEvent(new Event("cartUpdated"));
      toast.success("Added to cart successfully.", {
        containerId: "global",
        position: "bottom-left"
      });
    } catch (err) {
      console.error("Error adding to cart:", err);
      toast.error(err.message || "Error adding product to cart. Please try again.", {
        containerId: "global",
        position: "bottom-left"
      });
    } finally {
      setCartLoading(false);
    }
  };

  const handleAddToMyList = async () => {
    if (!product) return;
    const productId = product?._id || product?.id;
    try {
      setMyListLoading(true);
      if (productId && isSaved) {
        await removeFromMyList(productId);
        setIsSaved(false);
      } else {
        await addToMyList(product);
        setIsSaved(true);
      }
    } catch (err) {
      console.error("My List add error:", err);
      alert(err.message || "Failed to add to my list.");
    } finally {
      setMyListLoading(false);
    }
  };

  const handleBuyNow = () => {
    if (typeof onClose === "function") onClose();
    navigate("/checkout");
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="lg" fullWidth>

      <div className="amazonModal">
        <button className="modalCloseBtn" onClick={onClose}>
          <GrClose />

        </button>
        {/* LEFT – IMAGE + SLIDER */}
        <div className="amazonLeft">
          <div
            className="amazonMainImgWrapper"
            ref={imgContainerRef}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
          >
            <img src={activeImg} alt="product" className="amazonMainImgZoom" style={zoomStyle} />
          </div>

          {product.images?.length > 0 ? (
            <div className="amazonThumbWrapper">
              <Swiper slidesPerView={5} spaceBetween={10}>
                {product.images.map((imgObj, index) => (
                  <SwiperSlide key={index}>
                    <img
                      src={imgObj.url}
                      alt="thumb"
                      className={`amazonThumb ${activeImg === imgObj.url ? "amazonActiveThumb" : ""}`}
                      onClick={() => setActiveImg(imgObj.url)}
                    />
                  </SwiperSlide>
                ))}
              </Swiper>
            </div>
          ) : product.img ? (
            <div className="amazonThumbWrapper">
              <Swiper slidesPerView={5} spaceBetween={10}>
                <SwiperSlide>
                  <img
                    src={product.img}
                    alt="thumb"
                    className="amazonThumb amazonActiveThumb"
                  />
                </SwiperSlide>
              </Swiper>
            </div>
          ) : null}
        </div>

        {/* CENTER – DETAILS */}
        <div className="amazonCenter">
          <h2 className="amazonTitle">
            {productName} {productBrand ? <span className="brandTag">({productBrand})</span> : ''}
          </h2>

          <p className="amazonDesc">
           {productDesc?.split(" ").slice(0, 17).join(" ")}...
          </p>

          <div className="amazonRatings">
            {renderStars(productRating)} <span className="count">(1,245 ratings)</span>
          </div>

          <div className="amazonPriceBox">
            <span className="amazonPrice">${productPrice.toFixed(2)}</span>
            <span className="amazonOldPrice">${productOldPrice.toFixed(2)}</span>
          </div>
          
          <div className="qtyInline">
            <QuantityBtn value={qty} onChange={setQty} min={1} max={maxQty} />
          </div>

          <p className={`amazonStock ${productInStock ? "inS" : "outS"}`}>
            {productInStock ? "In Stock." : "Currently unavailable."}
          </p>
         
        </div>
                 
        {/* RIGHT – BUY BOX */}
        <div className="amazonRightBox">
          <div className="boxPrice">${productPrice.toFixed(2)}</div>

          <div className="deliveryText">
            FREE delivery available <br />
            <strong>Tomorrow</strong> if you order today
          </div>

          <Button className="buyNowBtn" onClick={handleBuyNow}>
            Buy Now
          </Button>
          <Button
            variant="contained"
            className="addToCartBtn"
            disabled={!productInStock || cartLoading}
            onClick={handleAddToCart}
          >
            {cartLoading ? "Adding..." : "Add to Cart"}
          </Button>
          <Button
            variant="outlined"
            className={`amazonWishlistBtn ${isSaved ? "saved" : ""}`}
            onClick={handleAddToMyList}
            disabled={myListLoading}
          >
            {myListLoading ? "Saving..." : isSaved ? "Remove Wishlist" : "Add to Wishlist"}
          </Button>

          <div className="secureText">
            <IoMdLock /> Secure transaction
          </div>
        </div>
      
      </div>
        
    </Dialog>
  );
};

export default ProductModel;
