<div align="center">
  <img src="doc-assets/stuf_icon_logo.png" alt="Stuf Logo" width="200" height="200">
  
  # Stuf - Smart Inventory Management System
  
  A modern, **self-hosted** inventory management application with AI-powered item recognition, built with React, TypeScript, Python FastAPI, and Google Gemini AI.
  
  ![Python](https://img.shields.io/badge/Python-3.8+-blue.svg)
  ![React](https://img.shields.io/badge/React-18+-61DAFB.svg)
  ![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-blue.svg)
  ![FastAPI](https://img.shields.io/badge/FastAPI-Latest-009688.svg)
  ![License](https://img.shields.io/badge/License-MIT-green.svg)
  ![Self-Hosted](https://img.shields.io/badge/Self--Hosted-✓-brightgreen.svg)
</div>

> **🏠 Self-Hosted Solution**: Stuf is designed to run on your own hardware, giving you complete control over your data and privacy. No cloud dependencies, no monthly fees, no data sharing with third parties.

## 📋 Table of Contents

- [📸 Visual Overview](#-visual-overview)
- [✨ Key Features at a Glance](#-key-features-at-a-glance)
- [🌟 Features](#-features)
- [⚡ Quick Start](#-quick-start)
- [🔧 Advanced Configuration](#-advanced-configuration)
- [📱 Mobile Features](#-mobile-features)
- [🤖 AI SmartAdd Feature](#-ai-smartadd-feature)
- [🎨 UI/UX Features](#-uiux-features)
- [🔧 Technical Architecture](#-technical-architecture)
- [📊 Data Management](#-data-management)
- [🔍 Search & Filtering](#-search--filtering)
- [🔄 Bulk Operations](#-bulk-operations)
- [🛠️ Development](#️-development)
- [🏠 Why Self-Hosted?](#-why-self-hosted)
- [🔒 Security & Privacy](#-security--privacy)
- [🚀 Deployment Options](#-deployment-options)
- [📈 Performance Optimizations](#-performance-optimizations)
- [🐛 Troubleshooting](#-troubleshooting)
- [🖼️ Complete Interface Overview](#️-complete-interface-overview)
- [🚀 Future Enhancements](#-future-enhancements)

## 📸 Visual Overview

Get a quick look at Stuf's modern interface and powerful features:

### 🏠 Home Page - Inventory Grid
![Home Page](doc-assets/Home_Page.png)
*Clean, responsive grid layout with search, filtering, and bulk operations*

### ➕ Add New Item - Smart Form
![Add New Item](doc-assets/Add_new_Item.png)
*Intuitive item creation with custom attributes and image upload*

### 🤖 SmartAdd - AI-Powered Recognition
![SmartAdd Feature](doc-assets/Smart_Add.png)
*Upload photos and let AI suggest item details with duplicate detection*

### 📋 Item Details - Complete Information
![Item Details](doc-assets/item_details.png)
*Comprehensive item view with QR codes, attributes, and management options*

---

## ✨ Key Features at a Glance

<table>
<tr>
<td width="50%">

### 🏠 **Modern Inventory Management**
- Clean, responsive interface
- Real-time search and filtering
- Bulk operations support
- Mobile-optimized design

</td>
<td width="50%">

### 🤖 **AI-Powered SmartAdd**
- Photo analysis with Google Gemini
- Intelligent item suggestions
- Duplicate detection
- Confidence scoring

</td>
</tr>
<tr>
<td width="50%">

### 📱 **Mobile-First Design**
- Touch-friendly interface
- Camera integration
- Responsive layouts
- Network flexibility

</td>
<td width="50%">

### 🔒 **Self-Hosted Privacy**
- Complete data control
- No cloud dependencies
- Zero ongoing costs
- Offline functionality

</td>
</tr>
</table>

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

## ⚡ Quick Start

Get Stuf running on your local machine in under 5 minutes!

### System Requirements

| Component | Minimum | Recommended |
|-----------|---------|-------------|
| **OS** | Windows 10, macOS 10.15, Ubuntu 18.04 | Latest versions |
| **RAM** | 4GB | 8GB+ |
| **Storage** | 2GB free space | 5GB+ (for images) |
| **Network** | Internet for AI features | Stable connection |

### Dependencies

Before starting, ensure you have these installed:

#### Required
- **Python 3.8+** - [Download here](https://www.python.org/downloads/)
- **Node.js 16+** - [Download here](https://nodejs.org/)
- **Git** - [Download here](https://git-scm.com/)

#### Optional (for AI features)
- **Google Gemini API Key** - [Get free key](https://aistudio.google.com/)

### 🚀 Installation Steps

#### 1. Clone the Repository
```bash
git clone https://github.com/your-username/stuf.git
cd stuf
```

#### 2. Backend Setup (Python)
```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Create environment file (optional, for AI features)
echo "GEMINI_API_KEY=your_api_key_here" > .env
echo "DATABASE_URL=sqlite:///./inventory.db" >> .env
```

#### 3. Frontend Setup (Node.js)
```bash
# Navigate to frontend directory
cd frontend

# Install dependencies
npm install

# Return to project root
cd ..
```

#### 4. Start the Application
```bash
# Terminal 1: Start backend server
python main.py

# Terminal 2: Start frontend (in new terminal)
cd frontend && npm run dev
```

#### 5. Access Your Stuf
- **Application**: http://localhost:5173
- **API Documentation**: http://localhost:8000/docs

### 🎉 You're Ready!
Your Stuf inventory system is now running locally. Start by adding your first item!

### 🔧 Quick Troubleshooting

**Backend won't start?**
- Check Python version: `python --version` (should be 3.8+)
- Ensure virtual environment is activated (you should see `(venv)` in terminal)
- Try: `pip install -r requirements.txt --upgrade`

**Frontend won't start?**
- Check Node version: `node --version` (should be 16+)
- Try: `npm install --force` in the frontend directory
- Clear cache: `npm cache clean --force`

**Can't access from mobile?**
- Start frontend with: `npm run dev -- --host`
- Access via your computer's IP address (e.g., `http://192.168.1.100:5173`)

**AI features not working?**
- Ensure you have a valid `GEMINI_API_KEY` in your `.env` file
- Check the backend logs for API errors

## 🔧 Advanced Configuration

### Environment Variables

Create a `.env` file in the project root for advanced configuration:

```env
# Database Configuration
DATABASE_URL=sqlite:///./inventory.db

# AI Features (Optional)
GEMINI_API_KEY=your_google_gemini_api_key_here

# Server Configuration (Optional)
HOST=0.0.0.0
PORT=8000
DEBUG=false

# Security Configuration (Production)
ALLOWED_ORIGINS=http://localhost:5173,http://192.168.1.100:5173
# For development, leave ALLOWED_ORIGINS unset or use "*"

# File Upload Limits (Optional)
MAX_FILE_SIZE=10485760  # 10MB in bytes
ALLOWED_EXTENSIONS=jpg,jpeg,png,gif,webp
```

### Database Options

**SQLite (Default)**
- Perfect for personal use
- Single file database
- No additional setup required

**PostgreSQL (Advanced)**
- Better for multi-user scenarios
- Requires separate PostgreSQL installation
- Update `DATABASE_URL` in `.env`:
  ```env
  DATABASE_URL=postgresql://username:password@localhost/stuf_db
  ```

### Custom Deployment

**Raspberry Pi Setup**
```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install dependencies
sudo apt install python3-pip nodejs npm git -y

# Follow standard installation steps
git clone https://github.com/your-username/stuf.git
cd stuf
# ... continue with setup
```

**Windows Service**
Use `nssm` or `sc` to run as a Windows service for always-on operation.

**Linux Systemd Service**
Create `/etc/systemd/system/stuf.service`:
```ini
[Unit]
Description=Stuf Inventory Management
After=network.target

[Service]
Type=simple
User=stuf
WorkingDirectory=/home/stuf/stuf
ExecStart=/home/stuf/stuf/venv/bin/python main.py
Restart=always

[Install]
WantedBy=multi-user.target
```

## 📱 Mobile Features

<div align="center">
  <img src="doc-assets/Add_new_Item.png" alt="Mobile-Friendly Interface" width="500">
  <p><em>Mobile-optimized interface with touch-friendly controls and camera integration</em></p>
</div>

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

<div align="center">
  <img src="doc-assets/Smart_Add.png" alt="SmartAdd in Action" width="600">
  <p><em>SmartAdd analyzing photos and suggesting item details with duplicate detection</em></p>
</div>

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

<div align="center">
  <img src="doc-assets/item_details.png" alt="Item Details View" width="500">
  <p><em>Comprehensive item details with QR codes, custom attributes, and management options</em></p>
</div>

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

## 🏠 Why Self-Hosted?

### Benefits of Self-Hosting Stuf

**🔒 Complete Privacy**
- Your inventory data never leaves your network
- No third-party access to your personal items
- Full control over who can access your system

**💰 Zero Ongoing Costs**
- No monthly subscription fees
- No per-user pricing
- Only pay for your own hardware and electricity

**🛠️ Full Customization**
- Modify the code to fit your specific needs
- Add custom features and integrations
- No vendor lock-in or feature limitations

**📶 Works Offline**
- Core functionality works without internet
- Only AI features require online connectivity
- Perfect for remote locations or unreliable internet

**🚀 Performance**
- Runs on your hardware, optimized for your usage
- No network latency to external servers
- Scale resources based on your needs

### Self-Hosting Considerations

**📋 Requirements**
- Basic technical knowledge helpful but not required
- Computer or server to run the application
- Regular backups recommended (database is a single SQLite file)

**🔧 Maintenance**
- Keep dependencies updated for security
- Monitor disk space for uploaded images
- Backup your `inventory.db` file regularly

**🌐 Network Access**
- Runs on your local network by default
- Can be configured for remote access if needed
- Mobile access works on same WiFi network

## 🔒 Security & Privacy

### Production Security Checklist

Before deploying to production, ensure you:

**✅ Environment Configuration**
- Set `DEBUG=false` in your `.env` file
- Configure `ALLOWED_ORIGINS` to specific domains (not "*")
- Use strong, unique `GEMINI_API_KEY`
- Set proper file permissions on `.env` file (600)

**✅ Network Security**
- Use HTTPS in production (SSL/TLS certificates)
- Configure firewall rules for ports 8000 and 5173
- Consider using a reverse proxy (nginx/Apache)
- Restrict database access to localhost only

**✅ File Security**
- Regular backups of `inventory.db` and `uploads/` directory
- Monitor disk space for uploaded images
- Implement file size limits and type validation
- Consider virus scanning for uploaded files

**✅ Access Control**
- Remove or secure the `/debug` endpoint in production
- Implement authentication if needed for multi-user scenarios
- Regular security updates for dependencies
- Monitor application logs for suspicious activity

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

## 🚀 Deployment Options

### Local Development (Default)
Perfect for personal use and testing:
```bash
# Backend
python main.py

# Frontend
cd frontend && npm run dev
```

### Production Deployment

#### Option 1: Local Network Server
Run on a dedicated machine (Raspberry Pi, old laptop, etc.):

```bash
# Backend (production mode)
pip install gunicorn
gunicorn -w 4 -k uvicorn.workers.UvicornWorker main:app --bind 0.0.0.0:8000

# Frontend (build for production)
cd frontend
npm run build
npm install -g serve
serve -s dist -l 5173
```

#### Option 2: Docker Deployment
Create a `Dockerfile` for containerized deployment:

```dockerfile
# Example Dockerfile (create this file)
FROM python:3.11-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install -r requirements.txt
COPY . .
EXPOSE 8000
CMD ["python", "main.py"]
```

#### Option 3: VPS/Cloud Server
Deploy on any VPS provider (DigitalOcean, Linode, AWS, etc.):
- Follow the standard installation steps
- Configure firewall to allow ports 8000 and 5173
- Set up SSL certificate for secure access
- Consider using a reverse proxy (nginx/Apache)

### Backup Strategy

**Essential Files to Backup:**
- `inventory.db` - Your entire database
- `uploads/` - All uploaded images
- `.env` - Your configuration (keep secure!)

**Automated Backup Script:**
```bash
#!/bin/bash
# backup.sh - Run daily via cron
DATE=$(date +%Y%m%d_%H%M%S)
mkdir -p backups
cp inventory.db backups/inventory_$DATE.db
tar -czf backups/uploads_$DATE.tar.gz uploads/
echo "Backup completed: $DATE"
```

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

## 🖼️ Complete Interface Overview

<div align="center">
  <img src="doc-assets/Home_Page.png" alt="Complete Home Interface" width="800">
  <p><em>Full home page showing the complete inventory management interface with search, filtering, and grid layout</em></p>
</div>

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