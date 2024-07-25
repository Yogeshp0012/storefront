import { CommonModule } from '@angular/common';
import { Component, HostListener, OnInit } from '@angular/core';

@Component({
    selector: 'app-navigation-bar',
    standalone: true,
    imports: [CommonModule],
    templateUrl: './navigation-bar.component.html',
    styleUrl: './navigation-bar.component.scss'
})
export class NavigationBarComponent implements OnInit {
    isScrolled = false;
    mounted = false;

    @HostListener('window:scroll', [])
    onWindowScroll() {
        this.isScrolled = window.pageYOffset > 0;
    }

    ngOnInit() {
        this.mounted = true;
    }
}
