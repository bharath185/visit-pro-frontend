import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Notification {
  notificationId: number;
  empId: number;
  title: string;
  message: string;
  type: string;
  isRead: boolean;
  isStarred: boolean;
  relatedId: number;
  isActive: boolean;
  isDeleted: boolean;
  createdDate: string;
}

@Injectable({ providedIn: 'root' })
export class NotificationService {
  private api = environment.apiUrl.replace('/visitor', '/notifications');

  constructor(private http: HttpClient) {}

  getMyNotifications(empId: number): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.api}/my/${empId}`);
  }

  getUnreadCount(empId: number): Observable<any> {
    return this.http.get(`${this.api}/unread-count/${empId}`);
  }

  getUnread(empId: number): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.api}/unread/${empId}`);
  }

  markAsRead(id: number): Observable<Notification> {
    return this.http.post<Notification>(`${this.api}/mark-read/${id}`, {});
  }

  markAllAsRead(empId: number): Observable<any> {
    return this.http.post(`${this.api}/mark-all-read/${empId}`, {});
  }

  toggleStar(id: number): Observable<Notification> {
    return this.http.post<Notification>(`${this.api}/toggle-star/${id}`, {});
  }

  deleteNotification(id: number): Observable<any> {
    return this.http.delete(`${this.api}/${id}`);
  }

  createNotification(empId: number, title: string, message: string, type: string, relatedId?: number): Observable<Notification> {
    return this.http.post<Notification>(`${this.api}`, { empId, title, message, type, relatedId: relatedId || 0 });
  }
}