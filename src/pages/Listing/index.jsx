import SideBar from "../../components/List_SideBar";
import ContentRight from "../../components/List-content_right"
import { useLocation, useParams } from "react-router-dom";

import { useState } from "react";
 
const Listing = () => {
  const { id } = useParams();
  const location = useLocation();
  const isSubCategoryRoute = location.pathname.toLowerCase().startsWith('/subcat/');
  const categoryId = !isSubCategoryRoute && id !== 'all' ? id : null;
  const subCategoryId = isSubCategoryRoute ? id : null;
  const [priceFilter, setPriceFilter] = useState(null);
  const [brandFilter, setBrandFilter] = useState(null);

  const handlePriceFilter = (maxPrice) => {
    setPriceFilter(maxPrice);
  };

  const handleBrandFilter = (brands) => {
    setBrandFilter(brands);
  };

  return(
    <>
      <section className="product_listing_page">
        <div className="container">
          <div className="productListing d-flex">
              <SideBar onPriceFilter={handlePriceFilter} onBrandFilter={handleBrandFilter}/>
              <ContentRight
                categoryId={categoryId}
                subCategoryId={subCategoryId}
                priceFilter={priceFilter}
                brandFilter={brandFilter}
              />
          </div>
        </div>
      </section>  
    </>
  )
 }
 export default Listing;
