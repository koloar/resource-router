import { Inject, Injectable, InjectionToken } from '@angular/core';
import { normalizeUrl } from './normalize';


/**
 * Prefix for the URL. Can be base-relative, host-relative or absolute.
 * Always should however end with slash ('/').
 *
 * @type {InjectionToken<string>}
 */
export const APP_API_PREFIX = new InjectionToken<string>('APP_API_PREFIX');


/**
 * It maps view URLs to API and vice versa.
 */
@Injectable()
export class ApiUrl {
  /**
   * API URL prefix. It's absolute URL, includes base href (if applicable).
   */
  readonly prefix: string;

  constructor(@Inject(APP_API_PREFIX) prefix: string) {
    // Normalize prefix
    this.prefix = normalizeUrl(prefix);
  }

  /**
   * Maps view path to resource URL. Can be overridden during configuration.
   * By default it maps path to API one to one.
   *
   * Counterpart to {@link #mapApiToView}.
   *
   * @param {String} path View path, as in `$location.path()`.
   * @returns {String} Resource url, for e.g. HTTP requests.
   */
  mapViewToApi(path: string): string {
    if (typeof path !== 'string') {
      throw new Error('path must be string');
    }

    // This is for diagnostics only, but might be useful
    if (/^https?:/.test(path)) {
      throw new Error('path must be relative');
    }

    // Strip leading slash
    path = path.replace(/^\//, '');

    // Join
    // Note: API prefix MUST end with a slash, otherwise it will work as configured, which is most likely wrong.
    return (this.prefix + path).replace(/\/$/, '');
  }

  /**
   * Maps resource URL to view path. Can be overridden during configuration.
   * By default it maps API url to view paths one to one.
   *
   * Counterpart to {@link #mapViewToApi}.
   *
   * @param {String} url Resource url. It must be inside API namespace. If it is not, `null` is returned.
   *                     <p>If the url equals to api prefix, empty string is returned.</p>
   * @returns {String} View path.
   */
  mapApiToView(url: string): string | null {
    if (typeof url !== 'string') {
      throw new Error('url must be string');
    }

    // Remove prefix
    if (url && url.indexOf(this.prefix) === 0) {
      return '/' + url.substring(this.prefix.length).replace(/\/$/, '');
    }

    // Unable to map
    return null;
  }
}
