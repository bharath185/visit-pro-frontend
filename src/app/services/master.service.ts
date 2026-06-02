import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({ providedIn: 'root' })
export class MasterService {
  private api = environment.apiUrl.replace('/visitor', '/master');

  constructor(private http: HttpClient) {}

  // === Companies ===
  getCompanies(): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/companies`);
  }
  saveCompany(data: any): Observable<any> {
    return this.http.post<any>(`${this.api}/companies`, data);
  }
  deleteCompany(id: number): Observable<any> {
    return this.http.delete(`${this.api}/companies/${id}`);
  }

  // === Departments (Locations) ===
  getDepartments(): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/departments`);
  }
  saveDepartment(data: any): Observable<any> {
    return this.http.post<any>(`${this.api}/departments`, data);
  }
  deleteDepartment(id: number): Observable<any> {
    return this.http.delete(`${this.api}/departments/${id}`);
  }
  getDeptNamesByCompany(compId: number): Observable<string[]> {
    return this.http.get<string[]>(`${this.api}/dept-names-by-company?compId=${compId}`);
  }
  getLocationsByCompany(compId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/locations/by-company/${compId}`);
  }

  // === Plants ===
  getPlants(): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/plants`);
  }
  savePlant(data: any): Observable<any> {
    return this.http.post<any>(`${this.api}/plants`, data);
  }
  deletePlant(id: number): Observable<any> {
    return this.http.delete(`${this.api}/plants/${id}`);
  }
  getPlantsByLocation(locId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/plants/by-location/${locId}`);
  }

  // === Designations ===
  getDesignations(): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/designations`);
  }
  saveDesignation(data: any): Observable<any> {
    return this.http.post<any>(`${this.api}/designations`, data);
  }
  deleteDesignation(id: number): Observable<any> {
    return this.http.delete(`${this.api}/designations/${id}`);
  }
  getDesignationsByPlantDropdown(plantId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/designations/by-plant-dropdown/${plantId}`);
  }
  getDesignationsByDept(deptId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/designations/by-dept/${deptId}`);
  }
  getDesignationList(deptId?: number): Observable<any[]> {
    const url = deptId ? `${this.api}/designation-list?deptId=${deptId}` : `${this.api}/designation-list`;
    return this.http.get<any[]>(url);
  }

  // === Employees ===
  getAllEmployees(): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/employees-all`);
  }
  getEmployeesByPlant(plantId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/employees-by-plant/${plantId}`);
  }
  getEmployeesByDesignation(designationId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/employees-by-designation/${designationId}`);
  }
  getFilteredEmployees(compId?: number, deptName?: string, designationId?: number): Observable<any[]> {
    let url = `${this.api}/employees-filter?`;
    if (compId) url += `compId=${compId}&`;
    if (deptName) url += `deptName=${encodeURIComponent(deptName)}&`;
    if (designationId) url += `designationId=${designationId}&`;
    return this.http.get<any[]>(url);
  }
  getEmployeeHierarchy(plantId: number): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/employee-hierarchy/${plantId}`);
  }
  saveEmployee(data: any): Observable<any> {
    return this.http.post<any>(`${this.api}/employees`, data);
  }
  deleteEmployee(id: number): Observable<any> {
    return this.http.delete(`${this.api}/employees/${id}`);
  }

  // === Categories ===
  getCategories(): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/categories/list`);
  }
  saveCategory(data: any): Observable<any> {
    return this.http.post<any>(`${this.api}/categories`, data);
  }
  deleteCategory(id: number): Observable<any> {
    return this.http.delete(`${this.api}/categories/${id}`);
  }

  // === Visit Purposes ===
  getVisitPurposes(): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/visit-purposes/list`);
  }
  saveVisitPurpose(data: any): Observable<any> {
    return this.http.post<any>(`${this.api}/visit-purposes`, data);
  }
  deleteVisitPurpose(id: number): Observable<any> {
    return this.http.delete(`${this.api}/visit-purposes/${id}`);
  }
}
