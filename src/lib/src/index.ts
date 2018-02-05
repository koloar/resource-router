export { ResourceRouterModule, ResourceRouterOptions, RESOURCE_ROUTER_CONFIGURATION } from './resource-router-module';
export { NO_HEADERS, ReadOnlyHeaders } from './read-only-headers';
export { ViewData } from './view-data';
export { ResourceClient, HttpResourceClient } from './resource-client';
export { ResourceData } from './resource-data';
export { ViewDef, Data, StatusType } from './view-definition';
export { ActivatedView } from './activated-view';
export { LocationInfo, parseUrl } from './utils/parse-url';
export { ApiUrl, BaseApiUrl, BrowserApiUrl } from './api-url';
export { ApiMapper } from './api-mapper';
export { SingleApiMapper, APP_API_PREFIX } from './single-api-mapper';
export { ApiLocation } from './api-location';
export { ResourceViewRegistry, RESOURCE_VIEWS, TYPE_QUALITY_EVALUATOR } from './resource-view-registry';
export { ResourceOutletComponent } from './directives/resource-outlet';
export { ResourceDataOfDirective } from './directives/resource-data-of';
export { ResourceViewDirective } from './directives/resource-view';
export { TypeQualityEvaluator, simpleTypeQualityEvaluator, statusQualityEvaluator } from './quality-evaluator';
export { Navigable, supportsNavigation } from './navigation';
export { normalizeMediaType } from './utils/normalize-media-type';
export * from './system-media-types';
export { ViewTypeStrategy, HeaderViewTypeStrategy } from './view-type-strategy';
export { escapeRegExpPattern, wildcardToRegex } from './utils/wildcard-to-regex';
export { ResourceLinkDirective } from './directives/resource-link';
export { ResourceLinkWithHrefDirective } from './directives/resource-link-with-href';
