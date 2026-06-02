import { Component, OnInit } from '@angular/core';
import { NotificationService, Notification } from '../../services/notification.service';
import { AuthService } from '../../services/auth.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { VisitorService } from '../../services/visitor.service';

@Component({
  selector: 'app-notifications',
  templateUrl: './notifications.component.html'
})
export class NotificationsComponent implements OnInit {
  notifications: Notification[] = [];
  unreadCount = 0;
  loading = false;

  constructor(
    private notifSvc: NotificationService,
    private auth: AuthService,
    private notification: NzNotificationService,
    private visitorSvc: VisitorService
  ) {}

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    const empId = this.auth.currentUser?.EmpId;
    if (!empId) return;
    this.loading = true;
    this.notifSvc.getMyNotifications(empId).subscribe({
      next: (data) => { this.notifications = data; this.loading = false; },
      error: () => { this.loading = false; }
    });
    this.notifSvc.getUnreadCount(empId).subscribe({
      next: (data: any) => { this.unreadCount = data.count || 0; }
    });
  }

  markRead(n: Notification, event?: Event): void {
    if (event) event.stopPropagation();
    if (n.isRead) return;
    this.notifSvc.markAsRead(n.notificationId).subscribe(() => {
      n.isRead = true;
      this.unreadCount = Math.max(0, this.unreadCount - 1);
    });
  }

  markAllRead(): void {
    const empId = this.auth.currentUser?.EmpId;
    if (!empId) return;
    this.notifSvc.markAllAsRead(empId).subscribe(() => {
      this.notifications.forEach(n => n.isRead = true);
      this.unreadCount = 0;
      this.notification.success('Done', 'All notifications marked as read');
    });
  }

  toggleStar(n: Notification, event?: Event): void {
    if (event) event.stopPropagation();
    this.notifSvc.toggleStar(n.notificationId).subscribe((updated) => {
      n.isStarred = updated.isStarred;
    });
  }

  deleteNotif(n: Notification, event?: Event): void {
    if (event) event.stopPropagation();
    this.notifSvc.deleteNotification(n.notificationId).subscribe(() => {
      this.notifications = this.notifications.filter(x => x.notificationId !== n.notificationId);
      if (!n.isRead) this.unreadCount = Math.max(0, this.unreadCount - 1);
    });
  }

  getIcon(type: string): string {
    const icons: Record<string, string> = {
      'visitor': 'team',
      'checkin': 'safety',
      'checkout': 'rollback',
      'invite': 'send',
      'alert': 'exclamation-circle',
      'system': 'setting'
    };
    return icons[type] || 'bell';
  }

  approveApproval(n: Notification, event: Event): void {
    event.stopPropagation();
    if (!n.relatedId) return;
    this.visitorSvc.approvePendingInvite(n.relatedId).subscribe({
      next: () => {
        this.notification.success('Approved', 'Invite approved and email sent to visitor');
        this.deleteNotif(n, event);
      },
      error: () => this.notification.error('Error', 'Failed to approve')
    });
  }

  rejectApproval(n: Notification, event: Event): void {
    event.stopPropagation();
    if (!n.relatedId) return;
    this.visitorSvc.rejectPendingInvite(n.relatedId).subscribe({
      next: () => {
        this.notification.success('Rejected', 'Invite has been rejected');
        this.deleteNotif(n, event);
      },
      error: () => this.notification.error('Error', 'Failed to reject')
    });
  }

  getColor(type: string): string {
    const colors: Record<string, string> = {
      'visitor': '#1890ff',
      'checkin': '#52c41a',
      'checkout': '#13c2c2',
      'invite': '#722ed1',
      'alert': '#ff4d4f',
      'system': '#faad14'
    };
    return colors[type] || '#1890ff';
  }
}