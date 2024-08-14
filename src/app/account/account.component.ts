import { Component, effect, inject, OnInit } from '@angular/core';
import { MedusaClientService } from '../medusa-client.service';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { Utils } from '../utils/Utils';

@Component({
    selector: 'app-account',
    standalone: true,
    imports: [CommonModule, FormsModule, RouterModule, DatePipe],
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
    editAddressId: string = '';

    addressIsLoading: boolean = false;
    address_city: string = '';
    address_country: string = 'IN';
    address_state: string = 'Karnataka';
    address_zipcode: string = '';
    address_firstName: string = '';
    address_lastName: string = '';
    address_phone: string = '';
    address_company: string = '';
    address_address1: string = '';
    address_address2: string = '';
    address_metadata: {} = {};
    addressErrorMessage: string = '';

    orders: any[] = [];

    stateList: string[] = [
        "Andaman and Nicobar Islands",
        "Andhra Pradesh",
        "Arunachal Pradesh",
        "Assam",
        "Bihar",
        "Chandigarh",
        "Chhattisgarh",
        "Dadra and Nagar Haveli and Daman and Diu",
        "Goa",
        "Gujarat",
        "Haryana",
        "Himachal Pradesh",
        "Jammu and Kashmir",
        "Jharkhand",
        "Karnataka",
        "Kerala",
        "Ladakh",
        "Lakshadweep",
        "Madhya Pradesh",
        "Maharashtra",
        "Manipur",
        "Meghalaya",
        "Mizoram",
        "Nagaland",
        "NCT of Delhi",
        "Odisha",
        "Puducherry",
        "Punjab",
        "Rajasthan",
        "Sikkim",
        "Tamil Nadu",
        "Telangana",
        "Tripura",
        "Uttarakhand",
        "Uttar Pradesh",
        "West Bengal"
    ];

    constructor() {
        effect(() => {
            this.user = this.medusa.user;
            if (this.user()) {
                this.lastName = this.user().last_name;
                this.name = this.firstName + " " + this.lastName;
                this.email = this.user().email;
                this.phone = this.user().phone;
                this.addresses = this.user().shipping_addresses;
                this.orders = this.medusa.user().orders;
                console.log(this.orders);
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
        this.medusa.updateProfile(this.firstName, this.lastName, this.email, this.phone, this.password).then((data: any) => {
            this.isLoading = false;
            this.successMessage = "Profile updated successfully";
        });
    }

    updateAddress(): void {
        this.addressErrorMessage = '';
        if(this.address_city === ''||
        this.address_phone === ''||
        this.address_state === ''||
        this.address_zipcode === ''||
        this.address_firstName === ''||
        this.address_lastName === ''||
        this.address_company === ''||
        this.address_address1 === ''
     ){
        this.addressErrorMessage = 'Please enter all the details.';
        return;
        }
        if(this.address_phone.length < 10 || this.address_phone.length > 12){
            this.addressErrorMessage = 'Please enter a valid phone number';
            return;
        }
        this.openAddressModal = true;
        if (this.editAddressId) {
            this.medusa.updateAddress(this.editAddressId, {
                first_name: this.address_firstName,
                last_name: this.address_lastName,
                address_2: this.address_address2,
                address_1: this.address_address1,
                city: this.address_city,
                country_code: this.address_country,
                postal_code: this.address_zipcode,
                phone: this.address_phone,
                company: this.address_company,
                province: this.address_state,
            }).then(() => {
                this.openAddressModal = false;
                this.addressIsLoading = false;
                this.editAddressId = '';
            })
        }
        else {
            this.openAddressModal = false;
            this.addressIsLoading = true;
            this.medusa.addAddress({
                first_name: this.address_firstName,
                last_name: this.address_lastName,
                address_1: this.address_address1,
                address_2: this.address_address2,
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

    editAddress(address: any) {
        this.editAddressId = address.id;
        this.address_city = address.city;
        this.address_phone = address.phone;
        this.address_state = address.province;
        this.address_zipcode = address.postal_code;
        this.address_firstName = address.first_name;
        this.address_lastName = address.last_name;
        this.address_company = address.company;
        this.address_address1 = address.address_1;
        this.address_address2 = address.address_2;
        this.openAddressModal = true;
    }

    addNewAddress(): void {
        this.editAddressId ='';
        this.address_city = '';
        this.address_phone = '';
        this.address_state = 'Karnataka';
        this.address_zipcode = '';
        this.address_firstName = '';
        this.address_lastName = '';
        this.address_company = '';
        this.address_address1 = '';
        this.address_address2 = '';
        this.openAddressModal = true;
    }

    removeAddress(addressId: string): void {
        this.addressIsLoading = true;
        this.medusa.deleteAddress(addressId).then(() => {
            this.addressIsLoading = false;
        })
    }
}
