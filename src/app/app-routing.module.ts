import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import {LoginComponent} from "./login/login.component";
import {RegisterComponent} from "./register/register.component";
import {UserComponent} from "./user/user.component";
import {DepartmentComponent} from "./department/department.component";
import {PositionComponent} from "./position/position.component";
import {TaskComponent} from "./task/task.component";
import {MainComponent} from "./main/main.component";
import {SettingsComponent} from "./settings/settings.component";
import {ProfileComponent} from "./profile/profile.component";
import {AuthenticationGuard} from "./guard/authentication.guard";
import {SidebarComponent} from "./sidebar/sidebar.component";
import {EmployeeComponent} from "./employee/employee.component";
import {RoleComponent} from "./role/role.component";

const routes: Routes = [
  {path: 'main', component: MainComponent, canActivate: [AuthenticationGuard]},
  {path: 'login', component: LoginComponent},
  {path: 'register', component: RegisterComponent},
  {path: 'department/management', component: DepartmentComponent, canActivate: [AuthenticationGuard]},
  {path: 'position/management', component: PositionComponent, canActivate: [AuthenticationGuard]},
  {path: 'user/management', component: UserComponent, canActivate: [AuthenticationGuard]},
  {path: 'employee/management', component: EmployeeComponent, canActivate: [AuthenticationGuard]},
  {path: 'workflow/tasks', component: TaskComponent, canActivate: [AuthenticationGuard]},
  {path: 'settings', component: SettingsComponent, canActivate: [AuthenticationGuard]},
  {path: 'profile', component: ProfileComponent, canActivate: [AuthenticationGuard]},
  {path: 'sidebar', component: SidebarComponent, canActivate: [AuthenticationGuard]},
  {path: 'roles', component: RoleComponent, canActivate: [AuthenticationGuard]},
  {path: '', redirectTo: '/login', pathMatch: 'full', },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
