import { Routes } from '@angular/router';

export const routes: Routes = [
    { path: '', loadComponent: () => import('./home/home.component').then(m => m.HomeComponent) },
    { path: 'about', loadComponent: () => import('./static/about/about.component').then(m => m.AboutComponent) },
    { path: 'privacy-policy', loadComponent: () => import('./static/privacy-policy/privacy-policy.component').then(m => m.PrivacyPolicyComponent) },
    { path: 'tnc', loadComponent: () => import('./static/tnc/tnc.component').then(m => m.TncComponent) },
    { path: 'faq', loadComponent: () => import('./static/faq/faq.component').then(m => m.FaqComponent) },
    { path: 'login', loadComponent: () => import('./sign-in/sign-in.component').then(m => m.SignInComponent) },
    { path: 'register', loadComponent: () => import('./register/register.component').then(m => m.RegisterComponent) },
];
