import { Component, inject } from '@angular/core';
import { TitleService } from '../title.service';
import { MedusaClientService } from '../medusa-client.service';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { Utils } from '../utils/Utils';

@Component({
    selector: 'app-register',
    standalone: true,
    imports: [FormsModule, RouterModule],
    templateUrl: './register.component.html',
    styleUrl: './register.component.scss'
})
export class RegisterComponent {
    private readonly title: TitleService = inject(TitleService);
    private readonly medusa: MedusaClientService = inject(MedusaClientService);

    firstName: string = '';
    lastName: string = '';
    phone: string = '';
    email: string = '';
    password: string = '';
    errorMessage: string = '';
    isLoading: boolean = false;

    ngOnInit(): void {
        this.title.setTitle('Register');
    }

    register(): void {
        this.isLoading = true;
        this.errorMessage = '';
        if(this.firstName == '' || this.lastName == '' || this.email == '' || this.password == '' || this.phone == ''){
            this.errorMessage = "Please enter all the details";
            this.isLoading = false;
            return;
        }
        if(!Utils.validateEmail(this.email)){
            this.errorMessage = "Please enter a valid email";
            this.isLoading = false;
            return;
        }
        if(this.phone.length < 10 || this.phone.length > 12){
            this.errorMessage = "Please enter a valid phone number";
            this.isLoading = false;
            return;
         }
         this.medusa.createUser(this.firstName, this.lastName, this.email, this.password)
                    .then(({ customer }: { customer: any }) => {
                        this.isLoading = false;
                    })
                    .catch((error: any) => {
                        this.isLoading = false;
                        this.errorMessage = "Email already exists";
                    });
    }
}
