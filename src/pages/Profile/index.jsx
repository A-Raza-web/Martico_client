import { useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from "axios";
import { FaCloudUploadAlt } from "react-icons/fa";
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Backdrop from '@mui/material/Backdrop';
import CircularProgress from '@mui/material/CircularProgress';
import {
  ArrowLeft,
  Mail,
  Phone,
  MapPin,
  CalendarDays,
  BadgeCheck,
  Bell,
  Heart,
  Package,
  ShieldCheck,
  CreditCard
} from 'lucide-react';
import './Profile.css';

const mockOrders = [
  { id: 'ORD-1042', date: 'Mar 03, 2026', status: 'Delivered', total: '$128.00' },
  { id: 'ORD-1039', date: 'Feb 25, 2026', status: 'Shipped', total: '$79.99' },
  { id: 'ORD-1032', date: 'Feb 10, 2026', status: 'Processing', total: '$46.50' }
];

const readUser = () => {
  try {
    const userData = localStorage.getItem('user');
    const parsedUser = userData ? JSON.parse(userData) : null;
    if (parsedUser?.authProvider === 'firebase') {
      return parsedUser;
    }
    if (parsedUser && !parsedUser._id) {
      const storedUserId = localStorage.getItem('userId');
      if (storedUserId) {
        parsedUser._id = storedUserId;
      }
    }
    return parsedUser;
  } catch {
    return null;
  }
};


const Profile = () => {
  const [user, setUser] = useState(readUser);
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSecurityOpen, setIsSecurityOpen] = useState(false);
  const [isPaymentOpen, setIsPaymentOpen] = useState(false);
  const [isAvatarUploading, setIsAvatarUploading] = useState(false);
  const [isProfileSaving, setIsProfileSaving] = useState(false);
  const fileInputRef = useRef(null);
  const [formValues, setFormValues] = useState({
    name: user?.name || 'Guest User',
    email: user?.email || 'guest@example.com',
    phone: user?.phone || '',
    city: user?.city || 'New York',
    country: user?.country || 'United States',
    address: user?.address || ''
  });

  const userName = user?.name || 'Guest User';
  const userEmail = user?.email || 'guest@example.com';
  const userPhone = user?.phone || '+1 (555) 013-8023';
  const userLocation = `${user?.city || 'New York'}, ${user?.country || 'United States'}`;
  const userAvatar = user?.avatar || '';
  const userJoinDate = user?.createdAt
    ? new Date(user.createdAt).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'short',
        day: '2-digit'
      })
    : '—';
   
  const handleAvatarChange = async (event) => {
    const file = event.target.files?.[0];
    if (!file || !file.type.startsWith("image/")) return;

    setIsAvatarUploading(true);
    const convertToBase64 = (selectedFile) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(selectedFile);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
      });
    };

    try {
      const base64Image = await convertToBase64(file);
      if (!user?._id || user?.authProvider === 'firebase') {
        persistUser({ ...(user || {}), profileImage: base64Image });
        event.target.value = "";
        return;
      }
      const res = await axios.put(
        `martico-server.vercel.app/api/auth/update-profile/${user._id}`,
        { profileImage: base64Image }
      );

      const updatedUser = res.data?.user;

      if (updatedUser) {
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
      }
    } catch (error) {
      console.error(error);
      alert("Profile image upload failed!");
    } finally {
      setIsAvatarUploading(false);
    }
    event.target.value = "";
  };

  const persistUser = (updatedUser) => {
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const openEditDialog = () => {
    setFormValues({
      name: user?.name || 'Guest User',
      email: user?.email || 'guest@example.com',
      phone: user?.phone || '',
      city: user?.city || 'New York',
      country: user?.country || 'United States',
      address: user?.address || ''
    });
    setIsEditOpen(true);
  };

  const closeEditDialog = () => setIsEditOpen(false);
  const openNotificationsDialog = () => setIsNotificationsOpen(true);
  const closeNotificationsDialog = () => setIsNotificationsOpen(false);
  const openSecurityDialog = () => setIsSecurityOpen(true);
  const closeSecurityDialog = () => setIsSecurityOpen(false);
  const openPaymentDialog = () => setIsPaymentOpen(true);
  const closePaymentDialog = () => setIsPaymentOpen(false);

  const handleFieldChange = (event) => {
    const { name, value } = event.target;
    setFormValues((prev) => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = async () => {
    const updatedPayload = {
      name: formValues.name.trim() || 'Guest User',
      email: formValues.email.trim() || 'guest@example.com',
      phone: formValues.phone.trim(),
      city: formValues.city.trim() || 'New York',
      country: formValues.country.trim() || 'United States',
      address: formValues.address.trim()
    };

    if (!user?._id || user?.authProvider === 'firebase') {
      persistUser({ ...(user || {}), ...updatedPayload });
      setIsEditOpen(false);
      return;
    }

    try {
      setIsProfileSaving(true);
      const res = await axios.put(
        `martico-server.vercel.app/api/auth/update-profile/${user._id}`,
        updatedPayload
      );

      if (res.data?.success && res.data?.user) {
        persistUser(res.data.user);
      } else {
        persistUser({ ...(user || {}), ...updatedPayload });
      }
      setIsEditOpen(false);
    } catch (error) {
      console.error(error);
      alert("Profile update failed!");
    } finally {
      setIsProfileSaving(false);
    }
  };

 const openImagePicker = () => {
   if (!isAvatarUploading) fileInputRef.current?.click();
 };

  
  return (
    <section className="profilePage">
      <div className="container profileContainer">
        <div className="profileTopAction">
          <Link to="/" className="backHomeBtn">
            <ArrowLeft size={16} />
            Back to Home
          </Link>
        </div>
        <div className="profileHero">
          <div className="profileTopRow">
            <div className="avatarBlock">
              <div className="profileAvatar" onClick={openImagePicker}>
                {user?.profileImage ? (
                  <img src={user.profileImage} alt={userName} className="profileAvatarImage" />
                ) : (
                  <span className="profileAvatarInitial">{userName.charAt(0).toUpperCase()}</span>
                )}
                <span className="avatarUploadOverlay" aria-hidden="true">
                  <FaCloudUploadAlt size={28} />
                </span>
              </div>
             
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleAvatarChange}
                disabled={isAvatarUploading}
                className="avatarInput"
              />
            </div>
            <div>
              <p className="profileTag">Personal Profile</p>
              <h2>{userName}</h2>
              <p className="profileSubText">Manage your account, orders and preferences.</p>
            </div>
          </div>
          <div className="profileQuickStats">
            <div>
              <span>Orders</span>
              <strong>18</strong>
            </div>
            <div>
              <span>Wishlist</span>
              <strong>42</strong>
            </div>
            <div>
              <span>Reward Points</span>
              <strong>5,280</strong>
            </div>
          </div>
        </div>

        <div className="profileGrid">
          <article className="profileCard">
            <div className="cardTitleRow">
              <h4>Contact Details</h4>
              <BadgeCheck size={18} />
            </div>
            <ul className="infoList">
              <li><Mail size={16} /> {userEmail}</li>
              <li><Phone size={16} /> {userPhone}</li>
              <li><MapPin size={16} /> {userLocation}</li>
              <li><CalendarDays size={16} /> Joined {userJoinDate}</li>
            </ul>
            <button className="primaryAction" onClick={openEditDialog}>Edit Profile</button>
          </article>

          <article className="profileCard">
            <div className="cardTitleRow">
              <h4>Account Settings</h4>
            </div>
            <div className="actionGrid">
              <button type="button" className="actionChip" onClick={openNotificationsDialog}>
                <Bell size={16} /> Notifications
              </button>
              <button type="button" className="actionChip" onClick={openSecurityDialog}>
                <ShieldCheck size={16} /> Security
              </button>
              <button type="button" className="actionChip" onClick={openPaymentDialog}>
                <CreditCard size={16} /> Payment Methods
              </button>
              <Link to="/my-list" className="actionChip"><Heart size={16} /> Saved Items</Link>
            </div>
          </article>
        </div>

        <article className="profileCard ordersCard">
          <div className="cardTitleRow">
            <h4>Recent Orders</h4>
            <Link to="/orders" className="viewAllLink">View All Orders</Link>
          </div>
          <div className="ordersTable">
            {mockOrders.map((order) => (
              <div className="orderRow" key={order.id}>
                <div className="orderId"><Package size={16} /> {order.id}</div>
                <div>{order.date}</div>
                <div className={`statusBadge ${order.status.toLowerCase()}`}>{order.status}</div>
                <div>{order.total}</div>
              </div>
            ))}
          </div>
        </article>
      </div>

      <Dialog open={isEditOpen} onClose={closeEditDialog} maxWidth="sm" fullWidth className="profileDialog">
        <DialogTitle>Edit Profile</DialogTitle>
        <DialogContent>
          <div className="profileFormGrid">
            <TextField
              label="Full Name"
              name="name"
              value={formValues.name}
              onChange={handleFieldChange}
              fullWidth
              size="small"
            />
            <TextField
              label="Email"
              name="email"
              type="email"
              value={formValues.email}
              onChange={handleFieldChange}
              fullWidth
              size="small"
            />
            <TextField
              label="Phone Number"
              name="phone"
              value={formValues.phone}
              onChange={handleFieldChange}
              fullWidth
              size="small"
            />
            <TextField
              label="City"
              name="city"
              value={formValues.city}
              onChange={handleFieldChange}
              fullWidth
              size="small"
            />
            <TextField
              label="Country"
              name="country"
              value={formValues.country}
              onChange={handleFieldChange}
              fullWidth
              size="small"
            />
            <TextField
              label="Address"
              name="address"
              value={formValues.address}
              onChange={handleFieldChange}
              fullWidth
              size="small"
              multiline
              minRows={3}
            />
          </div>
        </DialogContent>
        <DialogActions className="profileDialogActions">
          <Button onClick={closeEditDialog} variant="outlined" className="dialogBtn dialogBtnCancel">Cancel</Button>
          <Button
            onClick={handleSaveProfile}
            variant="contained"
            className="dialogBtn dialogBtnSave"
            disabled={isProfileSaving}
          >
            {isProfileSaving ? 'Saving...' : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={isNotificationsOpen} onClose={closeNotificationsDialog} maxWidth="sm" fullWidth className="profileDialog">
        <DialogTitle>Notifications</DialogTitle>
        <DialogContent dividers>
          <div className="dialogEmpty">
            <div className="dialogEmptyIcon">
              <Bell size={28} />
            </div>
            <div className="dialogEmptyTitle">All caught up</div>
            <div className="dialogEmptySubtitle">
              You don’t have any notifications right now. We’ll let you know when something arrives.
            </div>
          </div>
        </DialogContent>
        <DialogActions className="profileDialogActions">
          <Button onClick={closeNotificationsDialog} variant="outlined" className="dialogBtn dialogBtnCancel">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={isSecurityOpen} onClose={closeSecurityDialog} maxWidth="sm" fullWidth className="profileDialog">
        <DialogTitle>Security</DialogTitle>
        <DialogContent dividers>
          <div className="dialogEmpty">
            <div className="dialogEmptyIcon">
              <ShieldCheck size={28} />
            </div>
            <div className="dialogEmptyTitle">Security tools coming soon</div>
            <div className="dialogEmptySubtitle">
              You’ll be able to manage password, devices, and login activity here.
            </div>
          </div>
        </DialogContent>
        <DialogActions className="profileDialogActions">
          <Button onClick={closeSecurityDialog} variant="outlined" className="dialogBtn dialogBtnCancel">
            Close
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={isPaymentOpen} onClose={closePaymentDialog} maxWidth="sm" fullWidth className="profileDialog">
        <DialogTitle>Payment Methods</DialogTitle>
        <DialogContent dividers>
          <div className="dialogEmpty">
            <div className="dialogEmptyIcon">
              <CreditCard size={28} />
            </div>
            <div className="dialogEmptyTitle">No saved payments</div>
            <div className="dialogEmptySubtitle">
              Add a payment method at checkout to save it here for faster purchases.
            </div>
          </div>
        </DialogContent>
        <DialogActions className="profileDialogActions">
          <Button onClick={closePaymentDialog} variant="outlined" className="dialogBtn dialogBtnCancel">
            Close
          </Button>
        </DialogActions>
      </Dialog>
      <Backdrop
        sx={{ color: '#fff', zIndex: (theme) => theme.zIndex.modal + 10 }}
        open={isAvatarUploading || isProfileSaving}
      >
        <CircularProgress color="inherit" />
      </Backdrop>
    </section>
  );
};

export default Profile;
