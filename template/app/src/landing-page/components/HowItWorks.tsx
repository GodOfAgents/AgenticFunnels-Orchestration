export default function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "Create Your Agent",
      description: "Choose from templates or start from scratch. Set voice persona, configure tone, and add your knowledge base.",
      icon: "🤖",
      features: ["17 voice personas", "Multi-language", "Custom branding"]
    },
    {
      number: "02",
      title: "Build Workflows",
      description: "Drag-and-drop visual builder. Add calendar sync, CRM integration, and custom actions - all without code.",
      icon: "🔧",
      features: ["Visual builder", "Pre-built templates", "Test mode"]
    },
    {
      number: "03",
      title: "Deploy Anywhere",
      description: "Get embed code, webhook URL, or API access. Deploy to your website, app, or phone system in minutes.",
      icon: "🚀",
      features: ["Embed widget", "API access", "Webhooks"]
    }
  ];

  return (
    <section className="bg-gradient-to-b from-background to-muted/20 py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            How It Works
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            From idea to deployed AI agent in just three simple steps
          </p>
        </div>

        {/* Steps */}
        <div className="mx-auto mt-16 max-w-6xl">
          <div className="grid grid-cols-1 gap-12 lg:grid-cols-3">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                {/* Connector Line (desktop only) */}
                {index < steps.length - 1 && (
                  <div className="absolute left-1/2 top-20 hidden h-0.5 w-full bg-gradient-to-r from-blue-500 to-purple-500 lg:block" />
                )}

                {/* Step Card */}
                <div className="relative rounded-2xl border border-border bg-card p-8 shadow-lg transition-all hover:shadow-xl">
                  {/* Step Number */}
                  <div className="absolute -top-4 left-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 px-4 py-2 text-sm font-bold text-white">
                    {step.number}
                  </div>

                  {/* Icon */}
                  <div className="mb-4 text-5xl">{step.icon}</div>

                  {/* Title */}
                  <h3 className="mb-3 text-xl font-bold text-foreground">
                    {step.title}
                  </h3>

                  {/* Description */}
                  <p className="mb-4 text-muted-foreground">
                    {step.description}
                  </p>

                  {/* Features */}
                  <ul className="space-y-2">
                    {step.features.map((feature, featureIndex) => (
                      <li key={featureIndex} className="flex items-center text-sm text-muted-foreground">
                        <svg className="mr-2 h-4 w-4 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-16 text-center">
          <p className="text-sm text-muted-foreground mb-4">
            Average setup time: <strong className="text-foreground">5 minutes</strong>
          </p>
          <a
            href="/signup"
            className="inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-blue-600 to-purple-600 px-8 py-3 text-base font-semibold text-white shadow-lg transition-all hover:from-blue-700 hover:to-purple-700 hover:shadow-xl"
          >
            Start Building Your Agent
            <svg className="ml-2 h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </a>
        </div>
      </div>
    </section>
  );
}
