import { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import pro from '../../../assets/images/pro.jpg';
import { IoArrowForward } from "react-icons/io5";
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import { Navigation } from 'swiper/modules';
import { FaStar, FaRegStar} from "react-icons/fa";
import { IoMdHeartEmpty, IoMdHeart } from "react-icons/io";
import { RxExitFullScreen } from "react-icons/rx";
import { IoChevronBack, IoChevronForward } from "react-icons/io5";
import './List1.css';
import ProductModel from '../../ProductModel';
import { useNavigate } from 'react-router-dom';
import { addToMyList, getMyListIds, removeFromMyList } from "../../../utils/myList";

const Reatedproduct = ({ product }) => {
  // State for related products
  const [relatedProducts, setRelatedProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const [myListIds, setMyListIds] = useState(() => getMyListIds());

  // -------------------------------
  //  PRODUCT MODAL STATE
  // -------------------------------
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [openModal, setOpenModal] = useState(false);

  const handleOpenModal = (product) => {
    setSelectedProduct(product);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedProduct(null);
  };

  // Fetch related products from the same category
  useEffect(() => {
    const fetchRelatedProducts = async () => {
      if (!product?.category?._id) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const res = await fetch(`martico-server.vercel.app/api/products?limit=10&category=${product.category._id}`);
        const json = await res.json();
        
        if (json.success && json.data) {
          // Filter out the current product and limit to 5
          const filtered = json.data
            .filter(p => p._id !== product._id)
            .slice(0, 5);
          setRelatedProducts(filtered);
        }
      } catch (err) {
        console.error("Error fetching related products:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchRelatedProducts();
  }, [product]);

  useEffect(() => {
    const handleUpdate = () => setMyListIds(getMyListIds());
    window.addEventListener("myListUpdated", handleUpdate);
    return () => window.removeEventListener("myListUpdated", handleUpdate);
  }, []);

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating || 0);
    const hasHalf = (rating || 0) % 1 !== 0;
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) stars.push(<FaStar key={i} className="text-warning" />);
      else if (i === fullStars && hasHalf)
        stars.push(<FaStar key={i} className="text-warning opacity-50" />);
      else stars.push(<FaRegStar key={i} className="text-muted" />);
    }
    return stars;
  };

  const getDiscountPercent = (oldPrice, newPrice) => {
    if (!oldPrice || !newPrice) return 0;
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

  // Transform API product to display format
  const transformProduct = (item) => ({
    id: item._id,
    name: item.name,
    nameShort: truncateName(item.name || ''),
    desc: item.description,
    img: item.images?.[0]?.url || pro,
    oldPrice: item.oldPrice || (item.price * 1.2),
    newPrice: item.price,
    price: item.price,
    rating: item.rating || 0,
    inStock: (item.countInStock || 0) > 0,
    brand: item.brand,
    category: item.category?.name || item.category
  });

  // Truncate product name to 3 words
  const truncateName = (text) => {
    if (!text) return '';
    const words = text.split(/\s+/);
    if (words.length <= 3) return text;
    return words.slice(0, 3).join(' ') + '...';
  };

  const displayProducts = relatedProducts.map(transformProduct);

  // Navigate to product detail page
  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
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

  // Show loading or empty state if no related products
  if (loading) {
    return null;
  }

  if (displayProducts.length === 0) {
    return null;
  }

  return (
    <section className="homeProducts py-5">
      <div className="container">
        <div className="row">

          {/* Product list */}
          <div className="col-md-12 ProductsRow">
            <div className="d-flex align-items-center mb-3">
              <div className="info w-75 ml-4">
                <h3 className="mb-0 hd"> RELATED PRODUCTS</h3>
               
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

            <div className="product_row w-100 mt-2 ml-4">
              <div className="custom-swiper-button-prev-1">
                <IoChevronBack />
              </div>
              <div className="custom-swiper-button-next-1">
                <IoChevronForward />
              </div>

              <Swiper
                slidesPerView={4}
                spaceBetween={25}
                modules={[Navigation]}
                className="mySwiper"
                onInit={(swiper) => {
                  swiper.params.navigation.prevEl = '.custom-swiper-button-prev-1';
                  swiper.params.navigation.nextEl = '.custom-swiper-button-next-1';
                  swiper.navigation.init();
                  swiper.navigation.update();
                }}
              >
                {displayProducts.map((item) => {
                  const productId = item.id || item._id;
                  const isSaved = productId ? myListIds.includes(String(productId)) : false;
                  return (
                  <SwiperSlide key={item.id}>
                    <div 
                      className='card productCard shadow-sm border-0 rounded-lg' 
                      onClick={() => handleProductClick(item.id)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className='imgWrapper overflow-hidden position-relative'>
                        <img src={item.img} alt={item.name} className="img-fluid w-100" />

                        {/* Discount */}
                        <span className="discountBadge">
                          {getDiscountPercent(item.oldPrice, item.newPrice)} % OFF
                        </span>

                        {/* Icons */}
                        <div className="imageIcons">

                          {/*  FULL SCREEN ICON CLICK → OPEN MODAL */}
                          <span className="iconBox" onClick={(e) => { e.stopPropagation(); handleOpenModal(item); }}>
                            <RxExitFullScreen />
                          </span>

                          <span className={`iconBox ${isSaved ? "active" : ""}`} onClick={(e) => handleAddToMyList(e, item)}>
                            {isSaved ? <IoMdHeart /> : <IoMdHeartEmpty />}
                          </span>

                        </div>
                      </div>

                      <div className='card-body text-start px-3'>
                        <h6 className='card-title mb-1 fw-bold'>{item.nameShort || truncateName(item.name)}</h6>
                        <p className='text-muted small mb-1'>{truncateWords(item.desc)}</p>

                        <div className={`stockStatus ${item.inStock ? 'inStock' : 'outStock'}`}>
                          {item.inStock ? "In Stock" : "Out of Stock"}
                        </div>

                        <div className='rating mb-2'>
                          {renderStars(item.rating)}
                        </div>

                        <div className='priceBox mt-1'>
                          <span className='oldPrice me-2'>${(item.oldPrice || 0).toFixed(2)}</span>
                          <span className='newPrice ml-3'>${(item.newPrice || 0).toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </SwiperSlide>
                );
                })}
              </Swiper>
            </div>
          </div>

        </div>

        {/*  PRODUCT MODAL COMPONENT */}
        <ProductModel 
          open={openModal} 
          onClose={handleCloseModal} 
          product={selectedProduct} 
        />

      </div>
    </section>
  );
};

export default Reatedproduct;
