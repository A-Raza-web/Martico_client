import { useRef, useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import { Swiper, SwiperSlide } from 'swiper/react';
import 'swiper/css';
import 'swiper/css/navigation';
import { Navigation } from 'swiper/modules';
import './HomeCat.css';
import { IoIosArrowRoundForward } from "react-icons/io";
import { IoIosArrowRoundBack } from "react-icons/io";

const HomeCat = () => {
  const swiperRef = useRef(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Default fallback colors in case category doesn't have one
  const defaultColors = [
    "#FEEFEA",  // light peach
    "#EAF4FF",  // sky blue
    "#FFF3E8",  // light orange
    "#E4F9F5",  // mint light
    "#E6F7FF",  // baby blue
    "#FFF1F0",  // blush white
    "#EDF9FF",  // ice blue
    "#FFF7FB",  // cotton pink
    "#FFEFF5",  // strawberry cream
    "#E9FFFD",  // aqua milk
    "#FDF5FF",  // orchid tint
  ];

  // Fetch categories from API
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await fetch('http://localhost:4000/api/categories');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        // Handle both wrapped and unwrapped responses
        const categoryList = data.data || data;
        setCategories(categoryList);
        setError(null);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError('Failed to load categories');
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return (
    <section className="homeCat">
      <div className="container">
        <h3 className='mb-3 hd '>Top Categories</h3>
        
        {loading && <p>Loading categories...</p>}
        {error && <p style={{ color: 'red' }}>{error}</p>}
        
        {!loading && !error && categories.length > 0 && (
          <div className="swiper-wrapper-container" style={{ position: "relative" }}>
            {/* Arrows */}
            <div
              className="arrow-prev"
              onClick={() => swiperRef.current?.slidePrev()}
            >
              < IoIosArrowRoundBack />
            </div>
            <div
              className="arrow-next"
              onClick={() => swiperRef.current?.slideNext()}
            >
              <IoIosArrowRoundForward />
            </div>

            <Swiper
              onSwiper={(swiper) => (swiperRef.current = swiper)}
              slidesPerView={10}
              slidesPerGroup={3}
              spaceBetween={10}
              modules={[Navigation]}
            >
              {categories.map((category, index) => (
                <SwiperSlide key={category._id}>
                  <Link to={`/cat/${category._id}`}>
                    <div
                      className="items cursor "
                      style={{ 
                        background: category.color || defaultColors[index % defaultColors.length], 
                        color: '#1B1B1B'
                      }}
                    >
                      <img 
                        src={category.image?.[0] || 'https://nest.botble.com/storage/product-categories/image-2.png'} 
                        alt={category.name} 
                      />
                      <h6 className=" mt-4">{category.name}</h6>
                    </div>
                  </Link>
                </SwiperSlide>
              ))}
            </Swiper>
          </div>
        )}
        
        {!loading && !error && categories.length === 0 && (
          <p>No categories available</p>
        )}
      </div>
    </section>
  );
};

export default HomeCat;
