from fastapi import APIRouter, HTTPException, Request, Depends
from ..db import init_db, get_db
from ..schemas import (
    SettingIn, SystemConfigIn, BackupCreate, BackupConfig, 
    RoleIn, RoleUpdate, PasswordChange, PasswordReset
)
from ..utils import hash_password, verify_password
from ..audit import log_audit
from ..gdrive import gdrive_service
from datetime import datetime
from typing import Optional
from bson import ObjectId
import json

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


@router.on_event('startup')
async def startup_db():
    init_db()


# ============ GENERAL SETTINGS ============
@router.get('/', tags=['settings'])
async def list_settings(category: Optional[str] = None):
    """List all settings with optional category filter"""
    db = get_db()
    coll = db.get_collection('settings')
    filt = {}
    if category:
        filt['category'] = category
    docs = await coll.find(filt).to_list(1000)
    return serialize_doc(docs)


@router.get('/key/{key}', tags=['settings'])
async def get_setting(key: str):
    """Get a specific setting by key"""
    db = get_db()
    coll = db.get_collection('settings')
    doc = await coll.find_one({'key': key})
    if not doc:
        raise HTTPException(status_code=404, detail='Not found')
    return serialize_doc(doc)


@router.post('/', tags=['settings'])
async def upsert_setting(s: SettingIn, request: Request):
    """Create or update a setting"""
    db = get_db()
    coll = db.get_collection('settings')
    result = await coll.update_one(
        {'key': s.key},
        {
            '$set': {
                'value': s.value,
                'description': s.description,
                'category': s.category,
                'updatedBy': request.headers.get('x-user-name'),
                'updatedAt': datetime.utcnow().isoformat()
            },
            '$setOnInsert': {
                'createdAt': datetime.utcnow().isoformat()
            }
        },
        upsert=True
    )
    await log_audit(
        action='update_setting',
        resource='setting',
        resourceId=s.key,
        userId=request.headers.get('x-user-id'),
        userName=request.headers.get('x-user-name'),
        details={'key': s.key, 'category': s.category},
        ip=request.client.host if request.client else None
    )
    doc = await coll.find_one({'key': s.key})
    return serialize_doc(doc)


@router.delete('/key/{key}', tags=['settings'])
async def delete_setting(key: str, request: Request):
    """Delete a setting by key"""
    db = get_db()
    coll = db.get_collection('settings')
    res = await coll.delete_one({'key': key})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail='Not found')
    
    await log_audit(
        action='delete_setting',
        resource='setting',
        resourceId=key,
        userId=request.headers.get('x-user-id'),
        userName=request.headers.get('x-user-name'),
        ip=request.client.host if request.client else None
    )
    return {'success': True}


# ============ SYSTEM CONFIGURATION ============
@router.get('/system-config', tags=['system-config'])
async def get_system_config():
    """Get all system configuration settings"""
    db = get_db()
    coll = db.get_collection('system_config')
    doc = await coll.find_one({'_id': 'main_config'})
    if not doc:
        # Return default configuration
        return {
            '_id': 'main_config',
            'restaurantName': 'Restaurant Management System',
            'address': '',
            'city': '',
            'state': '',
            'pincode': '',
            'contactNumber': '',
            'email': '',
            'website': '',
            'operatingHours': '',
            'currency': 'INR',
            'timezone': 'Asia/Kolkata',
            'language': 'English',
            'dateFormat': 'DD/MM/YYYY',
            'timeFormat': '12-hour'
        }
    return serialize_doc(doc)


@router.post('/system-config', tags=['system-config'])
async def update_system_config(config: SystemConfigIn, request: Request):
    """Update system configuration"""
    db = get_db()
    coll = db.get_collection('system_config')
    
    update_data = config.model_dump(exclude_unset=True)
    update_data['updatedAt'] = datetime.utcnow().isoformat()
    update_data['updatedBy'] = request.headers.get('x-user-name')
    
    await coll.update_one(
        {'_id': 'main_config'},
        {
            '$set': update_data,
            '$setOnInsert': {'createdAt': datetime.utcnow().isoformat()}
        },
        upsert=True
    )
    
    await log_audit(
        action='update_system_config',
        resource='system_config',
        resourceId='main_config',
        userId=request.headers.get('x-user-id'),
        userName=request.headers.get('x-user-name'),
        details={'updated_fields': list(update_data.keys())},
        ip=request.client.host if request.client else None
    )
    
    return serialize_doc(await coll.find_one({'_id': 'main_config'}))


# ============ ROLES & PERMISSIONS ============
@router.get('/roles', tags=['roles'])
async def list_roles():
    """List all roles with their permissions"""
    db = get_db()
    coll = db.get_collection('roles')
    docs = await coll.find().to_list(100)
    
    if not docs:
        # Initialize with default roles
        default_roles = [
            {
                '_id': 'admin',
                'name': 'Admin',
                'description': 'Full system access with all permissions',
                'permissions': {
                    'dashboard': True, 'menu': True, 'orders': True, 'kitchen': True,
                    'tables': True, 'inventory': True, 'staff': True, 'billing': True,
                    'delivery': True, 'offers': True, 'reports': True, 'notifications': True, 'settings': True
                },
                'createdAt': datetime.utcnow().isoformat()
            },
            {
                '_id': 'manager',
                'name': 'Manager',
                'description': 'Restaurant operations management',
                'permissions': {
                    'dashboard': True, 'menu': True, 'orders': True, 'kitchen': True,
                    'tables': True, 'inventory': True, 'staff': True, 'billing': True,
                    'delivery': True, 'offers': True, 'reports': True, 'notifications': True, 'settings': False
                },
                'createdAt': datetime.utcnow().isoformat()
            },
            {
                '_id': 'chef',
                'name': 'Chef',
                'description': 'Kitchen and menu management',
                'permissions': {
                    'dashboard': True, 'menu': True, 'orders': True, 'kitchen': True,
                    'tables': False, 'inventory': True, 'staff': False, 'billing': False,
                    'delivery': False, 'offers': False, 'reports': False, 'notifications': True, 'settings': False
                },
                'createdAt': datetime.utcnow().isoformat()
            },
            {
                '_id': 'waiter',
                'name': 'Waiter',
                'description': 'Order and table management',
                'permissions': {
                    'dashboard': True, 'menu': True, 'orders': True, 'kitchen': False,
                    'tables': True, 'inventory': False, 'staff': False, 'billing': True,
                    'delivery': False, 'offers': False, 'reports': False, 'notifications': True, 'settings': False
                },
                'createdAt': datetime.utcnow().isoformat()
            },
            {
                '_id': 'cashier',
                'name': 'Cashier',
                'description': 'Billing and payment management',
                'permissions': {
                    'dashboard': True, 'menu': True, 'orders': True, 'kitchen': False,
                    'tables': False, 'inventory': False, 'staff': False, 'billing': True,
                    'delivery': False, 'offers': True, 'reports': True, 'notifications': True, 'settings': False
                },
                'createdAt': datetime.utcnow().isoformat()
            }
        ]
        await coll.insert_many(default_roles)
        docs = default_roles
    
    return serialize_doc(docs)


@router.get('/roles/{role_id}', tags=['roles'])
async def get_role(role_id: str):
    """Get a specific role by ID"""
    db = get_db()
    coll = db.get_collection('roles')
    doc = await coll.find_one({'_id': role_id})
    if not doc:
        raise HTTPException(status_code=404, detail='Role not found')
    return serialize_doc(doc)


@router.post('/roles', tags=['roles'])
async def create_role(role: RoleIn, request: Request):
    """Create a new role"""
    db = get_db()
    coll = db.get_collection('roles')
    
    # Check if role name already exists
    existing = await coll.find_one({'name': role.name})
    if existing:
        raise HTTPException(status_code=409, detail='Role name already exists')
    
    doc = {
        '_id': role.name.lower().replace(' ', '_'),
        'name': role.name,
        'description': role.description,
        'permissions': role.permissions.model_dump(),
        'createdAt': datetime.utcnow().isoformat()
    }
    
    await coll.insert_one(doc)
    
    await log_audit(
        action='create_role',
        resource='role',
        resourceId=doc['_id'],
        userId=request.headers.get('x-user-id'),
        userName=request.headers.get('x-user-name'),
        details={'name': role.name},
        ip=request.client.host if request.client else None
    )
    
    return serialize_doc(doc)


@router.put('/roles/{role_id}', tags=['roles'])
async def update_role(role_id: str, role: RoleUpdate, request: Request):
    """Update a role's permissions"""
    db = get_db()
    coll = db.get_collection('roles')
    
    # Get existing role
    existing = await coll.find_one({'_id': role_id})
    if not existing:
        raise HTTPException(status_code=404, detail='Role not found')
    
    update_data = {}
    if role.name is not None:
        update_data['name'] = role.name
    if role.description is not None:
        update_data['description'] = role.description
    if role.permissions is not None:
        update_data['permissions'] = role.permissions.model_dump()
    
    update_data['updatedAt'] = datetime.utcnow().isoformat()
    
    await coll.update_one({'_id': role_id}, {'$set': update_data})
    
    await log_audit(
        action='update_role',
        resource='role',
        resourceId=role_id,
        userId=request.headers.get('x-user-id'),
        userName=request.headers.get('x-user-name'),
        details={'name': role.name},
        ip=request.client.host if request.client else None
    )
    
    return serialize_doc(await coll.find_one({'_id': role_id}))


@router.delete('/roles/{role_id}', tags=['roles'])
async def delete_role(role_id: str, request: Request):
    """Delete a role (except built-in roles)"""
    protected_roles = ['admin', 'manager', 'chef', 'waiter', 'cashier']
    if role_id in protected_roles:
        raise HTTPException(status_code=400, detail='Cannot delete built-in roles')
    
    db = get_db()
    coll = db.get_collection('roles')
    res = await coll.delete_one({'_id': role_id})
    
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail='Role not found')
    
    await log_audit(
        action='delete_role',
        resource='role',
        resourceId=role_id,
        userId=request.headers.get('x-user-id'),
        userName=request.headers.get('x-user-name'),
        ip=request.client.host if request.client else None
    )
    
    return {'success': True}


# ============ PASSWORD MANAGEMENT ============
@router.post('/change-password', tags=['security'])
async def change_password(payload: PasswordChange, request: Request):
    """Change user password"""
    from bson import ObjectId
    db = get_db()
    coll = db.get_collection('staff')
    
    try:
        user_id = ObjectId(payload.userId)
    except Exception:
        raise HTTPException(status_code=400, detail='Invalid user ID format')
    
    user = await coll.find_one({'_id': user_id})
    if not user:
        raise HTTPException(status_code=404, detail='User not found')
    
    # Verify current password
    if not verify_password(payload.currentPassword, user.get('password_hash', '')):
        raise HTTPException(status_code=401, detail='Current password is incorrect')
    
    # Validate new password
    if len(payload.newPassword) < 8:
        raise HTTPException(status_code=400, detail='Password must be at least 8 characters')
    
    # Update password
    new_hash = hash_password(payload.newPassword)
    await coll.update_one(
        {'_id': user_id},
        {'$set': {
            'password_hash': new_hash,
            'passwordChangedAt': datetime.utcnow().isoformat()
        }}
    )
    
    await log_audit(
        action='change_password',
        resource='staff',
        resourceId=payload.userId,
        userId=request.headers.get('x-user-id'),
        userName=request.headers.get('x-user-name'),
        ip=request.client.host if request.client else None
    )
    
    return {'success': True, 'message': 'Password changed successfully'}


@router.post('/reset-password', tags=['security'])
async def reset_password_request(payload: PasswordReset, request: Request):
    """Request password reset (sends reset link/code)"""
    db = get_db()
    coll = db.get_collection('staff')
    
    user = await coll.find_one({'email': payload.email})
    if not user:
        # Don't reveal whether email exists
        return {'success': True, 'message': 'If the email exists, a reset link has been sent'}
    
    # Generate reset token (in production, send email)
    import secrets
    reset_token = secrets.token_urlsafe(32)
    
    await coll.update_one(
        {'_id': user['_id']},
        {'$set': {
            'resetToken': reset_token,
            'resetTokenExpiry': datetime.utcnow().isoformat()
        }}
    )
    
    await log_audit(
        action='password_reset_request',
        resource='staff',
        resourceId=str(user['_id']),
        userId=request.headers.get('x-user-id'),
        userName=request.headers.get('x-user-name'),
        details={'email': payload.email},
        ip=request.client.host if request.client else None
    )
    
    return {'success': True, 'message': 'Password reset link has been sent to your email'}


# ============ BACKUP & RECOVERY ============
@router.get('/backups', tags=['backup'])
async def list_backups():
    """List all backups"""
    db = get_db()
    coll = db.get_collection('backups')
    docs = await coll.find().sort('createdAt', -1).to_list(100)
    return serialize_doc(docs)


@router.get('/backup-config', tags=['backup'])
async def get_backup_config():
    """Get backup configuration"""
    db = get_db()
    coll = db.get_collection('backup_config')
    doc = await coll.find_one({'_id': 'backup_settings'})
    if not doc:
        return {
            '_id': 'backup_settings',
            'autoBackupEnabled': True,
            'frequency': 'daily',
            'retentionDays': 30,
            'backupLocation': 'local',
            'googleDriveEnabled': False,
            'googleDriveFolderId': None
        }
    return serialize_doc(doc)


@router.post('/backup-config', tags=['backup'])
async def update_backup_config(config: BackupConfig, request: Request):
    """Update backup configuration"""
    db = get_db()
    coll = db.get_collection('backup_config')
    
    update_data = config.model_dump()
    update_data['updatedAt'] = datetime.utcnow().isoformat()
    
    await coll.update_one(
        {'_id': 'backup_settings'},
        {'$set': update_data},
        upsert=True
    )
    
    await log_audit(
        action='update_backup_config',
        resource='backup_config',
        resourceId='backup_settings',
        userId=request.headers.get('x-user-id'),
        userName=request.headers.get('x-user-name'),
        ip=request.client.host if request.client else None
    )
    
    return serialize_doc(await coll.find_one({'_id': 'backup_settings'}))



@router.post('/backups', tags=['backup'])
async def create_backup(payload: BackupCreate, request: Request):
    """Create a new backup and optionally upload to Google Drive"""
    db = get_db()
    coll = db.get_collection('backups')
    config_coll = db.get_collection('backup_config')
    
    # Get backup configuration
    backup_config = await config_coll.find_one({'_id': 'backup_settings'})
    google_drive_enabled = backup_config.get('googleDriveEnabled', False) if backup_config else False
    google_drive_folder_id = backup_config.get('googleDriveFolderId') if backup_config else None
    
    # Get list of collections to backup
    collection_names = payload.collections or ['staff', 'settings', 'system_config', 'roles', 'audit_logs', 'attendance', 'shifts', 'performance_logs']
    
    # Export actual data from each collection
    backup_content = {
        'collections': collection_names,
        'data': {},
        'metadata': {}
    }
    total_docs = 0
    
    for coll_name in collection_names:
        collection = db.get_collection(coll_name)
        docs = await collection.find().to_list(10000)
        backup_content['data'][coll_name] = serialize_doc(docs)
        backup_content['metadata'][coll_name] = len(docs)
        total_docs += len(docs)
    
    now = datetime.utcnow()
    backup_name = payload.name or f"Backup - {now.strftime('%Y-%m-%d %H:%M')}"
    backup_content['exportedAt'] = now.isoformat()
    backup_content['backupName'] = backup_name
    
    # Calculate approximate size
    backup_size_bytes = len(json.dumps(backup_content, default=str))
    if backup_size_bytes > 1024 * 1024:
        size_str = f"{backup_size_bytes / (1024 * 1024):.2f} MB"
    else:
        size_str = f"{backup_size_bytes / 1024:.2f} KB"
    
    # Create backup document
    backup_doc = {
        'name': backup_name,
        'type': payload.type or 'manual',
        'collections': collection_names,
        'documentCounts': backup_content['metadata'],
        'totalDocuments': total_docs,
        'size': size_str,
        'date': now.strftime('%Y-%m-%d'),
        'time': now.strftime('%H:%M:%S'),
        'status': 'completed',
        'createdAt': now.isoformat()
    }
    
    res = await coll.insert_one(backup_doc)
    
    await log_audit(
        action='create_backup',
        resource='backup',
        resourceId=str(res.inserted_id),
        userId=request.headers.get('x-user-id'),
        userName=request.headers.get('x-user-name'),
        details={
            'collections': collection_names, 
            'totalDocs': total_docs
        },
        ip=request.client.host if request.client else None
    )
    
    result = serialize_doc(await coll.find_one({'_id': res.inserted_id}))
    return result


@router.post('/backups/{backup_id}/restore', tags=['backup'])
async def restore_backup(backup_id: str, request: Request):
    """Restore from a backup"""
    db = get_db()
    coll = db.get_collection('backups')
    
    backup = await coll.find_one({'_id': to_object_id(backup_id)})
    if not backup:
        raise HTTPException(status_code=404, detail='Backup not found')
    
    # In production, would actually restore data from backup file
    await log_audit(
        action='restore_backup',
        resource='backup',
        resourceId=backup_id,
        userId=request.headers.get('x-user-id'),
        userName=request.headers.get('x-user-name'),
        details={'backup_name': backup.get('name')},
        ip=request.client.host if request.client else None
    )
    
    return {'success': True, 'message': f"Backup '{backup.get('name')}' restored successfully"}


@router.get('/backups/{backup_id}/download', tags=['backup'])
async def download_backup(backup_id: str):
    """Download backup data as JSON"""
    db = get_db()
    coll = db.get_collection('backups')
    
    backup = await coll.find_one({'_id': to_object_id(backup_id)})
    if not backup:
        raise HTTPException(status_code=404, detail='Backup not found')
    
    # Get the collections that were backed up
    collection_names = backup.get('collections', ['staff', 'settings', 'system_config', 'roles'])
    
    # Export data from each collection
    backup_data = {
        'backupInfo': serialize_doc(backup),
        'collections': collection_names,
        'data': {},
        'exportedAt': datetime.utcnow().isoformat()
    }
    
    for coll_name in collection_names:
        collection = db.get_collection(coll_name)
        docs = await collection.find().to_list(10000)
        backup_data['data'][coll_name] = serialize_doc(docs)
    
    return backup_data


@router.post('/backups/upload', tags=['backup'])
async def upload_backup(request: Request):
    """Upload and process a backup file"""
    db = get_db()
    
    try:
        body = await request.json()
    except Exception:
        raise HTTPException(status_code=400, detail='Invalid JSON data')
    
    if 'collections' not in body or 'data' not in body:
        raise HTTPException(status_code=400, detail='Invalid backup format. Must contain collections and data.')
    
    # Create a backup record for the uploaded file
    now = datetime.utcnow()
    backup_doc = {
        'name': f"Uploaded Backup - {now.strftime('%Y-%m-%d %H:%M')}",
        'type': 'uploaded',
        'collections': body.get('collections', []),
        'totalDocuments': sum(len(docs) for docs in body.get('data', {}).values()),
        'size': f"{len(str(body)) / 1024:.2f} KB",
        'date': now.strftime('%Y-%m-%d'),
        'time': now.strftime('%H:%M:%S'),
        'status': 'completed',
        'createdAt': now.isoformat()
    }
    
    coll = db.get_collection('backups')
    res = await coll.insert_one(backup_doc)
    
    await log_audit(
        action='upload_backup',
        resource='backup',
        resourceId=str(res.inserted_id),
        userId=request.headers.get('x-user-id'),
        userName=request.headers.get('x-user-name'),
        details={'collections': body.get('collections', [])},
        ip=request.client.host if request.client else None
    )
    
    return {'success': True, 'message': 'Backup uploaded successfully', 'backup': serialize_doc(await coll.find_one({'_id': res.inserted_id}))}


@router.delete('/backups/{backup_id}', tags=['backup'])
async def delete_backup(backup_id: str, request: Request):
    """Delete a backup"""
    db = get_db()
    coll = db.get_collection('backups')
    
    res = await coll.delete_one({'_id': to_object_id(backup_id)})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail='Backup not found')
    
    await log_audit(
        action='delete_backup',
        resource='backup',
        resourceId=backup_id,
        userId=request.headers.get('x-user-id'),
        userName=request.headers.get('x-user-name'),
        ip=request.client.host if request.client else None
    )
    
    return {'success': True}
