import { useState, useEffect } from "react";
import { FaStar } from "react-icons/fa";
import axios from "axios";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import "./ReviewSection.css";

const ReviewSection = ({ product }) => {
  const [reviews, setReviews] = useState([]);
  const [message, setMessage] = useState("");
  const [rating, setRating] = useState(0);
  const [avgRating, setAvgRating] = useState(product?.rating || 0);
  const [reviewCount, setReviewCount] = useState(0);

  const API_BASE = "http://localhost:4000/api/reviews";
  const storedUser = (() => {
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  })();
  const reviewerName = storedUser?.name?.trim() || storedUser?.email?.trim() || "Anonymous";

  // Fetch reviews from backend
  useEffect(() => {
    if (!product?._id) return;

    const fetchReviews = async () => {
      try {
        const res = await axios.get(`${API_BASE}/${product._id}`);
        if (res.data.success) {
          setReviews(res.data.reviews);
          setAvgRating(product.rating || 0);
          setReviewCount(res.data.reviews.length);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchReviews();
  }, [product]);

  // Handle submit review
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validation with snackbar
    if (!message.trim()) return toast.error("Message is required!");
    if (rating === 0) return toast.error("Please select a rating!");

    try {
      const res = await axios.post(`${API_BASE}/${product._id}`, {
        name: reviewerName,
        message,
        rating
      });

      if (res.data.success) {
        setReviews([res.data.review, ...reviews]);
        setAvgRating(res.data.productRating);
        setReviewCount(prev => prev + 1);

        setMessage("");
        setRating(0);

        toast.success("Review submitted successfully!");
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to submit review.");
    }
  };

  // Rating distribution
  const ratingDistribution = [
    { label: "Five", stars: 5, percentage: avgRating >= 4 ? 70 : 30 },
    { label: "Four", stars: 4, percentage: avgRating >= 4 ? 50 : 20 },
    { label: "Three", stars: 3, percentage: 30 },
    { label: "Two", stars: 2, percentage: 15 },
    { label: "One", stars: 1, percentage: 5 },
  ];

  return (
    <section className="review-section">
      {/* Toast container for snackbar */}
      <ToastContainer
        position="top-left"
        autoClose={3000}
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        pauseOnHover
        draggable
      />

      {/* Rating Summary */}
      <div className="rating-summary">
        <div className="rating-bars">
          {ratingDistribution.map((row, index) => (
            <div key={index} className="bar-row">
              <span>{row.label}</span>
              <div className="star-icon"><FaStar /></div>
              <div className="bar-bg">
                <div className="bar-fill" style={{ width: `${row.percentage}%` }}></div>
              </div>
            </div>
          ))}
        </div>

        <div className="avg-rating-card">
          <div className="avg-value-big">{avgRating.toFixed(1)}</div>
          <div className="avg-stars-big">
            {[1, 2, 3, 4, 5].map(i => (
              <FaStar key={i} className={i <= Math.round(avgRating) ? "filled" : "empty"} />
            ))}
          </div>
          <div className="avg-count-label">{reviewCount} Ratings</div>
        </div>
      </div>

      {/* Reviews + Add Review */}
      <div className="reviews-split-layout">
        {/* Left: Feedbacks */}
        <div className="feedbacks-part">
          <h3 className="section-title">Recent Feedbacks</h3>
          <div className="feedback-list scrollable">
            {reviews.map((review, index) => (
              <div key={index} className="feedback-card">
                <div className="user-avatar">
                  <img src={review.avatar || `https://i.pravatar.cc/150?u=${review.name}`} alt={review.name} />
                </div>
                <div className="feedback-content">
                  <div className="feedback-header">
                    <h4>{review.name}</h4>
                    <div className="feedback-stars">
                      {[1,2,3,4,5].map(i => (
                        <FaStar key={i} className={i <= review.rating ? "active" : "empty"} />
                      ))}
                    </div>
                  </div>
                  <p className="feedback-text">{review.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Add Review */}
        <div className="add-review-part">
          <h3 className="section-title">Add a Review</h3>
          <form onSubmit={handleSubmit} className="add-review-form">
            <div className="form-group">
              <label>Add Your Rating *</label>
              <div className="star-rating-selector">
                {[1,2,3,4,5].map(star => (
                  <FaStar
                    key={star}
                    className={rating >= star ? "active" : ""}
                    onClick={() => setRating(star)}
                  />
                ))}
              </div>
            </div>

            <div className="form-group">
              <label>Write Your Review *</label>
              <textarea
                placeholder="Write here..."
                value={message}
                onChange={e => setMessage(e.target.value)}
              />
            </div>

            <button type="submit" className="submit-review-btn">Submit</button>
          </form>
        </div>
      </div>
    </section>
  );
};

export default ReviewSection;
