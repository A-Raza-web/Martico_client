 import { useState, useEffect } from "react";
import Button from "@mui/material/Button";
import { Link } from 'react-router-dom';
import { useParams } from 'react-router-dom';

import "./sideBar.css"

const SideBar =  ({ onPriceFilter, onBrandFilter }) => {
  const [priceRange, setPriceRange] = useState(200);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [selectedBrands, setSelectedBrands] = useState([]);
  const { id: activeId } = useParams();

  const applyPriceFilter = () => {
    onPriceFilter(priceRange); 
  };

  const applyBrandFilter = () => {
    onBrandFilter(selectedBrands);
  };

  const handleBrandClick = (brand) => {
    setSelectedBrands(prev => {
      const newSelection = prev.includes(brand)
        ? prev.filter(b => b !== brand)
        : [...prev, brand];
      
      // Apply filter immediately when selection changes
      onBrandFilter(newSelection);
      return newSelection;
    });
  };

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('http://localhost:4000/api/categories');
        const json = await res.json();
        setCategories(json.data || json);
      } catch (e) {}
    };
    
    const fetchBrands = async () => {
      try {
        const res = await fetch('http://localhost:4000/api/products/brands');
        const json = await res.json();
        if (json.success && Array.isArray(json.data)) {
          setBrands(json.data);
        }
      } catch (e) {
        console.error('Error fetching brands:', e);
      }
    };
    
    fetchCategories();
    fetchBrands();
  }, []);

  return(
    <>
       <div className="sideBar">
         <div  className="filterBox">
          <h6>PRODUCT CATEGORIES</h6>
          <div className='scroll'>
            <ul>
              {categories.map(cat => (
                <li key={cat._id}>
                  <Link
                    className={`catItem ${activeId === String(cat._id) ? 'active' : ''}`}
                    to={`/cat/${cat._id}`}
                  >
                    <span className="catAvatar">
                      <img src={cat.image && cat.image[0] ? cat.image[0] : 'https://via.placeholder.com/28'} alt={cat.name}/>
                    </span>
                    <span className="catName">{cat.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
         </div>
        <div className="filterBox ">
            <h6 className="filterTitle">FILTER BY PRICE</h6>

            <div className="priceSliderWrapper">
              <input
                type="range"
                min="0"
                max="200"
                value={priceRange}
                onChange={(e) => setPriceRange(e.target.value)}
                className="priceSlider"
                style={{
                  // Yeh line dynamic color update karegi
                  background: `linear-gradient(to right, #2DE1C2 0%, #2DE1C2 ${(priceRange / 200) * 100}%, #e0e0e0 ${(priceRange / 200) * 100}%, #e0e0e0 100%)`
                }}
              />
            </div>

            <div className="priceValues">
              <span>$0</span>
              <span className="activePrice">${priceRange}</span>
            </div>

            <Button
              variant="contained"
              size="small"
              className="filterBtn"
              onClick={applyPriceFilter}
            >
              <span className='Apply_fil'>Apply Filter</span>
            </Button>
        </div>
        <div  className="filterBox ">
          <h6>BRANDS</h6>
          <div className='scroll'>
            <ul className="brandList">
              {brands.map((brand) => (
                <li key={brand}>
                  <button
                    className={`brandItem ${selectedBrands.includes(brand) ? 'selected' : ''}`}
                    onClick={() => handleBrandClick(brand)}
                  >
                    <span className="brandName">{brand}</span>
                    {selectedBrands.includes(brand) && (
                      <span className="brandCheck">✓</span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="sideBarBanner">
            <Link to="#">
            <img src="https://api.spicezgold.com/download/file_1734525767798_NewProject(35).jpg"/>
            </Link> 
        </div>
        <div>
            <Link to="#">
            <img src="https://api.spicezgold.com/download/file_1734525767798_NewProject(35).jpg"/>
            </Link> 
        </div>
       </div>
       
    </>
  )
}
export default SideBar;
