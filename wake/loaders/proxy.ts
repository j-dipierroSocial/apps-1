import { Route } from "../../website/flags/audience.ts";
import { AppContext } from "../mod.ts";

const PATHS_TO_PROXY = [
  ["/checkout", "/checkout"],
  ["/checkout/complete", "/checkout/complete"],
  ["/Fechamento"],
  ["/Fechamento/*"],
  ["/Carrinho/*"],
  ["/api/*"],
  ["/Login/Authenticate", "/Login/Authenticate"],
  ["/login/authenticate", "/login/authenticate"],
  ["/Login/Signup", "/Login/Signup"],
  ["/login/signup", "/login/signup"],
  ["/Login/Password/Recovery", "/Login/Password/Recovery"],
  ["/login/password/recovery", "/login/password/recovery"],
  ["/login", "/login"],
  ["/account", "/account"],
  ["/account/my-data", "/account/my-data"],
  ["/account/checking_account", "/account/checking_account"],
  ["/account/addresses", "/account/addresses"],
  ["/account/subscriptions", "/account/subscriptions"],
];

const decoSiteMapUrl = "/sitemap/deco.xml";

export interface Props {
  extraPathsToProxy?: string[];
  /**
   * @title If deco site map should be exposed at /deco-sitemap.xml
   */
  generateDecoSiteMap?: boolean;
  /**
   * @title Exclude paths from /deco-sitemap.xml
   */
  excludePathsFromDecoSiteMap?: string[];
  /**
   * @title Other site maps to include
   */
  includeSiteMap?: string[];
}

/**
 * @title Wake Proxy Routes
 */
function loader(
  props: Props,
  _req: Request,
  { checkoutUrl }: AppContext,
): Route[] {
  const {
    generateDecoSiteMap = true,
    excludePathsFromDecoSiteMap = [],
    includeSiteMap,
    extraPathsToProxy = [],
  } = props as Props;

  const extraPathsToProxyAsArray = extraPathsToProxy.map((path) => [path]);

  const checkout = [...PATHS_TO_PROXY, ...extraPathsToProxyAsArray].map((
    [pathTemplate, basePath],
  ) => ({
    pathTemplate,
    handler: {
      value: {
        __resolveType: "website/handlers/proxy.ts",
        url: checkoutUrl + basePath,
        basePath,
        customHeaders: [{
          Host: checkoutUrl,
        }],
      },
    },
  }));


  const [include, routes] = generateDecoSiteMap
    ? [[...(includeSiteMap ?? []), decoSiteMapUrl], [{
      pathTemplate: decoSiteMapUrl,
      handler: {
        value: {
          excludePaths: excludePathsFromDecoSiteMap,
          __resolveType: "website/handlers/sitemap.ts",
        },
      },
    }]]
    : [includeSiteMap, []];

  // TODO: include is not working, because wake return all urls directly at /Sitemap.xml
  const sitemap = {
    pathTemplate: "/Sitemap.xml",
    handler: {
      value: {
        __resolveType: "wake/handlers/sitemap.ts",
        include,
        customHeaders: [{
          Host: checkoutUrl,
        }],
      },
    },
  };

  return [...routes, ...checkout, sitemap];
}

export default loader;
