import { Component, effect, inject, OnInit } from '@angular/core';
import { MedusaClientService } from '../medusa-client.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Utils } from '../utils/Utils';

@Component({
    selector: 'app-account',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule],
    templateUrl: './account.component.html',
    styleUrl: './account.component.scss'
})
export class AccountComponent implements OnInit {
    private readonly router: Router = inject(Router);
    private readonly medusa: MedusaClientService = inject(MedusaClientService);

    user = this.medusa.user;
    name: string = '';
    firstName: string = '';
    lastName: string = '';
    selectedStep: string = "1";
    email: string = '';
    password: string = '';
    phone: string = '';
    isLoading: boolean = false;
    errorMessage: string = '';
    successMessage: string = '';
    addresses: any[] = [];
    openAddressModal: boolean = false;

    addressIsLoading: boolean = false;
    address_city: string = '';
    address_country: string = 'IN';
    address_state: string = '';
    address_zipcode: string = '';
    address_firstName: string = '';
    address_lastName: string = '';
    address_phone: string = '';
    address_company: string = '';
    address_address1: string = '';
    address_address2: string = '';
    address_metadata: {} = {};

    constructor() {
        effect(() => {
            this.user = this.medusa.user;
                if(this.user()) {
                this.lastName = this.user().last_name;
                this.name = this.firstName + " " + this.lastName;
                this.email = this.user().email;
                this.phone = this.user().phone;
            this.addresses = this.user().shipping_addresses;
                    console.log(this.addresses);
            }
        })
    }

    ngOnInit(): void {
        this.medusa.checkUserLoggedIn().then((data: any) => {
            if (!this.user()) {
                this.router.navigate(['/']);
            }
            this.firstName = this.user().first_name;
            this.lastName = this.user().last_name;
            this.name = this.firstName + " " + this.lastName;
            this.email = this.user().email;
            this.phone = this.user().phone;
            this.addresses = this.user().shipping_addresses;
        });
    }

    updateProfile(): void {
        this.isLoading = true;
        this.errorMessage = '';
        this.successMessage = '';
        if (this.firstName == '' || this.lastName == '' || this.email == '' || this.phone == '') {
            this.errorMessage = "Please enter all the required details";
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
            this.medusa.updateProfile(this.firstName, this.lastName, this.email,this.phone,this.password).then((data: any) => {
                this.isLoading = false;
                this.successMessage = "Profile updated successfully";
            });
    }

    updateAddress(): void {
        this.addressIsLoading = true;
        this.medusa.addAddress({
            first_name: this.address_firstName,
            last_name: this.address_lastName,
            address_1: this.address_address1,
            city: this.address_city,
            country_code: this.address_country,
            postal_code: this.address_zipcode,
            phone: this.address_phone,
            company: this.address_company,
            province: this.address_state,
        }).then(() => {
            this.addressIsLoading = false;
        })
    }
}
