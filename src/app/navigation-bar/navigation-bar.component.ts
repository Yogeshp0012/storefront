import { CommonModule } from '@angular/common';
import { Component, HostListener, inject, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { MedusaClientService } from '../medusa-client.service';

@Component({
    selector: 'app-navigation-bar',
    standalone: true,
    imports: [CommonModule, RouterModule],
    templateUrl: './navigation-bar.component.html',
    styleUrl: './navigation-bar.component.scss'
})
export class NavigationBarComponent implements OnInit {
    private readonly router: Router = inject(Router);
    private readonly medusa: MedusaClientService = inject(MedusaClientService);

    isScrolled = false;
    mounted = false;
    mobileMenu: boolean = false;
    isMenuOpen: boolean = false;
    user = this.medusa.user;

    @HostListener('window:scroll', [])
    onWindowScroll() {
        this.isScrolled = window.pageYOffset > 0;
    }

    ngOnInit() {
        this.medusa.checkUserLoggedIn()
        this.mounted = true;
    }

    openMobileMenu() {
        this.mobileMenu = true;
        this.isMenuOpen = true;
    }

    closeMobileMenu() {
        this.mobileMenu = false;
    }

    checkUser(){
        this.router.navigate(['/login']);
    }

    logout(){
        this.medusa.logout();
    }
}
