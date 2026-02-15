import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/app/components/ui/card';
import { Button } from '@/app/components/ui/button';
import { Label } from '@/app/components/ui/label';
import { Badge } from '@/app/components/ui/badge';
import { Switch } from '@/app/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/app/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/app/components/ui/table';
import { Separator } from '@/app/components/ui/separator';
import { Database, Download, Upload, RefreshCcw, Check, AlertCircle, Calendar, Clock, HardDrive } from 'lucide-react';
import { toast } from 'sonner';

interface Backup {
  id: string;
  name: string;
  size: string;
  date: string;
  time: string;
  status: 'completed' | 'failed' | 'in_progress';
  type: 'manual' | 'automatic';
}

interface BackupConfig {
  autoBackupEnabled: boolean;
  backupFrequency: 'hourly' | 'daily' | 'weekly' | 'monthly';
  retentionDays: number;
  backupLocation: string;
}

const STORAGE_KEY_BACKUPS = 'rms_backups';
const STORAGE_KEY_CONFIG = 'rms_backup_config';

export function BackupRecovery() {
  const [backups, setBackups] = useState<Backup[]>([]);
  const [config, setConfig] = useState<BackupConfig>({
    autoBackupEnabled: true,
    backupFrequency: 'daily',
    retentionDays: 30,
    backupLocation: 'Cloud Storage',
  });
  const [isBackingUp, setIsBackingUp] = useState(false);

  // Load backups from localStorage
  useEffect(() => {
    const storedBackups = localStorage.getItem(STORAGE_KEY_BACKUPS);
    if (storedBackups) {
      setBackups(JSON.parse(storedBackups));
    } else {
      // Initialize with sample backups
      const defaultBackups: Backup[] = [
        {
          id: '1',
          name: 'Full Backup - 2026-01-29',
          size: '258 MB',
          date: '2026-01-29',
          time: '02:00:00',
          status: 'completed',
          type: 'automatic',
        },
        {
          id: '2',
          name: 'Full Backup - 2026-01-28',
          size: '256 MB',
          date: '2026-01-28',
          time: '02:00:00',
          status: 'completed',
          type: 'automatic',
        },
        {
          id: '3',
          name: 'Manual Backup - 2026-01-27',
          size: '255 MB',
          date: '2026-01-27',
          time: '15:30:00',
          status: 'completed',
          type: 'manual',
        },
        {
          id: '4',
          name: 'Full Backup - 2026-01-27',
          size: '254 MB',
          date: '2026-01-27',
          time: '02:00:00',
          status: 'completed',
          type: 'automatic',
        },
        {
          id: '5',
          name: 'Full Backup - 2026-01-26',
          size: '252 MB',
          date: '2026-01-26',
          time: '02:00:00',
          status: 'completed',
          type: 'automatic',
        },
      ];
      setBackups(defaultBackups);
      localStorage.setItem(STORAGE_KEY_BACKUPS, JSON.stringify(defaultBackups));
    }

    const storedConfig = localStorage.getItem(STORAGE_KEY_CONFIG);
    if (storedConfig) {
      setConfig(JSON.parse(storedConfig));
    }
  }, []);

  // Save config to localStorage
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY_CONFIG, JSON.stringify(config));
  }, [config]);

  const handleCreateBackup = () => {
    setIsBackingUp(true);
    toast.success('Backup initiated. This may take a few minutes...');

    // Simulate backup creation
    setTimeout(() => {
      const newBackup: Backup = {
        id: Date.now().toString(),
        name: `Manual Backup - ${new Date().toISOString().split('T')[0]}`,
        size: '258 MB',
        date: new Date().toISOString().split('T')[0],
        time: new Date().toTimeString().split(' ')[0],
        status: 'completed',
        type: 'manual',
      };

      const updatedBackups = [newBackup, ...backups];
      setBackups(updatedBackups);
      localStorage.setItem(STORAGE_KEY_BACKUPS, JSON.stringify(updatedBackups));
      setIsBackingUp(false);
      toast.success('Backup completed successfully!');
    }, 3000);
  };

  const handleRestoreBackup = (backup: Backup) => {
    toast.success(`Restoring backup: ${backup.name}. System will restart...`);
    // In real app, this would call API to restore
  };

  const handleDownloadBackup = (backup: Backup) => {
    toast.success(`Downloading: ${backup.name}`);
    // In real app, this would trigger file download
  };

  const handleUploadBackup = () => {
    toast.success('Upload backup functionality will be connected with backend');
    // In real app, this would open file picker
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
    .reduce((total, backup) => total + parseFloat(backup.size), 0)
    .toFixed(2);

  return (
    <div className="bg-settings-module min-h-screen space-y-6 p-6">
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
                onCheckedChange={(checked) => setConfig({ ...config, autoBackupEnabled: checked })} 
              />
            </div>

            {config.autoBackupEnabled && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="backup-frequency">Backup Frequency</Label>
                  <Select 
                    value={config.backupFrequency} 
                    onValueChange={(value: any) => setConfig({ ...config, backupFrequency: value })}
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
                    onValueChange={(value) => setConfig({ ...config, retentionDays: parseInt(value) })}
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
                <TableRow key={backup.id}>
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
