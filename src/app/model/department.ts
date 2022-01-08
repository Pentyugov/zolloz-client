export class Department {
  id: string;
  name: string;
  code: string;
  head: boolean;
  parentDepartment: Department | null | undefined;

  constructor() {
    this.id = '';
    this.name = '';
    this.code = '';
    this.head = false;
    this.parentDepartment = null;
  }
}
