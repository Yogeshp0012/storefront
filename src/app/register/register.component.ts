import { Component, inject, OnInit } from '@angular/core';
import { TitleService } from '../title.service';
import { MedusaClientService } from '../medusa-client.service';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Utils } from '../utils/Utils';

@Component({
    selector: 'app-register',
    imports: [FormsModule, RouterModule],
    templateUrl: './register.component.html',
    styleUrl: './register.component.scss'
})
export class RegisterComponent implements OnInit {
    private readonly title: TitleService = inject(TitleService);
    private readonly medusa: MedusaClientService = inject(MedusaClientService);
    private readonly router: Router = inject(Router);

    firstName: string = '';
    lastName: string = '';
    phone: string = '';
    email: string = '';
    password: string = '';
    errorMessage: string = '';
    isLoading: boolean = false;
    user = this.medusa.user;

    ngOnInit(): void {
        this.medusa.checkUserLoggedIn().then((data: any) => {
            if (this.user()) {
                this.router.navigate(['/']);
            }
        });
        this.title.setTitle('Vastragrah - Register');
    }

    register(): void {
        this.isLoading = true;
        this.errorMessage = '';
        if (this.firstName == '' || this.lastName == '' || this.email == '' || this.password == '' || this.phone == '') {
            this.errorMessage = "Please enter all the details";
            this.isLoading = false;
            return;
        }
        if (!Utils.validateEmail(this.email)) {
            this.errorMessage = "Please enter a valid email";
            this.isLoading = false;
            return;
        }
        if (this.phone.length < 10 || this.phone.length > 12) {
            this.errorMessage = "Please enter a valid phone number";
            this.isLoading = false;
            return;
        }
        this.medusa.createUser(this.firstName, this.lastName, this.email, this.password, this.phone)
            .then(() => {
                this.medusa.sendSignUpEmail(this.email, this.firstName+" "+this.lastName).subscribe({
                    next: (data: any) => {
                        this.isLoading = false;
                        this.router.navigate(['/']);
                    },
                    error: (error) => {
                        this.isLoading = false;
                        this.router.navigate(['/']);
                    }
                });
            })
            .catch((error: any) => {
                this.isLoading = false;
                this.errorMessage = "Email already exists";
            });
    }
}
