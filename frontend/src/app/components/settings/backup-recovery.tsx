import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Label } from '@/app/components/ui/label';
import { Badge } from '@/app/components/ui/badge';
import { Switch } from '@/app/components/ui/switch';
import { Input } from '@/app/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { Separator } from '@/app/components/ui/separator';
import { Database, Download, Upload, RefreshCcw, Check, AlertCircle, Calendar, Clock, HardDrive, Trash2, FileJson } from 'lucide-react';
import { backupApi } from '@/utils/api';
import { toast } from 'sonner';

interface Backup {
  _id: string;
  name: string;
  size: string;
  date: string;
  time: string;
  status: 'completed' | 'failed' | 'in_progress';
  type: 'manual' | 'automatic';
  collections?: string[];
  totalDocuments?: number;
}

interface BackupConfig {
  autoBackupEnabled: boolean;
  frequency: 'hourly' | 'daily' | 'weekly' | 'monthly';
  retentionDays: number;
  backupLocation: string;
  googleDriveEnabled: boolean;
  googleDriveFolderId: string | null;
}

export function BackupRecovery() {
  const [backups, setBackups] = useState<Backup[]>([]);
  const [config, setConfig] = useState<BackupConfig>({
    autoBackupEnabled: true,
    frequency: 'daily',
    retentionDays: 30,
    backupLocation: 'local',
    googleDriveEnabled: false,
    googleDriveFolderId: null,
  });
  const [isBackingUp, setIsBackingUp] = useState(false);
  const [loading, setLoading] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Load backups from backend
  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [backupsData, configData] = await Promise.all([
        backupApi.list(),
        backupApi.getConfig(),
      ]);
      setBackups(backupsData || []);
      setConfig({
        autoBackupEnabled: configData.autoBackupEnabled ?? true,
        frequency: configData.frequency || 'daily',
        retentionDays: configData.retentionDays || 30,
        backupLocation: configData.backupLocation || 'local',
        googleDriveEnabled: configData.googleDriveEnabled ?? false,
        googleDriveFolderId: configData.googleDriveFolderId || null,
      });
    } catch (error) {
      console.error('Error fetching backup data:', error);
      toast.error('Failed to load backup data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateBackup = async () => {
    setIsBackingUp(true);
    toast.success('Creating backup locally...');

    try {
      const result = await backupApi.create({ type: 'manual' });
      toast.success('Backup created successfully!');
      
      await fetchData();
    } catch (error) {
      console.error('Error creating backup:', error);
      toast.error('Failed to create backup');
    } finally {
      setIsBackingUp(false);
    }
  };

  const handleUpdateConfig = async (newConfig: Partial<BackupConfig>) => {
    const updatedConfig = { ...config, ...newConfig };
    setConfig(updatedConfig);
    
    try {
      await backupApi.updateConfig(updatedConfig);
      toast.success('Backup configuration updated');
    } catch (error) {
      console.error('Error updating config:', error);
      toast.error('Failed to update configuration');
    }
  };

  const handleRestoreBackup = async (backup: Backup) => {
    if (!confirm(`Are you sure you want to restore backup "${backup.name}"? This will overwrite current data.`)) return;
    
    try {
      const result = await backupApi.restore(backup._id);
      toast.success(result.message || 'Backup restored successfully');
    } catch (error) {
      console.error('Error restoring backup:', error);
      toast.error('Failed to restore backup');
    }
  };

  const handleDownloadBackup = async (backup: Backup) => {
    try {
      toast.info(`Preparing download: ${backup.name}`);
      // Fetch the backup data from backend
      const response = await fetch(`http://localhost:8000/api/settings/backups/${backup._id}/download`);
      if (!response.ok) throw new Error('Failed to download backup');
      
      const data = await response.json();
      
      // Create a blob and download
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${backup.name.replace(/[^a-z0-9]/gi, '_')}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success(`Downloaded: ${backup.name}`);
    } catch (error) {
      console.error('Error downloading backup:', error);
      toast.error('Failed to download backup');
    }
  };

  const handleDeleteBackup = async (backup: Backup) => {
    if (!confirm(`Are you sure you want to delete backup "${backup.name}"?`)) return;
    
    try {
      await backupApi.delete(backup._id);
      toast.success('Backup deleted successfully');
      await fetchData();
    } catch (error) {
      console.error('Error deleting backup:', error);
      toast.error('Failed to delete backup');
    }
  };

  const handleUploadBackup = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.json')) {
      toast.error('Please select a valid backup file (.json)');
      return;
    }

    try {
      const text = await file.text();
      const backupData = JSON.parse(text);
      
      // Validate backup structure
      if (!backupData.collections || !backupData.data) {
        toast.error('Invalid backup file format');
        return;
      }

      toast.info('Uploading backup...');
      
      // Send to backend for restoration
      const response = await fetch('http://localhost:8000/api/settings/backups/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(backupData),
      });

      if (!response.ok) throw new Error('Failed to upload backup');
      
      const result = await response.json();
      toast.success(result.message || 'Backup uploaded successfully');
      await fetchData();
    } catch (error) {
      console.error('Error uploading backup:', error);
      toast.error('Failed to upload backup file');
    }

    // Reset the file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getStatusBadge = (status: Backup['status']) => {
    switch (status) {
      case 'completed':
        return (
          <Badge className="bg-green-500">
            <Check className="h-3 w-3 mr-1" />
            Completed
          </Badge>
        );
      case 'failed':
        return (
          <Badge className="bg-red-500">
            <AlertCircle className="h-3 w-3 mr-1" />
            Failed
          </Badge>
        );
      case 'in_progress':
        return (
          <Badge className="bg-blue-500">
            <RefreshCcw className="h-3 w-3 mr-1 animate-spin" />
            In Progress
          </Badge>
        );
    }
  };

  const totalBackupSize = backups
    .reduce((total, backup) => total + parseFloat(backup.size || '0'), 0)
    .toFixed(2);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-[40vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading backup data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Backup Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-primary" />
              <div>
                <CardTitle>Backup Actions</CardTitle>
                <CardDescription>Create and manage backups</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button 
              onClick={handleCreateBackup} 
              className="w-full" 
              size="lg"
              disabled={isBackingUp}
            >
              {isBackingUp ? (
                <>
                  <RefreshCcw className="h-5 w-5 mr-2 animate-spin" />
                  Backing Up...
                </>
              ) : (
                <>
                  <Database className="h-5 w-5 mr-2" />
                  Create Backup Now
                </>
              )}
            </Button>

            <Separator />

            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div className="space-y-0.5">
                <Label>Automatic Backups</Label>
                <p className="text-xs text-muted-foreground">
                  Enable scheduled backups
                </p>
              </div>
              <Switch 
                checked={config.autoBackupEnabled} 
                onCheckedChange={(checked) => handleUpdateConfig({ autoBackupEnabled: checked })} 
              />
            </div>

            {config.autoBackupEnabled && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="backup-frequency">Backup Frequency</Label>
                  <Select 
                    value={config.frequency} 
                    onValueChange={(value: any) => handleUpdateConfig({ frequency: value })}
                  >
                    <SelectTrigger id="backup-frequency">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Every Hour</SelectItem>
                      <SelectItem value="daily">Daily (2:00 AM)</SelectItem>
                      <SelectItem value="weekly">Weekly (Sunday 2:00 AM)</SelectItem>
                      <SelectItem value="monthly">Monthly (1st, 2:00 AM)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="retention">Retention Period (Days)</Label>
                  <Select 
                    value={config.retentionDays.toString()} 
                    onValueChange={(value) => handleUpdateConfig({ retentionDays: parseInt(value) })}
                  >
                    <SelectTrigger id="retention">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">7 Days</SelectItem>
                      <SelectItem value="15">15 Days</SelectItem>
                      <SelectItem value="30">30 Days</SelectItem>
                      <SelectItem value="60">60 Days</SelectItem>
                      <SelectItem value="90">90 Days</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <Separator />

            <div className="space-y-2">
              <Label>Upload Backup</Label>
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".json"
                className="hidden"
              />
              <Button variant="outline" className="w-full" onClick={handleUploadBackup}>
                <Upload className="h-4 w-4 mr-2" />
                Choose File to Upload
              </Button>
              <p className="text-xs text-muted-foreground">
                Upload a previously downloaded backup file
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Backup Status */}
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Check className="h-5 w-5 text-green-500" />
              <div>
                <CardTitle>Backup Status</CardTitle>
                <CardDescription>Latest backup information</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center gap-3 p-4 border rounded-lg bg-green-50 dark:bg-green-950">
              <div className="p-2 bg-green-500 rounded-lg">
                <Check className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1">
                <p className="font-medium">Last Backup Successful</p>
                <p className="text-sm text-muted-foreground">
                  {backups.length > 0 ? `${backups[0].date} at ${backups[0].time}` : 'No backups yet'}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <Database className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Total Backup Size</span>
                </div>
                <span className="font-medium">{totalBackupSize} MB</span>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Next Scheduled</span>
                </div>
                <span className="font-medium">
                  {config.autoBackupEnabled ? 'Tomorrow 02:00 AM' : 'Disabled'}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Retention Period</span>
                </div>
                <span className="font-medium">{config.retentionDays} Days</span>
              </div>

              <div className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-2">
                  <HardDrive className="h-4 w-4 text-muted-foreground" />
                  <span className="text-sm">Storage Location</span>
                </div>
                <span className="font-medium">{config.backupLocation}</span>
              </div>
            </div>

            <div className="pt-2">
              <p className="text-xs text-muted-foreground mb-2">Storage Usage</p>
              <div className="h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary" style={{ width: '35%' }} />
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {totalBackupSize} MB of 1000 MB used
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Backup History */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            <div>
              <CardTitle>Backup History</CardTitle>
              <CardDescription>Previous backups available for restore</CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Backup Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Size</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {backups.map(backup => (
                <TableRow key={backup._id}>
                  <TableCell className="font-medium">{backup.name}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {backup.type === 'manual' ? 'Manual' : 'Automatic'}
                    </Badge>
                  </TableCell>
                  <TableCell>{backup.size}</TableCell>
                  <TableCell>{backup.date}</TableCell>
                  <TableCell>{backup.time}</TableCell>
                  <TableCell>{getStatusBadge(backup.status)}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex gap-2 justify-end">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleRestoreBackup(backup)}
                        disabled={backup.status !== 'completed'}
                      >
                        <RefreshCcw className="h-4 w-4 mr-2" />
                        Restore
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownloadBackup(backup)}
                        disabled={backup.status !== 'completed'}
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDeleteBackup(backup)}
                        className="text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
