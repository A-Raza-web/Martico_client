import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Button from '@mui/material/Button';
import { LuSearch } from "react-icons/lu";
import './search.css';

const SearchBar = () => {

  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  // 🔍 Handle Search Button Click
  const handleSearch = () => {
    if (!search.trim()) return;
    const query = encodeURIComponent(search.trim());
    navigate(`/search?q=${query}`);
  };

  return (
    <div className='headerSearch ml-3 mr-3'>
      
      {/* Input */}
      <input
        type='text'
        placeholder='Search for products...'
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            handleSearch();
          }
        }}
      />

      {/* Button */}
      <Button onClick={handleSearch}>
        <LuSearch />
      </Button>

    </div>
  );
}

export default SearchBar;
