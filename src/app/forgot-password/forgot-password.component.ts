import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MedusaClientService } from '../medusa-client.service';
import { Utils } from '../utils/Utils';
import { Router, RouterModule } from '@angular/router';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [FormsModule, RouterModule],
  templateUrl: './forgot-password.component.html',
  styleUrl: './forgot-password.component.scss',
})
export class ForgotPasswordComponent {
  private readonly medusa: MedusaClientService = inject(MedusaClientService);
  private readonly router: Router = inject(Router);

  email: string = '';
  password: string = '';
  code: string = '';
  mailCode: string = '';
  errorMessage: string = '';
  successMessage: boolean = false;
  isLoading: boolean = false;
  emailVerified: boolean = false;
  token: string = '';

  checkEmail(): void {
    if (!Utils.validateEmail(this.email)) {
      this.errorMessage = 'Invalid Email';
      return;
    }
    this.isLoading = true;
    this.medusa.emailExists(this.email).then((data: any) => {
      if (data.exists) {
        this.errorMessage = '';
        this.mailCode = Math.floor(100000 + Math.random() * 900000).toString();
        this.medusa.sendPasswordToken(this.email, this.mailCode).subscribe({
          next: (data: any) => {
            this.token = data.code;
            this.isLoading = false;
            this.emailVerified = true;
          },
          error: (error) => {
            console.log(error);
            this.errorMessage = 'Failed to send email';
            this.isLoading = false;
          },
        });
      } else {
        this.errorMessage = 'Email does not exist';
        this.isLoading = false;
      }
    });
  }

  resetPassword() {
    this.errorMessage = '';
    this.successMessage = false;
    this.isLoading = true;
    if (this.password == '' || this.code == '') {
        this.errorMessage === 'Please enter all details';
        this.isLoading = false;
        return;
      }
      if (this.successMessage) {
        this.errorMessage = 'Password has already been updated';
        this.isLoading = false;
        return;
      }
    if (this.code === this.mailCode) {
      this.medusa
        .updatePassword(this.email, this.password, this.token)
        .then(() => {
          this.successMessage = true;
          this.isLoading = false;
        })
        .catch((error: any) => {
          console.log(error);
          this.errorMessage === 'Failed to update password';
          this.isLoading = false;
        });
    } else {
      this.errorMessage = 'Invalid code';
      this.isLoading = false;
    }
  }
}
