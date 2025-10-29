import { Link } from 'react-router-dom';

export default function Pricing() {
  const plans = [
    {
      name: 'Starter',
      price: 'Free',
      description: 'Perfect for trying out AFO',
      features: [
        '1 AI Agent',
        '100 conversations/month',
        'Basic workflows',
        'Email support',
        'Community access',
      ],
      cta: 'Get Started',
      highlighted: false,
    },
    {
      name: 'Professional',
      price: '$49',
      period: '/month',
      description: 'For growing teams',
      features: [
        'Unlimited AI Agents',
        '10,000 conversations/month',
        'Advanced workflows',
        'All integrations',
        'Priority support',
        'Custom branding',
        'Analytics dashboard',
      ],
      cta: 'Start Trial',
      highlighted: true,
    },
    {
      name: 'Enterprise',
      price: 'Custom',
      description: 'For large organizations',
      features: [
        'Everything in Professional',
        'Unlimited conversations',
        'Dedicated support',
        'SLA guarantee',
        'Custom deployment',
        'Advanced security',
        'Training & onboarding',
      ],
      cta: 'Contact Sales',
      highlighted: false,
    },
  ];

  return (
    <div id="pricing" className="bg-white dark:bg-gray-900 py-24 sm:py-32">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white sm:text-4xl">
            Simple, Transparent Pricing
          </h2>
          <p className="mt-6 text-lg leading-8 text-gray-600 dark:text-gray-300">
            Start free, scale as you grow. No hidden fees, no surprises.
          </p>
        </div>

        <div className="mx-auto mt-16 grid max-w-lg grid-cols-1 items-start gap-8 lg:max-w-none lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-3xl p-8 ring-1 ${
                plan.highlighted
                  ? 'bg-blue-600 ring-blue-600 shadow-2xl scale-105'
                  : 'bg-white dark:bg-gray-800 ring-gray-200 dark:ring-gray-700'
              }`}
            >
              {plan.highlighted && (
                <div className="absolute -top-5 left-0 right-0 mx-auto w-32">
                  <div className="rounded-full bg-blue-500 px-3 py-1 text-sm font-semibold text-white text-center">
                    Popular
                  </div>
                </div>
              )}

              <div className="flex items-center justify-between gap-x-4">
                <h3
                  className={`text-lg font-semibold leading-8 ${
                    plan.highlighted ? 'text-white' : 'text-gray-900 dark:text-white'
                  }`}
                >
                  {plan.name}
                </h3>
              </div>

              <p
                className={`mt-4 text-sm leading-6 ${
                  plan.highlighted ? 'text-blue-100' : 'text-gray-600 dark:text-gray-300'
                }`}
              >
                {plan.description}
              </p>

              <p className="mt-6 flex items-baseline gap-x-1">
                <span
                  className={`text-4xl font-bold tracking-tight ${
                    plan.highlighted ? 'text-white' : 'text-gray-900 dark:text-white'
                  }`}
                >
                  {plan.price}
                </span>
                {plan.period && (
                  <span
                    className={`text-sm font-semibold leading-6 ${
                      plan.highlighted ? 'text-blue-100' : 'text-gray-600 dark:text-gray-400'
                    }`}
                  >
                    {plan.period}
                  </span>
                )}
              </p>

              <Link
                to="/agent/create-new"
                className={`mt-6 block w-full rounded-md px-3 py-2 text-center text-sm font-semibold shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 ${
                  plan.highlighted
                    ? 'bg-white text-blue-600 hover:bg-gray-100 focus-visible:outline-white'
                    : 'bg-blue-600 text-white hover:bg-blue-500 focus-visible:outline-blue-600'
                }`}
              >
                {plan.cta}
              </Link>

              <ul
                role="list"
                className={`mt-8 space-y-3 text-sm leading-6 ${
                  plan.highlighted ? 'text-blue-100' : 'text-gray-600 dark:text-gray-300'
                }`}
              >
                {plan.features.map((feature) => (
                  <li key={feature} className="flex gap-x-3">
                    <svg
                      className={`h-6 w-5 flex-none ${
                        plan.highlighted ? 'text-white' : 'text-blue-600'
                      }`}
                      viewBox="0 0 20 20"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        fillRule="evenodd"
                        d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-16 text-center">
          <p className="text-base text-gray-600 dark:text-gray-300">
            All plans include: Self-hosted option • Open source • LiveKit + Qwen 3 Omni • No vendor lock-in
          </p>
        </div>
      </div>
    </div>
  );
}
