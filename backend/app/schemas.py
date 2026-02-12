from pydantic import BaseModel, Field, EmailStr
from typing import Any, Optional, List
from datetime import datetime, date
from enum import Enum


# ============ ENUMS ============
class StaffRole(str, Enum):
    admin = "admin"
    manager = "manager"
    chef = "chef"
    waiter = "waiter"
    cashier = "cashier"
    staff = "staff"


class ShiftType(str, Enum):
    morning = "morning"
    afternoon = "afternoon"
    evening = "evening"
    night = "night"


class AttendanceStatus(str, Enum):
    present = "present"
    absent = "absent"
    late = "late"
    half_day = "half_day"
    leave = "leave"


# ============ SETTINGS ============
class SettingIn(BaseModel):
    key: str
    value: Any
    description: Optional[str] = None
    category: Optional[str] = "general"


class SettingOut(SettingIn):
    id: Optional[str] = Field(None, alias="_id")
    updatedBy: Optional[str] = None
    createdAt: Optional[datetime] = None
    updatedAt: Optional[datetime] = None


class SystemConfigIn(BaseModel):
    restaurantName: Optional[str] = None
    address: Optional[str] = None
    city: Optional[str] = None
    state: Optional[str] = None
    pincode: Optional[str] = None
    contactNumber: Optional[str] = None
    email: Optional[str] = None
    website: Optional[str] = None
    operatingHours: Optional[str] = None
    currency: Optional[str] = "INR"
    timezone: Optional[str] = "Asia/Kolkata"
    language: Optional[str] = "English"
    dateFormat: Optional[str] = "DD/MM/YYYY"
    timeFormat: Optional[str] = "12-hour"


# ============ STAFF MANAGEMENT ============
class LoginIn(BaseModel):
    email: EmailStr
    password: str


class StaffIn(BaseModel):
    name: str
    email: EmailStr
    role: Optional[StaffRole] = StaffRole.staff
    password: str
    phone: Optional[str] = None
    shift: Optional[ShiftType] = ShiftType.morning
    department: Optional[str] = None
    salary: Optional[float] = None
    hireDate: Optional[date] = None


class StaffUpdate(BaseModel):
    name: Optional[str] = None
    role: Optional[StaffRole] = None
    phone: Optional[str] = None
    shift: Optional[ShiftType] = None
    department: Optional[str] = None
    salary: Optional[float] = None
    active: Optional[bool] = None
    password: Optional[str] = None


class StaffOut(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    name: str
    email: EmailStr
    role: str
    phone: Optional[str] = None
    shift: Optional[str] = None
    department: Optional[str] = None
    active: bool = True
    hireDate: Optional[date] = None
    createdAt: Optional[datetime] = None


# ============ SHIFT & ATTENDANCE ============
class ShiftAssignment(BaseModel):
    staffId: str
    shiftType: ShiftType
    date: date
    startTime: str
    endTime: str
    notes: Optional[str] = None


class AttendanceIn(BaseModel):
    staffId: str
    date: date
    status: AttendanceStatus
    checkIn: Optional[str] = None
    checkOut: Optional[str] = None
    hoursWorked: Optional[float] = None
    notes: Optional[str] = None


class AttendanceOut(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    staffId: str
    staffName: Optional[str] = None
    date: date
    status: str
    checkIn: Optional[str] = None
    checkOut: Optional[str] = None
    hoursWorked: Optional[float] = None
    notes: Optional[str] = None
    createdAt: Optional[datetime] = None


# ============ PERFORMANCE LOGGING ============
class PerformanceLogIn(BaseModel):
    staffId: str
    metric: str  # e.g., 'orders_served', 'tables_handled', 'customer_rating', 'attendance_score'
    value: float
    period: Optional[str] = None  # e.g., 'daily', 'weekly', 'monthly'
    notes: Optional[str] = None


class PerformanceLogOut(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    staffId: str
    staffName: Optional[str] = None
    metric: str
    value: float
    period: Optional[str] = None
    notes: Optional[str] = None
    createdAt: Optional[datetime] = None


# ============ PASSWORD MANAGEMENT ============
class PasswordChange(BaseModel):
    userId: str
    currentPassword: str
    newPassword: str


class PasswordReset(BaseModel):
    email: EmailStr


# ============ BACKUP & RECOVERY ============
class BackupCreate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = "manual"  # manual, automatic
    collections: Optional[List[str]] = None  # specific collections, or None for all


class BackupConfig(BaseModel):
    autoBackupEnabled: bool = True
    frequency: Optional[str] = "daily"  # hourly, daily, weekly, monthly
    retentionDays: int = 30
    backupLocation: Optional[str] = "local"  # local, google_drive, both
    googleDriveFolderId: Optional[str] = None
    googleDriveEnabled: bool = False


class BackupOut(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    name: str
    size: Optional[str] = None
    date: str
    time: str
    status: str  # completed, failed, in_progress
    type: str  # manual, automatic
    createdAt: Optional[datetime] = None


# ============ AUDIT LOGS ============
class AuditOut(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    action: str
    resource: Optional[str] = None
    resourceId: Optional[str] = None
    userId: Optional[str] = None
    userName: Optional[str] = None
    details: Optional[Any] = None
    ip: Optional[str] = None
    device: Optional[str] = None
    status: Optional[str] = "success"
    createdAt: Optional[datetime] = None


# ============ ROLES & PERMISSIONS ============
class RolePermissions(BaseModel):
    dashboard: bool = False
    menu: bool = False
    orders: bool = False
    kitchen: bool = False
    tables: bool = False
    inventory: bool = False
    staff: bool = False
    billing: bool = False
    delivery: bool = False
    offers: bool = False
    reports: bool = False
    notifications: bool = False
    settings: bool = False


class RoleIn(BaseModel):
    name: str
    description: Optional[str] = None
    permissions: RolePermissions


class RoleUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    permissions: Optional[RolePermissions] = None


class RoleOut(BaseModel):
    id: Optional[str] = Field(None, alias="_id")
    name: str
    description: Optional[str] = None
    permissions: RolePermissions
    createdAt: Optional[datetime] = None
    updatedAt: Optional[datetime] = None
