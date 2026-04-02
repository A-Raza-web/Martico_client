import { useEffect, useState } from "react";
import {
  FaStar,
  FaRegStar,
  FaShoppingCart,
  FaHeart,
  FaMinus,
  FaPlus
} from "react-icons/fa";
import Pro from "../../../assets/images/pro.jpg";
import Button from '@mui/material/Button';
import { addToMyList, getMyListIds, removeFromMyList } from "../../../utils/myList";


const ProductInfo = ({ product, qty, setQty, onAddToCart, cartLoading }) => {
  // Get product images - handle both array and single image formats
  const productImages = product?.images || [];
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [myListLoading, setMyListLoading] = useState(false);
  const [isSaved, setIsSaved] = useState(false);
  
  const mainImage = productImages[selectedImageIndex]?.url || Pro;

  // Calculate discount percentage
  const discountPercent = product?.oldPrice && product?.price 
    ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
    : 0;

  // Format price
  const currentPrice = product?.price?.toFixed(2) || "0.00";
  const oldPrice = product?.oldPrice?.toFixed(2) || null;

  // Check stock status
  const inStock = product?.countInStock > 0;
  const stockText = inStock ? "In Stock" : "Out of Stock";

  // Get category name
  const categoryName = product?.category?.name || "Uncategorized";

  // Render stars based on rating
  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating || 0);
    const hasHalf = (rating || 0) % 1 !== 0;
    
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars.push(<FaStar key={i} className="text-warning" />);
      } else if (i === fullStars && hasHalf) {
        stars.push(<FaStar key={i} className="text-warning opacity-50" />);
      } else {
        stars.push(<FaRegStar key={i} className="text-muted" />);
      }
    }
    return stars;
  };

  // Get review count
  const reviewCount = product?.review?.length || 0;

  // Handle thumbnail click
  const handleThumbnailClick = (index) => {
    setSelectedImageIndex(index);
  };

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

  return (
    <section className="product-details-section py-5">
      <div className="container">
        <div className="row bg-white p-4 p-lg-5 rounded-4 align-items-center shadow-lg product-details-card">

          {/* IMAGE */}
          <div className="col-md-4 mt-0 mb-0">
            {/* Main Image */}
            <div className="product-img-wrapper overflow-hidden rounded-4 border shadow-sm mb-3">
              <img
                src={mainImage}
                alt={product?.name || "Product"}
                className="img-fluid w-100 h-100 object-fit-cover transition-zoom"
              />
            </div>
            
            {/* Thumbnail Images */}
            {productImages.length > 1 && (
              <div className="thumbnail-images d-flex gap-2 justify-content-center">
                {productImages.map((img, index) => (
                  <div 
                    key={index}
                    className={`thumbnail-wrapper ${selectedImageIndex === index ? 'active' : ''}`}
                    onClick={() => handleThumbnailClick(index)}
                    style={{
                      width: '80px',
                      height: '80px',
                      borderRadius: '8px',
                      overflow: 'hidden',
                      cursor: 'pointer',
                      border: selectedImageIndex === index ? '2px solid #2DE1C2' : '2px solid transparent',
                      opacity: selectedImageIndex === index ? 1 : 0.7,
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <img
                      src={img.url}
                      alt={`${product?.name || "Product"} ${index + 1}`}
                      className="img-fluid w-100 h-100 object-fit-cover"
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* INFO */}
          <div className="col-md-8 ">
            
            <h1 className="fw-bold mb-2 ">
              {product?.name || "Product Name"}
            </h1>
            <div className="mb-3">
              <span className={`badge ${inStock ? 'bg-soft-success' : 'bg-danger'}`}>
                {stockText}
              </span>
              <span className="text-muted small ml-2">SKU: {product?._id?.slice(-6) || "N/A"}</span>
            </div>

            <div className="d-flex align-items-center gap-3 mb-3">
              <div className="text-warning small ml-1">
                {renderStars(product?.rating || 0)}
              </div>
              <span className="text-muted small border-start ps-3 ml-2 mt-1">
                {reviewCount} Reviews
              </span>
            </div>

            <div className="d-flex align-items-center gap-3 mb-4">
              <h2 className="price-tag fw-bold mb-0">${currentPrice}</h2>
              {oldPrice && (
                <del className="text-muted ml-3">${oldPrice}</del>
              )}
              {discountPercent > 0 && (
                <span className="badge1 ml-2">Save {discountPercent}%</span>
              )}
            </div>

            <p className="text-muted mb-4">
              {product?.description || "No description available."}
            </p>

            {/* QTY + BUTTONS */}
            <div className="d-flex flex-wrap align-items-center gap-4 mb-4">
              <div className="qty-selector d-flex align-items-center gap-2">
                <Button
                  className="qty-btn minus"
                  disabled={qty === 1}
                  onClick={() => setQty(qty - 1)}
                >
                  <FaMinus size={13} />
                </Button>

                <span className="qty-number fw-bold">
                  {qty}
                </span>

                <Button
                  className="qty-btn plus"
                  onClick={() => setQty(qty + 1)}
                >
                  <FaPlus size={13} />
                </Button>
              </div>

              <div className="d-flex flex-grow-1 p-3">
                <Button
                  className="btn btn-primary ml-2 mt-2 btn-lg flex-grow-1 d-flex justify-content-center"
                  onClick={onAddToCart}
                  disabled={!inStock || cartLoading}
                >
                  <FaShoppingCart /> 
                  <span className="ml-2">{cartLoading ? "Adding..." : inStock ? "Add to Cart" : "Out of Stock"}</span> 
                </Button>
                <Button
                  className={`btn btn-outline-danger ml-4 btn-lg ${isSaved ? "saved" : ""}`}
                  onClick={handleAddToMyList}
                  disabled={myListLoading}
                >
                  <FaHeart />
                </Button>  
                
              </div>
               
            </div>

            <hr />
            <p className="small text-muted mb-0">
              Category: <strong>{categoryName}</strong>
              {product?.brand && (
                <>
                  <span className="mx-2">|</span>
                  Brand: <strong>{product.brand}</strong>
                </>
              )}
            </p>
          </div>

        </div>
      </div>
      

    </section>
  );
};

export default ProductInfo;
