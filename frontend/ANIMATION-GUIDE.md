# 🎨 FoodChain Animation & Design System Guide

## Overview
This guide documents all the animations, effects, and visual design elements implemented in the FoodChain UI.

---

## 🌟 Background System

### 1. **Animated Canvas Background**
**File:** `src/components/AnimatedBackground.jsx`

Features:
- **Floating Food Particles**: 50 animated food emojis (🍕, 🍔, 🍟, etc.)
- **Rotation Animation**: Each particle slowly rotates
- **Blockchain Lines**: Connecting lines between nearby particles (blockchain-inspired)
- **Smooth Movement**: Particles float smoothly across the screen
- **Performance**: Uses `requestAnimationFrame` for smooth 60fps

Customization:
```javascript
const numberOfParticles = 50; // Adjust particle count
const opacity = 0.1 to 0.4;   // Particle visibility
const speedX/Y = -1 to 1;     // Movement speed
```

### 2. **Floating Geometric Shapes**
**File:** `src/components/FloatingShapes.jsx`

Features:
- **Large Gradient Orbs**: Multiple colored orbs with blur effect
- **Geometric Shapes**: Rotating squares and circles
- **Layered Depth**: Multiple layers at different speeds
- **Pure CSS**: No JavaScript, just CSS animations

Shapes:
- 3 large gradient orbs (20-25s animation)
- 2 medium accent shapes (15s animation)
- 3 small geometric shapes (6-30s animation)

### 3. **Gradient Mesh Overlay**
Radial gradients at corners for subtle depth:
```css
bg-[radial-gradient(circle_at_top_right,...)]
```

---

## 🎭 Animation Keyframes

### Core Animations

#### 1. **fadeIn** (0.5s)
```css
From: opacity 0, translateY(10px)
To: opacity 1, translateY(0)
```
**Usage:** Page loads, content appearance

#### 2. **slideIn** (0.5s)
```css
From: opacity 0, translateX(-20px)
To: opacity 1, translateX(0)
```
**Usage:** Side panels, notifications

#### 3. **float-slow** (20s)
```css
Smooth floating motion with horizontal drift
```
**Usage:** Large background orbs

#### 4. **float-medium** (15s)
```css
Moderate floating with alternating direction
```
**Usage:** Medium background shapes

#### 5. **float-fast** (10s)
```css
Quick floating motion
```
**Usage:** Small accent elements

#### 6. **float-slower** (25s)
```css
Very slow float with scale effect
```
**Usage:** Extra large orbs

#### 7. **spin-slow** (30s)
```css
360° rotation over 30 seconds
```
**Usage:** Geometric shapes, icons

#### 8. **pulse-slow** (4s)
```css
Opacity and scale pulse
```
**Usage:** Badges, status indicators

#### 9. **bounce-slow** (6s)
```css
Vertical bounce motion
```
**Usage:** Icons, emojis

#### 10. **shimmer** (3s)
```css
Shine effect moving across surface
```
**Usage:** Buttons on hover, cards

#### 11. **glow** (2s)
```css
Shadow pulsing effect
```
**Usage:** Important elements, CTAs

---

## 🎨 Component Styles

### Glass Morphism

```css
.glass-card {
  background: white/70%;
  backdrop-blur: xl;
  border: 1px solid white/30;
  shadow: 2xl;
}
```

**Where Used:**
- Feature cards on landing
- Welcome screen role cards
- Modal dialogs

### Gradient Text

```css
.gradient-text {
  background: linear-gradient(orange-600 → red-600 → pink-600);
  -webkit-background-clip: text;
  color: transparent;
}
```

**Where Used:**
- Main headings
- Logo
- Important labels

### Buttons

#### Primary Button
```css
.btn-primary {
  background: linear-gradient(orange-600 → red-600);
  hover: shadow-xl + shadow-orange-500/50 + scale-105;
  animation: shimmer on hover;
}
```

Features:
- Gradient background
- Glow shadow on hover
- Scale transform
- Shimmer sweep effect
- 300ms transitions

#### Secondary Button
```css
.btn-secondary {
  background: white/80 + backdrop-blur;
  border: 2px solid gray-300;
  hover: border-orange-500 + shadow-lg;
}
```

### Cards

#### Standard Card
```css
.card {
  background: white/90 + backdrop-blur-md;
  border: 1px solid white/20;
  shadow: lg;
  hover: shadow-xl;
}
```

#### Interactive Card
```css
.card-interactive {
  extends: .card;
  hover: scale-102 + shadow-2xl;
  cursor: pointer;
}
```

---

## 🎯 Page-Specific Animations

### Landing Page (Not Connected)

**Hero Section:**
1. **Pizza Icon**: 
   - Gradient box with glow animation
   - Hover: scale + rotate
   - Blur background pulse

2. **Title**:
   - Gradient text animation
   - fadeIn on load

3. **Feature Cards**:
   - Staggered fadeIn (0.6s, 0.8s, 1.0s delays)
   - Glass morphism
   - Hover: scale-105 + rotate-12 icon
   - Gradient overlay on hover
   - Emoji appears on hover

4. **Connect Button**:
   - Glowing background
   - Pulsing blur effect

### Welcome Screen (Role Selection)

**Role Cards:**
- Glass morphism background
- Border highlight when selected
- Icon scales and rotates when selected
- Glow animation on selected card
- Hover effects on all cards

**Continue Button:**
- Gradient background
- Shimmer effect when role selected
- Glow animation
- Arrow translation on hover

### Restaurant Cards (HomePage)

**Card Effects:**
1. **Image Container**:
   - Gradient background (orange → red → pink)
   - Icon scales + rotates on hover
   - Shimmer sweep effect

2. **Card Body**:
   - Glass morphism
   - Lifts up on hover (-translateY-2)
   - Glowing border appears

3. **Status Badge**:
   - "Open" badge has ping animation
   - Pulsing dot indicator

4. **Order Button**:
   - Primary button styling
   - Arrow slides right on hover

### Header

**Logo:**
- Pizza icon bounces slowly
- Sparkle icon pulses
- Hover: scale + rotate
- Shadow glow effect

**Navigation Links:**
- Color transition on hover
- Icon scales

### Footer

**Decorative Elements:**
- Gradient lines
- Animated pizza emoji (pulse)
- Spinning blockchain icon
- Icon scale on link hover

---

## 🔧 Customization Guide

### Adjusting Animation Speed

```css
/* Make animations faster */
.animate-float-slow {
  animation-duration: 10s; /* was 20s */
}

/* Make animations slower */
.animate-glow {
  animation-duration: 4s; /* was 2s */
}
```

### Changing Colors

```css
/* Update gradient colors */
:root {
  --primary-start: #ea580c; /* orange-600 */
  --primary-mid: #dc2626;   /* red-600 */
  --primary-end: #ec4899;   /* pink-600 */
}
```

### Adding New Animations

1. **Define Keyframes:**
```css
@keyframes myAnimation {
  0% { /* start state */ }
  50% { /* middle state */ }
  100% { /* end state */ }
}
```

2. **Create Utility Class:**
```css
.animate-myAnimation {
  animation: myAnimation 3s ease-in-out infinite;
}
```

3. **Apply to Elements:**
```jsx
<div className="animate-myAnimation">
  Content here
</div>
```

---

## 🎪 Interactive Effects

### Hover States

**Standard Hover Pattern:**
```css
transform: scale(1.05);
box-shadow: 0 20px 25px rgba(0,0,0,0.1);
transition: all 300ms;
```

**Intense Hover Pattern:**
```css
transform: scale(1.1) rotate(12deg);
box-shadow: 0 25px 50px rgba(249,115,22,0.3);
transition: all 500ms;
```

### Click/Active States

```css
.btn:active {
  transform: scale(0.95);
  transition-duration: 100ms;
}
```

### Focus States

```css
.input-field:focus {
  ring: 2px solid orange-500;
  border-color: orange-500;
  outline: none;
}
```

---

## 📱 Responsive Animations

### Mobile Considerations

**Reduce Motion:**
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
```

**Performance on Mobile:**
- Fewer particles (25 instead of 50)
- Slower animations
- Reduced blur effects
- Simplified shadows

```javascript
// In AnimatedBackground.jsx
const numberOfParticles = window.innerWidth < 768 
  ? Math.min(25, Math.floor(canvas.width / 30))
  : Math.min(50, Math.floor(canvas.width / 30));
```

---

## 🎨 Design Tokens

### Colors

```css
/* Primary Gradients */
Orange-Red: from-orange-500 to-red-600
Orange-Red-Pink: from-orange-600 via-red-600 to-pink-600

/* Background Gradients */
Orange-50: #fff7ed
Red-50: #fef2f2
Yellow-50: #fefce8

/* Status Colors */
Success: #10b981 (green-500)
Warning: #f59e0b (yellow-500)
Error: #ef4444 (red-500)
Info: #3b82f6 (blue-500)
```

### Spacing

```css
xs: 0.25rem (1)
sm: 0.5rem (2)
md: 1rem (4)
lg: 1.5rem (6)
xl: 2rem (8)
2xl: 3rem (12)
```

### Border Radius

```css
sm: 0.375rem (rounded)
md: 0.5rem (rounded-lg)
lg: 0.75rem (rounded-xl)
xl: 1rem (rounded-2xl)
full: 9999px (rounded-full)
```

### Shadows

```css
sm: 0 1px 2px rgba(0,0,0,0.05)
md: 0 4px 6px rgba(0,0,0,0.1)
lg: 0 10px 15px rgba(0,0,0,0.1)
xl: 0 20px 25px rgba(0,0,0,0.1)
2xl: 0 25px 50px rgba(0,0,0,0.25)

/* Colored shadows */
orange-glow: 0 0 40px rgba(249,115,22,0.4)
```

---

## 🚀 Performance Tips

### Optimizing Animations

1. **Use `transform` and `opacity`** (GPU accelerated)
   ```css
   /* Good */
   transform: translateX(10px);
   opacity: 0.5;
   
   /* Avoid */
   left: 10px;
   width: 200px;
   ```

2. **Use `will-change` sparingly**
   ```css
   .animated-element {
     will-change: transform, opacity;
   }
   ```

3. **Reduce particles on low-end devices**
   ```javascript
   const devicePixelRatio = window.devicePixelRatio || 1;
   const particleMultiplier = devicePixelRatio > 1 ? 0.7 : 1;
   ```

4. **Use CSS animations over JavaScript when possible**
   - Faster
   - Better performance
   - Runs on compositor thread

---

## 🎬 Animation Sequences

### Page Load Sequence

```
1. Background elements fade in (instant)
2. Hero icon appears (0s)
3. Title fades in (0s)
4. Subtitle fades in (0.2s delay)
5. CTA button fades in (0.4s delay)
6. Feature cards stagger in (0.6s, 0.8s, 1.0s)
7. Footer info (0.5s delay)
```

### Card Hover Sequence

```
1. Scale starts (0ms)
2. Shadow grows (0ms)
3. Icon rotates (100ms delay)
4. Emoji appears (200ms delay)
5. Text color changes (300ms delay)
```

---

## 📚 Component Animation Examples

### Animated Loading Spinner

```jsx
<div className="relative inline-block">
  <div className="absolute inset-0 bg-gradient-to-r from-orange-500 to-red-600 blur-2xl opacity-50 animate-pulse" />
  <div className="relative animate-spin rounded-full h-20 w-20 border-4 border-t-orange-600 border-r-red-600 border-b-orange-600 border-l-transparent" />
</div>
```

### Pulsing Badge

```jsx
<span className="relative px-3 py-1 bg-green-100 text-green-800 rounded-full">
  <span className="absolute inset-0 bg-green-500 rounded-full animate-ping" />
  <span className="relative">Open</span>
</span>
```

### Shimmer Button

```jsx
<button className="relative overflow-hidden btn-primary">
  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
  <span className="relative z-10">Click Me</span>
</button>
```

### Floating Icon

```jsx
<div className="animate-float-slow">
  <span className="text-6xl">🍕</span>
</div>
```

---

## 🎯 Best Practices

### DO ✅
- Use CSS animations for simple transforms
- Provide reduced motion alternatives
- Test on mobile devices
- Keep animations smooth (60fps)
- Use meaningful animations (not just decoration)
- Group animations logically

### DON'T ❌
- Animate layout properties (width, height, top, left)
- Use too many simultaneous animations
- Make animations too long (>1s for UI elements)
- Auto-play sound/video
- Use animations that interfere with usability
- Animate on low battery

---

## 🔍 Debugging Animations

### Chrome DevTools

1. **Performance Tab**: Record and analyze animation performance
2. **Animations Panel**: Slow down and inspect animations
3. **Rendering Tab**: Show FPS meter, paint flashing

### Console Logging

```javascript
// Log animation events
element.addEventListener('animationstart', (e) => {
  console.log('Animation started:', e.animationName);
});

element.addEventListener('animationend', (e) => {
  console.log('Animation ended:', e.animationName);
});
```

---

## 🎨 Future Enhancements

### Planned Animations
- [ ] Page transition animations
- [ ] Skeleton loaders
- [ ] Success/error toast animations
- [ ] Modal slide-in effects
- [ ] Accordion expand/collapse
- [ ] Tab switching animations
- [ ] Chart/data visualizations
- [ ] Progress bar animations
- [ ] Notification badges
- [ ] Drag and drop effects

### Advanced Effects
- [ ] Parallax scrolling
- [ ]3D transforms
- [ ] SVG path animations
- [ ] Lottie animations
- [ ] GSAP timeline sequences
- [ ] Scroll-triggered animations
- [ ] Mouse tracking effects

---

## 📖 Resources

### Documentation
- [Tailwind CSS Animations](https://tailwindcss.com/docs/animation)
- [CSS Animations MDN](https://developer.mozilla.org/en-US/docs/Web/CSS/CSS_Animations)
- [React Spring](https://www.react-spring.dev/)
- [Framer Motion](https://www.framer.com/motion/)

### Inspiration
- [Dribbble](https://dribbble.com/tags/web-animation)
- [Awwwards](https://www.awwwards.com/websites/animation/)
- [CodePen](https://codepen.io/trending)

---

**Last Updated:** November 15, 2025  
**Version:** 2.0.0  
**Status:** ✅ Production Ready

