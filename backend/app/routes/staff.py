from fastapi import APIRouter, HTTPException, Request, Query
from ..db import get_db
from ..schemas import (
    StaffIn, StaffUpdate, ShiftAssignment, AttendanceIn, 
    PerformanceLogIn, AttendanceStatus, ShiftType
)
from ..utils import hash_password, verify_password
from ..audit import log_audit
from datetime import datetime, date
from typing import Optional
from bson import ObjectId

router = APIRouter()


def serialize_doc(doc):
    """Convert MongoDB document to JSON-serializable dict"""
    if doc is None:
        return None
    if isinstance(doc, list):
        return [serialize_doc(d) for d in doc]
    if isinstance(doc, dict):
        result = {}
        for key, value in doc.items():
            if isinstance(value, ObjectId):
                result[key] = str(value)
            elif isinstance(value, dict):
                result[key] = serialize_doc(value)
            elif isinstance(value, list):
                result[key] = [serialize_doc(v) if isinstance(v, dict) else str(v) if isinstance(v, ObjectId) else v for v in value]
            else:
                result[key] = value
        return result
    return doc


def to_object_id(id_str: str):
    """Convert string ID to ObjectId, or return the string if invalid"""
    try:
        return ObjectId(id_str)
    except Exception:
        return id_str


# ============ STAFF CRUD ============
@router.get('/', tags=['staff'])
async def list_staff(
    role: Optional[str] = None,
    active: Optional[bool] = None,
    shift: Optional[str] = None,
    skip: int = 0,
    limit: int = 100
):
    """List all staff members with optional filters"""
    db = get_db()
    coll = db.get_collection('staff')
    filt = {}
    if role:
        filt['role'] = role
    if active is not None:
        filt['active'] = active
    if shift:
        filt['shift'] = shift
    docs = await coll.find(filt, {'password_hash': 0}).skip(skip).limit(limit).to_list(1000)
    return serialize_doc(docs)


@router.get('/stats', tags=['staff'])
async def get_staff_stats():
    """Get staff statistics by role"""
    db = get_db()
    coll = db.get_collection('staff')
    pipeline = [
        {'$group': {'_id': '$role', 'count': {'$sum': 1}}},
        {'$sort': {'_id': 1}}
    ]
    result = await coll.aggregate(pipeline).to_list(100)
    
    # Get active/inactive counts
    active_count = await coll.count_documents({'active': True})
    inactive_count = await coll.count_documents({'active': False})
    total = await coll.count_documents({})
    
    return {
        'byRole': {r['_id']: r['count'] for r in result},
        'active': active_count,
        'inactive': inactive_count,
        'total': total
    }


@router.get('/{id}', tags=['staff'])
async def get_staff(id: str):
    """Get a single staff member by ID"""
    db = get_db()
    coll = db.get_collection('staff')
    doc = await coll.find_one({'_id': to_object_id(id)})
    if not doc:
        raise HTTPException(status_code=404, detail='Not found')
    doc.pop('password_hash', None)
    return serialize_doc(doc)


@router.post('/', tags=['staff'])
async def create_staff(payload: StaffIn, request: Request):
    """Create a new staff member with role assignment"""
    db = get_db()
    coll = db.get_collection('staff')
    existing = await coll.find_one({'email': payload.email})
    if existing:
        raise HTTPException(status_code=409, detail='Email already exists')
    
    pw_hash = hash_password(payload.password)
    doc = {
        'name': payload.name,
        'email': payload.email,
        'role': payload.role.value if payload.role else 'staff',
        'password_hash': pw_hash,
        'phone': payload.phone,
        'shift': payload.shift.value if payload.shift else 'morning',
        'department': payload.department,
        'salary': payload.salary,
        'hireDate': payload.hireDate.isoformat() if payload.hireDate else None,
        'active': True,
        'createdAt': datetime.utcnow().isoformat()
    }
    res = await coll.insert_one(doc)
    created = await coll.find_one({'_id': res.inserted_id})
    created.pop('password_hash', None)
    
    await log_audit(
        action='create_staff',
        resource='staff',
        resourceId=str(res.inserted_id),
        userId=request.headers.get('x-user-id'),
        userName=request.headers.get('x-user-name'),
        details={'email': payload.email, 'role': payload.role.value if payload.role else 'staff'},
        ip=request.client.host if request.client else None
    )
    return serialize_doc(created)


@router.put('/{id}', tags=['staff'])
async def update_staff(id: str, payload: StaffUpdate, request: Request):
    """Update staff member details including role assignment"""
    db = get_db()
    coll = db.get_collection('staff')
    update = {}
    
    if payload.name is not None:
        update['name'] = payload.name
    if payload.role is not None:
        update['role'] = payload.role.value
    if payload.phone is not None:
        update['phone'] = payload.phone
    if payload.shift is not None:
        update['shift'] = payload.shift.value
    if payload.department is not None:
        update['department'] = payload.department
    if payload.salary is not None:
        update['salary'] = payload.salary
    if payload.active is not None:
        update['active'] = payload.active
    if payload.password is not None:
        update['password_hash'] = hash_password(payload.password)
    
    if not update:
        raise HTTPException(status_code=400, detail='No update fields provided')
    
    update['updatedAt'] = datetime.utcnow().isoformat()
    res = await coll.update_one({'_id': to_object_id(id)}, {'$set': update})
    
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail='Not found')
    
    updated = await coll.find_one({'_id': to_object_id(id)})
    updated.pop('password_hash', None)
    
    await log_audit(
        action='update_staff',
        resource='staff',
        resourceId=id,
        userId=request.headers.get('x-user-id'),
        userName=request.headers.get('x-user-name'),
        details={'updated_fields': list(update.keys())},
        ip=request.client.host if request.client else None
    )
    return serialize_doc(updated)


@router.delete('/{id}', tags=['staff'])
async def delete_staff(id: str, request: Request):
    """Delete a staff member"""
    db = get_db()
    coll = db.get_collection('staff')
    res = await coll.delete_one({'_id': to_object_id(id)})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail='Not found')
    
    await log_audit(
        action='delete_staff',
        resource='staff',
        resourceId=id,
        userId=request.headers.get('x-user-id'),
        userName=request.headers.get('x-user-name'),
        ip=request.client.host if request.client else None
    )
    return {'success': True}


# ============ STAFF ACTIVATION/DEACTIVATION ============
@router.post('/{id}/activate', tags=['staff'])
async def activate_staff(id: str, request: Request):
    """Activate a staff member"""
    db = get_db()
    coll = db.get_collection('staff')
    res = await coll.update_one({'_id': to_object_id(id)}, {'$set': {'active': True, 'updatedAt': datetime.utcnow().isoformat()}})
    
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail='Not found')
    
    await log_audit(
        action='activate_staff',
        resource='staff',
        resourceId=id,
        userId=request.headers.get('x-user-id'),
        userName=request.headers.get('x-user-name'),
        ip=request.client.host if request.client else None
    )
    return {'success': True, 'message': 'Staff activated successfully'}


@router.post('/{id}/deactivate', tags=['staff'])
async def deactivate_staff(id: str, request: Request):
    """Deactivate a staff member"""
    db = get_db()
    coll = db.get_collection('staff')
    res = await coll.update_one({'_id': to_object_id(id)}, {'$set': {'active': False, 'updatedAt': datetime.utcnow().isoformat()}})
    
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail='Not found')
    
    await log_audit(
        action='deactivate_staff',
        resource='staff',
        resourceId=id,
        userId=request.headers.get('x-user-id'),
        userName=request.headers.get('x-user-name'),
        ip=request.client.host if request.client else None
    )
    return {'success': True, 'message': 'Staff deactivated successfully'}


# ============ SHIFT MANAGEMENT ============
@router.get('/shifts/all', tags=['shifts'])
async def list_shifts(
    staffId: Optional[str] = None,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None
):
    """List shift assignments with optional filters"""
    db = get_db()
    coll = db.get_collection('shifts')
    filt = {}
    if staffId:
        filt['staffId'] = staffId
    if date_from:
        filt['date'] = {'$gte': date_from}
    if date_to:
        if 'date' in filt:
            filt['date']['$lte'] = date_to
        else:
            filt['date'] = {'$lte': date_to}
    
    docs = await coll.find(filt).sort('date', -1).to_list(1000)
    return serialize_doc(docs)


@router.post('/shifts', tags=['shifts'])
async def create_shift(payload: ShiftAssignment, request: Request):
    """Assign a shift to a staff member"""
    db = get_db()
    coll = db.get_collection('shifts')
    
    # Check if staff exists
    staff_coll = db.get_collection('staff')
    staff = await staff_coll.find_one({'_id': to_object_id(payload.staffId)})
    if not staff:
        raise HTTPException(status_code=404, detail='Staff not found')
    
    doc = {
        'staffId': payload.staffId,
        'staffName': staff.get('name'),
        'shiftType': payload.shiftType.value,
        'date': payload.date.isoformat(),
        'startTime': payload.startTime,
        'endTime': payload.endTime,
        'notes': payload.notes,
        'createdAt': datetime.utcnow().isoformat()
    }
    res = await coll.insert_one(doc)
    created = await coll.find_one({'_id': res.inserted_id})
    
    await log_audit(
        action='create_shift',
        resource='shift',
        resourceId=str(res.inserted_id),
        userId=request.headers.get('x-user-id'),
        userName=request.headers.get('x-user-name'),
        details={'staffId': payload.staffId, 'date': payload.date.isoformat()},
        ip=request.client.host if request.client else None
    )
    return serialize_doc(created)


@router.delete('/shifts/{id}', tags=['shifts'])
async def delete_shift(id: str, request: Request):
    """Delete a shift assignment"""
    db = get_db()
    coll = db.get_collection('shifts')
    res = await coll.delete_one({'_id': to_object_id(id)})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail='Not found')
    
    await log_audit(
        action='delete_shift',
        resource='shift',
        resourceId=id,
        userId=request.headers.get('x-user-id'),
        userName=request.headers.get('x-user-name'),
        ip=request.client.host if request.client else None
    )
    return {'success': True}


# ============ ATTENDANCE MANAGEMENT ============
@router.get('/attendance/all', tags=['attendance'])
async def list_attendance(
    staffId: Optional[str] = None,
    date_from: Optional[str] = None,
    date_to: Optional[str] = None,
    status: Optional[str] = None
):
    """List attendance records with optional filters"""
    db = get_db()
    coll = db.get_collection('attendance')
    filt = {}
    if staffId:
        filt['staffId'] = staffId
    if date_from:
        filt['date'] = {'$gte': date_from}
    if date_to:
        if 'date' in filt:
            filt['date']['$lte'] = date_to
        else:
            filt['date'] = {'$lte': date_to}
    if status:
        filt['status'] = status
    
    docs = await coll.find(filt).sort('date', -1).to_list(1000)
    return serialize_doc(docs)


@router.post('/attendance', tags=['attendance'])
async def record_attendance(payload: AttendanceIn, request: Request):
    """Record attendance for a staff member"""
    db = get_db()
    coll = db.get_collection('attendance')
    
    # Check if staff exists
    staff_coll = db.get_collection('staff')
    staff = await staff_coll.find_one({'_id': to_object_id(payload.staffId)})
    if not staff:
        raise HTTPException(status_code=404, detail='Staff not found')
    
    # Check for duplicate attendance on same date
    existing = await coll.find_one({'staffId': payload.staffId, 'date': payload.date.isoformat()})
    if existing:
        # Update existing record
        update_data = {
            'status': payload.status.value,
            'checkIn': payload.checkIn,
            'checkOut': payload.checkOut,
            'hoursWorked': payload.hoursWorked,
            'notes': payload.notes,
            'updatedAt': datetime.utcnow().isoformat()
        }
        await coll.update_one({'_id': existing['_id']}, {'$set': update_data})
        updated = await coll.find_one({'_id': existing['_id']})
        return serialize_doc(updated)
    
    doc = {
        'staffId': payload.staffId,
        'staffName': staff.get('name'),
        'date': payload.date.isoformat(),
        'status': payload.status.value,
        'checkIn': payload.checkIn,
        'checkOut': payload.checkOut,
        'hoursWorked': payload.hoursWorked,
        'notes': payload.notes,
        'createdAt': datetime.utcnow().isoformat()
    }
    res = await coll.insert_one(doc)
    created = await coll.find_one({'_id': res.inserted_id})
    
    await log_audit(
        action='record_attendance',
        resource='attendance',
        resourceId=str(res.inserted_id),
        userId=request.headers.get('x-user-id'),
        userName=request.headers.get('x-user-name'),
        details={'staffId': payload.staffId, 'date': payload.date.isoformat(), 'status': payload.status.value},
        ip=request.client.host if request.client else None
    )
    return serialize_doc(created)


@router.get('/attendance/summary', tags=['attendance'])
async def get_attendance_summary(
    month: Optional[int] = None,
    year: Optional[int] = None
):
    """Get attendance summary for all staff"""
    db = get_db()
    coll = db.get_collection('attendance')
    
    # Build date filter
    if month and year:
        start_date = f"{year}-{month:02d}-01"
        if month == 12:
            end_date = f"{year + 1}-01-01"
        else:
            end_date = f"{year}-{month + 1:02d}-01"
    else:
        # Current month
        now = datetime.utcnow()
        start_date = f"{now.year}-{now.month:02d}-01"
        if now.month == 12:
            end_date = f"{now.year + 1}-01-01"
        else:
            end_date = f"{now.year}-{now.month + 1:02d}-01"
    
    pipeline = [
        {'$match': {'date': {'$gte': start_date, '$lt': end_date}}},
        {'$group': {
            '_id': {'staffId': '$staffId', 'status': '$status'},
            'count': {'$sum': 1}
        }},
        {'$group': {
            '_id': '$_id.staffId',
            'statuses': {'$push': {'status': '$_id.status', 'count': '$count'}}
        }}
    ]
    result = await coll.aggregate(pipeline).to_list(1000)
    return serialize_doc(result)


# ============ PERFORMANCE LOGGING ============
@router.get('/performance/all', tags=['performance'])
async def list_performance_logs(
    staffId: Optional[str] = None,
    metric: Optional[str] = None,
    period: Optional[str] = None
):
    """List performance logs with optional filters"""
    db = get_db()
    coll = db.get_collection('performance_logs')
    filt = {}
    if staffId:
        filt['staffId'] = staffId
    if metric:
        filt['metric'] = metric
    if period:
        filt['period'] = period
    
    docs = await coll.find(filt).sort('createdAt', -1).to_list(1000)
    return serialize_doc(docs)


@router.post('/performance', tags=['performance'])
async def log_performance(payload: PerformanceLogIn, request: Request):
    """Log performance metrics for a staff member"""
    db = get_db()
    coll = db.get_collection('performance_logs')
    
    # Check if staff exists
    staff_coll = db.get_collection('staff')
    staff = await staff_coll.find_one({'_id': to_object_id(payload.staffId)})
    if not staff:
        raise HTTPException(status_code=404, detail='Staff not found')
    
    doc = {
        'staffId': payload.staffId,
        'staffName': staff.get('name'),
        'metric': payload.metric,
        'value': payload.value,
        'period': payload.period,
        'notes': payload.notes,
        'createdAt': datetime.utcnow().isoformat()
    }
    res = await coll.insert_one(doc)
    created = await coll.find_one({'_id': res.inserted_id})
    
    await log_audit(
        action='log_performance',
        resource='performance',
        resourceId=str(res.inserted_id),
        userId=request.headers.get('x-user-id'),
        userName=request.headers.get('x-user-name'),
        details={'staffId': payload.staffId, 'metric': payload.metric, 'value': payload.value},
        ip=request.client.host if request.client else None
    )
    return serialize_doc(created)


@router.get('/performance/summary/{staffId}', tags=['performance'])
async def get_staff_performance_summary(staffId: str):
    """Get performance summary for a specific staff member"""
    db = get_db()
    coll = db.get_collection('performance_logs')
    
    pipeline = [
        {'$match': {'staffId': staffId}},
        {'$group': {
            '_id': '$metric',
            'avgValue': {'$avg': '$value'},
            'maxValue': {'$max': '$value'},
            'minValue': {'$min': '$value'},
            'count': {'$sum': 1}
        }}
    ]
    result = await coll.aggregate(pipeline).to_list(100)
    
    # Get recent logs
    recent_logs = await coll.find({'staffId': staffId}).sort('createdAt', -1).limit(10).to_list(10)
    
    return {
        'summary': serialize_doc(result),
        'recentLogs': serialize_doc(recent_logs)
    }
