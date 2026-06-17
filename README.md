# Truck ELD (Electronic Logging Device) 🚚

A full-stack web application for managing truck routes, planning trips, and generating FMCSA-compliant Electronic Logging Device (ELD) daily logs.



---

## 📋 Features

✅ **Trip Planning**
- Input current location by coordinates or place name (Nominatim geocoding)
- Plan routes with pickup and dropoff locations
- View real-time route on interactive map (Leaflet + OpenStreetMap)
- Calculate optimal routing

✅ **ELD Daily Logs**
- Automatically generate FMCSA-compliant daily log sheets
- Compute duty status (driving, on-duty, sleeper berth, off-duty)
- Track Hours of Service (HOS) violations
- Export logs (visualization ready for PDF)

✅ **Contact Form**
- Send messages directly from the app
- Email notifications via Gmail SMTP

✅ **Responsive UI**
- Clean, modern React interface
- Mobile-friendly design
- Easy-to-use location and trip inputs

---

## 🛠️ Tech Stack

### Backend
- **Framework:** Django 4.2+
- **API:** Django REST Framework
- **Database:** PostgreSQL (production) / SQLite (development)
- **Server:** Gunicorn
- **Task:** Routing, ELD logic computation

### Frontend
- **Framework:** React 18
- **Build Tool:** Vite
- **Map Library:** Leaflet + OpenStreetMap
- **HTTP Client:** Axios

### Deployment
- **Platform:** Render.com (both frontend & backend)
- **Static Files:** WhiteNoise
- **Email:** Django SMTP (Gmail)
- **Geocoding:** Nominatim (OpenStreetMap)

---

## 📖 Table of Contents

- [Quick Start](#quick-start)
- [Local Development](#local-development)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Features Deep Dive](#features-deep-dive)
- [Contributing](#contributing)
- [Author](#author)

---

## Quick Start

### Prerequisites
- Python 3.11+
- Node.js 18+
- Git
- GitHub account (for deployment)

### 1. Clone Repository
```bash
git clone https://github.com/Aaryanmane/Truck-Log-ELD.git
cd Truck-Log-ELD
```

### 2. Backend Setup
```bash
cd backend
python -m venv venv
venv\Scripts\activate  # Windows
# source venv/bin/activate  # macOS/Linux

pip install -r requirements.txt
python manage.py migrate
python manage.py runserver
```

Backend runs at: `http://localhost:8000`

### 3. Frontend Setup (New Terminal)
```bash
cd frontend
npm install
npm run dev
```

Frontend runs at: `http://localhost:5173`

### 4. Access App
- Open browser: `http://localhost:5173`
- Backend API: `http://localhost:8000/api`
- Admin panel: `http://localhost:8000/admin`

---

## Local Development

### Backend Commands

```bash
cd backend
source venv/bin/activate  # or venv\Scripts\activate on Windows

# Run development server
python manage.py runserver

# Create superuser (for admin panel)
python manage.py createsuperuser

# Run migrations
python manage.py migrate

# Create migrations
python manage.py makemigrations

# Access admin
# http://localhost:8000/admin
```

### Frontend Commands

```bash
cd frontend

# Development server (hot reload)
npm run dev

# Production build
npm run build

# Preview production build
npm run preview
```

### Testing

```bash
# Backend
cd backend
python manage.py test

# Frontend (if tests configured)
cd frontend
npm test
```


---

## API Endpoints

### Trip Planning
```
POST /api/plan-trip/
Content-Type: application/json

{
  "current_location": {"lat": 40.7128, "lon": -74.0060},
  "pickup_location": {"lat": 41.8781, "lon": -87.6298},
  "dropoff_location": {"lat": 39.7392, "lon": -104.9903},
  "current_cycle_hours": 30.5
}

Response:
{
  "route": {...},
  "estimated_duration": 24.5,
  "daily_logs": [...]
}
```

### Daily Logs
```
GET /api/logs/
GET /api/logs/<id>/
POST /api/logs/
```

### Contact
```
POST /api/contact/
Content-Type: application/json

{
  "name": "John Doe",
  "message": "Great app!"
}

Response: {"ok": true}
```

---

## Project Structure

```
Truck-Log-ELD/
├── backend/
│   ├── truck_eld_project/
│   │   ├── settings.py          # Django configuration (Render-ready)
│   │   ├── urls.py              # URL routing
│   │   └── wsgi.py              # WSGI application
│   ├── eld/
│   │   ├── models.py            # Database models
│   │   ├── views.py             # API views
│   │   ├── serializers.py       # DRF serializers
│   │   ├── urls.py              # App URLs
│   │   └── services/
│   │       ├── eld_logic.py     # Hours of Service logic
│   │       └── routing.py       # Route calculation
│   ├── manage.py
│   ├── requirements.txt         # Python dependencies
│   └── .env.example             # Environment template
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx              # Main React component
│   │   ├── main.jsx             # Entry point
│   │   ├── styles.css           # Global styles
│   │   ├── api/
│   │   │   └── client.js        # Axios instance (Render-ready)
│   │   ├── components/
│   │   │   ├── MapView.jsx      # Leaflet map
│   │   │   ├── DailyLogSheet.jsx# Log visualization
│   │   │   └── ELDLogDrawer.jsx # Modal drawer
│   │   └── pages/
│   │       └── TripPlanner.jsx  # Main trip page
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── .env.example             # Environment template
│
├── render.yaml                   # Render orchestration (optional)
├── .gitignore
└── README.md                     # This file
```

---

## Environment Variables

### Backend (.env)
```env
# Django
SECRET_KEY=your-secret-key-here
DEBUG=False
ALLOWED_HOSTS=localhost,127.0.0.1,your-domain.com

# Database
DATABASE_URL=postgres://user:password@host:port/dbname  # Optional, uses SQLite if empty

# CORS
CORS_ALLOWED_ORIGINS=http://localhost:5173,https://your-frontend.com

# Email (Gmail)
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-16-char-app-password
```

### Frontend (.env.local)
```env
VITE_API_BASE_URL=http://localhost:8000  # For local dev
# In production (Render), set to: https://truck-eld-backend.onrender.com
```

---

## Features Deep Dive

### 1. Trip Planning with Geolocation

**Input Methods:**
- **Coordinates:** Latitude, Longitude (decimal)
- **Place Name:** Search by city, address (uses Nominatim/OpenStreetMap)

**Route Calculation:**
- Uses OSRM or OpenRouteService API
- Displays route with markers on Leaflet map
- Shows distance and estimated time

### 2. ELD Daily Logs

**Automatic Computation:**
- FMCSA Hours of Service (HOS) compliance
- 14-hour workday rule
- 11-hour driving limit per day
- 70-hour / 8-day cycle (Property-carrying drivers)
- 30-minute break requirement

**Outputs:**
- Daily log sheets (compliant with FMCSA 395.8)
- Duty status tracking
- Violations alert
- Print/export ready

### 3. Contact Form

**Features:**
- Send messages without creating account
- Email delivered to admin
- Validation and error handling
- CSRF protection

---

## Assumptions & Rules Implemented

✅ **Property-Carrying Driver**
- 70-hour workday limit per 8 days
- 11-hour driving limit per day
- 14-hour on-duty limit
- Fueling stops: every 1000 miles
- Pickup/Dropoff: 1 hour per location

✅ **Database Rules**
- Logs stored in PostgreSQL (production)
- Automatic migrations on deploy
- Soft-delete support (if configured)

---

## Security

✅ **Production Ready:**
- SECRET_KEY from environment (never hardcoded)
- DEBUG=False in production
- HTTPS enforced on Render
- CSRF protection enabled
- Secure cookies (session, CSRF)
- CORS whitelisting
- SQL injection protection (Django ORM)
- XSS protection enabled

⚠️ **Development:**
- Use .env.local or .env file (never commit)
- Change SECRET_KEY before production deploy
- Create strong admin password

---

## Troubleshooting

### Backend Won't Build on Render
- Check build command syntax (spaces, paths)
- Ensure all dependencies in requirements.txt
- View logs: Render Dashboard → Service → Logs

### Frontend Can't Connect to API
- Verify VITE_API_BASE_URL is set correctly
- Check CORS_ALLOWED_ORIGINS on backend
- Open DevTools → Network tab to see requests

### Email Not Sending
- Verify EMAIL_HOST_USER and EMAIL_HOST_PASSWORD
- Use Gmail app-specific password (not main password)
- Check spam folder
- Enable "less secure apps" OR use app password

### Cold Start Delays
- Free Render services sleep after 15 mins
- First request after ~30 second wait
- Upgrade to paid plan to avoid (starts at $7/month)

---

## Performance Tips

1. **Frontend:**
   - Vite provides fast HMR in development
   - Optimized bundle in production (~80KB gzipped)
   - Lazy-load map components

2. **Backend:**
   - Database indexing on frequently queried fields
   - Use pagination for log lists
   - Cache route calculations

3. **Deployment:**
   - Use PostgreSQL instead of SQLite
   - Enable gzip compression
   - Set appropriate gunicorn workers

---

## Contributing

1. Fork the repo
2. Create feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open Pull Request

---

## Roadmap

- [ ] Integrate real-time OSRM directions
- [ ] Add driver certification/credentials
- [ ] Implement CoDriver support
- [ ] Mobile app (React Native)
- [ ] Push notifications for violations
- [ ] Integration with truck telematics APIs
- [ ] Advanced analytics dashboard

---

## License

MIT License - See LICENSE file for details

---

## Author

**Aaryan Mane**

- 🔗 GitHub: [@Aaryanmane](https://github.com/Aaryanmane)
- 💼 LinkedIn: [Aaryan Mane](https://www.linkedin.com/in/aaryan-mane-474a4a3aa/)
- 📧 Email: aaryanrahulmane@gmail.com

---

## Support

For issues, questions, or feature requests:
- Open an [Issue](https://github.com/Aaryanmane/Truck-Log-ELD/issues)
- Contact via email or LinkedIn

---

## Acknowledgments

- FMCSA HOS rules: [FMCSA Guide](https://www.fmcsa.dot.gov/regulations/hours-service)
- Nominatim/OpenStreetMap for geocoding
- Leaflet for interactive maps
- Django and React communities

---

## Quick Links

- 📍 [Live App](https://truck-eld-frontend.onrender.com)
- 🔌 [API Documentation](https://truck-eld-backend.onrender.com)
- 📚 [Render Deployment](./DEPLOY_TO_RENDER.md)
- 🎯 [Project Checklist](./RENDER_CHECKLIST.md)

---

**Happy Trucking! 🚚**
