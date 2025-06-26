# Stuf - Smart Inventory Management System

A modern, full-stack inventory management application with AI-powered item recognition, built with React, TypeScript, Python FastAPI, and Google Gemini AI.

## 🌟 Features

### Core Functionality
- **Item Management**: Create, read, update, and delete inventory items
- **Photo Storage**: Upload and manage item images
- **QR Code Generation**: Automatic QR codes for each item
- **Category Organization**: Organize items by customizable categories
- **Custom Attributes**: Flexible metadata system for items

### AI-Powered SmartAdd (v2.0)
- **Photo Analysis**: Upload up to 3 photos for AI analysis using Google Gemini Flash 2.0
- **Intelligent Suggestions**: AI suggests item name, category, quantity, and custom attributes
- **Confident Language**: Direct, professional suggestions without hedging
- **Duplicate Detection**: Identifies similar existing items and offers quantity increment
- **Camera Integration**: Mobile camera capture with rear camera preference
- **Batch Processing**: Analyze multiple photos together for better context

### Search & Filtering
- **Global Search**: Real-time search across names, categories, and attributes
- **Category Filtering**: Filter by specific categories
- **Quantity Range**: Filter by minimum and maximum quantities
- **Advanced Sorting**: Sort by name, quantity, or category (ascending/descending)
- **Clear Filters**: Easy filter management with status indicators

### Bulk Operations
- **Multi-Select Mode**: Select multiple items with visual feedback
- **Bulk Delete**: Delete multiple items with confirmation
- **Bulk Category Change**: Update categories for selected items
- **Bulk Quantity Updates**: Add, subtract, or set quantities for multiple items
- **CSV Export**: Export selected items to CSV format

### User Interface
- **Modern Design**: Built with shadcn/ui components and Tailwind CSS
- **Dark/Light Mode**: Full theme support with system preference detection
- **Mobile Responsive**: Optimized layouts for all screen sizes
- **Touch Friendly**: Proper touch targets and mobile interactions
- **Accessibility**: ARIA labels and keyboard navigation support

### Mobile Optimizations
- **Compact Grid Layout**: 2-6 column responsive grid with square thumbnails
- **Touch Targets**: Minimum 48px touch areas on mobile
- **Camera Access**: Native camera integration for photo capture
- **Network Flexibility**: Dynamic API URL configuration for mobile access
- **Gesture Support**: Swipe and touch optimizations

## 🚀 Quick Start

### Prerequisites
- Python 3.8+
- Node.js 16+
- Google Gemini API key (for SmartAdd feature)

### Backend Setup

1. **Clone and navigate to the project**:
   ```bash
   git clone <repository-url>
   cd stuf
   ```

2. **Create virtual environment**:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

3. **Install dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Environment configuration**:
   Create a `.env` file in the root directory:
   ```env
   GEMINI_API_KEY=your_google_gemini_api_key_here
   ```

5. **Start the backend server**:
   ```bash
   python main.py
   ```
   Server runs on `http://localhost:8000`

### Frontend Setup

1. **Navigate to frontend directory**:
   ```bash
   cd frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start development server**:
   ```bash
   npm run dev
   ```
   Application runs on `http://localhost:5173`

### Mobile Development

For mobile testing on local network:

1. **Start backend with network access**:
   ```bash
   python main.py  # Already configured for 0.0.0.0:8000
   ```

2. **Start frontend with host flag**:
   ```bash
   cd frontend
   npm run dev -- --host
   ```

3. **Access from mobile device**:
   Use your computer's IP address (e.g., `http://192.168.1.100:5173`)

## 📱 Mobile Features

### Camera Integration
- **Native Camera Access**: Take photos directly from mobile browsers
- **Environment Camera**: Automatically uses rear camera for better item photography
- **Fallback Support**: Graceful fallback to file picker on unsupported devices

### Responsive Design
- **Adaptive Layouts**: Components automatically adjust for screen size
- **Touch Optimization**: All interactive elements sized for finger navigation
- **Compact Views**: Condensed layouts maximize screen real estate
- **Gesture Support**: Native mobile gestures and interactions

### Network Flexibility
- **Dynamic Configuration**: Automatically detects and uses correct API endpoints
- **CORS Support**: Configured for cross-origin requests from mobile devices
- **Debug Tools**: Built-in connectivity testing at `/debug` route

## 🤖 AI SmartAdd Feature

### How It Works
1. **Photo Upload**: Select up to 3 photos of your item
2. **AI Analysis**: Google Gemini Flash 2.0 analyzes the images
3. **Smart Suggestions**: Receive confident suggestions for:
   - Item name
   - Category (from existing categories)
   - Quantity
   - Custom attributes
4. **Duplicate Detection**: System checks for similar existing items
5. **Choose Action**: Either increment existing items or create new ones

### AI Capabilities
- **Multi-Photo Context**: Analyzes multiple angles for better accuracy
- **Category Intelligence**: Suggests from existing categories to maintain consistency
- **Attribute Extraction**: Identifies relevant custom attributes from images
- **Confidence Scoring**: Provides confidence levels for suggestions
- **Error Handling**: Graceful fallback when AI analysis fails

### Duplicate Detection
- **Smart Matching**: Compares suggested items with existing inventory
- **Increment Options**: Offers to increase quantity of similar items
- **User Choice**: Final decision remains with the user
- **Efficiency**: Avoids duplicate entries and maintains clean inventory

## 🎨 UI/UX Features

### Theme System
- **Dark/Light Mode**: Complete theme support with smooth transitions
- **System Preference**: Automatically detects and follows system theme
- **Persistent Settings**: Theme preference saved across sessions
- **Accessible Colors**: High contrast ratios for readability

### Component Library
Built with modern shadcn/ui components:
- **Forms**: Validated input fields with error handling
- **Dialogs**: Modal interfaces for confirmations and detailed views
- **Tables**: Responsive data display with sorting
- **Buttons**: Consistent styling with loading states
- **Cards**: Clean item display with hover effects

### Mobile-First Design
- **Responsive Grid**: 2-6 column layout based on screen size
- **Compact Cards**: Optimized information density
- **Touch Targets**: Minimum 48px for accessibility
- **Overlay Elements**: Space-efficient badge positioning
- **Stacked Layouts**: Vertical arrangements on narrow screens

## 🔧 Technical Architecture

### Backend (FastAPI)
- **RESTful API**: Clean endpoint design with proper HTTP methods
- **SQLite Database**: Lightweight, file-based storage
- **File Management**: Secure image upload and storage
- **AI Integration**: Google Gemini API for image analysis
- **CORS Configuration**: Cross-origin support for development

### Frontend (React + TypeScript)
- **Modern React**: Hooks, context, and functional components
- **TypeScript**: Full type safety and IntelliSense support
- **Vite**: Fast development server and optimized builds
- **Tailwind CSS**: Utility-first styling with custom theme
- **Component Architecture**: Reusable, composable UI components

### State Management
- **React Hooks**: useState, useEffect, useContext for local state
- **Custom Hooks**: Reusable logic for API calls and data fetching
- **Context Providers**: Theme and configuration management
- **Local Storage**: Persistent user preferences

## 📊 Data Management

### Item Schema
```typescript
interface Item {
  id: number;
  name: string;
  category: string;
  quantity: number;
  image_url?: string;
  qr_code_url?: string;
  custom_attributes: Record<string, any>;
  created_at: string;
  updated_at: string;
}
```

### Database Operations
- **CRUD Operations**: Full create, read, update, delete support
- **Bulk Operations**: Efficient multi-item updates
- **Search Indexing**: Fast text search across all fields
- **Data Export**: CSV export functionality
- **Migration Support**: Database schema versioning

## 🔍 Search & Filtering

### Search Capabilities
- **Global Search**: Searches across item names, categories, and custom attributes
- **Real-time Results**: Instant filtering as you type
- **Case Insensitive**: Flexible matching for better user experience
- **Partial Matching**: Finds items with partial text matches

### Filter Options
- **Category Filter**: Dropdown selection of available categories
- **Quantity Range**: Minimum and maximum quantity filters
- **Sort Options**: Multiple sorting criteria with ascending/descending
- **Active Filters**: Visual indicators of applied filters
- **Clear Filters**: One-click filter reset

### Performance
- **Client-side Filtering**: Fast, responsive filtering without server requests
- **Memoization**: Optimized re-renders with React.useMemo
- **Debounced Search**: Prevents excessive filtering during typing
- **Efficient Updates**: Minimal DOM updates for smooth performance

## 🔄 Bulk Operations

### Selection System
- **Bulk Mode Toggle**: Enter/exit selection mode
- **Visual Feedback**: Selected items highlighted with ring border
- **Selection Counter**: Shows number of selected items
- **Select All**: Bulk select all visible items

### Available Operations
- **Bulk Delete**: Remove multiple items with confirmation
- **Category Change**: Update category for selected items
- **Quantity Updates**: Add, subtract, or set quantities
- **CSV Export**: Export selected items to spreadsheet

### Safety Features
- **Confirmation Dialogs**: Prevent accidental bulk operations
- **Loading States**: Visual feedback during processing
- **Error Handling**: Graceful failure recovery
- **Undo Prevention**: Clear confirmations for destructive actions

## 🛠️ Development

### Project Structure
```
stuf/
├── main.py                 # FastAPI backend server
├── requirements.txt        # Python dependencies
├── migrate_db.py          # Database migration script
├── uploads/               # Uploaded images storage
├── qrcodes/              # Generated QR codes
└── frontend/
    ├── src/
    │   ├── components/    # React components
    │   ├── lib/          # Utilities and configuration
    │   ├── types/        # TypeScript type definitions
    │   └── App.tsx       # Main application component
    ├── package.json      # Node.js dependencies
    └── vite.config.ts    # Vite configuration
```

### Key Components
- **ItemList**: Main inventory grid with search and filtering
- **AddItemForm**: Item creation with SmartAdd integration
- **ItemDetails**: Detailed item view and editing
- **EnhancedSmartAdd**: AI-powered item recognition
- **CameraCapture**: Mobile camera integration
- **Navbar**: Navigation with theme toggle

### Configuration
- **Dynamic API URLs**: Automatic endpoint detection for mobile access
- **Theme System**: CSS custom properties for consistent theming
- **Responsive Breakpoints**: Tailwind CSS utility classes
- **Type Safety**: Full TypeScript coverage

## 🔒 Security & Privacy

### API Security
- **Environment Variables**: Secure API key storage
- **CORS Configuration**: Controlled cross-origin access
- **Input Validation**: Server-side request validation
- **Error Handling**: Secure error messages without sensitive data

### Data Privacy
- **Local Storage**: Images stored locally, not in cloud
- **API Key Protection**: Gemini API key secured on backend
- **No User Tracking**: No analytics or user data collection
- **Secure Uploads**: File type validation and sanitization

## 📈 Performance Optimizations

### Frontend Performance
- **Code Splitting**: Lazy loading of components
- **Image Optimization**: Efficient image loading and caching
- **Memoization**: Optimized re-renders with React hooks
- **Bundle Optimization**: Tree shaking and minification

### Backend Performance
- **SQLite Optimization**: Indexed queries for fast search
- **File Caching**: Efficient static file serving
- **API Response Optimization**: Minimal data transfer
- **Concurrent Processing**: Async request handling

### Mobile Performance
- **Touch Optimization**: Reduced tap delays
- **Image Compression**: Optimized file sizes for mobile networks
- **Lazy Loading**: Progressive content loading
- **Efficient Layouts**: Minimal reflows and repaints

## 🐛 Troubleshooting

### Common Issues

#### Mobile Access Problems
- **Symptom**: Can't access from mobile device
- **Solution**: Use `npm run dev -- --host` and access via IP address
- **Debug**: Visit `/debug` route for connectivity tests

#### AI SmartAdd Not Working
- **Symptom**: SmartAdd always fails
- **Solution**: Check `GEMINI_API_KEY` in `.env` file
- **Debug**: Check browser console for API errors

#### Images Not Loading
- **Symptom**: Uploaded images don't display
- **Solution**: Ensure `uploads/` directory exists and is writable
- **Debug**: Check network tab for 404 errors

#### Theme Issues
- **Symptom**: Colors look wrong or inconsistent
- **Solution**: Clear browser cache and localStorage
- **Debug**: Check CSS custom properties in developer tools

### Debug Tools
- **Connection Test**: Visit `/debug` for comprehensive connectivity tests
- **Console Logging**: Enhanced logging in development mode
- **Network Inspection**: Use browser dev tools to inspect API calls
- **Component State**: React Developer Tools for component inspection

## 🚀 Future Enhancements

### Planned Features
- **Barcode Scanning**: Camera-based barcode and QR code reading
- **Price Tracking**: AI-powered price detection from receipts
- **Expiration Dates**: Automatic expiry date recognition
- **Batch Processing**: Multiple item analysis in single photo
- **Advanced Analytics**: Inventory insights and reporting
- **Cloud Sync**: Optional cloud backup and synchronization

### Technical Improvements
- **Database Migration**: PostgreSQL support for larger datasets
- **Real-time Updates**: WebSocket integration for live updates
- **Progressive Web App**: Offline functionality and app installation
- **Advanced Search**: Elasticsearch integration for complex queries
- **API Versioning**: Structured API evolution support

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

### Development Setup
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📞 Support

If you encounter any issues or have questions, please:
1. Check the troubleshooting section above
2. Visit the `/debug` route for connectivity tests
3. Open an issue on GitHub with detailed information
4. Include browser console logs and network errors when applicable

---

Built with ❤️ using React, TypeScript, FastAPI, and Google Gemini AI. 