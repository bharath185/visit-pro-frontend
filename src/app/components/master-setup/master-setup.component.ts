import { Component, OnInit } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { NzNotificationService } from 'ng-zorro-antd/notification';
import { AuthService } from '../../services/auth.service';

interface MItem { Id?: number; Name?: string; Code?: string; ShortName?: string; Description?: string; ParentId?: number | null; ParentName?: string; IsActive?: boolean; PlantId?: number | null; LocationId?: number | null; Field1?: string; Field2?: string; Field3?: string; IsAdminUser?: boolean; IsSecurity?: boolean; ReportId?: number | null; }

@Component({
  selector: 'app-master-setup',
  templateUrl: './master-setup.component.html'
})
export class MasterSetupComponent implements OnInit {
  api = environment.apiUrl.replace('/visitor', '/master');
  isSuperAdmin = false;
  isPlantAdmin = false;

  constructor(private http: HttpClient, private notification: NzNotificationService, public auth: AuthService) {
    this.isSuperAdmin = auth.isSuperAdmin();
    this.isPlantAdmin = auth.isPlantAdmin();
  }

  // ===== Companies =====
  companies: MItem[] = [];
  compSearch = '';
  compDialog = false;
  compModel: MItem = {};
  editingComp: MItem | null = null;
  savingComp = false;

  // ===== Locations =====
  locations: MItem[] = [];
  locSearch = '';
  locDialog = false;
  locModel: MItem = {};
  editingLoc: MItem | null = null;
  savingLoc = false;

  // ===== Plants =====
  plants: MItem[] = [];
  plantSearch = '';
  plantDialog = false;
  plantModel: MItem = {};
  editingPlant: MItem | null = null;
  savingPlant = false;
  plantLocationOptions: { label: string; value: number }[] = [];

  // ===== Designations =====
  designations: MItem[] = [];
  desigSearch = '';
  desigDialog = false;
  desigModel: MItem = {};
  editingDesig: MItem | null = null;
  savingDesig = false;
  desigCompanyOptions: { label: string; value: number }[] = [];
  desigLocationOptions: { label: string; value: number }[] = [];
  desigPlantOptions: { label: string; value: number }[] = [];

  // ===== Employees =====
  employees: MItem[] = [];
  empSearch = '';
  empDialog = false;
  empModel: MItem = {};
  editingEmp: MItem | null = null;
  savingEmp = false;
  empPassword = '';
  selectedRole: string = 'user';
  empCompanyOptions: { label: string; value: number }[] = [];
  empLocationOptions: { label: string; value: number }[] = [];
  empPlantOptions: { label: string; value: number }[] = [];
  empDesigOptions: { label: string; value: number }[] = [];
  reportingToEnabled = false;
  reportingEmployees: { id: number; name: string }[] = [];

  ngOnInit(): void {
    this.loadCompanies();
    this.loadLocations();
    this.loadPlants();
    this.loadDesignations();
    this.loadEmployees();
    this.loadCategories();
    this.loadVisitPurposes();
  }

  // ==================== COMPANIES ====================
  loadCompanies(): void {
    this.http.get<MItem[]>(`${this.api}/companies`).subscribe(r => {
      this.companies = r;
      this.desigCompanyOptions = r.map(c => ({ label: c.Name!, value: c.Id! }));
      this.empCompanyOptions = [...this.desigCompanyOptions];
    });
  }

  openNewComp(): void { this.editingComp = null; this.compModel = {}; this.compDialog = true; }
  editComp(c: MItem): void { this.editingComp = c; this.compModel = { ...c }; this.compDialog = true; }

  saveCompany(): void {
    this.savingComp = true;
    this.http.post<MItem>(`${this.api}/companies`, {
      Id: this.editingComp?.Id, Name: this.compModel.Name, Code: this.compModel.Code || null, IsActive: true, IsDeleted: false
    }).subscribe({
      next: () => {
        this.savingComp = false; this.compDialog = false; this.editingComp = null;
        this.notification.success('Saved', 'Company saved');
        this.loadCompanies();
      },
      error: () => { this.savingComp = false; this.notification.error('Error', 'Failed'); }
    });
  }

  deleteComp(id: number): void {
    if (!confirm('Delete this company?')) return;
    this.http.delete(`${this.api}/companies/${id}`).subscribe({
      next: () => { this.notification.success('Deleted', 'Company deleted'); this.loadCompanies(); },
      error: () => this.notification.error('Error', 'Failed')
    });
  }

  get filteredComps(): MItem[] {
    return this.compSearch ? this.companies.filter(c => (c.Name || '').toLowerCase().includes(this.compSearch.toLowerCase())) : this.companies;
  }

  // ==================== LOCATIONS ====================
  loadLocations(): void {
    this.http.get<MItem[]>(`${this.api}/departments`).subscribe(r => this.locations = r);
  }

  openNewLoc(): void {
    this.editingLoc = null;
    this.locModel = {};
    this.locDialog = true;
  }

  editLoc(d: MItem): void {
    this.editingLoc = d;
    this.locModel = { ...d };
    this.locDialog = true;
  }

  saveLocation(): void {
    this.savingLoc = true;
    this.http.post<MItem>(`${this.api}/departments`, {
      Id: this.editingLoc?.Id, Name: this.locModel.Name, ShortName: this.locModel.ShortName || null,
      ParentId: this.locModel.ParentId, IsActive: true, IsDeleted: false
    }).subscribe({
      next: () => {
        this.savingLoc = false; this.locDialog = false; this.editingLoc = null;
        this.notification.success('Saved', 'Location saved');
        this.loadLocations();
      },
      error: () => { this.savingLoc = false; this.notification.error('Error', 'Failed'); }
    });
  }

  deleteLoc(id: number): void {
    if (!confirm('Delete this location?')) return;
    this.http.delete(`${this.api}/departments/${id}`).subscribe({
      next: () => { this.notification.success('Deleted', 'Location deleted'); this.loadLocations(); },
      error: () => this.notification.error('Error', 'Failed')
    });
  }

  get filteredLocs(): MItem[] {
    return this.locSearch ? this.locations.filter(d => (d.Name || '').toLowerCase().includes(this.locSearch.toLowerCase())) : this.locations;
  }

  getCompanyName(id?: number | null): string {
    if (!id) return '—';
    const c = this.companies.find(x => x.Id === id);
    return c ? (c.Name || '—') : '—';
  }

  // ==================== PLANTS ====================
  loadPlants(): void {
    this.http.get<MItem[]>(`${this.api}/plants`).subscribe(r => this.plants = r);
  }

  openNewPlant(): void {
    this.editingPlant = null;
    this.plantModel = {};
    this.plantLocationOptions = [];
    this.plantDialog = true;
  }

  onPlantCompanyChange(): void {
    this.plantModel.LocationId = undefined;
    this.plantModel.Description = undefined;
    this.plantLocationOptions = [];
    if (this.plantModel.ParentId) {
      this.http.get<MItem[]>(`${this.api}/locations/by-company/${this.plantModel.ParentId}`).subscribe(list => {
        this.plantLocationOptions = list.map(l => ({ label: l.Name!, value: l.Id! }));
      });
    }
  }

  editPlant(p: MItem): void {
    this.editingPlant = p;
    this.plantModel = { ...p };
    this.plantLocationOptions = [];
    if (p.ParentId) this.onPlantCompanyChange();
    this.plantDialog = true;
  }

  savePlant(): void {
    this.savingPlant = true;
    this.http.post<MItem>(`${this.api}/plants`, {
      Id: this.editingPlant?.Id, Name: this.plantModel.Name, Code: this.plantModel.Code || null,
      ParentId: this.plantModel.ParentId, LocationId: this.plantModel.LocationId || null,
      Description: this.plantModel.Description || null, IsActive: true, IsDeleted: false
    }).subscribe({
      next: () => {
        this.savingPlant = false; this.plantDialog = false; this.editingPlant = null;
        this.notification.success('Saved', 'Plant saved');
        this.loadPlants();
      },
      error: () => { this.savingPlant = false; this.notification.error('Error', 'Failed'); }
    });
  }

  deletePlant(id: number): void {
    if (!confirm('Delete this plant?')) return;
    this.http.delete(`${this.api}/plants/${id}`).subscribe({
      next: () => { this.notification.success('Deleted', 'Plant deleted'); this.loadPlants(); },
      error: () => this.notification.error('Error', 'Failed')
    });
  }

  getLocationName(id?: number | null): string {
    if (!id) return '—';
    const loc = this.locations.find(x => x.Id === id);
    return loc ? (loc.Name || '—') : '—';
  }

  get filteredPlants(): MItem[] {
    return this.plantSearch ? this.plants.filter(p => (p.Name || '').toLowerCase().includes(this.plantSearch.toLowerCase())) : this.plants;
  }

  // ==================== DESIGNATIONS ====================
  loadDesignations(): void {
    this.http.get<MItem[]>(`${this.api}/designations`).subscribe(r => this.designations = r);
  }

  openNewDesig(): void {
    this.editingDesig = null;
    this.desigModel = {};
    this.desigLocationOptions = [];
    this.desigPlantOptions = [];
    // Auto-select cascade for PlantAdmin/Admin users
    if (this.isPlantAdmin || this.auth.currentUser?.IsAdmin === true) {
      const compId = this.auth.getCompId();
      const plantId = this.auth.getPlantId();
      if (compId) {
        this.desigModel.ParentId = compId;
        this.http.get<MItem[]>(`${this.api}/locations/by-company/${compId}`).subscribe(locs => {
          this.desigLocationOptions = locs.map(l => ({ label: l.Name!, value: l.Id! }));
          if (plantId) {
            this.http.get<MItem[]>(`${this.api}/plants`).subscribe(plants => {
              const myPlant = plants.find(p => p.Id === plantId);
              if (myPlant) {
                const locMatch = locs.find(l => l.Id === myPlant.LocationId);
                if (locMatch) {
                  this.desigModel.LocationId = locMatch.Id;
                }
                this.desigModel.PlantId = plantId;
              }
            });
          }
        });
      }
    }
    this.desigDialog = true;
  }

  onDesigCompanyChange(): void {
    this.desigModel.LocationId = undefined;
    this.desigModel.PlantId = undefined;
    this.desigLocationOptions = [];
    this.desigPlantOptions = [];
    if (this.desigModel.ParentId) {
      this.http.get<MItem[]>(`${this.api}/locations/by-company/${this.desigModel.ParentId}`).subscribe(list => {
        this.desigLocationOptions = list.map(l => ({ label: l.Name!, value: l.Id! }));
      });
    }
  }

  onDesigLocationChange(): void {
    this.desigModel.PlantId = undefined;
    this.desigPlantOptions = [];
    if (this.desigModel.LocationId) {
      this.http.get<MItem[]>(`${this.api}/plants/by-location/${this.desigModel.LocationId}`).subscribe(list => {
        this.desigPlantOptions = list.map(p => ({ label: p.Name!, value: p.Id! }));
      });
    }
  }

  editDesig(d: MItem): void {
    this.editingDesig = d;
    this.desigModel = { ...d };
    this.desigLocationOptions = [];
    this.desigPlantOptions = [];
    if (d.ParentId) this.onDesigCompanyChange();
    this.desigDialog = true;
  }

  saveDesignation(): void {
    this.savingDesig = true;
    this.http.post<MItem>(`${this.api}/designations`, {
      Id: this.editingDesig?.Id, Name: this.desigModel.Name, ShortName: this.desigModel.ShortName || null,
      Description: this.desigModel.Description || null, ParentId: this.desigModel.ParentId,
      LocationId: this.desigModel.LocationId, PlantId: this.desigModel.PlantId,
      IsActive: true, IsDeleted: false
    }).subscribe({
      next: () => {
        this.savingDesig = false; this.desigDialog = false; this.editingDesig = null;
        this.notification.success('Saved', 'Designation saved');
        this.loadDesignations();
      },
      error: () => { this.savingDesig = false; this.notification.error('Error', 'Failed'); }
    });
  }

  deleteDesig(id: number): void {
    if (!confirm('Delete this designation?')) return;
    this.http.delete(`${this.api}/designations/${id}`).subscribe({
      next: () => { this.notification.success('Deleted', 'Designation deleted'); this.loadDesignations(); },
      error: () => this.notification.error('Error', 'Failed')
    });
  }

  get filteredDesigs(): MItem[] {
    return this.desigSearch ? this.designations.filter(d => (d.Name || '').toLowerCase().includes(this.desigSearch.toLowerCase())) : this.designations;
  }

  getPlantNameForDesig(d: MItem): string {
    if (!d.PlantId) return '—';
    const p = this.plants.find(x => x.Id === d.PlantId);
    return p ? (p.Name || '—') : '—';
  }

  // ==================== EMPLOYEES ====================
  loadEmployees(): void {
    if (this.isPlantAdmin && this.auth.getPlantId()) {
      this.http.get<MItem[]>(`${this.api}/employees-by-plant/${this.auth.getPlantId()}`).subscribe(r => this.employees = r);
    } else {
      this.http.get<MItem[]>(`${this.api}/employees-all`).subscribe(r => this.employees = r);
    }
  }

  openNewEmp(): void {
    this.editingEmp = null;
    this.empModel = {};
    this.empPassword = '';
    this.selectedRole = 'user';
    this.empLocationOptions = [];
    this.empPlantOptions = [];
    this.empDesigOptions = [];
    this.reportingToEnabled = false;
    // Auto-select cascade for PlantAdmin/Admin users
    if (this.isPlantAdmin || this.auth.currentUser?.IsAdmin === true) {
      const compId = this.auth.getCompId();
      const plantId = this.auth.getPlantId();
      if (compId) {
        this.empModel.ParentId = compId;
        this.http.get<MItem[]>(`${this.api}/locations/by-company/${compId}`).subscribe(locs => {
          this.empLocationOptions = locs.map(l => ({ label: l.Name!, value: l.Id! }));
          if (plantId) {
            this.http.get<MItem[]>(`${this.api}/plants`).subscribe(plants => {
              const myPlant = plants.find(p => p.Id === plantId);
              if (myPlant) {
                const locMatch = locs.find(l => l.Id === myPlant.LocationId);
                if (locMatch) {
                  this.empModel.ShortName = locMatch.Name;
                }
                this.empModel.PlantId = plantId;
                this.http.get<MItem[]>(`${this.api}/designations/by-plant-dropdown/${plantId}`).subscribe(ds => {
                  this.empDesigOptions = ds.map(d => ({ label: d.Name!, value: d.Id! }));
                });
              }
            });
          }
        });
      }
    }
    this.empDialog = true;
  }

  onEmpCompanyChange(): void {
    this.empModel.ShortName = undefined;
    this.empModel.Description = undefined;
    this.empModel.PlantId = undefined;
    this.empLocationOptions = [];
    this.empPlantOptions = [];
    this.empDesigOptions = [];
    if (this.empModel.ParentId) {
      this.http.get<MItem[]>(`${this.api}/locations/by-company/${this.empModel.ParentId}`).subscribe(list => {
        this.empLocationOptions = list.map(l => ({ label: l.Name!, value: l.Id! }));
      });
    }
  }

  onEmpLocationChange(): void {
    this.empModel.Description = undefined;
    this.empModel.PlantId = undefined;
    this.empPlantOptions = [];
    this.empDesigOptions = [];
    const locId = this.empLocationOptions.find(l => l.label === this.empModel.ShortName)?.value;
    if (locId && this.empModel.ParentId) {
      this.http.get<MItem[]>(`${this.api}/plants/by-location/${locId}`).subscribe(list => {
        this.empPlantOptions = list.map(p => ({ label: p.Name!, value: p.Id! }));
      });
    }
  }

  onEmpPlantChange(): void {
    this.empModel.Description = undefined;
    this.empDesigOptions = [];
    if (this.empModel.PlantId) {
      this.http.get<MItem[]>(`${this.api}/designations/by-plant-dropdown/${this.empModel.PlantId}`).subscribe(list => {
        this.empDesigOptions = list.map(d => ({ label: d.Name!, value: d.Id! }));
      });
    }
  }

  onReportingToChange(): void {
    if (this.reportingToEnabled && this.reportingEmployees.length === 0) {
      this.http.get<any[]>(`${this.api}/reporting-employees`).subscribe(list => {
        this.reportingEmployees = list.map(r => ({ id: r.Id, name: r.Name }));
      });
    }
    if (!this.reportingToEnabled) {
      this.empModel.ReportId = undefined;
    }
  }

  editEmp(e: MItem): void {
    this.editingEmp = e;
    this.empModel = { ...e };
    this.empPassword = '';
    this.selectedRole = e.IsAdminUser ? 'admin' : (e.IsSecurity ? 'security' : 'user');
    this.empLocationOptions = [];
    this.empPlantOptions = [];
    this.empDesigOptions = [];
    this.reportingToEnabled = !!e.ReportId;
    if (this.reportingToEnabled && this.reportingEmployees.length === 0) {
      this.http.get<any[]>(`${this.api}/reporting-employees`).subscribe(list => {
        this.reportingEmployees = list.map(r => ({ id: r.Id, name: r.Name }));
      });
    }
    setTimeout(() => {
      if (e.ParentId) this.onEmpCompanyChange();
    }, 300);
    this.empDialog = true;
  }

  saveEmployee(): void {
    if (!this.editingEmp && !this.empPassword) {
      this.notification.warning('Warning', 'Password required'); return;
    }
    this.savingEmp = true;
    const isSuperAdmin = this.selectedRole === 'admin';
    const isPlantAdmin = this.selectedRole === 'plantadmin';
    const isSecurity = this.selectedRole === 'security';
    const desigName = isSuperAdmin ? 'Administrator' : (isSecurity ? 'Security' : (isPlantAdmin ? 'Plant Admin' : (this.empModel.Description || 'User')));
    this.http.post<MItem>(`${this.api}/employees`, {
      Id: this.editingEmp?.Id, Name: this.empModel.Name, Code: this.empModel.Code,
      ShortName: this.empModel.ShortName, Description: desigName,
      ParentId: this.empModel.ParentId, PlantId: this.empModel.PlantId,
      Field1: this.empModel.Field1, Field2: this.empModel.Field2,
      Field3: this.empModel.Code, Password: this.empPassword || null,
      IsAdminUser: isSuperAdmin, IsSecurity: isSecurity, IsPlantAdmin: isPlantAdmin,
      ReportId: this.reportingToEnabled ? this.empModel.ReportId : null,
      IsActive: true, IsDeleted: false
    }).subscribe({
      next: () => {
        this.savingEmp = false; this.empDialog = false; this.editingEmp = null;
        this.notification.success('Saved', 'User saved');
        this.loadEmployees();
      },
      error: () => { this.savingEmp = false; this.notification.error('Error', 'Failed'); }
    });
  }

  deleteEmp(id: number): void {
    const currentEmpId = this.auth.currentUser?.EmpId;
    if (id === currentEmpId) {
      this.notification.warning('Not Allowed', 'You cannot delete your own account');
      return;
    }
    if (!confirm('Delete this employee?')) return;
    this.http.delete(`${this.api}/employees/${id}`).subscribe({
      next: () => { this.notification.success('Deleted', 'Employee deleted'); this.loadEmployees(); },
      error: () => this.notification.error('Error', 'Failed')
    });
  }

  isCurrentUser(id: number): boolean {
    return id === this.auth.currentUser?.EmpId;
  }

  // ===== Categories =====
  categories: MItem[] = [];
  catSearch = '';
  catDialog = false;
  catModel: MItem = {};
  editingCat: MItem | null = null;
  savingCat = false;

  loadCategories(): void {
    this.http.get<any[]>(`${this.api}/categories/list`).subscribe(r => this.categories = r);
  }

  openNewCat(): void { this.editingCat = null; this.catModel = {}; this.catDialog = true; }
  editCat(c: MItem): void { this.editingCat = c; this.catModel = { ...c }; this.catDialog = true; }

  saveCategory(): void {
    this.savingCat = true;
    this.http.post(`${this.api}/categories`, { Id: this.editingCat?.Id, Name: this.catModel.Name }).subscribe({
      next: () => { this.savingCat = false; this.catDialog = false; this.notification.success('Saved', 'Category saved'); this.loadCategories(); },
      error: () => { this.savingCat = false; this.notification.error('Error', 'Failed'); }
    });
  }

  deleteCat(id: number): void {
    if (!confirm('Delete this category?')) return;
    this.http.delete(`${this.api}/categories/${id}`).subscribe({
      next: () => { this.notification.success('Deleted', 'Category deleted'); this.loadCategories(); },
      error: () => this.notification.error('Error', 'Failed')
    });
  }

  get filteredCats(): MItem[] {
    return this.catSearch ? this.categories.filter(c => (c.Name || '').toLowerCase().includes(this.catSearch.toLowerCase())) : this.categories;
  }

  // ===== Visit Purposes =====
  visitPurposes: MItem[] = [];
  vpSearch = '';
  vpDialog = false;
  vpModel: MItem = {};
  editingVp: MItem | null = null;
  savingVp = false;

  loadVisitPurposes(): void {
    this.http.get<any[]>(`${this.api}/visit-purposes/list`).subscribe(r => this.visitPurposes = r);
  }

  openNewVp(): void { this.editingVp = null; this.vpModel = {}; this.vpDialog = true; }
  editVp(v: MItem): void { this.editingVp = v; this.vpModel = { ...v }; this.vpDialog = true; }

  saveVisitPurpose(): void {
    this.savingVp = true;
    this.http.post(`${this.api}/visit-purposes`, { Id: this.editingVp?.Id, Name: this.vpModel.Name, Description: this.vpModel.Description }).subscribe({
      next: () => { this.savingVp = false; this.vpDialog = false; this.notification.success('Saved', 'Visit purpose saved'); this.loadVisitPurposes(); },
      error: () => { this.savingVp = false; this.notification.error('Error', 'Failed'); }
    });
  }

  deleteVp(id: number): void {
    if (!confirm('Delete this visit purpose?')) return;
    this.http.delete(`${this.api}/visit-purposes/${id}`).subscribe({
      next: () => { this.notification.success('Deleted', 'Visit purpose deleted'); this.loadVisitPurposes(); },
      error: () => this.notification.error('Error', 'Failed')
    });
  }

  get filteredVps(): MItem[] {
    return this.vpSearch ? this.visitPurposes.filter(v => (v.Name || '').toLowerCase().includes(this.vpSearch.toLowerCase())) : this.visitPurposes;
  }

  get filteredEmps(): MItem[] {
    return this.empSearch ? this.employees.filter(e =>
      (e.Name || '').toLowerCase().includes(this.empSearch.toLowerCase()) ||
      (e.Code || '').toLowerCase().includes(this.empSearch.toLowerCase())
    ) : this.employees;
  }

}
