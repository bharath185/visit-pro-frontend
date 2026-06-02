import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../services/auth.service';
import { NzNotificationService } from 'ng-zorro-antd/notification';

const API = 'http://192.168.2.45:8081/api';

@Component({
  selector: 'app-designation-management',
  templateUrl: './designation-management.component.html'
})
export class DesignationManagementComponent implements OnInit {
  plantId: number | null = null;
  designations: any[] = [];
  desigSearch = '';
  loading = false;

  showModal = false;
  editModal: any = { IsActive: true, IsDeleted: false };
  editingId: number | null = null;
  saving = false;

  constructor(private http: HttpClient, public auth: AuthService, private notification: NzNotificationService) {
    this.plantId = auth.getPlantId();
  }

  ngOnInit(): void {
    this.loadDesignations();
  }

  loadDesignations(): void {
    this.loading = true;
    if (this.plantId) {
      this.http.get<any[]>(API + '/master/designations/by-plant-dropdown/' + this.plantId).subscribe({
        next: r => { this.designations = r; this.loading = false; },
        error: () => { this.loading = false; }
      });
    } else {
      this.http.get<any[]>(API + '/master/designations').subscribe({
        next: r => { this.designations = r; this.loading = false; },
        error: () => { this.loading = false; }
      });
    }
  }

  get filteredList(): any[] {
    if (!this.desigSearch) return this.designations;
    const s = this.desigSearch.toLowerCase();
    return this.designations.filter(d => (d.Name || '').toLowerCase().includes(s));
  }

  openNew(): void {
    this.editingId = null;
    this.editModal = { PlantId: this.plantId, IsActive: true, IsDeleted: false };
    this.showModal = true;
  }

  editDesig(d: any): void {
    this.editingId = d.Id || d.id;
    this.editModal = {
      Id: this.editingId,
      Name: d.Name || '',
      PlantId: d.PlantId || this.plantId,
      IsActive: true, IsDeleted: false
    };
    this.showModal = true;
  }

  save(): void {
    if (!this.editModal.Name) {
      this.notification.warning('Warning', 'Designation name is required');
      return;
    }
    this.saving = true;
    this.http.post<any>(API + '/master/designations', {
      Id: this.editingId || 0,
      Name: this.editModal.Name,
      PlantId: this.editModal.PlantId || this.plantId,
      IsActive: true, IsDeleted: false
    }).subscribe({
      next: () => {
        this.saving = false;
        this.showModal = false;
        this.notification.success('Saved', 'Designation saved');
        this.loadDesignations();
      },
      error: () => { this.saving = false; this.notification.error('Error', 'Failed to save'); }
    });
  }

  deleteDesig(id: number): void {
    if (!confirm('Delete this designation?')) return;
    this.http.delete(API + '/master/designations/' + id).subscribe({
      next: () => { this.notification.success('Deleted', 'Designation deleted'); this.loadDesignations(); },
      error: () => this.notification.error('Error', 'Failed to delete')
    });
  }
}
