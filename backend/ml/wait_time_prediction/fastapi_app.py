"""
fastapi_app.py

Minimal FastAPI app exposing the wait-time prediction model.
Run standalone for local testing:

    uvicorn fastapi_app:app --reload --port 8001

In the larger backend, just import `predict` and `WaitTimeRequest` from
`predict.py` directly into your existing FastAPI app/router instead of
running this file -- it's provided as a runnable reference/smoke-test.
"""

from fastapi import FastAPI, HTTPException

from predict import WaitTimeRequest, WaitTimeResponse, predict

app = FastAPI(
    title="Wait Time Prediction API",
    description="Predicts outpatient queue waiting time (minutes) from live queue features.",
    version="1.0.0",
)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.post("/predict", response_model=WaitTimeResponse)
def predict_endpoint(payload: WaitTimeRequest):
    try:
        return predict(payload)
    except FileNotFoundError as e:
        raise HTTPException(status_code=503, detail=str(e))
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
