import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';
import { AuthInterceptor } from './services/auth.interceptor';
import { FormsModule } from '@angular/forms';
import { AppComponent } from './app.component';
import { RouterModule } from '@angular/router';
import { AppRoutingModule } from './app.routes';

import { registerLocaleData } from '@angular/common';
import en from '@angular/common/locales/en';
registerLocaleData(en);

import { NZ_I18N, en_US } from 'ng-zorro-antd/i18n';
import { NzLayoutModule } from 'ng-zorro-antd/layout';
import { NzMenuModule } from 'ng-zorro-antd/menu';
import { NzIconModule } from 'ng-zorro-antd/icon';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzCardModule } from 'ng-zorro-antd/card';
import { NzTableModule } from 'ng-zorro-antd/table';
import { NzFormModule } from 'ng-zorro-antd/form';
import { NzInputModule } from 'ng-zorro-antd/input';
import { NzSelectModule } from 'ng-zorro-antd/select';
import { NzDatePickerModule } from 'ng-zorro-antd/date-picker';
import { NzTimePickerModule } from 'ng-zorro-antd/time-picker';
import { NzModalModule } from 'ng-zorro-antd/modal';
import { NzTagModule } from 'ng-zorro-antd/tag';
import { NzSpinModule } from 'ng-zorro-antd/spin';
import { NzNotificationModule } from 'ng-zorro-antd/notification';
import { NzTabsModule } from 'ng-zorro-antd/tabs';
import { NzBreadCrumbModule } from 'ng-zorro-antd/breadcrumb';
import { NzDividerModule } from 'ng-zorro-antd/divider';
import { NzGridModule } from 'ng-zorro-antd/grid';
import { NzAvatarModule } from 'ng-zorro-antd/avatar';
import { NzBadgeModule } from 'ng-zorro-antd/badge';
import { NzDropDownModule } from 'ng-zorro-antd/dropdown';
import { NzMessageModule } from 'ng-zorro-antd/message';
import { NzSkeletonModule } from 'ng-zorro-antd/skeleton';
import { NgxEchartsModule } from 'ngx-echarts';
import { NzToolTipModule } from 'ng-zorro-antd/tooltip';
import { NzUploadModule } from 'ng-zorro-antd/upload';
import { NzAlertModule } from 'ng-zorro-antd/alert';

import { IconDefinition } from '@ant-design/icons-angular';
import { HomeOutline, DashboardOutline, SendOutline, TeamOutline, LogoutOutline, UserOutline, LockOutline,
  SettingOutline, FilterOutline, BarChartOutline, MenuFoldOutline, MenuUnfoldOutline, PlusOutline,
  EditOutline, DeleteOutline, SearchOutline, DownloadOutline, CloseOutline, CheckOutline, CheckCircleOutline,
  EyeOutline, ClockCircleOutline, InboxOutline, MailOutline, PhoneOutline, IdcardOutline,
  ApartmentOutline, BuildOutline, EnvironmentOutline, SafetyOutline, RollbackOutline,
  LoadingOutline, ReloadOutline, FileExcelOutline, ArrowLeftOutline, ArrowUpOutline, ArrowDownOutline,
  FormOutline, UndoOutline, CalendarOutline, UnorderedListOutline, CameraOutline, PlusCircleOutline,
  BellOutline, StarOutline, StarFill, ExclamationCircleOutline,
  BankOutline, TagOutline } from '@ant-design/icons-angular/icons';

const icons: IconDefinition[] = [
  HomeOutline, DashboardOutline, SendOutline, TeamOutline, LogoutOutline, UserOutline, LockOutline,
  BankOutline, TagOutline,
  SettingOutline, FilterOutline, BarChartOutline, MenuFoldOutline, MenuUnfoldOutline, PlusOutline,
  EditOutline, DeleteOutline, SearchOutline, DownloadOutline, CloseOutline, CheckOutline, CheckCircleOutline,
  EyeOutline, ClockCircleOutline, InboxOutline, MailOutline, PhoneOutline, IdcardOutline,
  ApartmentOutline, BuildOutline, EnvironmentOutline, SafetyOutline, RollbackOutline,
  LoadingOutline, ReloadOutline, FileExcelOutline, ArrowLeftOutline, ArrowUpOutline, ArrowDownOutline,
  FormOutline, UndoOutline, CalendarOutline, UnorderedListOutline, CameraOutline,
  PlusCircleOutline, BellOutline, StarOutline, StarFill, ExclamationCircleOutline
];

// Import all components
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { InviteVisitorComponent } from './components/invite-visitor/invite-visitor.component';
import { ViewVisitorsComponent } from './components/view-visitors/view-visitors.component';
import { DirectCheckinComponent } from './components/direct-checkin/direct-checkin.component';
import { VisitorSelfCheckinComponent } from './components/visitor-self-checkin/visitor-self-checkin.component';
import { VisitorAcceptInviteComponent } from './components/visitor-accept-invite/visitor-accept-invite.component';
import { MasterSetupComponent } from './components/master-setup/master-setup.component';
import { VisitFilterComponent } from './components/visit-filter/visit-filter.component';
import { SelfCheckoutComponent } from './components/self-checkout/self-checkout.component';
import { SelfDirectCheckinComponent } from './components/self-direct-checkin/self-direct-checkin.component';
import { ForgotPasswordComponent } from './components/forgot-password/forgot-password.component';
import { NotificationsComponent } from './components/notifications/notifications.component';

// New role-based components
import { SuperAdminDashboardComponent } from './components/super-admin-dashboard/super-admin-dashboard.component';
import { PlantAdminDashboardComponent } from './components/plant-admin-dashboard/plant-admin-dashboard.component';
import { PlantUserManagementComponent } from './components/plant-user-management/plant-user-management.component';
import { DesignationManagementComponent } from './components/designation-management/designation-management.component';
import { UserDashboardComponent } from './components/user-dashboard/user-dashboard.component';
import { CreateInviteComponent } from './components/create-invite/create-invite.component';
import { MyInvitesComponent } from './components/my-invites/my-invites.component';
import { AppLayoutComponent } from './components/app-layout/app-layout.component';
import { ChangePasswordComponent } from './components/change-password/change-password.component';

@NgModule({
  declarations: [
    AppComponent,
    ChangePasswordComponent,
    LoginComponent,
    DashboardComponent,
    InviteVisitorComponent,
    ViewVisitorsComponent,
    DirectCheckinComponent,
    VisitorSelfCheckinComponent,
    VisitorAcceptInviteComponent,
    MasterSetupComponent,
    VisitFilterComponent,
    SelfCheckoutComponent,
    SelfDirectCheckinComponent,
    ForgotPasswordComponent,
    NotificationsComponent,
    SuperAdminDashboardComponent,
    PlantAdminDashboardComponent,
    PlantUserManagementComponent,
    DesignationManagementComponent,
    UserDashboardComponent,
    CreateInviteComponent,
    MyInvitesComponent,
    AppLayoutComponent
  ],
  imports: [
    BrowserModule, BrowserAnimationsModule, HttpClientModule, FormsModule,
    NzLayoutModule, NzMenuModule, NzIconModule.forRoot(icons), NzButtonModule,
    NzCardModule, NzTableModule, NzFormModule, NzInputModule, NzSelectModule,
    NzDatePickerModule, NzTimePickerModule, NzModalModule, NzTagModule, NzSpinModule, NzNotificationModule,
    NzTabsModule, NzBreadCrumbModule, NzDividerModule, NzGridModule, NzAvatarModule,
    NzBadgeModule, NzDropDownModule, NzMessageModule, NzSkeletonModule,
    NzToolTipModule, NzUploadModule, NzAlertModule,
    NgxEchartsModule.forRoot({ echarts: () => import('echarts') }),
    RouterModule,
    AppRoutingModule
  ],
  providers: [
    { provide: NZ_I18N, useValue: en_US },
    { provide: HTTP_INTERCEPTORS, useClass: AuthInterceptor, multi: true }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
