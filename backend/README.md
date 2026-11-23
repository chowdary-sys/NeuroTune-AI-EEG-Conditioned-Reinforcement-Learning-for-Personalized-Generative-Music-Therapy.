# NeuroTune AI – Backend Architecture & Deployment Guide

## Research Foundation
**Paper**: *"EEG-Conditioned Reinforcement Learning for Personalized Generative Music Therapy: A Closed-Loop Framework and Simulation Study"*

This repository implements a full-stack, closed-loop neuro-adaptive system:
1. **Signal Processing**: 3-lead EEG acquisition ($F_3, F_4, P_z$), digital 2nd-order Butterworth filtering ($0.5 - 45\text{ Hz}$), and Welch FFT periodogram band-power extraction ($\theta, \alpha, \beta$, Frontal Alpha Asymmetry $\text{FAA} = \ln(\alpha_{F4}) - \ln(\alpha_{F3})$, and Arousal Ratio $\beta_{Pz} / (\alpha_{Pz} + \theta_{Pz})$).
2. **Affective Decoder**: Ridge Regression model ($\lambda = 1.0$) mapping 11D spectral features to Valence and Arousal on Russell's Circumplex Affect Plane.
3. **Reinforcement Learning**: REINFORCE Policy Gradient with linear-Gaussian continuous tempo control ($\mu_\theta(s), \sigma$) and Softmax policies for Mode (Major/Minor) and Note Density (Sparse, Medium, Dense).
4. **Reward Engine**: Multi-objective formulation balancing emotional convergence progress ($\Delta \text{Dist}$), acoustic consonance ($Q$), preference congruence ($P$), and listener subjective feedback.
5. **Procedural Synthesizer**: Real-time Web Audio API synthesizer adjusting harmonics, cadence, and density.

---

## Directory Structure
```
/backend
├── main.py              # FastAPI server implementing REST endpoints
├── requirements.txt     # Python dependencies (NumPy, SciPy, Scikit-learn, FastAPI)
├── schema.sql           # SQLite & PostgreSQL database schema
└── README.md            # Backend documentation and execution instructions
```

---

## Installation & Setup

### 1. Python Environment Setup
```bash
cd backend
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
```

### 2. Database Initialization
```bash
# SQLite (Default)
sqlite3 neurotune.db < schema.sql

# PostgreSQL (Alternative)
psql -U postgres -d neurotune_db -f schema.sql
```

### 3. Running the FastAPI Server
```bash
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

Interactive API documentation will be available at:
- Swagger UI: `http://localhost:8000/docs`
- ReDoc: `http://localhost:8000/redoc`

---

## API Endpoints Overview

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/health` | Service health status and algorithm inventory |
| `POST` | `/api/eeg/preprocess` | Epoch segmentation, bandpass filtering, and band power extraction |
| `POST` | `/api/emotion/predict` | Ridge regression mapping from EEG features to Valence/Arousal |
| `POST` | `/api/rl/sample-action` | REINFORCE policy evaluation to sample musical parameters |
| `POST` | `/api/rl/calculate-reward` | Multi-objective reward calculation |

---

## Dual Execution Architecture
The application features a zero-dependency, isomorphic mathematical architecture:
- **Client-Side Engine (TypeScript)**: Runs 100% inside the browser with Web Audio API for latency-free closed-loop response.
- **Python Backend (FastAPI)**: Serves distributed compute, batch simulation sweeps (512 listeners, 300 iterations), and relational database archiving.
