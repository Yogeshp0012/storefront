import { Component, inject, OnInit } from '@angular/core';
import { TitleService } from '../title.service';

@Component({
    selector: 'app-contact',
    imports: [],
    templateUrl: './contact.component.html',
    styleUrl: './contact.component.scss'
})
export class ContactComponent implements OnInit {
    private readonly title: TitleService = inject(TitleService);

    ngOnInit(): void {
        this.title.setTitle("Vastragrah - Contact")
    }

}
