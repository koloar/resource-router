import { Component, OnInit } from '@angular/core';
import { ActivatedView } from 'angular-resource-router';

export interface SampleData {

  _links?: any;

  name: string;
  address?: string;
  age?: number;
}


@Component({
  template: `<h2>SAmple</h2>
  <form *ngIf="data">
    <label for="name">Name</label>
    <input id="name" name="name" type="text" [(ngModel)]="data.name">

    <label for="address">Address</label>
    <input id="address" name="address" type="text" [(ngModel)]="data.address">

    <label for="age">Name</label>
    <input id="age" name="age" type="number" [(ngModel)]="data.age">
  </form>

  <a *ngIf="data?._links?.next as link" [resourceLink]="link.href">{{link.title}}</a>`
})
export class SampleComponent implements OnInit {

  data: SampleData;

  constructor(public view: ActivatedView<SampleData>) {
  }

  ngOnInit(): void {
    this.view.data.subscribe(data => this.data = data.body);
  }
}
