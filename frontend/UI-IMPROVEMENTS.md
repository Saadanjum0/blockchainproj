# 🎨 FoodChain UI Improvements & Role Detection System

## Overview
This document describes the comprehensive UI improvements and role detection system implemented for the FoodChain decentralized food delivery platform.

---

## ✨ Key Features Implemented

### 1. 🔐 Role Detection System
**File:** `src/hooks/useRoleDetection.js`

A custom React hook that automatically detects a user's role when they connect their MetaMask wallet:

- **Roles Supported:**
  - `none` - New user (no registration)
  - `restaurant` - Restaurant owner
  - `rider` - Delivery rider
  - `customer` - Regular customer

- **How It Works:**
  1. Checks if user is registered as a rider (via smart contract)
  2. Checks if user owns a restaurant (via localStorage + future event logs)
  3. Checks if user has placed orders (customer)
  4. Returns `none` for first-time users

**Usage:**
```javascript
import { useRoleDetection } from './hooks/useRoleDetection';

const { role, isLoading, refetch, isRegistered } = useRoleDetection();
```

---

### 2. 🎯 Welcome Screen for New Users
**File:** `src/components/WelcomeScreen.jsx`

When a new MetaMask address is detected, users see an attractive onboarding screen with three role options:

#### Features:
- **Interactive Role Cards** with hover effects
- **Visual Icons** for each role (Customer, Restaurant, Rider)
- **Feature Lists** explaining benefits of each role
- **Selection Indicator** showing active choice
- **Gradient Buttons** with smooth animations

#### User Flow:
1. User connects wallet
2. System detects no registration
3. Welcome screen appears with role options
4. User selects a role (Customer/Restaurant/Rider)
5. Automatically navigated to appropriate registration page

---

### 3. 🎨 Enhanced UI Design

#### A. Improved Header
**File:** `src/App.jsx`

- **Glassmorphism Effect:** Backdrop blur with transparency
- **Animated Logo:** Scales on hover
- **Role-Specific Navigation:**
  - Customers see: Browse, My Orders
  - Restaurants see: Browse, Dashboard (with restaurant icon)
  - Riders see: Browse, Dashboard (with bike icon)
- **Mobile Responsive:** Hamburger menu for mobile devices
- **Gradient Text:** Logo uses gradient effect

#### B. Landing Page (Not Logged In)
- **Large Animated Icon:** Pizza emoji with scale animation
- **Gradient Title:** Orange to red gradient text
- **Feature Cards:** Three cards with gradient icons
  - Customer features
  - Restaurant features  
  - Rider features
- **Hover Effects:** Cards scale and show enhanced shadows

#### C. Restaurant Cards
**File:** `src/pages/HomePage.jsx`

Enhanced restaurant listing cards with:
- **Gradient Backgrounds** on images
- **Smooth Animations:** Lift effect on hover
- **Better Typography:** Improved hierarchy
- **Status Badges:** Visual indicators for open/closed
- **Action Buttons:** Different styles for active/inactive restaurants

#### D. Form Styling
**File:** `src/index.css`

Updated global styles:
- **Gradient Buttons:** Orange to red gradient with hover effects
- **Enhanced Input Fields:** Better borders, focus states
- **Badge Components:** Success, warning, error, info badges
- **Custom Scrollbar:** Branded scrollbar with gradient
- **Smooth Animations:** Fade-in and slide-in effects

---

### 4. 📸 Image Upload System (Supabase Ready)

#### A. Restaurant Registration
**File:** `src/pages/RestaurantDashboard.jsx`

Added image upload fields:
- **Restaurant Logo/Image:** Upload field with drag-and-drop UI
- **Menu Item Images:** Each menu item can have an image
- **File Preview:** Shows selected file name
- **Future Ready:** Prepared for Supabase integration

#### B. Image Upload Component
**File:** `src/components/ImageUpload.jsx`

Reusable component features:
- **Drag & Drop UI:** Visual upload interface
- **Image Preview:** Shows selected image
- **File Validation:** Size limits (configurable)
- **Remove Functionality:** Clear selected image
- **Supabase Ready:** Documented integration steps
- **Helper Comments:** Example code for Supabase integration

**Integration Instructions Included:**
```javascript
// Component includes example code for:
// 1. Supabase client initialization
// 2. File upload to storage bucket
// 3. Getting public URL
// 4. Storing URL in blockchain metadata
```

---

### 5. 🔄 Smart Role-Based Routing

#### Address Change Detection
**File:** `src/App.jsx`

- Automatically detects when MetaMask address changes
- Re-runs role detection
- Updates UI accordingly
- Shows loading state during detection

#### Navigation Logic
```javascript
// When role detected:
- role === 'restaurant' → Show Restaurant Dashboard
- role === 'rider' → Show Rider Dashboard  
- role === 'customer' → Show Browse & My Orders
- role === 'none' → Show Welcome Screen
```

---

### 6. 📱 Responsive Design

#### Mobile Menu
- Hamburger menu on small screens
- Smooth slide-in animation
- Touch-friendly tap targets
- Same role-based navigation

#### Breakpoints
- **Mobile:** Single column layouts
- **Tablet:** 2-column grids
- **Desktop:** 3-column grids
- **Fluid Typography:** Scales with screen size

---

## 🗂️ File Structure

```
frontend/src/
├── components/
│   ├── WelcomeScreen.jsx       ← NEW: Role selection UI
│   └── ImageUpload.jsx         ← NEW: Reusable image upload
├── hooks/
│   └── useRoleDetection.js     ← NEW: Role detection hook
├── pages/
│   ├── HomePage.jsx            ← ENHANCED: Better styling
│   ├── RestaurantDashboard.jsx ← ENHANCED: Image uploads
│   └── RiderDashboard.jsx      ← ENHANCED: Registration tracking
├── App.jsx                      ← ENHANCED: Role-based routing
└── index.css                    ← ENHANCED: Better global styles
```

---

## 🎯 User Registration Flow

### New User Journey

1. **Connect Wallet**
   ```
   User clicks "Connect Wallet" button
   → MetaMask opens
   → User approves connection
   ```

2. **Role Detection**
   ```
   System checks:
   - Is user a registered rider? (Smart contract)
   - Does user own a restaurant? (Local storage + events)
   - Has user placed orders? (Local storage)
   ```

3. **Welcome Screen** (if new user)
   ```
   User sees:
   - Three role options with descriptions
   - Feature lists for each role
   - Interactive selection UI
   ```

4. **Role Selection**
   ```
   User selects role:
   → Customer: Browse restaurants immediately
   → Restaurant: Navigate to registration form
   → Rider: Navigate to rider registration form
   ```

5. **Registration**
   ```
   User fills form:
   - Restaurant: Name, description, menu, images
   - Rider: Name, vehicle type, phone
   → Submit transaction to blockchain
   → localStorage stores registration
   ```

6. **Role-Specific Dashboard**
   ```
   After registration:
   - Restaurant owners see restaurant dashboard
   - Riders see delivery dashboard
   - Customers see restaurant listings
   ```

---

## 🖼️ Supabase Integration Guide

### Current State
All image upload UI is **ready** but stores files locally (not uploaded anywhere).

### Future Integration Steps

1. **Install Supabase**
   ```bash
   npm install @supabase/supabase-js
   ```

2. **Create Supabase Project**
   - Go to supabase.com
   - Create new project
   - Get API URL and anon key

3. **Set Environment Variables**
   ```env
   REACT_APP_SUPABASE_URL=your_supabase_url
   REACT_APP_SUPABASE_KEY=your_supabase_anon_key
   ```

4. **Create Storage Bucket**
   ```sql
   -- In Supabase Dashboard:
   CREATE BUCKET images
   WITH PUBLIC ACCESS
   ```

5. **Update Code**
   ```javascript
   // See ImageUpload.jsx for complete example
   import { createClient } from '@supabase/supabase-js'
   
   const supabase = createClient(
     process.env.REACT_APP_SUPABASE_URL,
     process.env.REACT_APP_SUPABASE_KEY
   )
   
   // Upload function ready to use
   async function uploadImage(file) {
     const fileName = `${Date.now()}-${file.name}`
     const { data, error } = await supabase.storage
       .from('images')
       .upload(fileName, file)
     
     // Get public URL
     const { data: { publicUrl } } = supabase.storage
       .from('images')
       .getPublicUrl(fileName)
     
     return publicUrl // Store this in IPFS metadata
   }
   ```

6. **Storage Strategy**
   ```
   Blockchain: Stores IPFS hash with metadata
   IPFS Metadata: Contains Supabase image URLs
   Supabase: Actual image storage
   
   Example metadata:
   {
     "name": "Pizza Paradise",
     "description": "Best pizza in town",
     "logo": "https://supabase.co/storage/v1/object/public/images/logo.jpg",
     "menuItems": [
       {
         "name": "Margherita",
         "price": 0.002,
         "image": "https://supabase.co/storage/.../pizza.jpg"
       }
     ]
   }
   ```

---

## 🎨 Design System

### Color Palette
```css
Primary: Orange (#ea580c) to Red (#dc2626) gradient
Secondary: Gray scale (#1f2937 to #f9fafb)
Success: Green (#10b981)
Warning: Yellow (#f59e0b)
Error: Red (#ef4444)
Info: Blue (#3b82f6)
```

### Typography
```css
Headings: Bold, gradient text for main titles
Body: Regular weight, good contrast
Small: 0.75rem, used for meta information
```

### Spacing
```css
Tight: 0.5rem (gap-2)
Normal: 1rem (gap-4)
Relaxed: 1.5rem (gap-6)
Loose: 2rem (gap-8)
```

### Border Radius
```css
Small: 0.5rem (rounded-lg)
Medium: 0.75rem (rounded-xl)
Large: 1rem (rounded-2xl)
Full: 9999px (rounded-full)
```

### Shadows
```css
Small: shadow-md
Medium: shadow-lg
Large: shadow-xl
Extra: shadow-2xl
```

---

## 🚀 Animation System

### Built-in Animations

1. **Fade In**
   ```css
   .animate-fadeIn
   Duration: 0.5s
   Effect: Opacity + Y translation
   ```

2. **Slide In**
   ```css
   .animate-slideIn
   Duration: 0.5s
   Effect: Opacity + X translation
   ```

3. **Hover Lift**
   ```css
   transform: hover:-translate-y-1
   Duration: 0.3s
   ```

4. **Scale**
   ```css
   transform: hover:scale-105
   Duration: 0.3s
   ```

---

## 📝 Best Practices Implemented

### ✅ Accessibility
- Semantic HTML elements
- ARIA labels where needed
- Keyboard navigation support
- Focus states on all interactive elements
- Sufficient color contrast

### ✅ Performance
- Lazy loading for images (ready)
- Efficient re-renders with proper dependencies
- Memoization where appropriate
- Optimized animations (GPU accelerated)

### ✅ UX Principles
- Clear visual hierarchy
- Immediate feedback on interactions
- Loading states for all async operations
- Error messages with helpful context
- Success confirmations
- Smooth transitions between states

### ✅ Code Quality
- Reusable components
- Custom hooks for shared logic
- Proper prop types
- Helpful comments
- Clear naming conventions

---

## 🔧 Configuration

### LocalStorage Keys
```javascript
`restaurant_${address}` - Stores restaurant ID
`rider_${address}` - Marks rider registration
`customer_${address}` - Marks customer activity
`pendingRole_${address}` - Temporary role selection
```

### Role Detection Order
1. Check rider (smart contract call)
2. Check restaurant owner (localStorage)
3. Check customer (localStorage)
4. Default to 'none' (new user)

---

## 🐛 Known Limitations

1. **Restaurant Ownership Detection**
   - Currently uses localStorage
   - In production, should use event logs or The Graph
   - Need to query all restaurants to find owner

2. **Customer Detection**
   - Based on localStorage
   - Could be lost if user clears browser data
   - Should query order history from blockchain

3. **Image Storage**
   - Currently local only (not uploaded)
   - Needs Supabase integration
   - File objects not persisted

---

## 🎯 Future Enhancements

### Short Term
- [ ] Integrate Supabase for image storage
- [ ] Use The Graph for role detection
- [ ] Add image compression before upload
- [ ] Implement image caching

### Medium Term
- [ ] Dark mode support
- [ ] Multi-language support (i18n)
- [ ] Advanced animations with Framer Motion
- [ ] Progressive Web App (PWA) features

### Long Term
- [ ] Real-time order tracking with WebSockets
- [ ] Push notifications
- [ ] Native mobile apps
- [ ] AR menu viewing

---

## 📚 Additional Resources

### Dependencies Used
- React 18.2.0
- React Router DOM 6.21.0
- Wagmi 2.5.0 (Ethereum interactions)
- RainbowKit 2.0.0 (Wallet connection)
- Tailwind CSS 3.4.0
- Lucide React 0.300.0 (Icons)

### Useful Links
- [Tailwind CSS Docs](https://tailwindcss.com)
- [RainbowKit Docs](https://www.rainbowkit.com)
- [Supabase Docs](https://supabase.com/docs)
- [Wagmi Docs](https://wagmi.sh)

---

## 🙋 Support

For questions or issues:
1. Check this documentation
2. Review code comments
3. Check browser console for errors
4. Verify MetaMask is connected
5. Ensure you're on Sepolia testnet

---

**Last Updated:** November 15, 2025  
**Version:** 2.0.0  
**Status:** ✅ Ready for Testing & Supabase Integration

