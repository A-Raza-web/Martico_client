import { useState, useEffect } from 'react';
import Button from '@mui/material/Button';
import Tabs, { tabsClasses } from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import List2 from '../List2/index'
import { useNavigate } from 'react-router-dom';
import img1 from "../../../assets/images/banner1.jpg";
import pro from '../../../assets/images/pro.jpg';

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
import { addToMyList, getMyListIds, removeFromMyList } from "../../../utils/myList";

const List1 = () => {

  // -------------------------------
  //  PRODUCT MODAL STATE
  // -------------------------------
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const navigate = useNavigate();

  const handleOpenModal = (product) => {
    setSelectedProduct(product);
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedProduct(null);
  };


  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [myListIds, setMyListIds] = useState(() => getMyListIds());

  const fetchProducts = async (categoryId = null) => {
    try {
      setLoading(true);
      let url = 'martico-server.vercel.app/api/products?limit=12';
      
      if (categoryId) {
        url += `&category=${categoryId}`;
      } else {
        url += '&inFeatured=true';
      }
      
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const json = await res.json();
      const list = json.data || json;
      setProducts(list);
      setError(null);
    } catch (err) {
      console.error('Error fetching products:', err);
      setError('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts(selectedCategory);
    
    const fetchCategories = async () => {
      try {
        const res = await fetch('martico-server.vercel.app/api/categories');
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const json = await res.json();
        const list = json.data || json;
        setCategories(list);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    fetchCategories();
  }, [selectedCategory]);

  useEffect(() => {
    const handleUpdate = () => setMyListIds(getMyListIds());
    window.addEventListener("myListUpdated", handleUpdate);
    return () => window.removeEventListener("myListUpdated", handleUpdate);
  }, []);

  const renderStars = (rating) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 !== 0;
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) stars.push(<FaStar key={i} className="text-warning" />);
      else if (i === fullStars && hasHalf)
        stars.push(<FaStar key={i} className="text-warning opacity-50" />);
      else stars.push(<FaRegStar key={i} className="text-muted" />);
    }
    return stars;
  };

  const getDiscountPercent = (oldPrice, newPrice) => {
    const discount = ((oldPrice - newPrice) / oldPrice) * 100;
    return Math.round(discount);
  };

  const handleTabChange = (_event, newValue) => {
    setTabValue(newValue);
    
    if (newValue === 0) {
      setSelectedCategory(null);
    } else {
      const categoryIndex = newValue - 1;
      if (categories[categoryIndex]) {
        const id = categories[categoryIndex]._id;
        setSelectedCategory(id);
      }
    }
  };

  // Navigate to product detail page
  const handleProductClick = (productId) => {
    navigate(`/product/${productId}`);
  };

  // Keep the active tab in sync with the selected category when categories load/update
  useEffect(() => {
    if (!selectedCategory) {
      if (tabValue !== 0) setTabValue(0);
      return;
    }
    const idx = categories.findIndex(c => c._id === selectedCategory);
    const desired = idx >= 0 ? idx + 1 : 0;
    if (desired !== tabValue) setTabValue(desired);
  }, [categories, selectedCategory]);

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
            <div className="banner shadow-sm rounded overflow-hidden">
              <img src={img1} alt="side banner" className="img-fluid cursor" />
            </div>
          </div>

          {/* Product list */}
          <div className="col-md-9 ProductsRow">
            <div className="d-flex align-items-center mb-3 productsHeader">
              <div className="info w-75 ml-4">
                <h3 className="mb-0 hd">FEATURED PRODUCTS</h3>
                <p className="text-color text-sml mb-0">
                  Do not miss the current offers until the end of March.
                </p>
              </div>
              <Box
                sx={{
                  maxWidth: { xs: 320, sm: 480 },
                  mr: 'auto',
                  px: 1,
                }}
              >
                <Tabs
                  value={tabValue}
                  onChange={handleTabChange}
                  variant="scrollable"
                  scrollButtons="auto"
                  aria-label="featured product categories"
                  TabIndicatorProps={{ style: { backgroundColor: '#006970', height: 3, borderRadius: 999 } }}
                  sx={{
                    minHeight: 42,
                    '& .MuiTab-root': {
                      minHeight: 42,
                      textTransform: 'none',
                      fontWeight: 700,
                      fontSize: 13,
                      color: '#24515d',
                      px: 2
                    },
                    '& .MuiTab-root.Mui-selected': {
                      color: '#006970'
                    },
                    '& .MuiTabs-scrollButtons': {
                      color: '#006970'
                    }
                  }}
                >
                  <Tab label="All" />
                  {categories.length > 0 ? (
                    categories.map((cat) => (
                      <Tab key={cat._id} label={cat.name} />
                    ))
                  ) : (
                    <>
                      <Tab label="Item One" />
                      <Tab label="Item Two" />
                      <Tab label="Item Three" />
                      <Tab label="Item Four" />
                      <Tab label="Item Five" />
                      <Tab label="Item Six" />
                      <Tab label="Item Seven" />
                    </>
                  )}
                </Tabs>
              </Box>
            </div>

            <div className="product_row w-100 mt-2 ml-4">
              <div className="custom-swiper-button-prev-1  ">
                <IoChevronBack />
              </div>
              <div className="custom-swiper-button-next-1 ">
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
                      <SwiperSlide key={item._id || item.id}>
                        <div 
                          className='card productCard shadow-sm border-0 rounded-lg' 
                          onClick={() => handleProductClick(item._id || item.id)}
                          style={{ cursor: 'pointer' }}
                        >
                          <div className='imgWrapper overflow-hidden position-relative'>
                            <img src={imgSrc} alt={item.name} className="img-fluid w-100" />

                            {/* Discount */}
                            <span className="discountBadge">
                              {getDiscountPercent(oldPrice, newPrice)} % OFF
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
                      </SwiperSlide>
                    );
                  })
                )}
              </Swiper>
            </div>
          </div>

          <List2 />
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

export default List1;
