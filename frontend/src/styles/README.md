# CSS Organization System

This project uses an organized CSS system for better maintainability, consistency, and development efficiency.

## 📁 File Structure

```
src/styles/
├── globals.css      # Global styles, variables, and base utility classes
├── components.css   # Component-specific styles and patterns
├── utilities.css    # Advanced utility classes and helpers
└── README.md       # This documentation
```

## 🎨 CSS Architecture

### 1. globals.css
**Purpose**: Foundation styles, CSS variables, and core utility classes

**Contains**:
- CSS Custom Properties (CSS Variables)
- Base HTML element styles
- Core utility classes (container, buttons, cards, etc.)
- Typography styles
- Layout utilities
- Form styles
- Responsive design patterns
- Accessibility features
- Print styles

**Key Classes**:
- `.container-custom` - Main page container
- `.btn-primary`, `.btn-secondary`, `.btn-outline` - Button styles
- `.card`, `.card-hover` - Card components
- `.section-padding` - Consistent section spacing
- `.text-heading`, `.text-body`, `.text-muted` - Typography

### 2. components.css
**Purpose**: Component-specific styles and variations

**Contains**:
- Specific styles for each component (hero, header, footer, etc.)
- Component variations and modifiers
- Loading states and error states
- Interactive states (hover, focus, active)
- Product and e-commerce specific styles

**Key Classes**:
- `.hero`, `.hero-content`, `.hero-title` - Hero section
- `.header`, `.header-content`, `.header-nav` - Header navigation
- `.footer`, `.footer-content`, `.footer-grid` - Footer layout
- `.category-card`, `.feature-card` - Product components
- `.newsletter-section`, `.faq-section` - Page sections

### 3. utilities.css
**Purpose**: Advanced utility classes and helper functions

**Contains**:
- Display and positioning utilities
- Advanced animation classes
- Glass effects and visual treatments
- Custom scrollbar styles
- Performance optimization classes
- Accessibility helpers
- Form enhancements
- Layout helpers

**Key Classes**:
- `.center-absolute`, `.center-flex` - Positioning
- `.hover-lift`, `.hover-scale` - Hover effects
- `.glass`, `.glass-dark` - Glass morphism
- `.text-gradient` - Gradient text
- `.custom-scrollbar` - Styled scrollbars
- `.gpu-accelerated` - Performance optimization

## 🔧 Usage Examples

### Basic Component Structure
```jsx
// Hero Section
<section className="hero">
  <div className="hero-content">
    <div className="container-custom">
      <div className="hero-text">
        <h1 className="hero-title">Title</h1>
        <p className="hero-description">Description</p>
        <Button className="btn-primary">Action</Button>
      </div>
    </div>
  </div>
</section>
```

### Card Component
```jsx
<div className="card-hover">
  <img className="category-image" src="..." alt="..." />
  <div className="category-content">
    <h3 className="category-title">Category Name</h3>
  </div>
</div>
```

### Form with Custom Styles
```jsx
<form className="newsletter-form--styled">
  <input className="newsletter-input focus-ring-orange" />
  <button className="btn-primary">Submit</button>
</form>
```

## 🎯 CSS Variables

### Colors
```css
--color-primary: #f97316;     /* orange-500 */
--color-primary-hover: #ea580c; /* orange-600 */
--color-text: #111827;        /* gray-900 */
--color-background: #ffffff;
```

### Typography
```css
--font-size-base: 1rem;       /* 16px */
--font-size-lg: 1.125rem;     /* 18px */
--font-size-xl: 1.25rem;      /* 20px */
```

### Spacing
```css
--spacing-md: 1rem;           /* 16px */
--spacing-lg: 1.5rem;         /* 24px */
--spacing-xl: 2rem;           /* 32px */
```

## 📱 Responsive Design

The system uses a mobile-first approach:

```css
/* Mobile First */
.hero-title {
  @apply text-4xl;
}

/* Tablet and up */
@media (min-width: 768px) {
  .hero-title {
    @apply text-5xl;
  }
}

/* Desktop and up */
@media (min-width: 1024px) {
  .hero-title {
    @apply text-6xl;
  }
}
```

## 🎨 Design Tokens

### Brand Colors
- **Primary**: Orange (#f97316)
- **Secondary**: Gray (#1f2937)
- **Success**: Emerald (#10b981)
- **Warning**: Amber (#f59e0b)
- **Error**: Red (#ef4444)

### Typography Scale
- **xs**: 12px
- **sm**: 14px
- **base**: 16px
- **lg**: 18px
- **xl**: 20px
- **2xl**: 24px
- **3xl**: 30px
- **4xl**: 36px
- **5xl**: 48px
- **6xl**: 60px

## ♿ Accessibility Features

### Focus Management
```css
.focus-ring-orange {
  @apply focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2;
}
```

### Screen Reader Support
```css
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
```

### High Contrast Mode
```css
@media (prefers-contrast: high) {
  .btn-primary {
    @apply border-2 border-black;
  }
}
```

### Reduced Motion
```css
@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    transition-duration: 0.01ms !important;
  }
}
```

## 🚀 Performance Optimizations

### GPU Acceleration
```css
.gpu-accelerated {
  transform: translateZ(0);
  backface-visibility: hidden;
  perspective: 1000px;
}
```

### Efficient Animations
```css
.hover-scale {
  @apply transform transition-transform duration-200 hover:scale-105 will-change-transform;
}
```

## 📋 Best Practices

### 1. Class Naming Convention
- Use semantic, descriptive names
- Follow BEM-like patterns for component styles
- Use kebab-case for multi-word classes

### 2. Component Structure
```jsx
// ✅ Good - Semantic structure
<section className="hero">
  <div className="hero-content">
    <div className="container-custom">
      // content
    </div>
  </div>
</section>

// ❌ Avoid - Inline Tailwind overload
<section className="relative h-[600px] overflow-hidden">
  <div className="relative z-20 h-full flex items-center">
    // content
  </div>
</section>
```

### 3. Responsive Design
- Use consistent breakpoints
- Design mobile-first
- Test across devices

### 4. Accessibility
- Always include focus states
- Use semantic HTML
- Test with screen readers
- Ensure color contrast ratios

## 🔄 Migration Guide

### From Inline Tailwind to Organized CSS

**Before**:
```jsx
<button className="bg-orange-500 hover:bg-orange-600 text-white font-bold px-6 py-3 rounded-lg transition-colors">
  Button
</button>
```

**After**:
```jsx
<button className="btn-primary">
  Button
</button>
```

### Component Updates
1. Replace repeated Tailwind classes with semantic class names
2. Use CSS variables for consistent theming
3. Leverage component-specific classes for variations
4. Apply utility classes for unique cases

## 🛠 Development Workflow

### Adding New Styles
1. **Check existing classes** - Use what's already available
2. **Add to appropriate file**:
   - `globals.css` - For widely reusable styles
   - `components.css` - For component-specific styles
   - `utilities.css` - For helper/utility classes
3. **Follow naming conventions**
4. **Test responsiveness and accessibility**
5. **Document if complex**

### Customizing Components
```jsx
// Use base class + modifiers
<div className="card card--large card--interactive">
  // content
</div>
```

## 📚 Resources

- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [CSS Custom Properties](https://developer.mozilla.org/en-US/docs/Web/CSS/--*)
- [Web Accessibility Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [CSS Performance Best Practices](https://web.dev/optimize-css/)

---

This CSS organization system provides a solid foundation for scalable, maintainable, and accessible styles. Follow the patterns established here for consistency across the project.