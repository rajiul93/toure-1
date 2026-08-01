import { getAiSettingsFromDB } from '@/lib/services/ai-settings.service'
import { getAiUsageOverviewFromDB } from '@/lib/services/ai-usage.service'
import { parsePricePer1M } from '@/lib/ai-settings.types'

export const metadata = {
  title: 'AI Usage',
}

export const dynamic = 'force-dynamic'

const nf = new Intl.NumberFormat('en-US')

function formatUsd(value: number) {
  // Costs here are often fractions of a cent, so avoid rounding them to $0.00.
  return value > 0 && value < 0.01 ? '<$0.01' : `$${value.toFixed(2)}`
}

export default async function AdminAiUsagePage() {
  const [settings, overview] = await Promise.all([
    getAiSettingsFromDB(),
    getAiUsageOverviewFromDB(),
  ])

  const prices = {
    openai: {
      input: parsePricePer1M(settings.openaiInputPricePer1M),
      output: parsePricePer1M(settings.openaiOutputPricePer1M),
    },
    gemini: {
      input: parsePricePer1M(settings.geminiInputPricePer1M),
      output: parsePricePer1M(settings.geminiOutputPricePer1M),
    },
  }

  /** Cost for one provider's row, or null when that provider has no price set. */
  function costFor(provider: string, promptTokens: number, completionTokens: number) {
    const p = provider === 'gemini' ? prices.gemini : prices.openai
    if (p.input === null && p.output === null) return null
    return (
      (promptTokens / 1_000_000) * (p.input ?? 0) +
      (completionTokens / 1_000_000) * (p.output ?? 0)
    )
  }

  const monthCost = overview.byModel.reduce<number | null>((acc, row) => {
    const c = costFor(row.provider, row.promptTokens, row.completionTokens)
    if (c === null) return acc
    return (acc ?? 0) + c
  }, null)

  const windows = [
    { label: 'Today', totals: overview.today },
    { label: 'Last 7 days', totals: overview.week },
    { label: 'Last 30 days', totals: overview.month },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">AI Usage</h1>
        <p className="mt-1 text-zinc-600">
          Tokens consumed by the website chat widget. Every answered or unanswered
          question is recorded here; failed requests are not, since they burn no tokens.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        {windows.map(({ label, totals }) => (
          <div key={label} className="rounded-lg border border-zinc-200 bg-white p-5">
            <p className="text-sm font-medium text-zinc-500">{label}</p>
            <p className="mt-2 text-3xl font-bold text-heading">
              {nf.format(totals.totalTokens)}
            </p>
            <p className="mt-1 text-sm text-zinc-500">
              tokens across {nf.format(totals.requests)}{' '}
              {totals.requests === 1 ? 'request' : 'requests'}
            </p>
            <p className="mt-2 text-xs text-zinc-500">
              in {nf.format(totals.promptTokens)} · out{' '}
              {nf.format(totals.completionTokens)}
            </p>
          </div>
        ))}
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-2">
          <h2 className="text-xl font-semibold text-heading">By model — last 30 days</h2>
          {monthCost !== null && (
            <p className="text-sm text-zinc-600">
              Estimated cost:{' '}
              <span className="font-semibold text-heading">{formatUsd(monthCost)}</span>
            </p>
          )}
        </div>

        {overview.byModel.length === 0 ? (
          <p className="mt-4 text-sm text-zinc-500">
            No usage recorded yet. Ask the chat widget a question and it will show up here.
          </p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-zinc-200 text-zinc-500">
                <tr>
                  <th className="py-2 pr-4 font-medium">Provider</th>
                  <th className="py-2 pr-4 font-medium">Model</th>
                  <th className="py-2 pr-4 text-right font-medium">Requests</th>
                  <th className="py-2 pr-4 text-right font-medium">In</th>
                  <th className="py-2 pr-4 text-right font-medium">Out</th>
                  <th className="py-2 pr-4 text-right font-medium">Total</th>
                  <th className="py-2 text-right font-medium">Est. cost</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {overview.byModel.map((row) => {
                  const cost = costFor(row.provider, row.promptTokens, row.completionTokens)
                  return (
                    <tr key={`${row.provider}-${row.model}`}>
                      <td className="py-2 pr-4 capitalize">{row.provider}</td>
                      <td className="py-2 pr-4 font-mono text-xs">{row.model}</td>
                      <td className="py-2 pr-4 text-right">{nf.format(row.requests)}</td>
                      <td className="py-2 pr-4 text-right">
                        {nf.format(row.promptTokens)}
                      </td>
                      <td className="py-2 pr-4 text-right">
                        {nf.format(row.completionTokens)}
                      </td>
                      <td className="py-2 pr-4 text-right font-semibold">
                        {nf.format(row.totalTokens)}
                      </td>
                      <td className="py-2 text-right text-zinc-600">
                        {cost === null ? '—' : formatUsd(cost)}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}

        {monthCost === null && overview.byModel.length > 0 && (
          <p className="mt-4 text-xs text-zinc-500">
            Set token prices on the AI Settings page to see cost estimates here.
          </p>
        )}
      </div>

      <div className="rounded-lg border border-zinc-200 bg-white p-6">
        <h2 className="text-xl font-semibold text-heading">Recent requests</h2>
        {overview.recent.length === 0 ? (
          <p className="mt-4 text-sm text-zinc-500">Nothing recorded yet.</p>
        ) : (
          <div className="mt-4 overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-zinc-200 text-zinc-500">
                <tr>
                  <th className="py-2 pr-4 font-medium">When</th>
                  <th className="py-2 pr-4 font-medium">Question</th>
                  <th className="py-2 pr-4 font-medium">Model</th>
                  <th className="py-2 pr-4 font-medium">Status</th>
                  <th className="py-2 text-right font-medium">Tokens</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {overview.recent.map((row) => (
                  <tr key={row.id}>
                    <td className="whitespace-nowrap py-2 pr-4 text-zinc-500">
                      {row.createdAt.toLocaleString()}
                    </td>
                    <td className="max-w-xs truncate py-2 pr-4" title={row.question}>
                      {row.question}
                    </td>
                    <td className="py-2 pr-4 font-mono text-xs">{row.model}</td>
                    <td className="py-2 pr-4">
                      <span
                        className={
                          row.status === 'answered'
                            ? 'rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700'
                            : 'rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700'
                        }
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="py-2 text-right font-semibold">
                      {nf.format(row.totalTokens)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
