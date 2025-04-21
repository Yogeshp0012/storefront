import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MedusaClientService } from '../medusa-client.service';
import { Utils } from '../utils/Utils';
import { Router, RouterModule } from '@angular/router';
import { firstValueFrom } from 'rxjs';

@Component({
    selector: 'app-forgot-password',
    imports: [FormsModule, RouterModule],
    templateUrl: './forgot-password.component.html',
    styleUrl: './forgot-password.component.scss'
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

  async checkEmail(): Promise<void> {
    if (!Utils.validateEmail(this.email)) {
        this.errorMessage = 'Invalid Email';
        return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    try {
        const data = await this.medusa.emailExists(this.email);

        if (data.exists) {
            this.mailCode = Math.floor(100000 + Math.random() * 900000).toString();
            let tokenData: any = await firstValueFrom(this.medusa.sendPasswordToken(this.email, this.mailCode));
            this.token = tokenData.code;
            this.emailVerified = true;
        } else {
            this.errorMessage = 'Email does not exist';
        }
    } catch (error) {
        console.error("Error checking email:", error);
        this.errorMessage = 'Failed to send email';
    } finally {
        this.isLoading = false;
    }
}

  resetPassword() {
    this.errorMessage = '';
    this.successMessage = false;
    this.isLoading = true;
    if (this.password == '' || this.code == '') {
        this.errorMessage = 'Please enter all details';
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
