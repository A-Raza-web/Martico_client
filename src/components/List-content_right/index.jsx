import { useState, useEffect } from "react";
import Button from "@mui/material/Button";
import Menu from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import { useNavigate } from "react-router-dom";

import { FaAngleDown, FaStar, FaRegStar } from "react-icons/fa6";
import { BiGridSmall, BiSolidGrid } from "react-icons/bi";
import { TfiLayoutGrid4Alt } from "react-icons/tfi";
import { IoIosMenu } from "react-icons/io";
import { IoMdHeartEmpty, IoMdHeart } from "react-icons/io";
import { RxExitFullScreen } from "react-icons/rx";

import pro from "../../assets/images/pro.jpg";
import "./content_right.css";
import ProductModel from '../ProductModel';
import { addToMyList, getMyListIds, removeFromMyList } from "../../utils/myList";

const apiProducts = async (categoryId, subCategoryId, searchQuery) => {
  let url = 'http://localhost:4000/api/products?limit=24';
  if (searchQuery) {
    url = `http://localhost:4000/api/search?q=${encodeURIComponent(searchQuery)}`;
  } else if (subCategoryId) {
    url += `&subCategory=${subCategoryId}`;
  } else if (categoryId && categoryId !== 'all') {
    url += `&category=${categoryId}`;
  }
  const res = await fetch(url);
  const json = await res.json();
  if (!json.success) {
    console.error('API Error:', json.message);
    return [];
  }
  return json.data || json;
};

//  Rating stars
const renderStars = (rating) => {
  const stars = [];
  const full = Math.floor(rating);
  const half = rating % 1 !== 0;

  for (let i = 0; i < 5; i++) {
    if (i < full) stars.push(<FaStar key={i} className="text-warning" />);
    else if (i === full && half)
      stars.push(<FaStar key={i} className="text-warning opacity-50" />);
    else stars.push(<FaRegStar key={i} className="text-muted" />);
  }
  return stars;
};

// 💲 Discount
const discountPercent = (oldP, newP) =>
  Math.round(((oldP - newP) / oldP) * 100);

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

const ContentRight = ({ categoryId, subCategoryId, priceFilter, brandFilter, searchQuery }) => {
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [openModal, setOpenModal] = useState(false);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [myListIds, setMyListIds] = useState(() => getMyListIds());

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
  const [anchorEl, setAnchorEl] = useState(null);
  const [showCount, setShowCount] = useState(10);
  const [view, setView] = useState("grid-3");

  const open = Boolean(anchorEl);
  useEffect(() => {
    let mounted = true;
    setLoading(true);
    apiProducts(categoryId, subCategoryId, searchQuery)
      .then(list => {
        if (!mounted) return;
        // Filter by price if priceFilter is set
        let filteredList = list;
        if (priceFilter !== null) {
          filteredList = filteredList.filter(item => {
            const price = item.newPrice ?? (item.price ?? 0);
            return price <= priceFilter;
          });
        }
        // Filter by brand if brandFilter is set
        if (brandFilter && brandFilter.length > 0) {
          filteredList = filteredList.filter(item => {
            return item.brand && brandFilter.includes(item.brand);
          });
        }
        setProducts(filteredList);
        setError(null);
      })
      .catch(() => {
        if (!mounted) return;
        setProducts([]);
        setError('Failed to load products');
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [categoryId, subCategoryId, priceFilter, brandFilter, searchQuery]);

  useEffect(() => {
    const handleUpdate = () => setMyListIds(getMyListIds());
    window.addEventListener("myListUpdated", handleUpdate);
    return () => window.removeEventListener("myListUpdated", handleUpdate);
  }, []);

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
    <div className="content_right">
      {/* Toolbar */}
      <div className="showBy mt-3 mb-3 d-flex align-items-center">

        <div className="d-flex align-items-center btnWapper">
          <Button onClick={() => setView("list")} className={view === "list" ? "active" : ""}>
            <IoIosMenu />
          </Button>
          <Button onClick={() => setView("grid-2")} className={view === "grid-2" ? "active" : ""}>
            <BiGridSmall />
          </Button>
          <Button onClick={() => setView("grid-3")} className={view === "grid-3" ? "active" : ""}>
            <BiSolidGrid />
          </Button>
          <Button onClick={() => setView("grid-4")} className={view === "grid-4" ? "active" : ""}>
            <TfiLayoutGrid4Alt />
          </Button>
        </div>

        <div className="ml-auto showByFilter">
          <Button className="showBtn" onClick={(e) => setAnchorEl(e.currentTarget)} >
            Show {showCount}
            <FaAngleDown />
          </Button>

          <Menu anchorEl={anchorEl} open={open} onClose={() => setAnchorEl(null)}>
            <MenuItem onClick={() => { setShowCount(10); setAnchorEl(null); }}>Show 10</MenuItem>
            <MenuItem onClick={() => { setShowCount(20); setAnchorEl(null); }}>Show 20</MenuItem>
            <MenuItem onClick={() => { setShowCount(30); setAnchorEl(null); }}>Show 30</MenuItem>
          </Menu>
        </div>
      </div>

      {/* Products */}
      <div className={`productListing ${view}`}>
        {loading ? (
          <div className="p-4">Loading products...</div>
        ) : error ? (
          <div className="p-4 text-danger">{error}</div>
        ) : products.length === 0 ? (
          <div className="p-4">No products available</div>
        ) : products.slice(0, showCount).map((item) => {
          const productId = item._id || item.id;
          const isSaved = productId ? myListIds.includes(String(productId)) : false;
          return (
          <div 
            className="productCard shadow-sm rounded-lg" 
            key={item._id || item.id}
            onClick={() => handleProductClick(item._id || item.id)}
            style={{ cursor: 'pointer' }}
          >
            <div className="imgWrapper position-relative overflow-hidden">
              <img src={(item.images && item.images[0]?.url) || item.img || pro} alt={item.name} className="img-fluid w-100" />

              <span className="discountBadge">
                {discountPercent(item.oldPrice ?? ((item.price ?? 0) * 1.2), item.newPrice ?? (item.price ?? 0))}% OFF
              </span>

              <div className="imageIcons">
                <span className="iconBox" onClick={(e) => { e.stopPropagation(); handleOpenModal(item); }}><RxExitFullScreen /></span>
                <span className={`iconBox ${isSaved ? "active" : ""}`} onClick={(e) => handleAddToMyList(e, item)}>
                  {isSaved ? <IoMdHeart /> : <IoMdHeartEmpty />}
                </span>
              </div>
            </div>

            <div className="card-body text-start px-3">
              <h6 className="fw-bold mb-1">{truncateName(item.name)}</h6>
              <p className="text-muted small mb-1">{truncateWords(item.description || item.desc)}</p>

              <div className={`stockStatus ${item.inStock ? "inStock" : "outStock"}`}>
                {(item.countInStock ?? item.inStock) ? "In Stock" : "Out of Stock"}
              </div>

              <div className="rating mb-2">
                {renderStars(item.rating ?? 0)}
              </div>

              <div className="priceBox">
                <span className="oldPrice mr-2">${(item.oldPrice ?? ((item.price ?? 0) * 1.2)).toFixed ? (item.oldPrice ?? ((item.price ?? 0) * 1.2)).toFixed(2) : item.oldPrice}</span>
                <span className="newPrice ms-2">${(item.newPrice ?? (item.price ?? 0)).toFixed ? (item.newPrice ?? (item.price ?? 0)).toFixed(2) : item.newPrice}</span>
              </div>
            </div>
          </div>
        );
        })}
      </div>
      <ProductModel
        open={openModal}
        onClose={handleCloseModal}
        product={selectedProduct}
      />

    </div>
  );
};

export default ContentRight;
