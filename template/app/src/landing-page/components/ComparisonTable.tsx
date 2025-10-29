export default function ComparisonTable() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Section Header */}
        <div className="mx-auto max-w-2xl text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
            Why Choose AFO?
          </h2>
          <p className="mt-4 text-lg text-muted-foreground">
            See how we compare to traditional multi-service pipelines
          </p>
        </div>

        {/* Comparison Table */}
        <div className="overflow-hidden rounded-2xl border border-border shadow-2xl">
          <table className="w-full">
            <thead>
              <tr className="bg-gradient-to-r from-blue-600 to-purple-600">
                <th className="px-6 py-4 text-left text-sm font-semibold text-white">
                  Feature
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-white">
                  <div className="flex items-center justify-center">
                    <span className="mr-2">🚀</span>
                    AFO Platform
                  </div>
                </th>
                <th className="px-6 py-4 text-center text-sm font-semibold text-white/80">
                  Traditional Stack
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border bg-card">
              {/* Latency */}
              <tr className="hover:bg-muted/50 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-foreground">
                  Response Latency
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-800 dark:bg-green-900/30 dark:text-green-400">
                    ⚡ 211ms
                  </span>
                </td>
                <td className="px-6 py-4 text-center text-sm text-muted-foreground">
                  500-1000ms
                </td>
              </tr>

              {/* Cost */}
              <tr className="hover:bg-muted/50 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-foreground">
                  Cost per Hour
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-800 dark:bg-green-900/30 dark:text-green-400">
                    💰 $5-10
                  </span>
                </td>
                <td className="px-6 py-4 text-center text-sm text-muted-foreground">
                  ~$75
                </td>
              </tr>

              {/* Services */}
              <tr className="hover:bg-muted/50 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-foreground">
                  Services Required
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-800 dark:bg-green-900/30 dark:text-green-400">
                    ✅ 1 (Unified)
                  </span>
                </td>
                <td className="px-6 py-4 text-center text-sm text-muted-foreground">
                  3+ (STT, LLM, TTS)
                </td>
              </tr>

              {/* Languages */}
              <tr className="hover:bg-muted/50 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-foreground">
                  Languages Supported
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-800 dark:bg-green-900/30 dark:text-green-400">
                    🌍 19 in / 10 out
                  </span>
                </td>
                <td className="px-6 py-4 text-center text-sm text-muted-foreground">
                  1-2 languages
                </td>
              </tr>

              {/* Video */}
              <tr className="hover:bg-muted/50 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-foreground">
                  Video Support
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-800 dark:bg-green-900/30 dark:text-green-400">
                    ✅ Yes
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="text-sm text-red-600 dark:text-red-400">❌ No</span>
                </td>
              </tr>

              {/* Emotion Detection */}
              <tr className="hover:bg-muted/50 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-foreground">
                  Emotion Detection
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-800 dark:bg-green-900/30 dark:text-green-400">
                    ✅ Built-in
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="text-sm text-red-600 dark:text-red-400">❌ No</span>
                </td>
              </tr>

              {/* Self-Hosted */}
              <tr className="hover:bg-muted/50 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-foreground">
                  Self-Hosted Option
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-800 dark:bg-green-900/30 dark:text-green-400">
                    ✅ Yes
                  </span>
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="text-sm text-red-600 dark:text-red-400">❌ No</span>
                </td>
              </tr>

              {/* Voice Personas */}
              <tr className="hover:bg-muted/50 transition-colors">
                <td className="px-6 py-4 text-sm font-medium text-foreground">
                  Voice Personas
                </td>
                <td className="px-6 py-4 text-center">
                  <span className="inline-flex items-center rounded-full bg-green-100 px-3 py-1 text-sm font-semibold text-green-800 dark:bg-green-900/30 dark:text-green-400">
                    🎭 17 Voices
                  </span>
                </td>
                <td className="px-6 py-4 text-center text-sm text-muted-foreground">
                  1-2 voices
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Bottom Stats */}
        <div className="mt-12 rounded-2xl bg-gradient-to-r from-blue-600 to-purple-600 p-8 text-center text-white shadow-2xl">
          <p className="text-2xl font-bold mb-2">
            Save 85% on costs • 2x faster responses • 10x more languages
          </p>
          <p className="text-blue-100">
            Join companies switching to AFO for better performance at lower costs
          </p>
        </div>
      </div>
    </section>
  );
}
