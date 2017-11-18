import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, DebugElement } from '@angular/core';
import { ResourceViewRegistry } from '../resource-view-registry';
import { ResourceLinkDirective, TargetType } from './resource-link';
import { Location } from '@angular/common';
import { ApiMapper, APP_API_PREFIX } from '../api-mapper';
import { ViewData } from '../view-data';
import { NavigationHandler } from '../navigation-handler';
import { Headers } from '@angular/http';
import { ApiLocation } from '../api-location';
import { By } from '@angular/platform-browser';
import { asSpy, createClassSpyObj } from '../utils/class-mock.spec';


const API_PREFIX = 'http://example.com/';

/**
 * Helper component for tests.
 */
@Component({
  selector: 'my-test',
  template: `
    <button type="button" [resourceLink]="link" [target]="target">${ResourceLinkDirective.name}</button>`
})
class TestComponent {
  link?: string;
  target?: TargetType;
}

function createSpyNavigationHandler() {
  return jasmine.createSpyObj<NavigationHandler>('navigation', ['go']);
}

describe(ResourceLinkDirective.name, () => {
  let location: Location;
  let registry: ResourceViewRegistry;

  let comp: TestComponent;
  let fixture: ComponentFixture<TestComponent>;
  let de: DebugElement;
  let el: HTMLElement;

  // Shared components
  beforeEach(async(() => {
    location = createClassSpyObj(Location);
    asSpy(location.path).and.returnValue('/');

    registry = createClassSpyObj(ResourceViewRegistry);

    return TestBed.configureTestingModule({
      declarations: [
        ResourceLinkDirective,
        TestComponent,
      ],
      providers: [
        {
          provide: Location,
          useValue: location
        },
        {
          provide: ResourceViewRegistry,
          useValue: registry
        },
        {
          provide: APP_API_PREFIX,
          useValue: API_PREFIX
        },
        ApiMapper,
        ApiLocation,
      ]
    });
  }));

  // Without declared ViewData (typically outside resource-view directive)
  describe('without ViewData', () => {
    beforeEach(async(() => {
      fixture = TestBed.createComponent(TestComponent);
      comp = fixture.componentInstance;
      de = fixture.debugElement.query(By.directive(ResourceLinkDirective));
      el = de.nativeElement;
    }));

    it('should be initialized', () => {
      expect(el).toBeDefined();
    });

    it('should change location onClick without target set', () => {
      comp.link = API_PREFIX + 'foo/bar';
      fixture.detectChanges();

      // Test
      de.triggerEventHandler('click', {button: 0});

      // Verify
      expect(location.go).toHaveBeenCalledWith('/foo/bar');
    });

    it('should change location onClick with ctrlKey or metaKey', () => {
      comp.link = API_PREFIX + 'foo/bar';
      fixture.detectChanges();

      // Test
      de.triggerEventHandler('click', {button: 0, ctrlKey: true, metaKey: true});

      // Verify
      expect(location.go).toHaveBeenCalledWith('/foo/bar');
    });

    it('should change location onClick with target _self', () => {
      comp.link = API_PREFIX + 'foo/bar';
      comp.target = '_self';
      fixture.detectChanges();

      // Test
      de.triggerEventHandler('click', {button: 0});

      // Verify
      expect(location.go).toHaveBeenCalledWith('/foo/bar');
    });

    it('should change location onClick with target _top', () => {
      comp.link = API_PREFIX + 'foo/bar';
      comp.target = '_top';
      fixture.detectChanges();

      // Test
      de.triggerEventHandler('click', {button: 0});

      // Verify
      expect(location.go).toHaveBeenCalledWith('/foo/bar');
    });

    it('should navigate onClick with explicit target', () => {
      const navigationMock = createSpyNavigationHandler();

      comp.link = API_PREFIX + 'foo/bar';
      comp.target = navigationMock;
      fixture.detectChanges();

      // Test
      de.triggerEventHandler('click', {button: 0});

      // Verify
      expect(navigationMock.go).toHaveBeenCalledWith(API_PREFIX + 'foo/bar');
      expect(location.go).not.toHaveBeenCalled();
    });
  });

  // With declared ViewData (typically inside resource-view directive)
  describe('with ViewData', () => {
    let navigationMock: NavigationHandler;

    // Declare ViewData for DI
    beforeEach(async(() => {
      navigationMock = createSpyNavigationHandler();

      return TestBed.configureTestingModule({
        providers: [
          {
            provide: ViewData,
            useValue: new ViewData(navigationMock, null, null, '', 0, '', new Headers())
          }
        ]
      });
    }));

    beforeEach(async(() => {
      fixture = TestBed.createComponent(TestComponent);
      comp = fixture.componentInstance;
      de = fixture.debugElement.query(By.directive(ResourceLinkDirective));
      el = de.nativeElement;
    }));

    it('should be initialized', () => {
      expect(el).toBeDefined();
    });
  });
});