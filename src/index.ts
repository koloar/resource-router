export { ResourceRouterModule, ResourceRouterOptions, RESOURCE_ROUTER_CONFIGURATION } from './resource-router-module';
export { ViewData } from './view-data';
export { ViewDataLoader, HttpClientViewDataLoader } from './view-data-loader';
export { ViewDef, Data, StatusType } from './view-definition';
export { LocationInfo, parseUrl } from './utils/parse-url';
export { ApiUrl, BaseApiUrl, BrowserApiUrl } from './api-url';
export { ApiMapper, APP_API_PREFIX } from './api-mapper';
export { ApiLocation } from './api-location';
export { ResourceViewRegistry, RESOURCE_VIEWS, TYPE_QUALITY_EVALUATOR } from './resource-view-registry';
export { ResourceOutletComponent } from './directives/resource-outlet';
export { ResourceDataDirective } from './directives/resource-data';
export { ResourceViewDirective } from './directives/resource-view';
export { TypeQualityEvaluator, simpleTypeQualityEvaluator, statusQualityEvaluator } from './quality-evaluator';
export { NavigationHandler, supportsNavigation } from './navigation-handler';
export { normalizeMediaType } from './normalize';
export * from './system-media-types';
export { ViewTypeStrategy, HeaderViewTypeStrategy } from './view-type-strategy';
export { escapeRegExpPattern, wildcardToRegex } from './utils/wildcard-to-regex';
export { ResourceLinkDirective } from './directives/resource-link';
export { ResourceLinkWithHrefDirective } from './directives/resource-link-with-href';
