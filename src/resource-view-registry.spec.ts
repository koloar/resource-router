import { async, TestBed, inject } from '@angular/core/testing';
import {
    ResourceViewRegistry, RESOURCE_VIEWS, normalizeStatusExpression,
    normalizeStatus
} from './resource-view-registry';
import { Type } from '@angular/core';

describe('ResourceViewRegistry', () => {
    beforeEach(async(() => {
        return TestBed.configureTestingModule({
            providers: [ResourceViewRegistry]
        });
    }));

    function fakeComponent(name: string): Type<any> {
        return class FakeComponent {
            static toString(): string {
                return name;
            }
        };
    }

    describe('should', () => {
        beforeEach(async(() => {
            return TestBed.configureTestingModule({
                providers: [
                    {
                        provide: RESOURCE_VIEWS,
                        useValue: [
                            {type: 'one', component: fakeComponent('one')},
                            {type: 'two', component: fakeComponent('two')},
                        ],
                        multi: true
                    },
                    {
                        provide: RESOURCE_VIEWS,
                        useValue: {type: 'three', component: fakeComponent('three')},
                        multi: true
                    }
                ]
            });
        }));

        it('initialize with configured views', inject([ResourceViewRegistry], (registry: ResourceViewRegistry) => {
            expect(registry).toBeTruthy();
            expect(registry.length).toBe(3);
            expect(registry.match('one', 200).component.toString()).toBe('one');
            expect(registry.match('two', 200).component.toString()).toBe('two');
            expect(registry.match('three', 200).component.toString()).toBe('three');
        }));
    });

    // Exact type
    describe('should match exact type', () => {
        beforeEach(async(inject([ResourceViewRegistry], (registry: ResourceViewRegistry) => {
            registry.addViews([
                {type: 'foo', component: fakeComponent('foo')},
                {type: 'application/foo', component: fakeComponent('application/foo')},
                {type: 'application/*', component: fakeComponent('application/*')},
                {type: 'foo', status: 20, component: fakeComponent('020 foo')},
                {type: 'foo', status: 201, component: fakeComponent('201 foo')},
                {type: 'foo', status: 400, component: fakeComponent('400 foo')},
                {type: 'foo', status: '4xx', component: fakeComponent('4?? foo')},
                {type: 'application/foo', status: '*', component: fakeComponent('??? application/foo')},
            ]);
        })));

        it('with default status', inject([ResourceViewRegistry], (registry: ResourceViewRegistry) => {
            expect(registry.match('foo', 200).component.toString()).toBe('foo');
            expect(registry.match('foo', 299).component.toString()).toBe('foo');
            expect(registry.match('application/foo', 200).component.toString()).toBe('application/foo');
            expect(registry.match('application/foo', 201).component.toString()).toBe('application/foo');
        }));

        it('with exact status', inject([ResourceViewRegistry], (registry: ResourceViewRegistry) => {
            expect(registry.match('foo', 201).component.toString()).toBe('201 foo');
            expect(registry.match('foo', 20).component.toString()).toBe('020 foo');
            expect(registry.match('foo', 400).component.toString()).toBe('400 foo');
        }));

        it('with wildcard status', inject([ResourceViewRegistry], (registry: ResourceViewRegistry) => {
            expect(registry.match('foo', 499).component.toString()).toBe('4?? foo');
        }));

        it('with any status', inject([ResourceViewRegistry], (registry: ResourceViewRegistry) => {
            expect(registry.match('application/foo', 300).component.toString()).toBe('??? application/foo');
            expect(registry.match('application/foo', 0).component.toString()).toBe('??? application/foo');
            expect(registry.match('application/foo', 999).component.toString()).toBe('??? application/foo');
        }));

        it('without definition as null', inject([ResourceViewRegistry], (registry: ResourceViewRegistry) => {
            expect(registry.match('foo', 500)).toBeFalsy();
        }));

        it('with quality override', inject([ResourceViewRegistry], (registry: ResourceViewRegistry) => {
            // Extra data
            registry.addViews({
                type: 'foo', quality: 1.1, component: fakeComponent('quality foo')
            });
            registry.addViews({
                type: 'foo', quality: 1.1, status: 201, component: fakeComponent('201 quality foo')
            });
            registry.addViews({
                type: 'application/foo', quality: 0.9, component: fakeComponent('low quality foo')
            });

            // Test
            expect(registry.match('foo', 200).component.toString()).toBe('quality foo');
            expect(registry.match('foo', 201).component.toString()).toBe('201 quality foo');
            expect(registry.match('application/foo', 200).component.toString()).toBe('application/foo');
        }));
    });

    // Wildcard type
    describe('should match wildcard type', () => {
        beforeEach(async(inject([ResourceViewRegistry], (registry: ResourceViewRegistry) => {
            registry.addViews([
                {type: 'foo*', component: fakeComponent('foo*')},
                {type: '*bar', component: fakeComponent('*bar')},
                {type: 'application/f?o', component: fakeComponent('application/f?o')},
                {type: 'application/f*bar', component: fakeComponent('application/f*bar')}, // This will never be matched, '*bar' always wins
                {type: 'application/*', component: fakeComponent('application/*')},
                {type: 'foo*', status: 20, component: fakeComponent('020 foo*')},
                {type: 'b?r', status: 200, component: fakeComponent('200 b?r')},
                {type: '*bar', status: 201, component: fakeComponent('201 *bar')},
                {type: 'foo*', status: 400, component: fakeComponent('400 foo*')},
                {type: 'foo*', status: '4xx', component: fakeComponent('4?? foo*')},
                {type: 'application/foo*', status: '*', component: fakeComponent('??? application/foo*')},
                {type: 'application/*bar', status: '*', component: fakeComponent('??? application/*bar')},
                {type: 'image/*', status: '*', component: fakeComponent('??? image/*')},
            ]);
        })));

        it('with default status', inject([ResourceViewRegistry], (registry: ResourceViewRegistry) => {
            expect(registry.match('foo', 200).component.toString()).toBe('foo*');
            expect(registry.match('foobar', 200).component.toString()).toBe('foo*');
            expect(registry.match('foobar', 299).component.toString()).toBe('foo*');
            expect(registry.match('fubar', 200).component.toString()).toBe('*bar');
            expect(registry.match('application/foo', 200).component.toString()).toBe('application/f?o');
            expect(registry.match('application/fxo', 200).component.toString()).toBe('application/f?o');
            expect(registry.match('application/fubar', 202).component.toString()).toBe('*bar');
            expect(registry.match('application/fooxxxbar', 200).component.toString()).toBe('*bar');
            expect(registry.match('application/bar', 200).component.toString()).toBe('*bar');
            expect(registry.match('application/xxx', 299).component.toString()).toBe('application/*');
        }));

        it('with exact status', inject([ResourceViewRegistry], (registry: ResourceViewRegistry) => {
            expect(registry.match('foobar', 201).component.toString()).toBe('201 *bar');
            expect(registry.match('application/fubar', 201).component.toString()).toBe('201 *bar');
            expect(registry.match('foobar', 20).component.toString()).toBe('020 foo*');
            expect(registry.match('foo', 400).component.toString()).toBe('400 foo*');
            expect(registry.match('fooxxx', 400).component.toString()).toBe('400 foo*');
            expect(registry.match('brr', 200).component.toString()).toBe('200 b?r');
        }));

        it('with wildcard status', inject([ResourceViewRegistry], (registry: ResourceViewRegistry) => {
            expect(registry.match('foo', 499).component.toString()).toBe('4?? foo*');
            expect(registry.match('foobar', 410).component.toString()).toBe('4?? foo*');
            expect(registry.match('fooxxx', 401).component.toString()).toBe('4?? foo*');
        }));

        it('with any status', inject([ResourceViewRegistry], (registry: ResourceViewRegistry) => {
            expect(registry.match('application/foo', 300).component.toString()).toBe('??? application/foo*');
            expect(registry.match('application/foobar', 300).component.toString()).toBe('??? application/foo*');
            expect(registry.match('application/fooxxx', 300).component.toString()).toBe('??? application/foo*');
            expect(registry.match('application/foo', 0).component.toString()).toBe('??? application/foo*');
            expect(registry.match('application/foobar', 0).component.toString()).toBe('??? application/foo*');
            expect(registry.match('application/fooxxx', 0).component.toString()).toBe('??? application/foo*');
            expect(registry.match('application/fubar', 999).component.toString()).toBe('??? application/*bar');
            expect(registry.match('application/fubar', 400).component.toString()).toBe('??? application/*bar');
            expect(registry.match('image/png', 200).component.toString()).toBe('??? image/*');
            expect(registry.match('image/jpg', 400).component.toString()).toBe('??? image/*');
        }));

        it('without definition as null', inject([ResourceViewRegistry], (registry: ResourceViewRegistry) => {
            expect(registry.match('foo', 500)).toBeFalsy();
            expect(registry.match('foobar', 500)).toBeFalsy();
        }));

        it('with quality override', inject([ResourceViewRegistry], (registry: ResourceViewRegistry) => {
            // Extra data
            registry.addViews([
                {type: 'foo*', quality: 0.51, component: fakeComponent('quality foo*')},
                {type: '*bar', quality: 0.6, component: fakeComponent('quality *bar')},
                {type: 'foo*', quality: 0.51, status: 201, component: fakeComponent('201 quality foo*')},
                {type: 'application/foo*', quality: 0.49, component: fakeComponent('low quality foo*')}
            ]);

            // Test
            expect(registry.match('foo', 200).component.toString()).toBe('quality foo*');
            expect(registry.match('foobar', 200).component.toString()).toBe('quality *bar');
            expect(registry.match('foo', 201).component.toString()).toBe('201 quality foo*');
            expect(registry.match('foobar', 201).component.toString()).toBe('201 quality foo*');
            expect(registry.match('application/foo', 200).component.toString()).toBe('application/f?o');
        }));
    });

    // Any type
    describe('should match any type', () => {
        beforeEach(async(inject([ResourceViewRegistry], (registry: ResourceViewRegistry) => {
            registry.addViews([
                {type: '*', component: fakeComponent('*')},
                {type: '*', status: 20, component: fakeComponent('020 *')},
                {type: '*', status: 201, component: fakeComponent('201 *')},
                {type: '*', status: 400, component: fakeComponent('400 *')},
                {type: '*', status: '4xx', component: fakeComponent('4?? *')},
                {type: '*', status: '*', component: fakeComponent('??? *')},
            ]);
        })));

        it('with default status', inject([ResourceViewRegistry], (registry: ResourceViewRegistry) => {
            expect(registry.match('foo', 200).component.toString()).toBe('*');
            expect(registry.match('asd', 299).component.toString()).toBe('*');
            expect(registry.match('application/foo', 200).component.toString()).toBe('*');
            expect(registry.match('', 200).component.toString()).toBe('*');
        }));

        it('with exact status', inject([ResourceViewRegistry], (registry: ResourceViewRegistry) => {
            expect(registry.match('foobar', 201).component.toString()).toBe('201 *');
            expect(registry.match('application/fubar', 201).component.toString()).toBe('201 *');
            expect(registry.match('asd', 20).component.toString()).toBe('020 *');
            expect(registry.match('aaa', 400).component.toString()).toBe('400 *');
        }));

        it('with wildcard status', inject([ResourceViewRegistry], (registry: ResourceViewRegistry) => {
            expect(registry.match('foo', 499).component.toString()).toBe('4?? *');
            expect(registry.match('foobar', 410).component.toString()).toBe('4?? *');
            expect(registry.match('fooxxx', 401).component.toString()).toBe('4?? *');
        }));

        it('with any status', inject([ResourceViewRegistry], (registry: ResourceViewRegistry) => {
            expect(registry.match('application/foo', 300).component.toString()).toBe('??? *');
            expect(registry.match('foo', 999).component.toString()).toBe('??? *');
            expect(registry.match('application', 0).component.toString()).toBe('??? *');
        }));

        it('with quality override', inject([ResourceViewRegistry], (registry: ResourceViewRegistry) => {
            // Extra data
            registry.addViews([
                {type: '*', quality: 0.01, component: fakeComponent('quality *')},
                {type: '*', quality: 0.01, status: 201, component: fakeComponent('201 quality *')},
                {type: '*', quality: -1, component: fakeComponent('low quality *')}
            ]);

            // Test
            expect(registry.match('foo', 200).component.toString()).toBe('quality *');
            expect(registry.match('xxx', 201).component.toString()).toBe('201 quality *');
            expect(registry.match('foo', 400).component.toString()).toBe('400 *');
            expect(registry.match('foo', 410).component.toString()).toBe('4?? *');
        }));
    });

    it('should register multi type and multi status', inject([ResourceViewRegistry], (registry: ResourceViewRegistry) => {
        registry.addViews({
            component: fakeComponent('test'),
            status: [200, '2??', '*'],
            type: ['foo*', 'foo', '*bar']
        });

        // Test
        expect(registry.length).toBe(9);
        expect(registry.match('foo', 200)).toBeTruthy();
        expect(registry.match('bar', 200)).toBeTruthy();
        expect(registry.match('foobar', 501)).toBeTruthy();
        expect(registry.match('xxx', 200)).toBeFalsy();
    }));

    it('should validate quality type', inject([ResourceViewRegistry], (registry: ResourceViewRegistry) => {
        expect(() => registry.addViews({
            type: 'foo',
            component: fakeComponent('test'),
            quality: ('x' as any) as number
        })).toThrow();
    }));

    it('should validate component as Type', inject([ResourceViewRegistry], (registry: ResourceViewRegistry) => {
        expect(() => registry.addViews({
            type: 'foo',
            component: 'error' as any
        })).toThrow();
    }));

    it('should validate type', inject([ResourceViewRegistry], (registry: ResourceViewRegistry) => {
        expect(() => registry.addViews({
            type: (50 as any) as string,
            component: fakeComponent('test')
        })).toThrow();

        expect(() => registry.addViews({
            type: ['foo', (50 as any) as string],
            component: fakeComponent('test')
        })).toThrow();
    }));

    it('should validate status', inject([ResourceViewRegistry], (registry: ResourceViewRegistry) => {
        expect(() => registry.addViews({
            type: 'foo',
            status: ({} as any) as number,
            component: fakeComponent('test')
        })).toThrow();

        expect(() => registry.addViews({
            type: 'foo',
            status: [50, ({} as any) as number, '500'],
            component: fakeComponent('test')
        })).toThrow();

        expect(() => registry.addViews({
            type: 'foo',
            status: '?44',
            component: fakeComponent('test')
        })).toThrow();

        expect(() => registry.addViews({
            type: 'foo',
            status: '*4',
            component: fakeComponent('test')
        })).toThrow();

        expect(() => registry.addViews({
            type: 'foo',
            status: 'abc',
            component: fakeComponent('test')
        })).toThrow();
    }));
});

describe('normalizeStatusExpression', () => {
    it('should normalize * as ?', () => {
        expect(normalizeStatusExpression('*')).toBe('???');
        expect(normalizeStatusExpression('1*')).toBe('1??');
        expect(normalizeStatusExpression('12*')).toBe('12?');
    });

    it('should throw for expressions with * and longer then 3 characters', () => {
        expect(() => normalizeStatusExpression('123*')).toThrow();
    });

    it('should normalize x as ?', () => {
        expect(normalizeStatusExpression('xxx')).toBe('???');
        expect(normalizeStatusExpression('1xx')).toBe('1??');
        expect(normalizeStatusExpression('12x')).toBe('12?');
        expect(normalizeStatusExpression('1x')).toBe('01?');
        expect(normalizeStatusExpression('xx1')).toBe('??1');
    });

    it('should pad expression with zeroes', () => {
        expect(normalizeStatusExpression('1')).toBe('001');
        expect(normalizeStatusExpression('12')).toBe('012');
        expect(normalizeStatusExpression('123')).toBe('123');
        expect(normalizeStatusExpression('?')).toBe('00?');
    });

    it('should not trim longer expressions', () => {
        expect(normalizeStatusExpression('1234')).toBe('1234');
        expect(normalizeStatusExpression('????')).toBe('????');
        expect(normalizeStatusExpression('xxxxx')).toBe('?????');
        expect(normalizeStatusExpression('2???')).toBe('2???');
    });
});

describe('normalizeStatus', () => {
    it('should pad left with zeroes for status < 100', () => {
        expect(normalizeStatus(0)).toBe('000');
        expect(normalizeStatus(1)).toBe('001');
        expect(normalizeStatus(10)).toBe('010');
        expect(normalizeStatus(99)).toBe('099');
    });

    it('should not modify status in range 100..999', () => {
        expect(normalizeStatus(100)).toBe('100');
        expect(normalizeStatus(404)).toBe('404');
        expect(normalizeStatus(200)).toBe('200');
        expect(normalizeStatus(999)).toBe('999');
    });

    it('should not trim status longer then 3 characters', () => {
        expect(normalizeStatus(1000)).toBe('1000');
        expect(normalizeStatus(999999)).toBe('999999');
    });
});