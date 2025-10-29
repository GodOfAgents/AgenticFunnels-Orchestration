import { Link as WaspRouterLink, routes } from '@src/lib/router';
import openSaasBannerDark from "../../client/static/open-saas-banner-dark.svg";
import openSaasBannerLight from "../../client/static/open-saas-banner-light.svg";
import { Button } from "../../components/ui/button";

export default function Hero() {
  return (
    <div className="relative w-full pt-14">
      <TopGradient />
      <BottomGradient />
      <div className="md:p-24">
        <div className="max-w-8xl mx-auto px-6 lg:px-8">
          <div className="lg:mb-18 mx-auto max-w-4xl text-center">
            {/* Badge */}
            <div className="mb-6 inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-medium text-blue-700 dark:border-blue-900 dark:bg-blue-950 dark:text-blue-300">
              <span className="mr-2">🚀</span>
              Powered by Open Source AI • Apache 2.0
            </div>

            {/* Main Headline */}
            <h1 className="text-foreground text-5xl font-bold sm:text-6xl lg:text-7xl">
              Deploy{" "}
              <span className="text-gradient-primary">AI Voice Agents</span>{" "}
              in Minutes
            </h1>

            {/* Subheadline */}
            <p className="text-muted-foreground mx-auto mt-6 max-w-3xl text-lg leading-8 sm:text-xl">
              End-to-end voice AI with <strong>211ms latency</strong>. 
              No pipeline complexity, 85% cheaper than alternatives, 
              19 languages, 17 voice personas.
            </p>

            {/* Key Stats */}
            <div className="mx-auto mt-8 grid max-w-2xl grid-cols-3 gap-6 text-center">
              <div>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">211ms</p>
                <p className="text-sm text-muted-foreground">Latency</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">85%</p>
                <p className="text-sm text-muted-foreground">Cost Savings</p>
              </div>
              <div>
                <p className="text-3xl font-bold text-blue-600 dark:text-blue-400">19</p>
                <p className="text-sm text-muted-foreground">Languages</p>
              </div>
            </div>

            {/* CTA Buttons */}
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Button size="lg" variant="default" asChild className="shadow-lg">
                <WaspRouterLink to={routes.AgentCreateRoute.to}>
                  Start Free Trial <span aria-hidden="true">→</span>
                </WaspRouterLink>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href="#pricing">
                  View Pricing
                </a>
              </Button>
            </div>

            {/* Trust Indicators */}
            <p className="mt-6 text-sm text-muted-foreground">
              ⭐ Open Source • 🔒 Self-Hosted • 🌍 Global Ready
            </p>
          </div>
          <div className="mt-14 flow-root sm:mt-14">
            <div className="m-2 hidden justify-center rounded-xl md:flex lg:-m-4 lg:rounded-2xl lg:p-4">
              <img
                src={openSaasBannerLight}
                alt="App screenshot"
                width={1000}
                height={530}
                loading="lazy"
                className="rounded-md shadow-2xl ring-1 ring-gray-900/10 dark:hidden"
              />
              <img
                src={openSaasBannerDark}
                alt="App screenshot"
                width={1000}
                height={530}
                loading="lazy"
                className="hidden rounded-md shadow-2xl ring-1 ring-gray-900/10 dark:block"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TopGradient() {
  return (
    <div
      className="absolute right-0 top-0 -z-10 w-full transform-gpu overflow-hidden blur-3xl sm:top-0"
      aria-hidden="true"
    >
      <div
        className="aspect-[1020/880] w-[70rem] flex-none bg-gradient-to-tr from-amber-400 to-purple-300 opacity-10 sm:right-1/4 sm:translate-x-1/2 dark:hidden"
        style={{
          clipPath:
            "polygon(80% 20%, 90% 55%, 50% 100%, 70% 30%, 20% 50%, 50% 0)",
        }}
      />
    </div>
  );
}

function BottomGradient() {
  return (
    <div
      className="absolute inset-x-0 top-[calc(100%-40rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-65rem)]"
      aria-hidden="true"
    >
      <div
        className="relative aspect-[1020/880] w-[90rem] bg-gradient-to-br from-amber-400 to-purple-300 opacity-10 sm:-left-3/4 sm:translate-x-1/4 dark:hidden"
        style={{
          clipPath: "ellipse(80% 30% at 80% 50%)",
        }}
      />
    </div>
  );
}
