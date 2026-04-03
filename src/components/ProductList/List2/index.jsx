import { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import { useNavigate } from 'react-router-dom';
import img from "../../../assets/images/banner2.jpg";
import pro from '../../../assets/images/pro.jpg';
import { IoArrowForward } from "react-icons/io5";
import 'swiper/css';
import 'swiper/css/navigation';
import { FaStar, FaRegStar} from "react-icons/fa";
import { IoMdHeartEmpty, IoMdHeart } from "react-icons/io";
import { RxExitFullScreen } from "react-icons/rx";
import './List2.css';
import ProductModel from '../../ProductModel';
import { addToMyList, getMyListIds, removeFromMyList } from "../../../utils/myList";


const List2 = () => {

  const [selectedProduct, setSelectedProduct] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const navigate = useNavigate();
  
    const handleOpenModal = (product) => {
      setSelectedProduct(product);
      setOpenModal(true);
    };
  
    const handleCloseModal = () => {
      setOpenModal(false);
      setSelectedProduct(null);
    };

  // Navigate to product detail page
  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [myListIds, setMyListIds] = useState(() => getMyListIds());

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const res = await fetch('martico-server.vercel.app/api/products?limit=24');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        const list = json.data || json;
        setProducts(list);
        setError(null);
      } catch (err) {
        console.error('Error fetching products (List2):', err);
        setError('Failed to load products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  useEffect(() => {
    const handleUpdate = () => setMyListIds(getMyListIds());
    window.addEventListener("myListUpdated", handleUpdate);
    return () => window.removeEventListener("myListUpdated", handleUpdate);
  }, []);

  const renderStars = (rating) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= rating)
        stars.push(<FaStar key={i} className="text-warning opacity-50" />);
      else stars.push(<FaRegStar key={i} className="text-muted" />);
    }
    return stars;
  };

  // 💲 Calculate discount %
  const getDiscountPercent = (oldPrice, newPrice) => {
    const discount = ((oldPrice - newPrice) / oldPrice) * 100;
    return Math.round(discount);
  };

  // Truncate description to 8 words
  const truncateWords = (text, wordLimit = 8) => {
    if (!text) return '';
    const words = text.split(/\s+/);
    if (words.length <= wordLimit) return text;
    return words.slice(0, wordLimit).join(' ') + '...';
  };

  // Truncate product name to 3 words
  const truncateName = (text) => {
    if (!text) return '';
    const words = text.split(/\s+/);
    if (words.length <= 3) return text;
    return words.slice(0, 3).join(' ') + '...';
  };

  const handleAddToMyList = async (event, product) => {
    event.stopPropagation();
    const productId = product?._id || product?.id;
    try {
      if (productId && myListIds.includes(String(productId))) {
        await removeFromMyList(productId);
      } else {
        await addToMyList(product);
      }
    } catch (err) {
      console.error("My List add error:", err);
      alert(err.message || "Failed to add to my list.");
    }
  };

  return (
      <section className="homeProducts py-5">
        <div className="container">
          <div className="row">
            {/* Left banner */}
              <div className="col-md-3">
                <div className="sticky-sidebar">
                  <div className="banner shadow-sm rounded overflow-hidden">
                    <img src={img} alt="side banner" className="img-fluid cursor" />
                  </div>
                </div>
            </div>

            {/* Product list */}
            <div className="col-md-9 ProductsRow">
              <div className="d-flex align-items-center mb-3">
                <div className="info w-75 ml-4">
                  <h3 className="mb-0 hd">BEST SELLERS</h3>
                  <p className="text-color text-sml mb-0">
                    Do not miss the current offers until the end of March.
                  </p>
                </div>
                <Button
                  className='viewAllBtn ml-auto'
                  variant="contained"
                  color="primary"
                  endIcon={<IoArrowForward />}
                >
                  View All
                </Button>
              </div>

              {/* Products Grid */}
              <div className="productsGrid mt-3">
                {loading ? (
                  <div className="p-4">Loading products...</div>
                ) : error ? (
                  <div className="p-4 text-danger">{error}</div>
                ) : products.length === 0 ? (
                  <div className="p-4">No products available</div>
                ) : (
                  products.map((item) => {
                    const oldPrice = item.oldPrice ?? ((item.price ?? 0) * 1.2);
                    const newPrice = item.newPrice ?? (item.price ?? 0);
                    const imgSrc = item.images && item.images.length ? item.images[0].url : (item.img || pro);
                    const desc = truncateWords(item.description || item.desc || '');
                    const name = truncateName(item.name || '');
                    const inStock = (item.countInStock ?? item.inStock ?? 0) > 0;
                    const rating = item.rating ?? 0;
                    const productId = item._id || item.id;
                    const isSaved = productId ? myListIds.includes(String(productId)) : false;
                    return (
                      <div 
                        key={item._id || item.id} 
                        className="productCard shadow-sm rounded-lg"
                        onClick={() => handleProductClick(item._id || item.id)}
                        style={{ cursor: 'pointer' }}
                      >
                        <div className='imgWrapper overflow-hidden position-relative'>
                          <img src={imgSrc} alt={item.name} className="img-fluid w-100" />
                          <span className="discountBadge">
                            {getDiscountPercent(oldPrice, newPrice)} % OFF
                          </span>
                          <div className="imageIcons">
                            <span className="iconBox" onClick={(e) => { e.stopPropagation(); handleOpenModal(item); }} ><RxExitFullScreen /></span>
                            <span className={`iconBox ${isSaved ? "active" : ""}`} onClick={(e) => handleAddToMyList(e, item)}>
                              {isSaved ? <IoMdHeart /> : <IoMdHeartEmpty />}
                            </span>
                          </div>
                        </div>

                        <div className='card-body text-start px-3'>
                          <h6 className='card-title mb-1 fw-bold'>{name}</h6>
                          <p className='text-muted small mb-1'>{desc}</p>

                          <div className={`stockStatus ${inStock ? 'inStock' : 'outStock'}`}>
                            {inStock ? "In Stock" : "Out of Stock"}
                          </div>

                          <div className='rating mb-2'>
                            {renderStars(rating)}
                          </div>

                          <div className='priceBox mt-1'>
                            <span className='oldPrice me-2'>${oldPrice.toFixed(2)}</span>
                            <span className='newPrice ml-3'>${newPrice.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
              <div className='d-flex mt-4 mb-5 bannerSec'>
                  <div className="banner shadow-sm rounded overflow-hidden">
                    <img src={
                      'https://img.freepik.com/premium-vector/neon-cyber-monday-landscape-poster-banner-ad-social-media-post-layout-template-design_925298-439.jpg?semt=ais_se_enriched&w=740&q=80'}
                    alt="side banner" className="img-fluid cursor" />
                  </div>
                  <div className="banner shadow-sm rounded overflow-hidden">
                    <img src={
                      'https://img.freepik.com/premium-vector/neon-cyber-monday-landscape-poster-banner-ad-social-media-post-layout-template-design_925298-439.jpg?semt=ais_se_enriched&w=740&q=80'}
                    alt="side banner" className="img-fluid cursor" />
                  </div>
              </div>
            </div>
          </div>
          <ProductModel 
          open={openModal} 
          onClose={handleCloseModal} 
          product={selectedProduct} 
        />
        </div>
      </section>

  );
};

export default List2;
