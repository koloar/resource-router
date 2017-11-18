import { Component } from '@angular/core';
import { ViewData } from '../../../public_api';

@Component({
  template: `<h2>JSON {{data.type}}</h2>
  <pre>{{data.body | json}}</pre>

  <a *ngIf="data.body?._links?.self as link"
     [resourceLink]="link.href" [type]="link.type" target="_self">{{link.title}}</a>

  <!-- TODO data.target -->
  <button type="button"
          *ngIf="data.body?._links?.self as link"
          [resourceLink]="link.href" [target]="data.target">
    {{link.title}}
  </button>
  `
})
export class JsonComponent {

  constructor(public data: ViewData<any>) {
    console.log(data);
  }
}