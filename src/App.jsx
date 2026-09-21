import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout.jsx'
import Home from './pages/Home.jsx'
import Browse from './pages/Browse.jsx'
import SellInfo from './pages/SellInfo.jsx'
import SellForm from './pages/SellForm.jsx'
import ListingDetail from './pages/ListingDetail.jsx'
import OpenBox from './pages/OpenBox.jsx'
import Cart from './pages/Cart.jsx'
import MyOrders from './pages/MyOrders.jsx'
import Wishlist from './pages/Wishlist.jsx'
import Admin from './pages/Admin.jsx'
import AdminActivity from './pages/AdminActivity.jsx'
import AboutUs from './pages/AboutUs.jsx'
import HowItWorks from './pages/HowItWorks.jsx'
import ContactUs from './pages/ContactUs.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Profile from './pages/Profile.jsx'

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        <Route path="/" element={<Home />} />
        <Route path="/browse" element={<Browse />} />
        <Route path="/sell" element={<SellInfo />} />
        <Route path="/sell/list" element={<SellForm />} />
        <Route path="/listing/:id" element={<ListingDetail />} />
        <Route path="/order/:id" element={<OpenBox />} />
        <Route path="/cart" element={<Cart />} />
        <Route path="/orders" element={<MyOrders />} />
        <Route path="/wishlist" element={<Wishlist />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="/admin/activity" element={<AdminActivity />} />
        <Route path="/about" element={<AboutUs />} />
        <Route path="/how-it-works" element={<HowItWorks />} />
        <Route path="/contact" element={<ContactUs />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/profile" element={<Profile />} />
      </Route>
    </Routes>
  )
}
