import Button from '@mui/material/Button';
import { IoIosMenu } from "react-icons/io";
import { FaAngleDown } from "react-icons/fa6";
import { Link } from 'react-router-dom';
import {
  CiHome,
  CiShoppingTag,
  CiLaptop,
  CiPizza,
  CiMobile3,
  CiRead,
  CiPhone,
} from "react-icons/ci"; // Outline Icons
import { useState, useEffect } from 'react';

const Navication = () => {
  const [isopenSidebarVal, setisopenSidebarVal] = useState(false);
  const [categories, setCategories] = useState([]);
  const [subCategories, setSubCategories] = useState([]);
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [hoveredSidebarCategory, setHoveredSidebarCategory] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await fetch('http://localhost:4000/api/categories');
        const json = await res.json();
        setCategories(json.data || json);
      } catch (err) {
        console.error('Error fetching categories:', err);
      }
    };
    const fetchSubCategories = async () => {
      try {
        const res = await fetch('http://localhost:4000/api/subcategories');
        const json = await res.json();
        setSubCategories(json.data || json);
      } catch (err) {
        console.error('Error fetching subcategories:', err);
      }
    };
    fetchCategories();
    fetchSubCategories();
  }, []);


  return (
    <nav className="custom-navbar py-2 shadow-sm">
      <div className='container navbar'>
        <div className='row align-items-center'>

          {/* Left Section */}
          <div className='col-sm-3 navPart1 d-flex align-items-center'>
            <div className='cadWrapper'>
              <Button className='allCatTab align-items-center px-3 py-2'
                onClick={() => setisopenSidebarVal(!isopenSidebarVal)}
              >
                <span className='icon1 mr-1'><IoIosMenu /></span>
                <span className='text font-weight-bold'>All CATEGORIES</span>
                <span className='icon2 ml-1'><FaAngleDown /></span>
              </Button>
              <div >
                <ul className={`sidebarNav ${isopenSidebarVal ? 'open' : ''}`}>
                  <li><Link to="/"><CiHome size={22} /><span>Home</span></Link></li>
                  {categories.length > 0 ? (
                    categories.map((cat) => (
                      <li 
                        key={cat._id}
                        onMouseEnter={() => setHoveredSidebarCategory(cat._id)}
                        onMouseLeave={() => setHoveredSidebarCategory(null)}
                        className='category-item'
                      >
                        <Link to={`/cat/${cat._id}`}>
                          <img
                            src={cat.image && cat.image[0] ? cat.image[0] : "https://via.placeholder.com/22"}
                            alt={cat.name}
                            style={{ width: 22, height: 22, objectFit: 'cover', borderRadius: 4, marginRight: 6 }}
                          />
                          <span>{cat.name}</span>
                        </Link>
                        {subCategories.filter(sub => sub.category === cat._id || sub.category?._id === cat._id).length > 0 && hoveredSidebarCategory === cat._id && (
                          <ul className='sidebar-submenu-list'>
                            {subCategories
                              .filter(sub => sub.category === cat._id || sub.category?._id === cat._id)
                              .map((sub) => (
                                <li key={sub._id}>
                                  <Link to={`/subcat/${sub._id}`}>
                                    <span>{sub.name}</span>
                                  </Link>
                                </li>
                              ))}
                          </ul>
                        )}
                      </li>
                    ))
                  ) : (
                    <>
                      <li><Link to="/cat/fashion"><CiShoppingTag size={22} /><span>Fashion</span></Link></li>
                      <li><Link to="/cat/electronic"><CiLaptop size={22} /><span>Electronic</span></Link></li>
                      <li><Link to="/cat/bakery"><CiPizza size={22} /><span>Bakery</span></Link></li>
                      <li><Link to="/cat/mobiles"><CiMobile3 size={22} /><span>Mobiles</span></Link></li>
                      <li><Link to="/cat/books"><CiRead size={22} /><span>Books</span></Link></li>
                      <li><Link to="/cat/phones"><CiPhone size={22} /><span>Phones</span></Link></li>
                    </>
                  )}
                </ul>

              </div>
            </div>
          </div>

          {/* Right Section */}
          <div className='col-sm-9 navPart2 d-flex align-items-center justify-content-end navpart2'>
            <ul className="list list-inline d-flex align-items-center justify-content-end mb-0">

              {categories.length > 0 ? (
                categories.slice(0, 7).map((cat) => {
                  const catSubCats = subCategories.filter(sub => sub.category === cat._id || sub.category?._id === cat._id);
                  return (
                  <li 
                    key={cat._id} 
                    className='list-line-items'
                    onMouseEnter={() => setHoveredCategory(cat._id)}
                    onMouseLeave={() => setHoveredCategory(null)}
                  >
                    <Link to={`/cat/${cat._id}`}>
                      <img
                        src={cat.image && cat.image[0] ? cat.image[0] : "https://via.placeholder.com/22"}
                        alt={cat.name}
                        style={{ width: 22, height: 22, objectFit: 'cover', borderRadius: 4, marginRight: 6 }}
                      />
                      <span>{cat.name}</span>
                    </Link>
                    <div className='subMenu shadow'>
                      {catSubCats.length > 0 ? (
                        catSubCats.map((sub) => (
                          <Link key={sub._id} to={`/subcat/${sub._id}`}>
                            <span>{sub.name}</span>
                          </Link>
                        ))
                      ) : (
                        <>
                          <Link to="/cat/clothing"><span>clothing</span></Link>
                          <Link to="/cat/footwear"><span>footwear</span></Link>
                          <Link to="/cat/watches"><span>watches</span></Link>
                        </>
                      )}
                    </div>
                  </li>
                  );
                })
              ) : (
                <>
                  <li className='list-line-items '>
                    <Link to="/cat/fashion"><CiShoppingTag size={22} /> <span>Fashion</span></Link>
                    <div className='subMenu shadow'>
                      <Link to="/cat/clothing"> <span>clothing</span></Link>
                      <Link to="/cat/footwear"> <span>footwear</span></Link>
                      <Link to="/cat/watches"> <span>watches</span></Link>
                      <Link to="/cat/clothing"> <span>clothing</span></Link>
                      <Link to="/cat/footwear"> <span>footwear</span></Link>
                      <Link to="/cat/watches"> <span>watches</span></Link>
                    </div>
                  </li>

                  <li className='list-line-items'>
                    <Link to="/cat/electronic"><CiLaptop size={22} /> <span>Electronic</span></Link>
                    <div className='subMenu shadow'>
                      <Link to="/cat/clothing"> <span>clothing</span></Link>
                      <Link to="/cat/footwear"> <span>footwear</span></Link>
                      <Link to="/cat/watches"> <span>watches</span></Link>
                      <Link to="/cat/clothing"> <span>clothing</span></Link>
                      <Link to="/cat/footwear"> <span>footwear</span></Link>
                      <Link to="/cat/watches"> <span>watches</span></Link>
                    </div>
                  </li>

                  <li className='list-line-items '>
                    <Link to="/cat/bakery"><CiPizza size={22} /> <span>Bakery</span></Link>
                    <div className='subMenu shadow'>
                      <Link to="/cat/clothing"> <span>clothing</span></Link>
                      <Link to="/cat/footwear"> <span>footwear</span></Link>
                      <Link to="/cat/watches"> <span>watches</span></Link>
                      <Link to="/cat/clothing"> <span>clothing</span></Link>
                      <Link to="/cat/footwear"> <span>footwear</span></Link>
                      <Link to="/cat/watches"> <span>watches</span></Link>
                    </div>
                  </li>

                  <li className='list-line-items '>
                    <Link to="/cat/mobiles"><CiMobile3 size={22} /> <span>Mobiles</span></Link>
                    <div className='subMenu shadow'>
                      <Link to="/cat/clothing"> <span>clothing</span></Link>
                      <Link to="/cat/footwear"> <span>footwear</span></Link>
                      <Link to="/cat/watches"> <span>watches</span></Link>
                      <Link to="/cat/clothing"> <span>clothing</span></Link>
                      <Link to="/cat/footwear"> <span>footwear</span></Link>
                      <Link to="/cat/watches"> <span>watches</span></Link>
                    </div>
                  </li>
                  
                  <li className='list-line-items '>
                    <Link to="/cat/books"><CiRead size={22} /> <span>Books</span></Link>
                    <div className='subMenu shadow'>
                      <Link to="/cat/fiction"> <span>fiction</span></Link>
                      <Link to="/cat/non-fiction"> <span>non-fiction</span></Link>
                      <Link to="/cat/children"> <span>children</span></Link>
                    </div>
                  </li>

                  <li className='list-line-items '>
                    <Link to="/cat/phones"><CiPhone size={22} /> <span>Phones</span></Link>
                    <div className='subMenu shadow'>
                      <Link to="/cat/android"> <span>android</span></Link>
                      <Link to="/cat/ios"> <span>ios</span></Link>
                      <Link to="/cat/accessories"> <span>accessories</span></Link>
                    </div>
                  </li>
                </>
              )}

            </ul>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navication;
