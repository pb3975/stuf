# Changelog

All notable changes to the Stuf Inventory Management System will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- **Rebranding to "Stuf"**: Complete application rebrand from "Vibe" to "Stuf"
  - New logo integration with orange warehouse/inventory icon
  - Updated application title and favicon
  - Refreshed navbar branding with logo display
  - Updated all documentation to reflect new brand name
- **Brand Color Theme**: Updated design system with official Stuf brand colors
  - Primary color: #F26422 (Stuf Orange)
  - Secondary color: #4A4A4A (Stuf Gray)
  - Updated all theme variables for light and dark modes
  - Consistent brand color application across all UI components

### Planned
- Barcode scanning functionality
- Price detection from receipts
- Expiration date recognition
- Advanced analytics dashboard
- Progressive Web App features

## [2.4.1] - 2024-12-XX

### Fixed
- **Light Mode Readability**: Improved text contrast and readability in light mode
  - Updated foreground color to pure black (`0 0% 0%`) for maximum contrast
  - Improved muted-foreground color to `0 0% 30%` for better readability
  - Added theme-aware status colors for all colored text elements
  - Removed hardcoded colors from components in favor of CSS custom properties
  - Fixed circular dependency in CSS custom properties

### Changed
- **Theme System**: Enhanced color system for better accessibility
  - All status messages now have proper light/dark mode variants
  - Removed hardcoded `bg-white`, `text-white`, and other fixed colors
  - Improved contrast ratios across all UI elements

## [2.4.0] - 2024-12-XX

### Added
- **Dark Mode Support**: Complete theme system implementation
  - Light, dark, and system preference modes
  - Theme toggle in navigation bar with dropdown selector
  - Persistent theme preference storage
  - Smooth theme transitions with CSS custom properties
  - High contrast color schemes for accessibility

### Changed
- **Navbar Redesign**: Modernized navigation with shadcn/ui components
  - Replaced basic HTML with Card and DropdownMenu components
  - Added theme toggle with sun/moon icons
  - Improved responsive design for mobile devices
  - Enhanced accessibility with proper ARIA labels

### Technical
- **Theme Provider**: Integrated next-themes for theme management
- **CSS Variables**: Comprehensive color system using CSS custom properties
- **Component Updates**: All components now support theme switching

## [2.3.0] - 2024-12-XX

### Added
- **Enhanced Delete Functionality**: Moved delete operations to item detail pages
  - Delete button removed from home page for cleaner interface
  - Added confirmation dialog with AlertDialog component
  - Safety features including item name confirmation
  - Automatic navigation to home page after deletion
  - Mobile-optimized confirmation dialogs

### Changed
- **Item Detail Page**: Enhanced with delete functionality
  - Integrated delete button with proper styling
  - Added loading states during deletion process
  - Improved error handling and user feedback

### Removed
- **Home Page Delete Buttons**: Cleaned up ItemList component
  - Removed delete buttons from item cards
  - Simplified item card interface

## [2.2.0] - 2024-12-XX

### Added
- **Camera Capture Integration**: Native camera support for mobile devices
  - CameraCapture component with dual input options
  - Mobile detection using user agent and touch capabilities
  - Environment camera preference for rear-facing camera
  - Graceful fallback to file picker for desktop users
  - Integration with both SmartAdd and regular image upload

### Enhanced
- **Mobile Experience**: Improved mobile device detection and handling
  - Enhanced mobile detection algorithm
  - Touch-optimized camera interface
  - Better user experience for photo capture workflows

### Technical
- **Component Architecture**: Reusable CameraCapture component
- **Device Detection**: Robust mobile device identification
- **Camera API**: Proper constraints for environment camera access

## [2.1.0] - 2024-12-XX

### Added
- **Mobile Responsiveness Optimization**: Complete mobile UX overhaul
  - Touch targets increased to minimum 48px on mobile
  - Adaptive layouts that stack vertically on mobile, horizontally on desktop
  - Photo grids optimized for mobile with 2-column layout
  - Form optimization with full-width inputs and proper spacing
  - Responsive breakpoints using Tailwind CSS utilities

### Enhanced
- **Component Mobile Optimization**:
  - **AddItemForm**: Complete mobile overhaul with stacked layouts
  - **ItemList**: Responsive header and grid system
  - **ItemDetails**: Mobile-friendly detail view
  - **SmartAdd**: Touch-optimized photo upload and suggestion interfaces
  - **Duplicate Detection**: Stacked item cards with full-width buttons

### Technical
- **Mobile-First Design**: Implemented mobile-first responsive design principles
- **Touch Optimization**: Enhanced touch interactions and gesture support
- **Responsive Grid**: Dynamic column layouts based on screen size

## [2.0.0] - 2024-12-XX

### Added
- **SmartAdd v2.0**: Major AI feature enhancement
  - **Confident AI Suggestions**: Removed hedging language for direct, professional suggestions
  - **Duplicate Detection**: Intelligent detection of similar existing items
  - **Quantity Increment**: Option to increment existing items instead of creating duplicates
  - **Enhanced AI Prompts**: Improved prompts for more accurate and confident responses

### Enhanced
- **Backend API**: New endpoints for duplicate detection and quantity management
  - `/items/{item_id}/increment` endpoint for efficient quantity updates
  - Enhanced duplicate detection logic comparing items within same category
  - Improved error handling and response formatting

### Changed
- **User Interface**: Enhanced SmartAdd workflow
  - Added similar items display with increment options
  - User choice between incrementing existing items or creating new ones
  - Improved visual feedback for duplicate detection results

### Technical
- **AI Integration**: Updated Google Gemini prompts for better accuracy
- **Database Operations**: Optimized item comparison and update operations
- **Component Architecture**: Enhanced SmartAdd component with duplicate handling

## [1.5.0] - 2024-12-XX

### Added
- **Bulk Operations**: Comprehensive multi-select functionality
  - **Multi-Select Mode**: Toggle selection mode with visual feedback
  - **Bulk Delete**: Delete multiple items with confirmation dialog
  - **Bulk Category Change**: Update categories for selected items
  - **Bulk Quantity Updates**: Add, subtract, or set quantities for multiple items
  - **CSV Export**: Export selected items to CSV format
  - **Selection Management**: Select all visible, deselect all, selection counter

### Enhanced
- **User Interface**: Bulk operations toolbar and visual feedback
  - Contextual toolbar appears when items are selected
  - Visual ring border for selected items
  - Responsive design for mobile screens
  - Loading states to prevent double-clicks

### Technical
- **State Management**: Enhanced selection state management
- **API Integration**: Bulk operation endpoints
- **Performance**: Optimized bulk operations for large datasets

## [1.4.0] - 2024-12-XX

### Added
- **Search and Filtering**: Comprehensive search and filter system
  - **Global Search Bar**: Real-time search across item names, categories, and custom attributes
  - **Category Filtering**: Dropdown to filter by specific categories
  - **Quantity Range Filters**: Min/max quantity inputs
  - **Sorting Options**: Name (A-Z, Z-A), Quantity (Low-High, High-Low), Category (A-Z, Z-A)
  - **Filter Management**: Clear filters button, active filter indicators

### Enhanced
- **Performance**: Client-side filtering with useMemo for efficiency
- **User Experience**: 
  - Filter status shown in item count ("X of Y items (filtered)")
  - Smart empty states based on filter status
  - Visual sort icons for clarity
  - Instant results as user types

### Technical
- **Search Algorithm**: Efficient client-side search implementation
- **State Management**: Optimized filter state management
- **Component Architecture**: Reusable filter components

## [1.3.0] - 2024-12-XX

### Added
- **Mobile Grid Layout Optimization**: Enhanced mobile experience
  - **Compact Grid**: 2 columns on mobile, up to 6 columns on desktop
  - **Square Thumbnails**: Consistent aspect-ratio for better layout
  - **Condensed Cards**: Removed separate buttons, made entire card clickable
  - **Overlay Badges**: Quantity badges positioned over images
  - **Compact Header**: Smaller title, integrated filter dropdown
  - **Line Clamping**: CSS utility for truncating long item names

### Fixed
- **Navigation Bug**: Resolved issue where clicking anywhere on page navigated to latest item
  - Replaced absolute positioned links with proper Link wrapper around Card components
  - Improved click handling for card interactions

### Enhanced
- **Touch Optimization**: Larger tap targets and better spacing for mobile devices
- **Visual Design**: Improved card layouts and information density

## [1.2.0] - 2024-12-XX

### Added
- **Dynamic Configuration System**: Flexible API URL configuration
  - Automatic hostname detection for mobile access
  - Dynamic API URL construction based on current environment
  - Enhanced configuration logging for debugging
  - ConnectionTest component at `/debug` route for connectivity testing

### Fixed
- **Mobile Access Issues**: Resolved hardcoded localhost URLs
  - Updated all components to use dynamic API URLs
  - Fixed inventory loading on mobile devices
  - Resolved SmartAdd AI service failures on mobile

### Enhanced
- **Backend Configuration**: 
  - Updated CORS settings to allow all origins for development
  - Configured backend to run on `0.0.0.0:8000` for network access
  - Enhanced QR code generation with dynamic host support

### Technical
- **Configuration Management**: Created `frontend/src/lib/config.ts` utility
- **Debug Tools**: Comprehensive connectivity testing and logging
- **Network Compatibility**: Improved cross-device access capabilities

## [1.1.0] - 2024-12-XX

### Added
- **SmartAdd Feature**: AI-powered item recognition using Google Gemini Flash 2.0
  - Upload up to 3 photos for analysis
  - AI suggests item name, category, quantity, and custom attributes
  - Uses existing categories to maintain consistency
  - Confidence scoring for suggestions
  - Comprehensive error handling
  - First photo becomes item image, others discarded

### Enhanced
- **Backend API**: New SmartAdd endpoint with Google Gemini integration
  - `/smart-add/` endpoint for photo analysis
  - Base64 image encoding and processing
  - Secure API key handling with environment variables
  - Detailed logging and error responses

### Technical
- **AI Integration**: Google Gemini API integration with structured prompts
- **Image Processing**: Multi-photo analysis with base64 encoding
- **Security**: Environment-based API key management

## [1.0.0] - 2024-12-XX

### Added
- **Initial Release**: Core inventory management functionality
  - **Item Management**: Create, read, update, delete inventory items
  - **Photo Storage**: Upload and manage item images
  - **QR Code Generation**: Automatic QR codes for each item
  - **Category Organization**: Organize items by customizable categories
  - **Custom Attributes**: Flexible metadata system for items

### Technical
- **Frontend**: React + TypeScript with Vite build system
- **Backend**: FastAPI with SQLite database
- **UI Components**: shadcn/ui component library with Tailwind CSS
- **Component Conversion**: Migrated from Material UI & Bootstrap to shadcn/ui

### Infrastructure
- **Database**: SQLite with migration support
- **File Storage**: Local file system for images and QR codes
- **API Design**: RESTful API with proper HTTP methods
- **Type Safety**: Full TypeScript coverage

### Bug Fixes
- **TypeScript Errors**: Fixed import type issues and compiler options
- **Tailwind CSS**: Resolved PostCSS configuration and version compatibility
- **Python Backend**: Fixed type annotation errors and imports
- **Component Imports**: Resolved path alias issues for UI components

## Development History

### Initial Setup Phase
- Project structure establishment
- TypeScript configuration and error resolution
- Tailwind CSS setup and version management
- Python backend type annotation fixes
- Component library migration from Material UI to shadcn/ui

### Feature Development Phase
- SmartAdd AI integration with Google Gemini
- Mobile responsiveness optimization
- Search and filtering implementation
- Bulk operations development
- Theme system implementation

### Enhancement Phase
- Mobile camera integration
- Dynamic configuration system
- Performance optimizations
- User experience improvements
- Comprehensive documentation

---

## Version Numbering

- **Major versions** (X.0.0): Significant feature additions or breaking changes
- **Minor versions** (X.Y.0): New features, enhancements, or significant improvements
- **Patch versions** (X.Y.Z): Bug fixes, small improvements, or maintenance updates

## Contributing

When contributing to this project, please:
1. Update this changelog with your changes
2. Follow the established format and categorization
3. Include relevant technical details and impact assessment
4. Reference any related issues or pull requests 