import { useState, useEffect } from "react";
import { FaAngleDown } from "react-icons/fa";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import { IoSearch } from "react-icons/io5";
import axios from "axios";
import "./Countrydorp.css";

const Countrydorp = () => {
  const [open, setOpen] = useState(false);
  const [selectedCity, setSelectedCity] = useState(""); // Initially empty
  const [search, setSearch] = useState("");
  const [cities, setCities] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // 🌍 API se data fetch karna
  useEffect(() => {
    const fetchCities = async () => {
      setLoading(true);
      setError("");
      try {
        const response = await axios.get("https://countriesnow.space/api/v0.1/countries");
        const cityList = response.data.data.map((country) => country.country);
        setCities(cityList);
      } catch (err) {
        setError("Failed to load countries. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchCities();
  }, []);

  // ✅ Agar naam 10 letters se zyada ho to substr + dots
  const displayCity = selectedCity
    ? selectedCity.length > 10
      ? selectedCity.substring(0, 10) + "..."
      : selectedCity
    : "Select Location"; // Default text

  const filteredCities = cities.filter((city) =>
    city.toLowerCase().includes(search.toLowerCase())
  );

  const handleOpen = () => setOpen(true);
  const handleClose = () => setOpen(false);

  const handleSelectCity = (city) => {
    setSelectedCity(city);
    setOpen(false);
  };

  return (
    <>
      {/* 🌍 Location Button */}
      <Button className="countrydrop btn1" onClick={handleOpen}>
        <div className="info">
          <span className="label">Your Location</span>
          <span className="name">{displayCity}</span>
        </div>
        <span className="icon">
          <FaAngleDown size={16} />
        </span>
      </Button>

      {/* 📍 Location Dialog */}
      <Dialog
        open={open}
        onClose={handleClose}
        className="locationModel"
        maxWidth="sm"
        fullWidth
        PaperProps={{
          className: "locationDialogPaper",
        }}
      >
        <DialogTitle className="dialogTitle">
          Choose Your Delivery Location
        </DialogTitle>

        <DialogContent>
          <p className="dialogDescription">
            Enter your city and we’ll show offers available in your area.
          </p>

          {/* 🔍 Search Input */}
          <div className="headerSearch">
            <input
              type="text"
              placeholder="Search for your city..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
            <Button variant="contained" className="searchBtn">
              <IoSearch  className="searchIcon "searchIcon  />
            </Button>
          </div>

          {/* 🏙️ City List */}
          <div className="cityList">
            {loading ? (
              <p className="loadingText">Loading countries...</p>
            ) : error ? (
              <p className="errorText">{error}</p>
            ) : filteredCities.length > 0 ? (
              filteredCities.map((city) => (
                <div
                  key={city}
                  onClick={() => handleSelectCity(city)}
                  className="cityItem"
                >
                  {city}
                </div>
              ))
            ) : (
              <p className="noCity">No countries found</p>
            )}
          </div>

          {/* 🔘 Close Button */}
          <div className="closeBtnWrapper">
            <Button
              onClick={handleClose}
              variant="outlined"
              className="closeBtn1"
            >
              Close
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default Countrydorp;
