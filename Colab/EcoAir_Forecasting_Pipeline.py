# =============================================================================
# EcoAir — Air Quality Forecasting Pipeline (Google Colab)
# =============================================================================
# Architecture: Seq2Seq Bi-LSTM (Encoder-Decoder)
# Preprocessing: Outlier clipping (1st-99th pct) + StandardScaler
#
# Pipeline:
#   Cell 1: Install dependencies
#   Cell 2: Configuration — 63 provinces + API key
#   Cell 3: Data Collection (loops all provinces)
#   Cell 4: Helper functions (preprocessing, model, training, export)
#   Cell 5: Main loop — Train & Export for each province
#   Cell 6: C# .NET Integration Guide
# =============================================================================

# %% [markdown]
# # 🌍 EcoAir — Air Quality Forecasting Pipeline
# **Model**: Encoder-Decoder Bi-LSTM (Seq2Seq)
# **Runs all 63 provinces automatically.**

# %%
# =============================================================================
# CELL 1: Install Dependencies
# =============================================================================

import subprocess, sys

def install(package):
    subprocess.check_call([sys.executable, "-m", "pip", "install", "-q", package])

for pkg in ["onnx", "onnxruntime", "pandas", "scikit-learn", "requests", "joblib"]:
    try:
        __import__(pkg.replace("-", "_"))
    except ImportError:
        install(pkg)

print("✅ All dependencies installed.")

# %%
# =============================================================================
# CELL 2: Configuration — 63 Provinces + API Key
# =============================================================================

import requests
import pandas as pd
import numpy as np
import time
import json
import os
import joblib
from datetime import datetime, timedelta, timezone
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import mean_squared_error, mean_absolute_error, r2_score
import torch
import torch.nn as nn
from torch.utils.data import Dataset, DataLoader

# ╔══════════════════════════════════════════════════════════════════╗
# ║  ⚙️  CONFIGURATION — EDIT THESE VALUES                         ║
# ╚══════════════════════════════════════════════════════════════════╝
OPENWEATHERMAP_API_KEY = "YOUR_API_KEY_HERE"  # 🔑 Replace with your key

# ── Tọa độ 63 tỉnh thành Việt Nam (lat, lon) ────────────────────────────────
VIETNAM_PROVINCES = {
    # ══════════════════════  ĐỒNG BẰNG SÔNG HỒNG  ══════════════════════
    "Hà Nội":          (21.0285, 105.8542),
    "Hải Phòng":       (20.8449, 106.6881),
    "Quảng Ninh":      (21.0064, 107.2925),
    "Bắc Ninh":        (21.1861, 106.0763),
    "Hải Dương":       (20.9373, 106.3146),
    "Hưng Yên":        (20.6464, 106.0511),
    "Thái Bình":       (20.4463, 106.3365),
    "Hà Nam":          (20.5835, 105.9230),
    "Nam Định":        (20.4388, 106.1621),
    "Ninh Bình":       (20.2506, 105.9745),
    "Vĩnh Phúc":      (21.3609, 105.5474),
    # ══════════════════════  ĐÔNG BẮC BỘ  ══════════════════════
    "Hà Giang":        (22.8233, 104.9838),
    "Cao Bằng":        (22.6666, 106.2579),
    "Bắc Kạn":        (22.1443, 105.8348),
    "Tuyên Quang":     (21.8237, 105.2181),
    "Lào Cai":         (22.3380, 103.8440),
    "Yên Bái":         (21.7168, 104.8985),
    "Thái Nguyên":     (21.5942, 105.8482),
    "Lạng Sơn":       (21.8469, 106.7613),
    "Bắc Giang":      (21.2731, 106.1946),
    "Phú Thọ":        (21.3228, 105.4019),
    # ══════════════════════  TÂY BẮC BỘ  ══════════════════════
    "Điện Biên":      (21.3860, 103.0230),
    "Lai Châu":       (22.3964, 103.4706),
    "Sơn La":         (21.3270, 103.9144),
    "Hòa Bình":       (20.8171, 105.3378),
    # ══════════════════════  BẮC TRUNG BỘ  ══════════════════════
    "Thanh Hóa":       (19.8067, 105.7852),
    "Nghệ An":        (18.6790, 105.6813),
    "Hà Tĩnh":       (18.3559, 105.8877),
    "Quảng Bình":     (17.4690, 106.6222),
    "Quảng Trị":      (16.7504, 107.1855),
    "Thừa Thiên Huế": (16.4637, 107.5909),
    # ══════════════════════  NAM TRUNG BỘ  ══════════════════════
    "Đà Nẵng":        (16.0544, 108.2022),
    "Quảng Nam":      (15.5394, 108.0191),
    "Quảng Ngãi":     (15.1206, 108.8044),
    "Bình Định":      (13.7720, 109.2197),
    "Phú Yên":        (13.0882, 109.0929),
    "Khánh Hòa":      (12.2585, 109.0526),
    "Ninh Thuận":     (11.5752, 108.9890),
    "Bình Thuận":     (10.9280, 108.1002),
    # ══════════════════════  TÂY NGUYÊN  ══════════════════════
    "Kon Tum":         (14.3546, 108.0005),
    "Gia Lai":         (13.9832, 108.0025),
    "Đắk Lắk":       (12.7100, 108.2378),
    "Đắk Nông":      (12.0036, 107.6876),
    "Lâm Đồng":      (11.9465, 108.4419),
    # ══════════════════════  ĐÔNG NAM BỘ  ══════════════════════
    "Hồ Chí Minh":    (10.8231, 106.6297),
    "Bà Rịa - Vũng Tàu": (10.3460, 107.0843),
    "Bình Dương":     (11.1671, 106.6160),
    "Bình Phước":     (11.7511, 106.7234),
    "Đồng Nai":       (10.9453, 106.8243),
    "Tây Ninh":        (11.3352, 106.0986),
    # ══════════════════════  ĐỒNG BẰNG SÔNG CỬU LONG  ══════════════════════
    "Long An":         (10.5360, 106.4132),
    "Tiền Giang":     (10.3600, 106.3630),
    "Bến Tre":        (10.2415, 106.3759),
    "Trà Vinh":       ( 9.9347, 106.3455),
    "Vĩnh Long":      (10.2538, 105.9722),
    "Đồng Tháp":     (10.4525, 105.6329),
    "An Giang":        (10.3860, 105.4350),
    "Kiên Giang":     (10.0125, 105.0809),
    "Cần Thơ":        (10.0452, 105.7469),
    "Hậu Giang":      ( 9.7579, 105.6413),
    "Sóc Trăng":      ( 9.6039, 105.9800),
    "Bạc Liêu":      ( 9.2850, 105.7246),
    "Cà Mau":          ( 9.1769, 105.1524),
}

# ── Model / Training constants ───────────────────────────────────────────────
FEATURE_COLUMNS = [
    "pm25", "pm10", "co", "no2", "so2", "o3",
    "temperature_2m", "relative_humidity_2m",
    "wind_speed_10m", "wind_direction_10m", "surface_pressure",
    "hour_sin", "hour_cos", "dow_sin", "dow_cos",
]
TARGET_COLUMNS = ["pm25"]  # PM2.5-only objective
TARGET_INDICES = [FEATURE_COLUMNS.index(c) for c in TARGET_COLUMNS]

NUM_FEATURES    = len(FEATURE_COLUMNS)   # 15
NUM_TARGETS     = len(TARGET_COLUMNS)    # 1
LOOKBACK_HOURS  = 336   # 14 days × 24 hours
FORECAST_HOURS  = 48    # 48h forecast horizon (for 24h/48h use-cases)
BATCH_SIZE      = 32
NUM_EPOCHS      = 100
LEARNING_RATE   = 1e-3
PATIENCE        = 15

# Time range
END_DATE   = datetime.now(timezone.utc)
START_DATE = END_DATE - timedelta(days=730)

# Root output — saved to Google Drive so data persists across runtime changes
from google.colab import drive
drive.mount('/content/drive')
ROOT_OUTPUT = "/content/drive/MyDrive/ecoair_output"
os.makedirs(ROOT_OUTPUT, exist_ok=True)

# Device
device = torch.device("cuda" if torch.cuda.is_available() else "cpu")

print(f"🖥️  Device: {device}")
print(f"📅 Date range: {START_DATE.strftime('%Y-%m-%d')} → {END_DATE.strftime('%Y-%m-%d')}")
print(f"🏙️  Total provinces: {len(VIETNAM_PROVINCES)}")
print(f"📊 Config: lookback={LOOKBACK_HOURS}h, forecast={FORECAST_HOURS}h (evaluate @24h & @48h)")
print(f"   Features: {NUM_FEATURES}, Targets: {NUM_TARGETS}")

# %%
# =============================================================================
# CELL 3: Data Collection — Automatically fetch ALL 63 provinces
# =============================================================================

def fetch_air_quality_data(lat, lon, start_dt, end_dt, api_key):
    """Fetch historical air pollution from OpenWeatherMap (chunked by week)."""
    all_records = []
    chunk_start = start_dt
    chunk_size = timedelta(days=7)
    total_chunks = int((end_dt - start_dt).total_seconds() / chunk_size.total_seconds()) + 1

    for i in range(total_chunks):
        chunk_end = min(chunk_start + chunk_size, end_dt)
        if chunk_start >= end_dt:
            break

        url = (
            f"http://api.openweathermap.org/data/2.5/air_pollution/history"
            f"?lat={lat}&lon={lon}"
            f"&start={int(chunk_start.timestamp())}&end={int(chunk_end.timestamp())}"
            f"&appid={api_key}"
        )
        try:
            resp = requests.get(url, timeout=30)
            resp.raise_for_status()
            for entry in resp.json().get("list", []):
                comp = entry.get("components", {})
                all_records.append({
                    "timestamp": datetime.fromtimestamp(entry["dt"], tz=timezone.utc),
                    "pm25": comp.get("pm2_5"), "pm10": comp.get("pm10"),
                    "co": comp.get("co"), "no2": comp.get("no2"),
                    "so2": comp.get("so2"), "o3": comp.get("o3"),
                })
        except requests.exceptions.RequestException:
            pass

        chunk_start = chunk_end
        if (i + 1) % 30 == 0:
            print(f"      Air quality: {i+1}/{total_chunks} chunks")
        time.sleep(1.1)

    df = pd.DataFrame(all_records)
    if not df.empty:
        df = df.drop_duplicates(subset="timestamp").sort_values("timestamp").reset_index(drop=True)
    return df


def fetch_weather_data(lat, lon, start_dt, end_dt):
    """Fetch historical weather from Open-Meteo (free, chunked by year)."""
    all_dfs = []
    chunk_start = start_dt

    while chunk_start < end_dt:
        chunk_end = min(chunk_start + timedelta(days=365), end_dt)
        url = (
            f"https://archive-api.open-meteo.com/v1/archive"
            f"?latitude={lat}&longitude={lon}"
            f"&start_date={chunk_start.strftime('%Y-%m-%d')}"
            f"&end_date={chunk_end.strftime('%Y-%m-%d')}"
            f"&hourly=temperature_2m,relative_humidity_2m,"
            f"wind_speed_10m,wind_direction_10m,surface_pressure"
            f"&timezone=UTC"
        )
        try:
            resp = requests.get(url, timeout=60)
            resp.raise_for_status()
            hourly = resp.json().get("hourly", {})
            if "time" in hourly:
                all_dfs.append(pd.DataFrame({
                    "timestamp":           pd.to_datetime(hourly["time"], utc=True),
                    "temperature_2m":      hourly.get("temperature_2m"),
                    "relative_humidity_2m": hourly.get("relative_humidity_2m"),
                    "wind_speed_10m":      hourly.get("wind_speed_10m"),
                    "wind_direction_10m":  hourly.get("wind_direction_10m"),
                    "surface_pressure":    hourly.get("surface_pressure"),
                }))
        except requests.exceptions.RequestException:
            pass
        chunk_start = chunk_end + timedelta(days=1)
        time.sleep(0.5)

    df = pd.concat(all_dfs, ignore_index=True) if all_dfs else pd.DataFrame()
    if not df.empty:
        df = df.drop_duplicates(subset="timestamp").sort_values("timestamp").reset_index(drop=True)
    return df


# ── Main collection loop ────────────────────────────────────────────────────
print("=" * 70)
print(f"📡 DATA COLLECTION — {len(VIETNAM_PROVINCES)} provinces")
print("=" * 70)

collection_results = {}

for idx, (province, (lat, lon)) in enumerate(VIETNAM_PROVINCES.items(), 1):
    safe_name = province.replace(" ", "_").replace("-", "_")
    prov_dir  = os.path.join(ROOT_OUTPUT, safe_name)
    csv_path  = os.path.join(prov_dir, "raw_merged_data.csv")

    if os.path.exists(csv_path):
        df_existing = pd.read_csv(csv_path)
        collection_results[province] = len(df_existing)
        print(f"  [{idx:2d}/63] ⏭️  {province} — already exists ({len(df_existing)} rows)")
        continue

    os.makedirs(prov_dir, exist_ok=True)
    print(f"\n  [{idx:2d}/63] 🌐 {province} ({lat}, {lon})")

    df_air = fetch_air_quality_data(lat, lon, START_DATE, END_DATE, OPENWEATHERMAP_API_KEY)
    print(f"      🌫️  Air quality: {len(df_air)} records")

    df_weather = fetch_weather_data(lat, lon, START_DATE, END_DATE)
    print(f"      🌤️  Weather: {len(df_weather)} records")

    if df_air.empty or df_weather.empty:
        print(f"      ⚠️  Skipped — insufficient data")
        collection_results[province] = 0
        continue

    df_air["timestamp"]     = df_air["timestamp"].dt.floor("h")
    df_weather["timestamp"] = df_weather["timestamp"].dt.floor("h")
    df_merged = pd.merge(df_air, df_weather, on="timestamp", how="inner")
    df_merged = df_merged.sort_values("timestamp").reset_index(drop=True)

    df_merged.to_csv(csv_path, index=False)
    collection_results[province] = len(df_merged)
    print(f"      ✅ Merged: {len(df_merged)} rows → {csv_path}")

collected = sum(1 for v in collection_results.values() if v > 0)
print(f"\n{'=' * 70}")
print(f"📊 Collection complete: {collected}/{len(VIETNAM_PROVINCES)} provinces have data")
print(f"{'=' * 70}")

# %%
# =============================================================================
# CELL 4: Helper Functions — Preprocessing, Model, Training, Export
# =============================================================================
# Model: Encoder-Decoder Bi-LSTM (Seq2Seq)
# Preprocessing: Outlier clipping (1st-99th percentile) + StandardScaler
# =============================================================================

# ── Dataset class ────────────────────────────────────────────────────────────

class TimeSeriesDataset(Dataset):
    def __init__(self, data, lookback, forecast, target_indices):
        self.data = data
        self.lookback = lookback
        self.forecast = forecast
        self.target_indices = target_indices
        self.total_len = len(data) - lookback - forecast + 1

    def __len__(self):
        return max(0, self.total_len)

    def __getitem__(self, idx):
        X = self.data[idx : idx + self.lookback, :]
        y = self.data[idx + self.lookback : idx + self.lookback + self.forecast, :][:, self.target_indices]
        return torch.FloatTensor(X), torch.FloatTensor(y)


# ── Model: Encoder-Decoder Bi-LSTM ──────────────────────────────────────────
#
# WHY Seq2Seq LSTM WORKS (where TCN failed):
#
#   TCN approach:  336 timesteps → compress → 1 vector → FC → 48×1 values
#                  PROBLEM: destroys temporal info, impossible regression
#
#   Seq2Seq approach:
#     Encoder: Bi-LSTM reads 336h → accumulates hidden state (memory)
#     Decoder: LSTM uses that memory to generate 48h step-by-step
#              Each output hour is conditioned on the decoder's evolving state
#
#   This is how machine translation works (sentence in → sentence out)
#   and it's proven for time-series forecasting.

class Seq2SeqBiLSTM(nn.Module):
    """
    Encoder-Decoder Bidirectional LSTM for time-series forecasting.

    Encoder: Bi-LSTM reads (batch, 336, 15) → hidden state
    Decoder: LSTM generates (batch, 48, 1) using encoder's hidden state

    Input:  (batch, 336, 15)
    Output: (batch, 48, 1)
    """
    def __init__(self, num_features=15, hidden_size=256, num_layers=2,
                 forecast_horizon=48, num_targets=1, dropout=0.2):
        super().__init__()
        self.hidden_size = hidden_size
        self.num_layers = num_layers
        self.forecast_horizon = forecast_horizon
        self.num_targets = num_targets

        # Encoder: Bidirectional LSTM
        self.encoder = nn.LSTM(
            input_size=num_features,
            hidden_size=hidden_size,
            num_layers=num_layers,
            batch_first=True,
            bidirectional=True,
            dropout=dropout if num_layers > 1 else 0.0,
        )

        # Bridge: convert bidirectional hidden → unidirectional decoder
        self.h_bridge = nn.Linear(hidden_size * 2, hidden_size)
        self.c_bridge = nn.Linear(hidden_size * 2, hidden_size)

        # Decoder: Unidirectional LSTM
        self.decoder = nn.LSTM(
            input_size=num_targets,
            hidden_size=hidden_size,
            num_layers=num_layers,
            batch_first=True,
            dropout=dropout if num_layers > 1 else 0.0,
        )

        # Output projection
        self.output_proj = nn.Sequential(
            nn.Linear(hidden_size, hidden_size // 2),
            nn.ReLU(),
            nn.Dropout(dropout),
            nn.Linear(hidden_size // 2, num_targets),
        )

    def forward(self, x):
        batch_size = x.size(0)

        # ── Encode ──────────────────────────────────────────────────────
        _, (h_n, c_n) = self.encoder(x)
        # h_n: (num_layers*2, batch, hidden) → merge directions

        h_n = h_n.view(self.num_layers, 2, batch_size, self.hidden_size)
        c_n = c_n.view(self.num_layers, 2, batch_size, self.hidden_size)

        # Concat forward + backward → bridge to decoder size
        h_combined = torch.cat([h_n[:, 0], h_n[:, 1]], dim=2)
        c_combined = torch.cat([c_n[:, 0], c_n[:, 1]], dim=2)
        h_dec = torch.tanh(self.h_bridge(h_combined))
        c_dec = torch.tanh(self.c_bridge(c_combined))

        # ── Decode ──────────────────────────────────────────────────────
        # Feed zeros as decoder input (the hidden state carries the info)
        decoder_input = torch.zeros(
            batch_size, self.forecast_horizon, self.num_targets, device=x.device
        )
        decoder_out, _ = self.decoder(decoder_input, (h_dec, c_dec))

        # Project to target dimensions
        output = self.output_proj(decoder_out)
        return output


# ── Preprocessing — with outlier clipping + StandardScaler ───────────────────

def preprocess_province(csv_path, output_dir):
    """
    KEY FIXES vs previous versions:
    1. Clip outliers at 1st-99th percentile
       → CO spikes (10000+ µg/m³) no longer crush all other values near 0
    2. StandardScaler instead of MinMaxScaler
       → Centers data at 0, std=1. Much more robust.
    """
    df = pd.read_csv(csv_path, parse_dates=["timestamp"])

    # Time features help the model learn daily/weekly PM2.5 seasonality.
    ts = pd.to_datetime(df["timestamp"], utc=True)
    hour = ts.dt.hour.values
    dow = ts.dt.dayofweek.values
    df["hour_sin"] = np.sin(2 * np.pi * hour / 24.0)
    df["hour_cos"] = np.cos(2 * np.pi * hour / 24.0)
    df["dow_sin"] = np.sin(2 * np.pi * dow / 7.0)
    df["dow_cos"] = np.cos(2 * np.pi * dow / 7.0)

    df_features = df[FEATURE_COLUMNS].copy()

    # Handle NaN
    df_features = df_features.ffill().bfill()
    df_features = df_features.interpolate(method="linear", limit_direction="both")
    if df_features.isnull().sum().sum() > 0:
        df_features = df_features.fillna(df_features.median())

    # ── CRITICAL: Clip outliers ──────────────────────────────────────────
    clip_info = {}
    for col in FEATURE_COLUMNS:
        p01, p99 = df_features[col].quantile([0.01, 0.99])
        clip_info[col] = {"p01": float(p01), "p99": float(p99)}
        df_features[col] = df_features[col].clip(p01, p99)

    # ── CRITICAL: StandardScaler ─────────────────────────────────────────
    scaler = StandardScaler()
    data_scaled = scaler.fit_transform(df_features.values)

    # Save
    joblib.dump(scaler, os.path.join(output_dir, "scaler.pkl"))

    config = {
        "feature_columns": FEATURE_COLUMNS,
        "target_columns": TARGET_COLUMNS,
        "target_indices_in_features": TARGET_INDICES,
        "num_features": NUM_FEATURES,
        "num_targets": NUM_TARGETS,
        "lookback_hours": LOOKBACK_HOURS,
        "forecast_hours": FORECAST_HOURS,
        "scaler_type": "StandardScaler",
        "scaler_mean": scaler.mean_.tolist(),
        "scaler_std": scaler.scale_.tolist(),
        "clip_bounds": clip_info,
    }
    with open(os.path.join(output_dir, "feature_config.json"), "w") as f:
        json.dump(config, f, indent=2)

    # Check minimum size
    min_required = LOOKBACK_HOURS + FORECAST_HOURS + BATCH_SIZE
    if len(data_scaled) < min_required:
        return None, None, None

    # Split 80/20
    split = int(len(data_scaled) * 0.8)
    train_ds = TimeSeriesDataset(data_scaled[:split], LOOKBACK_HOURS, FORECAST_HOURS, TARGET_INDICES)
    test_ds  = TimeSeriesDataset(data_scaled[split:],  LOOKBACK_HOURS, FORECAST_HOURS, TARGET_INDICES)

    if len(train_ds) < BATCH_SIZE or len(test_ds) == 0:
        return None, None, None

    train_loader = DataLoader(train_ds, batch_size=BATCH_SIZE, shuffle=True,  drop_last=True)
    test_loader  = DataLoader(test_ds,  batch_size=BATCH_SIZE, shuffle=False, drop_last=False)

    return train_loader, test_loader, scaler


# ── Training ─────────────────────────────────────────────────────────────────

def train_model(model, train_loader, test_loader, output_dir):
    """Train Seq2Seq Bi-LSTM with MSE loss + ReduceLROnPlateau."""
    criterion = nn.MSELoss()
    optimizer = torch.optim.Adam(model.parameters(), lr=LEARNING_RATE, weight_decay=1e-5)
    scheduler = torch.optim.lr_scheduler.ReduceLROnPlateau(
        optimizer, mode='min', factor=0.5, patience=5, min_lr=1e-6
    )

    best_val_loss = float("inf")
    patience_counter = 0
    best_model_path = os.path.join(output_dir, "best_model.pt")

    for epoch in range(NUM_EPOCHS):
        model.train()
        train_loss, n = 0.0, 0
        for X, y in train_loader:
            X, y = X.to(device), y.to(device)
            optimizer.zero_grad()
            loss = criterion(model(X), y)
            loss.backward()
            torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
            optimizer.step()
            train_loss += loss.item(); n += 1
        avg_train = train_loss / max(n, 1)

        model.eval()
        val_loss, vn = 0.0, 0
        with torch.no_grad():
            for X, y in test_loader:
                X, y = X.to(device), y.to(device)
                val_loss += criterion(model(X), y).item(); vn += 1
        avg_val = val_loss / max(vn, 1)

        scheduler.step(avg_val)

        if avg_val < best_val_loss:
            best_val_loss = avg_val
            patience_counter = 0
            torch.save(model.state_dict(), best_model_path)
        else:
            patience_counter += 1

        if (epoch + 1) % 10 == 0 or patience_counter == 0:
            lr_now = optimizer.param_groups[0]['lr']
            print(f"      Epoch {epoch+1:3d} │ Train: {avg_train:.6f} │ Val: {avg_val:.6f}"
                  f" │ LR: {lr_now:.2e} │ {'⭐' if patience_counter == 0 else f'⏳{patience_counter}'}")

        if patience_counter >= PATIENCE:
            print(f"      ⛔ Early stop at epoch {epoch+1}")
            break

    model.load_state_dict(torch.load(best_model_path, map_location=device))
    return best_val_loss


# ── Evaluation ───────────────────────────────────────────────────────────────

def evaluate_model(model, test_loader, scaler, output_dir):
    model.eval()
    all_preds, all_labels, all_inputs = [], [], []
    with torch.no_grad():
        for X, y in test_loader:
            preds = model(X.to(device))
            all_preds.append(preds.cpu().numpy())
            all_labels.append(y.numpy())
            all_inputs.append(X.numpy())

    all_preds  = np.concatenate(all_preds,  axis=0)
    all_labels = np.concatenate(all_labels, axis=0)
    all_inputs = np.concatenate(all_inputs, axis=0)

    # Inverse scale (StandardScaler: X_orig = X_scaled * std + mean)
    def inv_scale(arr):
        N, H, T = arr.shape
        flat = arr.reshape(-1, T)
        full = np.zeros((flat.shape[0], NUM_FEATURES))
        for i, idx in enumerate(TARGET_INDICES):
            full[:, idx] = flat[:, i]
        full_inv = scaler.inverse_transform(full)
        return np.column_stack([full_inv[:, idx] for idx in TARGET_INDICES]).reshape(N, H, T)

    preds_orig  = inv_scale(all_preds)
    labels_orig = inv_scale(all_labels)

    pm25_idx = FEATURE_COLUMNS.index("pm25")
    pm25_std = float(scaler.scale_[pm25_idx])
    pm25_mean = float(scaler.mean_[pm25_idx])
    inputs_pm25_orig = all_inputs[:, :, pm25_idx] * pm25_std + pm25_mean

    def calc_mape(yt, yp):
        mask = np.abs(yt) > 1.0
        if not mask.any():
            return 0.0
        return float(np.mean(np.abs((yt[mask] - yp[mask]) / yt[mask])) * 100)

    per_target = {}
    horizon_metrics = {}
    rmse_list, mae_list, r2_list, mape_list = [], [], [], []

    for i, col in enumerate(TARGET_COLUMNS):
        y_t = labels_orig[:, :, i].flatten()
        y_p = preds_orig[:, :, i].flatten()

        t_rmse = float(np.sqrt(mean_squared_error(y_t, y_p)))
        t_mae  = float(mean_absolute_error(y_t, y_p))
        t_r2   = float(r2_score(y_t, y_p))
        t_mape = float(calc_mape(y_t, y_p))

        per_target[col] = {"rmse": t_rmse, "mae": t_mae, "r2_score": t_r2, "mape": t_mape}
        rmse_list.append(t_rmse)
        mae_list.append(t_mae)
        r2_list.append(t_r2)
        mape_list.append(t_mape)

        print(f"        {col:<6}: RMSE={t_rmse:8.4f}  MAE={t_mae:8.4f}  R²={t_r2:7.4f}  MAPE={t_mape:6.2f}%")

    # PM2.5-only horizon report for thesis / production checks
    pm25_truth = labels_orig[:, :, 0]
    pm25_pred = preds_orig[:, :, 0]
    horizons = [1, 6, 12, 24, 48]
    for h in horizons:
        if preds_orig.shape[1] >= h:
            h_idx = h - 1
            y_t_h = pm25_truth[:, h_idx]
            y_p_h = pm25_pred[:, h_idx]
            horizon_metrics[f"h{h}"] = {
                "rmse": float(np.sqrt(mean_squared_error(y_t_h, y_p_h))),
                "mae": float(mean_absolute_error(y_t_h, y_p_h)),
                "r2_score": float(r2_score(y_t_h, y_p_h)),
                "mape": float(calc_mape(y_t_h, y_p_h)),
            }
            print(f"        @+{h:2d}h: RMSE={horizon_metrics[f'h{h}']['rmse']:8.4f}  "
                  f"MAE={horizon_metrics[f'h{h}']['mae']:8.4f}  "
                  f"R²={horizon_metrics[f'h{h}']['r2_score']:7.4f}  "
                  f"MAPE={horizon_metrics[f'h{h}']['mape']:6.2f}%")

    # Baselines for fair comparison
    naive_last_pred = np.repeat(inputs_pm25_orig[:, -1][:, None], FORECAST_HOURS, axis=1)
    if LOOKBACK_HOURS >= 24:
        last_day = inputs_pm25_orig[:, -24:]
        repeat_times = int(np.ceil(FORECAST_HOURS / 24.0))
        seasonal_daily_pred = np.tile(last_day, (1, repeat_times))[:, :FORECAST_HOURS]
    else:
        seasonal_daily_pred = naive_last_pred.copy()

    baseline_metrics = {}
    for baseline_name, baseline_pred in [
        ("naive_last", naive_last_pred),
        ("seasonal_24h", seasonal_daily_pred),
    ]:
        b_horizon = {}
        for h in horizons:
            if pm25_truth.shape[1] >= h:
                h_idx = h - 1
                y_t_h = pm25_truth[:, h_idx]
                y_p_h = baseline_pred[:, h_idx]
                b_horizon[f"h{h}"] = {
                    "rmse": float(np.sqrt(mean_squared_error(y_t_h, y_p_h))),
                    "mae": float(mean_absolute_error(y_t_h, y_p_h)),
                    "r2_score": float(r2_score(y_t_h, y_p_h)),
                    "mape": float(calc_mape(y_t_h, y_p_h)),
                }
        baseline_metrics[baseline_name] = b_horizon

    print("        Baseline checkpoints (PM2.5):")
    for baseline_name, b_vals in baseline_metrics.items():
        line = f"          {baseline_name:<12}: "
        parts = []
        for h in [24, 48]:
            k = f"h{h}"
            if k in b_vals:
                parts.append(f"+{h}h RMSE={b_vals[k]['rmse']:.4f}, R²={b_vals[k]['r2_score']:.4f}")
        print(line + " | ".join(parts))

    result = {
        "rmse": float(np.mean(rmse_list)),
        "mae":  float(np.mean(mae_list)),
        "r2_score": float(np.mean(r2_list)),
        "mape": float(np.mean(mape_list)),
        "per_target": per_target,
        "horizon_metrics": horizon_metrics,
        "baseline_metrics": baseline_metrics,
        "task": "pm25_only_forecast_48h",
    }

    with open(os.path.join(output_dir, "evaluation_results.json"), "w") as f:
        json.dump(result, f, indent=2)

    return result


# ── ONNX export ──────────────────────────────────────────────────────────────

def export_onnx(model, output_dir):
    import onnx
    import onnxruntime as ort

    model.eval()
    model.to("cpu")

    dummy = torch.randn(1, LOOKBACK_HOURS, NUM_FEATURES)
    onnx_path = os.path.join(output_dir, "ecoair_pm25_lstm.onnx")

    torch.onnx.export(
        model, dummy, onnx_path,
        export_params=True, opset_version=17,
        do_constant_folding=True,
        input_names=["input"], output_names=["output"],
        dynamic_axes={"input": {0: "batch_size"}, "output": {0: "batch_size"}},
    )

    onnx_model = onnx.load(onnx_path)
    onnx.checker.check_model(onnx_model)

    with torch.no_grad():
        pt_out = model(dummy).numpy()
    ort_out = ort.InferenceSession(onnx_path).run(["output"], {"input": dummy.numpy()})[0]
    max_diff = np.max(np.abs(pt_out - ort_out))

    model.to(device)
    return onnx_path, max_diff


print("✅ All helper functions defined (Seq2Seq Bi-LSTM + StandardScaler).")

# %%
# =============================================================================
# CELL 5: Main Loop — Train & Export for ALL 63 provinces
# =============================================================================

print("=" * 70)
print(f"🚀 TRAINING & EXPORT — {len(VIETNAM_PROVINCES)} provinces")
print("=" * 70)

summary = {}

for idx, (province, (lat, lon)) in enumerate(VIETNAM_PROVINCES.items(), 1):
    safe_name = province.replace(" ", "_").replace("-", "_")
    prov_dir  = os.path.join(ROOT_OUTPUT, safe_name)
    csv_path  = os.path.join(prov_dir, "raw_merged_data.csv")
    onnx_path = os.path.join(prov_dir, "ecoair_pm25_lstm.onnx")

    print(f"\n{'─' * 70}")
    print(f"  [{idx:2d}/63] 🏙️  {province}")
    print(f"{'─' * 70}")

    if os.path.exists(onnx_path):
        print(f"    ⏭️  Already exported — skipping")
        eval_path = os.path.join(prov_dir, "evaluation_results.json")
        if os.path.exists(eval_path):
            with open(eval_path) as f:
                summary[province] = json.load(f)
        else:
            summary[province] = {"status": "exported"}
        continue

    if not os.path.exists(csv_path):
        print(f"    ⚠️  No data file — skipping")
        summary[province] = {"status": "no data"}
        continue

    print(f"    📊 Preprocessing (clip outliers + StandardScaler)...")
    train_loader, test_loader, scaler = preprocess_province(csv_path, prov_dir)

    if train_loader is None:
        print(f"    ⚠️  Insufficient data — skipping")
        summary[province] = {"status": "insufficient data"}
        continue

    print(f"    ✅ Train: {len(train_loader)} batches | Test: {len(test_loader)} batches")

    print(f"    🧠 Training Seq2Seq Bi-LSTM...")
    model = Seq2SeqBiLSTM(
        num_features=NUM_FEATURES, hidden_size=256, num_layers=2,
        forecast_horizon=FORECAST_HOURS, num_targets=NUM_TARGETS, dropout=0.2,
    ).to(device)

    best_loss = train_model(model, train_loader, test_loader, prov_dir)
    print(f"    ✅ Best val loss: {best_loss:.6f}")

    print(f"    📏 Evaluating...")
    eval_result = evaluate_model(model, test_loader, scaler, prov_dir)
    print(f"    ✅ RMSE={eval_result['rmse']:.4f} | MAE={eval_result['mae']:.4f} "
          f"| R²={eval_result['r2_score']:.4f} | MAPE={eval_result['mape']:.2f}%")
    if "h24" in eval_result.get("horizon_metrics", {}) and "h48" in eval_result.get("horizon_metrics", {}):
        h24 = eval_result["horizon_metrics"]["h24"]
        h48 = eval_result["horizon_metrics"]["h48"]
        print(f"    ✅ PM2.5 @+24h: RMSE={h24['rmse']:.4f}, R²={h24['r2_score']:.4f}"
              f" | @+48h: RMSE={h48['rmse']:.4f}, R²={h48['r2_score']:.4f}")

    print(f"    📦 Exporting ONNX...")
    onnx_file, diff = export_onnx(model, prov_dir)
    print(f"    ✅ ONNX saved → max diff: {diff:.8f}")

    summary[province] = eval_result

    del model
    torch.cuda.empty_cache() if torch.cuda.is_available() else None

# ── Final summary ────────────────────────────────────────────────────────────
print("\n" + "=" * 70)
print("📊 FINAL SUMMARY — All Provinces")
print("=" * 70)
print(f"{'Province':<25} {'RMSE':>10} {'MAE':>10} {'R²':>10} {'MAPE(%)':>10} {'Status':>12}")
print("-" * 77)

for province in VIETNAM_PROVINCES:
    r = summary.get(province, {})
    if isinstance(r, dict) and "rmse" in r:
        print(f"{province:<25} {r['rmse']:>10.4f} {r['mae']:>10.4f} "
              f"{r['r2_score']:>10.4f} {r['mape']:>10.2f} {'✅':>12}")
    else:
        status = r.get("status", "unknown") if isinstance(r, dict) else str(r)
        print(f"{province:<25} {'—':>10} {'—':>10} {'—':>10} {'—':>10} {status:>12}")

summary_path = os.path.join(ROOT_OUTPUT, "all_provinces_summary.json")
with open(summary_path, "w") as f:
    json.dump(summary, f, indent=2, ensure_ascii=False)
print(f"\n💾 Summary saved to: {summary_path}")

# %%
# =============================================================================
# CELL 6: C# .NET Integration Guide
# =============================================================================

csharp_guide = r"""
╔══════════════════════════════════════════════════════════════════════════════╗
║  C# .NET Integration — EcoAir Seq2Seq Bi-LSTM (StandardScaler)             ║
╚══════════════════════════════════════════════════════════════════════════════╝

   dotnet add package Microsoft.ML.OnnxRuntime --version 1.17.0

┌── File Structure ───────────────────────────────────────────────────────────┐
│  Models/{Province}/ecoair_pm25_lstm.onnx                                    │
│  Models/{Province}/feature_config.json   ← scaler_mean + scaler_std         │
│  Models/{Province}/evaluation_results.json                                  │
└─────────────────────────────────────────────────────────────────────────────┘

┌── feature_config.json (StandardScaler) ─────────────────────────────────────┐
│                                                                             │
│  {                                                                          │
│    "scaler_type": "StandardScaler",                                         │
│    "scaler_mean": [12.5, 20.3, 340.1, ...],  // 15 values                  │
│    "scaler_std":  [8.2, 15.1, 200.5, ...],   // 15 values                  │
│    "clip_bounds": { "pm25": {"p01": 1.2, "p99": 85.0}, ... }               │
│  }                                                                          │
│                                                                             │
│  // C# Scale:   scaled = (raw - mean) / std                                │
│  // C# Inverse: orig   = scaled * std + mean                               │
└─────────────────────────────────────────────────────────────────────────────┘

┌── C# Usage ─────────────────────────────────────────────────────────────────┐
│                                                                             │
│  // 1. Clip raw values                                                      │
│  foreach feature: clipped = Math.Clamp(raw, clip_p01, clip_p99)             │
│                                                                             │
│  // 2. Scale with StandardScaler                                            │
│  scaled[i] = (clipped[i] - scaler_mean[i]) / scaler_std[i]                 │
│                                                                             │
│  // 3. Run ONNX inference                                                   │
│  var tensor = new DenseTensor<float>(new[] { 1, 336, 15 });                 │
│  // ... fill tensor with 336 hours of scaled data ...                       │
│  var results = session.Run(new[] { NamedOnnxValue.CreateFromTensor(          │
│      "input", tensor) });                                                   │
│  // output shape: [1, 48, 1]                                                │
│                                                                             │
│  // 4. Inverse scale predictions                                            │
│  orig[i] = output[i] * scaler_std[target_idx] + scaler_mean[target_idx]     │
└─────────────────────────────────────────────────────────────────────────────┘

   ONNX SHAPE:  INPUT  "input"  → float32[batch, 336, 15]
                OUTPUT "output" → float32[batch, 48, 1]
"""

print(csharp_guide)

guide_path = os.path.join(ROOT_OUTPUT, "csharp_integration_guide.txt")
with open(guide_path, "w") as f:
    f.write(csharp_guide)

print(f"💾 C# guide saved to: {guide_path}")
print(f"\n🎉 Pipeline complete! Each province folder contains:")
print(f"   📄 ecoair_pm25_lstm.onnx     — Trained PM2.5 ONNX model")
print(f"   📄 feature_config.json       — StandardScaler params + clip bounds")
print(f"   📄 evaluation_results.json   — RMSE / MAE / R² / MAPE")
