from fastapi import FastAPI, APIRouter, HTTPException, Depends, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import create_engine, Column, String, DateTime, Boolean, Text, Integer, Float, ForeignKey
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session, relationship
from sqlalchemy.dialects.postgresql import UUID
from dotenv import load_dotenv
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional
from datetime import datetime, timedelta
import os
import logging
import uuid
import jwt
import bcrypt

# Load environment variables
ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Database setup
DATABASE_URL = os.environ.get('DATABASE_URL')
engine = create_engine(DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

# JWT Configuration
JWT_SECRET_KEY = os.environ.get('JWT_SECRET_KEY')
JWT_ALGORITHM = "HS256"
security = HTTPBearer()

# Database Models
class User(Base):
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    username = Column(String, unique=True, index=True)
    name = Column(String)
    phone_number = Column(String, unique=True)
    place = Column(String)
    aadhaar_number = Column(String, unique=True)
    hashed_password = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)
    
    # Relationships
    family_surveys = relationship("FamilySurvey", back_populates="asha_worker")
    pregnancy_reports = relationship("PregnancyReport", back_populates="asha_worker")

class FamilySurvey(Base):
    __tablename__ = "family_surveys"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    household_id = Column(String, index=True)
    members_list = Column(Text)  # JSON string
    sanitation = Column(String)
    chronic_illnesses = Column(Text)
    asha_worker_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    synced = Column(Boolean, default=False)
    
    asha_worker = relationship("User", back_populates="family_surveys")

class PregnancyReport(Base):
    __tablename__ = "pregnancy_reports"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    lmp = Column(DateTime)  # Last Menstrual Period
    edd = Column(DateTime)  # Expected Delivery Date
    gravida = Column(Integer)
    para = Column(Integer)
    anc_checkups = Column(Text)  # JSON string
    risk_factors = Column(Text)
    patient_name = Column(String)
    patient_phone = Column(String)
    asha_worker_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    synced = Column(Boolean, default=False)
    
    asha_worker = relationship("User", back_populates="pregnancy_reports")

class ChildVaccination(Base):
    __tablename__ = "child_vaccinations"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    child_name = Column(String)
    child_dob = Column(DateTime)
    vaccine_schedule = Column(Text)  # JSON string
    missed_doses = Column(Text)
    next_due = Column(DateTime)
    parent_name = Column(String)
    parent_phone = Column(String)
    asha_worker_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    synced = Column(Boolean, default=False)

class PostnatalCare(Base):
    __tablename__ = "postnatal_care"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    pnc_visits = Column(Text)  # JSON string
    mother_health = Column(Text)
    baby_health = Column(Text)
    counselling = Column(Text)
    mother_name = Column(String)
    delivery_date = Column(DateTime)
    asha_worker_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    synced = Column(Boolean, default=False)

class LeprosyReport(Base):
    __tablename__ = "leprosy_reports"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    patient_name = Column(String)
    leprosy_type = Column(String)
    treatment = Column(Text)
    follow_ups = Column(Text)  # JSON string
    household_contacts = Column(Text)
    asha_worker_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    created_at = Column(DateTime, default=datetime.utcnow)
    synced = Column(Boolean, default=False)

class Alert(Base):
    __tablename__ = "alerts"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(String)
    message = Column(Text)
    alert_type = Column(String)  # 'anc', 'vaccination', 'pnc', 'followup'
    patient_id = Column(String)
    patient_name = Column(String)
    due_date = Column(DateTime)
    asha_worker_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)

# Create tables
Base.metadata.create_all(bind=engine)

# Pydantic Models
class UserCreate(BaseModel):
    name: str
    phone_number: str
    place: str
    aadhaar_number: str
    password: str

class UserLogin(BaseModel):
    username: str
    password: str

class UserResponse(BaseModel):
    id: str
    username: str
    name: str
    phone_number: str
    place: str
    created_at: datetime

    class Config:
        from_attributes = True

class FamilySurveyCreate(BaseModel):
    household_id: str
    members_list: str
    sanitation: str
    chronic_illnesses: str

class FamilySurveyResponse(BaseModel):
    id: str
    household_id: str
    members_list: str
    sanitation: str
    chronic_illnesses: str
    created_at: datetime
    synced: bool

    class Config:
        from_attributes = True

class PregnancyReportCreate(BaseModel):
    lmp: datetime
    edd: datetime
    gravida: int
    para: int
    anc_checkups: str
    risk_factors: str
    patient_name: str
    patient_phone: str

class PregnancyReportResponse(BaseModel):
    id: str
    lmp: datetime
    edd: datetime
    gravida: int
    para: int
    anc_checkups: str
    risk_factors: str
    patient_name: str
    patient_phone: str
    created_at: datetime
    synced: bool

    class Config:
        from_attributes = True

class ChildVaccinationCreate(BaseModel):
    child_name: str
    child_dob: datetime
    vaccine_schedule: str
    missed_doses: str
    next_due: datetime
    parent_name: str
    parent_phone: str

class PostnatalCareCreate(BaseModel):
    pnc_visits: str
    mother_health: str
    baby_health: str
    counselling: str
    mother_name: str
    delivery_date: datetime

class LeprosyReportCreate(BaseModel):
    patient_name: str
    leprosy_type: str
    treatment: str
    follow_ups: str
    household_contacts: str

class AlertResponse(BaseModel):
    id: str
    title: str
    message: str
    alert_type: str
    patient_name: str
    due_date: datetime
    is_read: bool
    created_at: datetime

    class Config:
        from_attributes = True

# Dependency to get DB session
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

# Auth utilities
def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode('utf-8'), bcrypt.gensalt()).decode('utf-8')

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return bcrypt.checkpw(plain_password.encode('utf-8'), hashed_password.encode('utf-8'))

def create_access_token(data: dict):
    to_encode = data.copy()
    expire = datetime.utcnow() + timedelta(days=30)
    to_encode.update({"exp": expire})
    encoded_jwt = jwt.encode(to_encode, JWT_SECRET_KEY, algorithm=JWT_ALGORITHM)
    return encoded_jwt

def get_current_user(credentials: HTTPAuthorizationCredentials = Depends(security), db: Session = Depends(get_db)):
    try:
        token = credentials.credentials
        payload = jwt.decode(token, JWT_SECRET_KEY, algorithms=[JWT_ALGORITHM])
        username: str = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    except jwt.PyJWTError:
        raise HTTPException(status_code=401, detail="Invalid authentication credentials")
    
    user = db.query(User).filter(User.username == username).first()
    if user is None:
        raise HTTPException(status_code=401, detail="User not found")
    return user

# Generate username from name
def generate_username(name: str, db: Session) -> str:
    base_username = name.lower().replace(" ", "")
    username = base_username
    counter = 1
    
    while db.query(User).filter(User.username == username).first():
        username = f"{base_username}{counter}"
        counter += 1
    
    return username

# FastAPI app setup
app = FastAPI(title="AASHAKIRANA Healthcare API", version="1.0.0")
api_router = APIRouter(prefix="/api")

# Auth endpoints
@api_router.post("/register", response_model=UserResponse)
async def register(user_data: UserCreate, db: Session = Depends(get_db)):
    # Check if phone or aadhaar already exists
    if db.query(User).filter(User.phone_number == user_data.phone_number).first():
        raise HTTPException(status_code=400, detail="Phone number already registered")
    
    if db.query(User).filter(User.aadhaar_number == user_data.aadhaar_number).first():
        raise HTTPException(status_code=400, detail="Aadhaar number already registered")
    
    # Generate unique username
    username = generate_username(user_data.name, db)
    
    # Hash password
    hashed_password = hash_password(user_data.password)
    
    # Create user
    db_user = User(
        username=username,
        name=user_data.name,
        phone_number=user_data.phone_number,
        place=user_data.place,
        aadhaar_number=user_data.aadhaar_number,
        hashed_password=hashed_password
    )
    
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    return UserResponse(
        id=str(db_user.id),
        username=db_user.username,
        name=db_user.name,
        phone_number=db_user.phone_number,
        place=db_user.place,
        created_at=db_user.created_at
    )

@api_router.post("/login")
async def login(login_data: UserLogin, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.username == login_data.username).first()
    
    if not user or not verify_password(login_data.password, user.hashed_password):
        raise HTTPException(status_code=401, detail="Incorrect username or password")
    
    access_token = create_access_token(data={"sub": user.username})
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user": UserResponse(
            id=str(user.id),
            username=user.username,
            name=user.name,
            phone_number=user.phone_number,
            place=user.place,
            created_at=user.created_at
        )
    }

# Family Survey endpoints
@api_router.post("/family-surveys", response_model=FamilySurveyResponse)
async def create_family_survey(
    survey_data: FamilySurveyCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_survey = FamilySurvey(
        **survey_data.dict(),
        asha_worker_id=current_user.id
    )
    db.add(db_survey)
    db.commit()
    db.refresh(db_survey)
    
    return FamilySurveyResponse(
        id=str(db_survey.id),
        household_id=db_survey.household_id,
        members_list=db_survey.members_list,
        sanitation=db_survey.sanitation,
        chronic_illnesses=db_survey.chronic_illnesses,
        created_at=db_survey.created_at,
        synced=db_survey.synced
    )

@api_router.get("/family-surveys", response_model=List[FamilySurveyResponse])
async def get_family_surveys(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    surveys = db.query(FamilySurvey).filter(FamilySurvey.asha_worker_id == current_user.id).all()
    return [
        FamilySurveyResponse(
            id=str(survey.id),
            household_id=survey.household_id,
            members_list=survey.members_list,
            sanitation=survey.sanitation,
            chronic_illnesses=survey.chronic_illnesses,
            created_at=survey.created_at,
            synced=survey.synced
        ) for survey in surveys
    ]

# Pregnancy Report endpoints
@api_router.post("/pregnancy-reports", response_model=PregnancyReportResponse)
async def create_pregnancy_report(
    report_data: PregnancyReportCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_report = PregnancyReport(
        **report_data.dict(),
        asha_worker_id=current_user.id
    )
    db.add(db_report)
    db.commit()
    db.refresh(db_report)
    
    return PregnancyReportResponse(
        id=str(db_report.id),
        lmp=db_report.lmp,
        edd=db_report.edd,
        gravida=db_report.gravida,
        para=db_report.para,
        anc_checkups=db_report.anc_checkups,
        risk_factors=db_report.risk_factors,
        patient_name=db_report.patient_name,
        patient_phone=db_report.patient_phone,
        created_at=db_report.created_at,
        synced=db_report.synced
    )

@api_router.get("/pregnancy-reports", response_model=List[PregnancyReportResponse])
async def get_pregnancy_reports(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    reports = db.query(PregnancyReport).filter(PregnancyReport.asha_worker_id == current_user.id).all()
    return [
        PregnancyReportResponse(
            id=str(report.id),
            lmp=report.lmp,
            edd=report.edd,
            gravida=report.gravida,
            para=report.para,
            anc_checkups=report.anc_checkups,
            risk_factors=report.risk_factors,
            patient_name=report.patient_name,
            patient_phone=report.patient_phone,
            created_at=report.created_at,
            synced=report.synced
        ) for report in reports
    ]

# Child Vaccination endpoints
@api_router.post("/child-vaccinations")
async def create_child_vaccination(
    vaccination_data: ChildVaccinationCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_vaccination = ChildVaccination(
        **vaccination_data.dict(),
        asha_worker_id=current_user.id
    )
    db.add(db_vaccination)
    db.commit()
    return {"message": "Child vaccination record created successfully"}

# Postnatal Care endpoints
@api_router.post("/postnatal-care")
async def create_postnatal_care(
    pnc_data: PostnatalCareCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_pnc = PostnatalCare(
        **pnc_data.dict(),
        asha_worker_id=current_user.id
    )
    db.add(db_pnc)
    db.commit()
    return {"message": "Postnatal care record created successfully"}

# Leprosy Report endpoints
@api_router.post("/leprosy-reports")
async def create_leprosy_report(
    leprosy_data: LeprosyReportCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db_leprosy = LeprosyReport(
        **leprosy_data.dict(),
        asha_worker_id=current_user.id
    )
    db.add(db_leprosy)
    db.commit()
    return {"message": "Leprosy report created successfully"}

# Alerts endpoints
@api_router.get("/alerts", response_model=List[AlertResponse])
async def get_alerts(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    alerts = db.query(Alert).filter(Alert.asha_worker_id == current_user.id).order_by(Alert.created_at.desc()).all()
    return [
        AlertResponse(
            id=str(alert.id),
            title=alert.title,
            message=alert.message,
            alert_type=alert.alert_type,
            patient_name=alert.patient_name,
            due_date=alert.due_date,
            is_read=alert.is_read,
            created_at=alert.created_at
        ) for alert in alerts
    ]

@api_router.put("/alerts/{alert_id}/read")
async def mark_alert_read(
    alert_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    alert = db.query(Alert).filter(
        Alert.id == alert_id,
        Alert.asha_worker_id == current_user.id
    ).first()
    
    if not alert:
        raise HTTPException(status_code=404, detail="Alert not found")
    
    alert.is_read = True
    db.commit()
    return {"message": "Alert marked as read"}

# Dashboard endpoint
@api_router.get("/dashboard")
async def get_dashboard_stats(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    total_surveys = db.query(FamilySurvey).filter(FamilySurvey.asha_worker_id == current_user.id).count()
    total_pregnancies = db.query(PregnancyReport).filter(PregnancyReport.asha_worker_id == current_user.id).count()
    total_vaccinations = db.query(ChildVaccination).filter(ChildVaccination.asha_worker_id == current_user.id).count()
    total_pnc = db.query(PostnatalCare).filter(PostnatalCare.asha_worker_id == current_user.id).count()
    unread_alerts = db.query(Alert).filter(
        Alert.asha_worker_id == current_user.id,
        Alert.is_read == False
    ).count()
    
    return {
        "total_surveys": total_surveys,
        "total_pregnancies": total_pregnancies,
        "total_vaccinations": total_vaccinations,
        "total_pnc": total_pnc,
        "unread_alerts": unread_alerts,
        "incentives_earned": total_surveys * 50 + total_pregnancies * 100  # Mock calculation
    }

# Sync endpoint for offline data
@api_router.post("/sync")
async def sync_offline_data(
    sync_data: dict,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    # Process each type of form data from offline storage
    synced_count = 0
    
    for form_type, records in sync_data.items():
        for record in records:
            record['asha_worker_id'] = current_user.id
            
            if form_type == 'family_surveys':
                db_record = FamilySurvey(**record)
            elif form_type == 'pregnancy_reports':
                db_record = PregnancyReport(**record)
            elif form_type == 'child_vaccinations':
                db_record = ChildVaccination(**record)
            elif form_type == 'postnatal_care':
                db_record = PostnatalCare(**record)
            elif form_type == 'leprosy_reports':
                db_record = LeprosyReport(**record)
            else:
                continue
            
            db.add(db_record)
            synced_count += 1
    
    db.commit()
    return {"message": f"Synced {synced_count} records successfully"}

# Include router in app
app.include_router(api_router)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)