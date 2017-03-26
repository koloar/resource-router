import { Directive, HostBinding, HostListener, Input, OnChanges, Optional } from '@angular/core';
import { Location } from '@angular/common';
import { ResourceViewRegistry } from '../resource-view-registry';
import { ApiUrl } from '../api-url';
import { ViewData } from '../view-data';
import { NavigationHandler } from '../navigation-handler';
import { ApiLocation } from '../api-location';


const TARGET_SELF = '_self';
const TARGET_TOP = '_top';


@Directive({
  selector: ':not(a)[resourceLink]'
})
export class ResourceLinkDirective {

  @Input() resourceLink: string;
  @Input() target?: NavigationHandler | '_self' | '_top';

  constructor(private apiLocation: ApiLocation,
              @Optional() private view?: ViewData<any>) {
  }

  @HostListener('click')
  onClick(): boolean {
    // Handle target
    let target = this.target;

    if (typeof target === 'string' && target) {
      if (target === TARGET_SELF) {
        target = this.view && this.view.navigation;
      } else if (target === TARGET_TOP) {
        target = undefined;
      } else {
        throw new Error(`Unsupported target '${target}', try <a> tag instead`);
      }
    }

    // Fallback to page navigation
    // TODO configurable by ViewDef.defaultNavigationTarget
    if (!target) {
      target = this.apiLocation;
    }

    // Navigate
    if (typeof target.go === 'function') {
      target.go(this.resourceLink);
    }

    // And cancel click
    return true;
  }
}


@Directive({selector: 'a[resourceLink]'})
export class ResourceLinkWithHrefDirective implements OnChanges {

  @HostBinding() href: string;
  @Input() resourceLink: string;
  @Input() type?: string;
  @Input() target?: NavigationHandler | string;
  @Input() external = false;

  constructor(private apiUrl: ApiUrl,
              private location: Location,
              private resourceViewRegistry: ResourceViewRegistry,
              @Optional() private view?: ViewData<any>) {
  }

  ngOnChanges(): void {
    // Is the link supported? Note that its pointless for external links
    if (this.type && !this.external) {
      // Is it known type for successful response?
      // Note that this mechanism does not work for other status codes, you will have to set [external] manually
      this.external = !this.resourceViewRegistry.match(this.type, 200);
    }

    // Map to API, if it fails, mark as external
    let viewUrl = this.resourceLink;
    if (!this.external && viewUrl) {
      const url = this.apiUrl.mapApiToView(viewUrl);
      if (url) {
        viewUrl = url;
      } else {
        this.external = true;
      }
    }

    // Store mapped URL to href
    this.href = this.location.prepareExternalUrl(viewUrl);
  }

  @HostListener('click', ['$event.button', '$event.ctrlKey', '$event.metaKey'])
  onClick(button: number, ctrlKey: boolean, metaKey: boolean): boolean {
    // Let the browser do the navigation if any key was pressed or this link is external
    if (button !== 0 || ctrlKey || metaKey || !this.resourceLink || this.external) {
      return true;
    }

    // Handle target
    let target = this.target;

    if (typeof target === 'string') {
      if (target === TARGET_SELF) {
        target = this.view && this.view.navigation;
      } else if (target === TARGET_TOP) {
        target = undefined;
      } else {
        // Custom target, open new window
        return true;
      }
    }

    // Custom target
    if (target && typeof target.go === 'function') {
      // Navigate
      target.go(this.resourceLink);
      return false;
    } else {
      // Default
      // TODO configurable by ViewDef.defaultNavigationTarget
      this.location.go(this.href);
      return false;
    }
  }
}
