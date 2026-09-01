from fastapi import APIRouter
from pydantic import BaseModel
auth_router = APIRouter()
class RegisterReq(BaseModel):
    phone: str
    name: str
@auth_router.post("/register")
def reg(req: RegisterReq): return {"token": "sample_jwt", "name": req.name}
