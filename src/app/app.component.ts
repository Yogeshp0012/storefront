import { Component, inject, OnInit } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { MedusaClientService } from './medusa-client.service';
import { NavigationBarComponent } from './navigation-bar/navigation-bar.component';
import { FooterComponent } from './footer/footer.component';
import { injectSpeedInsights } from '@vercel/speed-insights';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterOutlet, NavigationBarComponent, FooterComponent],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
    ngOnInit(): void {
        injectSpeedInsights();
    }
}
