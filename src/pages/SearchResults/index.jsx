import SideBar from "../../components/List_SideBar";
import ContentRight from "../../components/List-content_right";
import { useLocation } from "react-router-dom";
import { useMemo, useState } from "react";

const SearchResults = () => {
  const location = useLocation();
  const query = useMemo(() => {
    const params = new URLSearchParams(location.search);
    return params.get("q") || "";
  }, [location.search]);

  const [priceFilter, setPriceFilter] = useState(null);
  const [brandFilter, setBrandFilter] = useState(null);

  const handlePriceFilter = (maxPrice) => {
    setPriceFilter(maxPrice);
  };

  const handleBrandFilter = (brands) => {
    setBrandFilter(brands);
  };

  return (
    <section className="product_listing_page">
      <div className="container">
        <div className="productListing d-flex">
          <SideBar onPriceFilter={handlePriceFilter} onBrandFilter={handleBrandFilter} />
          <ContentRight
            categoryId={null}
            priceFilter={priceFilter}
            brandFilter={brandFilter}
            searchQuery={query}
          />
        </div>
      </div>
    </section>
  );
};

export default SearchResults;
