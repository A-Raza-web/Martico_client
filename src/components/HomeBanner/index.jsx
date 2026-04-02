import React, { useEffect, useState } from "react";
import Slider from "react-slick";
import Home1 from "../../assets/images/Home1.png";
import Home2 from "../../assets/images/home2.png";
import Home3 from "../../assets/images/Home3.png";
import Home4 from "../../assets/images/Home4.png";
import Home5 from "../../assets/images/Home5.png";
import { FaArrowLeft } from "react-icons/fa6";
import { FaArrowRight } from "react-icons/fa6";

import "./Home.css";

const HomeBanner = () => {
  const [banners, setBanners] = useState([]);

  const NextArrow = ({ onClick }) => {
    return (
      <div
        className="slider-arrow next"
        onClick={onClick}
      >
        <span className="arrow">
          <FaArrowRight style={{ marginBottom: "5px" }} />
        </span>
      </div>
    );
  };

  const PrevArrow = ({ onClick }) => {
    return (
      <div
        className="slider-arrow prev"
        onClick={onClick}

      >
        <FaArrowLeft style={{ marginBottom: "5px" }} />
      </div>
    );
  };


  var settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 1,
    slidesToScroll: 1,
    centerMode: true,
    centerPadding: "60px",
    autoplay: true,
    autoplaySpeed: 3000,
    pauseOnHover: false,
    nextArrow: <NextArrow />,
    prevArrow: <PrevArrow />,
    appendDots: dots => (
      <div
        style={{
          position: "absolute",
          bottom: "20px",
          width: "100%",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <ul style={{ margin: "0px" }}>{dots}</ul>
      </div>
    ),

    customPaging: i => (
      <div className="custom-dot"></div>
    ),
  };

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const res = await fetch("http://localhost:4000/api/banners");
        const data = await res.json();
        if (data?.success && Array.isArray(data.data)) {
          setBanners(data.data);
        }
      } catch (error) {
        console.error("Error fetching banners:", error);
      }
    };

    fetchBanners();
  }, []);

  const fallbackBanners = [
    { image: Home1 },
    { image: Home2 },
    { image: Home3 },
    { image: Home4 },
    { image: Home5 }
  ];

  const bannerItems = banners.length > 0 ? banners : fallbackBanners;



  return (

    <div className="container-custom mt-3">
      <div className="homeBannerWrapper">
        <Slider {...settings}>
          {bannerItems.map((banner, index) => (
            <div key={banner._id || index} className="items height">
              <img src={banner.image} className="w-100" alt={`Banner ${index + 1}`} />
            </div>
          ))}
        </Slider>
      </div>
    </div>
  );
};

export default HomeBanner;
