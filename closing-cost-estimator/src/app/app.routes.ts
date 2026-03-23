import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./calculator/calculator').then(m => m.CalculatorComponent),
  },
  {
    path: 'disclaimers',
    loadComponent: () =>
      import('./disclaimers/disclaimers').then(m => m.DisclaimersComponent),
  },
];
