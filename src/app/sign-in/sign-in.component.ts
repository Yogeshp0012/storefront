import { Component, inject, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TitleService } from '../title.service';
import { MedusaClientService } from '../medusa-client.service';
import { Router, RouterLink, RouterModule } from '@angular/router';

@Component({
  selector: 'app-sign-in',
  standalone: true,
  imports: [FormsModule, RouterModule],
  templateUrl: './sign-in.component.html',
  styleUrl: './sign-in.component.scss'
})
export class SignInComponent implements OnInit {
    private readonly title: TitleService = inject(TitleService);
    private readonly medusa: MedusaClientService = inject(MedusaClientService);
    private readonly router: Router = inject(Router);

    email: string = '';
    password: string = '';
    errorMessage: string = '';

    ngOnInit(): void{
        this.title.setTitle('Sign In');
    }

    signIn(): void {
        this.errorMessage = '';
        this.medusa.login(
            this.email,
            this.password
          )
          .then(({ customer }: {customer: any}) => {
            this.router.navigate(['/']);
          })
          .catch((error: any) => {
            this.errorMessage = "Invalid Email or Password";
          });
    }
}
