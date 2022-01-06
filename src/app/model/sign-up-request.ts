export class SignUpRequest {
  email : string;
  firstname : string;
  lastname : string;
  username : string;
  password : string;
  confirmPassword : string;

  constructor() {
    this.email = '';
    this.firstname = '';
    this.lastname = '';
    this.username = '';
    this.password = '';
    this.confirmPassword = '';

  }
}
