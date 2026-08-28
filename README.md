# ZeroPlate — "Share Food, Share Hope"

ZeroPlate is a two-sided intelligent food rescue platform connecting **Food Donors** (restaurants, caterers, hotels, households, volunteers) with **NGO Managers** (charities, food distribution networks) to route surplus meals to vulnerable communities before expiry.

---

## 🌟 Key Features

### 1. Distinct Non-Symmetric Roles & Lifecycles
- **Food Donors / Food Volunteers**:
  - Publish surplus food listings (`AVAILABLE`) with dietary type, meal count, packaging details, and pickup deadline.
  - Review incoming requests from local NGOs in the **NGO Requests Inbox** with comprehensive match score breakdowns.
  - **Accept or Reject** requests. On acceptance, the donation locks (`CONFIRMED`) and competing requests are atomically auto-rejected.
- **NGO Managers**:
  - Discover available surplus food via **Interactive GPS Radar Map** and **List View** with customizable search radius, dietary filters, and meal capacity thresholds.
  - Review **Smart Match Score Analysis** (40% Distance + 40% Capacity Fit + 20% Urgency Decay).
  - Submit food requests with requested quantities and notes.

### 2. Smart Matching Engine
- **Distance Factor (40%)**: Symmetric Haversine distance decay curve.
- **Capacity Compatibility (40%)**: Ratio of requested meals vs donor batch size.
- **Urgency Decay (20%)**: Time-sensitive score giving priority to food nearest to its pickup deadline.
- **Fairness-Guaranteed Premium Boost**: Tiered priority algorithm with mathematical bounds preventing lower-quality distant matches from overriding local emergencies.

### 3. Interactive GPS Radar Map
- Center hub representing the NGO's location with 5km and 15km radar rings.
- Dynamic color-coded pins for surplus food with match percentages and meal quantities.
- Interactive food inspection card synchronized with full details modal.

### 4. Impact & Sustainability Metrics
- Real-time tracking of **Total Meals Rescued**, **People Served**, **Food Waste Prevented (kg)**, and **Successful Pickups**.
- Interactive category distribution charts and live activity log.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Lucide Icons, Canvas-Confetti, Recharts
- **Backend**: Node.js, Express.js, TypeScript (`tsx`)
- **Testing**: Vitest (100% unit test coverage on matching algorithms & fairness rules)
- **Build Tool**: Vite

---

## 🚀 Getting Started

### 1. Install Dependencies
```bash
npm install
```

### 2. Run Locally
In two separate terminals:

**Start Backend Server:**
```bash
npm run server
```
*API runs on `http://localhost:3001`*

**Start Frontend Client:**
```bash
npm run client
```
*App runs on `http://localhost:5174` (or `http://localhost:5173`)*

### 3. Run Test Suite
```bash
npm run test
```

### 4. Build for Production
```bash
npm run build
```

---

## 👥 Demo Accounts

| Role | Email | Name | Default Portal |
| :--- | :--- | :--- | :--- |
| **Food Donor** | `donor@spicevilla.com` | SpiceVilla Restaurant | Food Donor Portal |
| **NGO Manager** | `ngo@hope.org` | Hope Foundation | NGO Rescue Portal |

---

## 📄 License
MIT License
