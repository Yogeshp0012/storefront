import { DOCUMENT } from '@angular/common';
import { Component, inject, OnInit, Renderer2 } from '@angular/core';
import { NavigationEnd, Router, RouterModule, RouterOutlet } from '@angular/router';
import { injectSpeedInsights } from '@vercel/speed-insights';
import { FooterComponent } from './footer/footer.component';
import { NavigationBarComponent } from './navigation-bar/navigation-bar.component';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterOutlet, NavigationBarComponent, FooterComponent, RouterModule],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
    private readonly document = inject(DOCUMENT);
    private readonly renderer = inject(Renderer2);
    private readonly router: Router = inject(Router);

    ngOnInit(): void {
        injectSpeedInsights();
        this.router.events.subscribe(event => {
            if (event instanceof NavigationEnd) {
                this.renderer.setProperty(this.document.documentElement, 'scrollTop', 0);
                this.renderer.setProperty(this.document.body, 'scrollTop', 0);
            }
        });
    }
}
