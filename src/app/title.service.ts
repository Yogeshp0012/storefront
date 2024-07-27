import { inject, Injectable } from '@angular/core';
import { Title } from '@angular/platform-browser';

@Injectable({
  providedIn: 'root'
})
export class TitleService {
    private title: Title = inject(Title);

    getTitle() {
        this.title.getTitle();
    }
    setTitle(newTitle: string) {
        this.title.setTitle(newTitle);
    }
}
