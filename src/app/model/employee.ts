export class Employee {
  id: string;
  firstName: string;
  lastName: string;
  middleName: string;
  salary: number
  phoneNumber: string;
  email: string;
  hireDate: Date | null;
  dismissalDate: Date | null;
  head: boolean
  userId: string;
  positionId: string;
  departmentId: string;

  constructor() {
    this.id = '';
    this.firstName = '';
    this.lastName = '';
    this.middleName = '';
    this.salary = 0;
    this.phoneNumber = '';
    this.email = '';
    this.hireDate = null;
    this.dismissalDate = null;
    this.head = false;
    this.userId = '';
    this.positionId = '';
    this.departmentId = '';
  }
}
