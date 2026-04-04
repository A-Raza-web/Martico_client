import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Heart, ShoppingBag, Trash2 } from "lucide-react";
import Box from "@mui/material/Box";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import "./MyList.css";
import { syncMyListIds, unmarkInMyList } from "../../utils/myList";

const MYLIST_API_BASE = "https://martico-server.vercel.app/api/mylist";

const toPrice = (value) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
};

const getCategoryLabel = (item) => {
  const raw = item?.category;
  if (!raw) return "Other";
  if (typeof raw === "string") return raw;
  if (typeof raw === "object") {
    return raw.name || raw.title || raw.label || "Other";
  }
  return "Other";
};

const truncateWords = (text, wordLimit = 3) => {
  if (!text) return "";
  const words = String(text).trim().split(/\s+/);
  if (words.length <= wordLimit) return words.join(" ");
  return `${words.slice(0, wordLimit).join(" ")}...`;
};

const MyList = () => {
  const [items, setItems] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState("");

  const userId =
    localStorage.getItem("userId") ||
    localStorage.getItem("guestUserId");

  const fetchMyList = async () => {
    if (!userId) {
      setItems([]);
      setLoading(false);
      setError("Please sign in to view your list.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const res = await fetch(`${MYLIST_API_BASE}/user/${userId}`);
      const json = await res.json();

      if (!res.ok || !json?.success) {
        throw new Error(json?.message || "Failed to load your list.");
      }

      const listItems = Array.isArray(json.data) ? json.data : [];
      setItems(listItems);
      syncMyListIds(listItems);
    } catch (err) {
      setItems([]);
      setError(err.message || "Failed to load your list.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyList();
  }, [userId]);

  const stats = useMemo(() => {
    const total = items.reduce((sum, item) => sum + toPrice(item.price || item.newPrice || 0), 0);
    return {
      count: items.length,
      total
    };
  }, [items]);

  const categories = useMemo(() => {
    const unique = items.map((item) => getCategoryLabel(item));
    return ["All", ...Array.from(new Set(unique))];
  }, [items]);

  const activeCategory = categories[tabValue] || "All";
  const visibleItems = activeCategory === "All"
    ? items
    : items.filter((item) => getCategoryLabel(item) === activeCategory);

  const handleRemove = async (id, productId) => {
    try {
      setDeletingId(id);
      const res = await fetch(`${MYLIST_API_BASE}/delete/${id}`, {
        method: "DELETE"
      });
      const json = await res.json();

      if (!res.ok || !json?.success) {
        throw new Error(json?.message || "Failed to remove item.");
      }

      setItems((prev) => prev.filter((item) => (item._id || item.id) !== id));
      if (productId) {
        unmarkInMyList(productId);
      }
      window.dispatchEvent(new Event("myListUpdated"));
    } catch (err) {
      setError(err.message || "Failed to remove item.");
    } finally {
      setDeletingId("");
    }
  };

  return (
    <section className="myListPage">
      <div className="container myListContainer">
        <div className="myListTopActions">
          <Link to="/" className="myListBackBtn">
            <ArrowLeft size={16} />
            Back to Home
          </Link>
        </div>

        <div className="myListHero">
          <div>
            <p className="myListTag">My List</p>
            <h2>Saved Items</h2>
            <p>Keep your favorite products here and shop anytime.</p>
          </div>
          <div className="myListStat">
            <span>Total Items</span>
            <strong>{stats.count}</strong>
          </div>
        </div>

        <div className="myListSummary">
          <div className="summaryCard">
            <div>
              <span>Estimated Total</span>
              <strong>${stats.total.toFixed(2)}</strong>
            </div>
            <div className="summaryIcon">
              <ShoppingBag size={18} />
            </div>
          </div>
          <div className="summaryCard highlight">
            <div>
              <span>Wishlist Status</span>
              <strong>Ready to Shop</strong>
            </div>
            <div className="summaryIcon">
              <Heart size={18} />
            </div>
          </div>
        </div>

        {error && <p className="myListAlert">{error}</p>}

        <Box className="myListTabs">
          <Tabs
            value={tabValue}
            onChange={(_, newValue) => setTabValue(newValue)}
            variant="scrollable"
            scrollButtons="auto"
            aria-label="my list categories"
          >
            {categories.map((label) => (
              <Tab key={label} label={label} />
            ))}
          </Tabs>
        </Box>

        {loading ? (
          <div className="myListEmpty">
            <p>Loading your list...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="myListEmpty">
            <Heart size={28} />
            <p>Your list is empty. Start adding your favorite products.</p>
            <Link to="/" className="myListBrowseBtn">Browse Products</Link>
          </div>
        ) : (
          <div className="myListGrid">
            {visibleItems.map((item) => {
              const id = item._id || item.id;
              const name = item.name || "Product";
              const brand = item.brand || "";
              const price = toPrice(item.price || item.newPrice || 0);
              const image = item.image || item.img || (item.images && item.images[0] && item.images[0].url) || "https://via.placeholder.com/120";
              const displayName = truncateWords(name, 8);
              const productId = item.productId?._id || item.productId;

              return (
                <article className="myListCard" key={id}>
                  <div className="cardTopRow">
                    <img src={image} alt={name} />
                    <button
                      className="removeBtn"
                      onClick={() => handleRemove(id, productId)}
                      disabled={deletingId === id}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="cardBody">
                    <h4>{displayName}</h4>
                    {brand && <span className="brandTag">{brand}</span>}
                    <div className="priceRow">
                      <span className="price">${price.toFixed(2)}</span>
                      <span className="status">In stock</span>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
};

export default MyList;
