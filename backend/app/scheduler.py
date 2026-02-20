"""
Backup Scheduler Module
Handles automatic scheduled backups based on configuration
"""

import asyncio
from datetime import datetime, timedelta
from typing import Optional
from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger

scheduler: Optional[AsyncIOScheduler] = None
backup_job_id = "automatic_backup_job"


async def run_automatic_backup():
    """Execute automatic backup"""
    from .db import get_db
    
    try:
        db = get_db()
        backups_coll = db.get_collection('backups')
        config_coll = db.get_collection('backup_config')
        
        # Get backup config
        config = await config_coll.find_one({'_id': 'backup_settings'})
        if not config or not config.get('autoBackupEnabled', True):
            print("[Scheduler] Auto backup is disabled, skipping...")
            return
        
        # Collections to backup
        collection_names = ['staff', 'settings', 'system_config', 'roles', 'audit_logs', 
                          'attendance', 'shifts', 'menu', 'orders', 'tables', 'inventory',
                          'customers', 'offers', 'notifications', 'billing']
        
        # Export data from each collection
        backup_content = {
            'collections': collection_names,
            'data': {},
            'exportedAt': datetime.utcnow().isoformat(),
            'type': 'automatic'
        }
        
        document_counts = {}
        for coll_name in collection_names:
            try:
                coll = db.get_collection(coll_name)
                docs = await coll.find().to_list(None)
                # Serialize ObjectId to string
                serialized_docs = []
                for doc in docs:
                    serialized_doc = {}
                    for key, value in doc.items():
                        if hasattr(value, '__str__') and type(value).__name__ == 'ObjectId':
                            serialized_doc[key] = str(value)
                        else:
                            serialized_doc[key] = value
                    serialized_docs.append(serialized_doc)
                backup_content['data'][coll_name] = serialized_docs
                document_counts[coll_name] = len(docs)
            except Exception as e:
                print(f"[Scheduler] Error backing up {coll_name}: {e}")
                backup_content['data'][coll_name] = []
                document_counts[coll_name] = 0
        
        # Calculate backup size (approximate)
        import json
        backup_json = json.dumps(backup_content, default=str)
        size_bytes = len(backup_json.encode('utf-8'))
        if size_bytes < 1024:
            size_str = f"{size_bytes} B"
        elif size_bytes < 1024 * 1024:
            size_str = f"{size_bytes / 1024:.1f} KB"
        else:
            size_str = f"{size_bytes / (1024 * 1024):.1f} MB"
        
        now = datetime.utcnow()
        backup_doc = {
            'name': f"Auto Backup - {now.strftime('%Y-%m-%d')}",
            'size': size_str,
            'date': now.strftime('%Y-%m-%d'),
            'time': now.strftime('%H:%M'),
            'status': 'completed',
            'type': 'automatic',
            'documentCounts': document_counts,
            'content': backup_content,
            'createdAt': now
        }
        
        result = await backups_coll.insert_one(backup_doc)
        print(f"[Scheduler] ✅ Automatic backup created: {result.inserted_id}")
        
        # Clean up old backups based on retention period
        retention_days = config.get('retentionDays', 30)
        cutoff_date = now - timedelta(days=retention_days)
        delete_result = await backups_coll.delete_many({
            'createdAt': {'$lt': cutoff_date},
            'type': 'automatic'  # Only delete automatic backups
        })
        if delete_result.deleted_count > 0:
            print(f"[Scheduler] 🗑️  Cleaned up {delete_result.deleted_count} old backups")
            
    except Exception as e:
        print(f"[Scheduler] ❌ Backup failed: {e}")
        # Log failed backup
        try:
            now = datetime.utcnow()
            await backups_coll.insert_one({
                'name': f"Auto Backup - {now.strftime('%Y-%m-%d')} (Failed)",
                'size': '0 B',
                'date': now.strftime('%Y-%m-%d'),
                'time': now.strftime('%H:%M'),
                'status': 'failed',
                'type': 'automatic',
                'error': str(e),
                'createdAt': now
            })
        except:
            pass


async def update_backup_schedule():
    """Update the backup schedule based on current config"""
    global scheduler
    
    if scheduler is None:
        return
    
    from .db import get_db
    
    try:
        db = get_db()
        config_coll = db.get_collection('backup_config')
        config = await config_coll.find_one({'_id': 'backup_settings'})
        
        if not config:
            config = {
                'autoBackupEnabled': True,
                'frequency': 'daily',
                'backupTime': '02:00',
                'retentionDays': 30
            }
        
        # Remove existing job if any
        try:
            scheduler.remove_job(backup_job_id)
        except:
            pass
        
        if not config.get('autoBackupEnabled', True):
            print("[Scheduler] Auto backup is disabled")
            return
        
        frequency = config.get('frequency', 'daily')
        backup_time = config.get('backupTime', '02:00')
        
        # Parse time
        try:
            hour, minute = map(int, backup_time.split(':'))
        except:
            hour, minute = 2, 0
        
        # Create cron trigger based on frequency
        if frequency == 'hourly':
            trigger = CronTrigger(minute=0)  # Run at the start of every hour
        elif frequency == 'daily':
            trigger = CronTrigger(hour=hour, minute=minute)
        elif frequency == 'weekly':
            trigger = CronTrigger(day_of_week='sun', hour=hour, minute=minute)
        elif frequency == 'monthly':
            trigger = CronTrigger(day=1, hour=hour, minute=minute)
        else:
            trigger = CronTrigger(hour=hour, minute=minute)  # Default to daily
        
        scheduler.add_job(
            run_automatic_backup,
            trigger=trigger,
            id=backup_job_id,
            replace_existing=True
        )
        
        print(f"[Scheduler] 📅 Backup scheduled: {frequency} at {backup_time}")
        
    except Exception as e:
        print(f"[Scheduler] Error updating schedule: {e}")


def init_scheduler():
    """Initialize the scheduler"""
    global scheduler
    
    scheduler = AsyncIOScheduler()
    scheduler.start()
    print("[Scheduler] ✅ Scheduler initialized")


async def start_scheduler():
    """Start the scheduler and load initial config"""
    init_scheduler()
    await update_backup_schedule()


def shutdown_scheduler():
    """Shutdown the scheduler gracefully"""
    global scheduler
    
    if scheduler:
        scheduler.shutdown(wait=False)
        print("[Scheduler] Scheduler shut down")
