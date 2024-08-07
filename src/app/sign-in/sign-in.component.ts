import { AfterContentChecked, AfterContentInit, AfterViewChecked, AfterViewInit, Component, inject, OnChanges, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { MedusaClientService } from '../medusa-client.service';
import { TitleService } from '../title.service';

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
    isLoading: boolean = false;
    user = this.medusa.user;

    ngOnInit(): void {
        this.medusa.checkUserLoggedIn().then((data: any) => {
            if(this.user()){
                this.router.navigate(['/']);
            }
          });
        this.title.setTitle('Sign In');
    }

    signIn(): void {
        console.log(this.user());
        this.isLoading = true;
        this.errorMessage = '';
        this.medusa.login(
            this.email,
            this.password
        ).then(() => {
            this.isLoading = false;
            this.router.navigate(['/']);
        })
            .catch((error: any) => {
                this.errorMessage = "Invalid Email or Password";
                this.isLoading = false;
            });
    }
}
