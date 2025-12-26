# niladri_dey_doc

# A Cost Effective and Power Aware Load Balancing Strategy for Cloud using Genetic Optimization & Machine Learning

PhD Research Implementation - Full Stack Application

## Project Structure

```
├── frontend/          # React frontend application
├── backend/           # Node.js/Express backend API
│   ├── algorithms/    # All algorithm implementations
│   │   ├── phase1/    # Phase 1 algorithms
│   │   ├── phase2/    # Phase 2 algorithms
│   │   ├── phase3/    # Phase 3 algorithms
│   │   └── phase4/    # Phase 4 algorithms
│   └── dataset/       # PlanetLab dataset files
└── package.json       # Root package.json
```

## Local Development

### Prerequisites
- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Install all dependencies
npm run install-all

# Or install separately
npm install
cd backend && npm install
cd ../frontend && npm install
```

### Running Locally

```bash
# Run both frontend and backend concurrently
npm run dev

# Or run separately:
# Terminal 1 - Backend
cd backend
npm start

# Terminal 2 - Frontend
cd frontend
npm start
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## Deployment

### Frontend (Netlify)

1. **Build the frontend:**
   ```bash
   cd frontend
   npm install
   npm run build
   ```

2. **Deploy to Netlify:**
   - Connect your Git repository to Netlify
   - Set build command: `cd frontend && npm install && npm run build`
   - Set publish directory: `frontend/build`
   - Add environment variable: `REACT_APP_API_URL=https://your-backend.onrender.com`

3. **Update API URL in frontend:**
   - Update `netlify.toml` with your Render backend URL
   - Or set `REACT_APP_API_URL` environment variable in Netlify

### Backend (Render)

1. **Prepare backend:**
   - Ensure `backend/package.json` has correct start script
   - Create `render.yaml` in root (already created)

2. **Deploy to Render:**
   - Connect your Git repository to Render
   - Create a new Web Service
   - Set:
     - Build Command: `cd backend && npm install`
     - Start Command: `cd backend && npm start`
     - Environment: Node
     - Add environment variable: `PORT=10000`

3. **Upload Dataset:**
   - Dataset files are too large for Git
   - Upload `backend/dataset/` folder to Render using:
     - Render's persistent disk feature, OR
     - Upload via SSH/SFTP after deployment

## Environment Variables

### Backend (.env)
```
PORT=5000
NODE_ENV=production
FRONTEND_URL=https://your-app.netlify.app
```

### Frontend (Netlify Environment Variables)
```
REACT_APP_API_URL=https://your-backend.onrender.com
```

## API Endpoints

- `GET /api/phases` - Get all phase information
- `GET /api/research-overview` - Get research overview
- `GET /api/health` - Health check
- `POST /api/phase1/run-algorithms` - Run Phase 1 algorithms
- `POST /api/phase2/run-algorithms` - Run Phase 2 algorithms
- `POST /api/phase3/run-algorithms` - Run Phase 3 algorithms
- `POST /api/phase4/run-algorithms` - Run Phase 4 algorithms
- `GET /api/datasets` - List available datasets
- `GET /api/datasets/:date/files` - List files for a date
- `GET /api/datasets/:date/files/:filename` - Preview file content

## Algorithms Implemented

### Phase 1 (5 Threshold Detection + 4 VM Consolidation = 20 combinations)
- Threshold Detection: IQR, LR, MAD, LRR, THR
- VM Consolidation: MC, MMT, MU, RS

### Phase 2 (4 algorithms)
- Algorithm 8: SBCSL - Service Based Categorization and Summarization of Loads
- Algorithm 9: CCPLP - Corrective Coefficient Based Pheromone Level Prediction
- Algorithm 10: CBLP - Correlation Based Load Prediction
- Algorithm 11: LB-PCC-CP - Load Balancing by Predictive Corrective Coefficient and Correlative Prediction

### Phase 3 (5 algorithms)
- Algorithm 12: LGT-LCI - Local and Global Threshold Based Load Condition Identification
- Algorithm 13: TDLI - Time-Dependent Location Identification
- Algorithm 14: PLGB-PD - Predictive Local and Global Best Position Detection
- Algorithm 15: SSOF - System Stability Driven Objective Function
- Algorithm 16: TVPL-CV-PSO-LB - Time-Variant Predictive Location Driven Corrective Velocity Based Particle Swarm Optimization for Load Balancing

### Phase 4 (1 algorithm)
- Algorithm 17: ACO-PSO Hybrid - ACO and PSO Inspired Hybrid Load Balancing Algorithm

**Total: 30 algorithms implemented**

## Dataset

PlanetLab dataset with 10 dates:
- 20110303, 20110306, 20110309, 20110322, 20110325
- 20110403, 20110409, 20110411, 20110412, 20110420

## Authors

- **Niladri Sekhar Dey** - Ph.D. Scholar (PART TIME)
- **Dr. S. Hrushikesava Raju** - Associate Professor, Department of CSE
- **KONERU LAKSHMAIAH EDUCATION FOUNDATION**

## License

MIT
