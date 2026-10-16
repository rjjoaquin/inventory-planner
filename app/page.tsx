'use client'

import { useMemo, useState } from 'react'
import { ArrowDownToLine, Minus, Plus, RotateCcw, Sparkles, WalletCards, X } from 'lucide-react'

type InventoryItem = {
  id: number
  title: string
  cost: string
  count: number
}

const initialItems: InventoryItem[] = [
  { id: 1, title: 'Ergonomic desk chair', cost: '189.00', count: 1 },
  { id: 2, title: 'Monitor stand', cost: '42.50', count: 2 },
  { id: 3, title: 'Desk lamp', cost: '36.00', count: 1 },
]

const currencyOptions = [
  { value: 'PHP', label: 'Peso', symbol: '₱' },
  { value: 'USD', label: 'Dollars', symbol: '$' },
  { value: 'EUR', label: 'Euro', symbol: '€' },
] as const

export default function Page() {
  const [budget, setBudget] = useState('500')
  const [currencyCode, setCurrencyCode] = useState<(typeof currencyOptions)[number]['value']>('PHP')
  const [items, setItems] = useState(initialItems)
  const [nextId, setNextId] = useState(4)
  const currency = useMemo(() => new Intl.NumberFormat('en-US', { style: 'currency', currency: currencyCode }), [currencyCode])
  const selectedCurrency = currencyOptions.find((option) => option.value === currencyCode) ?? currencyOptions[0]

  const total = useMemo(
    () => items.reduce((sum, item) => sum + (Number.parseFloat(item.cost) || 0) * item.count, 0),
    [items],
  )
  const budgetValue = Number.parseFloat(budget) || 0
  const percentage = budgetValue > 0 ? (total / budgetValue) * 100 : 0
  const isOverBudget = total > budgetValue && budgetValue > 0
  const progressWidth = Math.min(percentage, 100)

  function updateItem(id: number, field: 'title' | 'cost', value: string) {
    setItems((current) => current.map((item) => (item.id === id ? { ...item, [field]: value } : item)))
  }

  function changeCount(id: number, amount: number) {
    setItems((current) => current.map((item) => item.id === id ? { ...item, count: Math.max(1, item.count + amount) } : item))
  }

  function addItem() {
    setItems((current) => [...current, { id: nextId, title: 'New item', cost: '0.00', count: 1 }])
    setNextId((id) => id + 1)
  }

  function reset() {
    setBudget('500')
    setCurrencyCode('PHP')
    setItems(initialItems)
    setNextId(4)
  }

  function saveCsv() {
    const rows = [['Item', 'Cost per item', 'Quantity', 'Total cost'], ...items.map((item) => [item.title, item.cost, String(item.count), (Number.parseFloat(item.cost || '0') * item.count).toFixed(2)])]
    const csv = rows.map((row) => row.map((cell) => `"${cell.replaceAll('"', '""')}"`).join(',')).join('\n')
    const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8;' }))
    const link = document.createElement('a')
    link.href = url
    link.download = 'inventory-plan.csv'
    link.click()
    URL.revokeObjectURL(url)
  }

  return (
    <main className="min-h-screen bg-[#f5f6f3] px-4 py-8 text-[#17211c] sm:px-8 lg:px-12">
      <div className="mx-auto max-w-5xl">
        <header className="mb-9 flex items-start justify-between gap-4">
          <div>
            <div className="mb-3 flex items-center gap-2 text-sm font-semibold tracking-[0.18em] text-[#5c7664] uppercase">
              <span className="flex size-7 items-center justify-center rounded-lg bg-[#dceadf]"><Sparkles aria-hidden="true" /></span>
              Planwell
            </div>
            <h1 className="text-3xl font-semibold tracking-[-0.04em] sm:text-4xl">Inventory planner</h1>
            <p className="mt-2 max-w-xl text-sm leading-6 text-[#68756d]">Build your list, keep an eye on the spend, and stay comfortably within your budget.</p>
          </div>
          <div className="hidden rounded-full border border-[#d8e0d9] bg-white px-3 py-2 text-xs font-medium text-[#6b776f] sm:block">Draft plan · Today</div>
        </header>

        <section className="mb-5 rounded-2xl border border-[#dfe6e0] bg-white p-5 shadow-[0_12px_35px_rgba(30,51,38,0.05)] sm:p-6" aria-labelledby="budget-heading">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-2 flex items-center gap-2 text-xs font-semibold tracking-[0.13em] text-[#718077] uppercase"><WalletCards aria-hidden="true" /> Planning budget</p>
              <h2 id="budget-heading" className="text-xl font-semibold tracking-[-0.02em]">How much do you want to spend?</h2>
            </div>
            <label className="flex w-full max-w-[240px] items-center rounded-xl border border-[#cfdad1] bg-[#fbfcfb] px-3 py-2.5 transition focus-within:border-[#548269] focus-within:ring-4 focus-within:ring-[#dceadf]">
              <span className="mr-2 text-lg text-[#718077]">{selectedCurrency.symbol}</span>
              <span className="sr-only">Budget amount</span>
              <input aria-label="Budget amount" inputMode="decimal" value={budget} onChange={(event) => setBudget(event.target.value)} className="w-full bg-transparent text-right text-2xl font-semibold tracking-[-0.03em] outline-none" />
            </label>
          </div>
        </section>

        <section className="overflow-hidden rounded-2xl border border-[#dfe6e0] bg-white shadow-[0_12px_35px_rgba(30,51,38,0.05)]" aria-labelledby="items-heading">
          <div className="flex items-center justify-between border-b border-[#e8ede9] px-5 py-5 sm:px-6">
            <div><h2 id="items-heading" className="text-lg font-semibold">Your items</h2><p className="mt-1 text-sm text-[#7b867f]">{items.length} {items.length === 1 ? 'item' : 'items'} in this plan</p></div>
            <button onClick={addItem} className="inline-flex items-center gap-2 rounded-lg bg-[#193b29] px-3.5 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2b5940] focus:outline-none focus:ring-4 focus:ring-[#dceadf]"><Plus aria-hidden="true" /> Add item</button>
          </div>
          <div className="hidden grid-cols-[minmax(0,1fr)_150px_128px_125px_24px] gap-4 border-b border-[#edf1ed] bg-[#fbfcfb] px-6 py-3 text-[11px] font-semibold tracking-[0.12em] text-[#869189] uppercase md:grid">
            <span>Item</span><span>Cost per item</span><span>Quantity</span><span className="text-right">Total cost</span><span />
          </div>
          <div className="divide-y divide-[#edf1ed]">
            {items.map((item) => {
              const itemTotal = (Number.parseFloat(item.cost) || 0) * item.count
              return <div key={item.id} className="grid gap-4 px-5 py-5 md:grid-cols-[minmax(0,1fr)_150px_128px_125px_24px] md:items-center md:gap-4 md:px-6">
                <label className="min-w-0"><span className="mb-1 block text-[10px] font-semibold tracking-[0.12em] text-[#8a958d] uppercase md:hidden">Item</span><input aria-label={`Item ${item.id} name`} value={item.title} onChange={(event) => updateItem(item.id, 'title', event.target.value)} className="w-full rounded-lg border border-transparent bg-transparent px-2 py-2 text-[15px] font-medium outline-none transition hover:border-[#dfe6e0] focus:border-[#9ab7a2] focus:bg-[#fbfcfb]" /></label>
                <label><span className="mb-1 block text-[10px] font-semibold tracking-[0.12em] text-[#8a958d] uppercase md:hidden">Cost per item</span><div className="flex items-center rounded-lg border border-[#e2e8e3] px-2.5 py-2 text-sm"><span className="text-[#8a958d]">{selectedCurrency.symbol}</span><input aria-label={`${item.title} cost`} inputMode="decimal" value={item.cost} onChange={(event) => updateItem(item.id, 'cost', event.target.value)} className="min-w-0 w-full bg-transparent pl-1 outline-none" /></div></label>
                <div><span className="mb-1 block text-[10px] font-semibold tracking-[0.12em] text-[#8a958d] uppercase md:hidden">Quantity</span><div className="flex w-fit items-center rounded-lg border border-[#e2e8e3] p-1"><button aria-label={`Decrease ${item.title} quantity`} onClick={() => changeCount(item.id, -1)} className="flex size-7 items-center justify-center rounded-md text-[#68756d] hover:bg-[#eef4ef] disabled:opacity-40" disabled={item.count === 1}><Minus aria-hidden="true" /></button><span className="w-8 text-center text-sm font-semibold">{item.count}</span><button aria-label={`Increase ${item.title} quantity`} onClick={() => changeCount(item.id, 1)} className="flex size-7 items-center justify-center rounded-md text-[#3a7752] hover:bg-[#eef4ef]"><Plus aria-hidden="true" /></button></div></div>
                <div className="flex items-end justify-between md:block md:text-right"><span className="text-xs text-[#8a958d] md:hidden">Line total</span><span className="text-[15px] font-semibold">{currency.format(itemTotal)}</span></div>
                <button aria-label={`Remove ${item.title}`} onClick={() => setItems((current) => current.filter((entry) => entry.id !== item.id))} className="absolute right-5 mt-[-30px] text-[#a1aaa4] hover:text-[#b34e4e] md:static md:mt-0"><X aria-hidden="true" /></button>
              </div>
            })}
          </div>
        </section>

        <section className="mt-5 rounded-2xl border border-[#dfe6e0] bg-white p-5 shadow-[0_12px_35px_rgba(30,51,38,0.05)] sm:p-6" aria-labelledby="summary-heading">
          <div className="flex flex-wrap items-end justify-between gap-3"><div><p className="text-sm text-[#718077]">Grand total</p><h2 id="summary-heading" className="mt-1 text-3xl font-semibold tracking-[-0.04em]">{currency.format(total)}</h2></div><p className={`text-sm font-medium ${isOverBudget ? 'text-[#b34e4e]' : 'text-[#3a7752]'}`}>{budgetValue > 0 ? `${percentage.toFixed(0)}% of budget` : 'Set a budget to track spend'}</p></div>
          <div className="mt-6"><div className="mb-2 flex justify-between text-xs font-medium text-[#7b867f]"><span>Budget progress</span><span>{currency.format(budgetValue)} budget</span></div><div className="h-3 overflow-hidden rounded-full bg-[#e9eeea]" role="progressbar" aria-label="Budget progress" aria-valuenow={Math.round(percentage)} aria-valuemin={0} aria-valuemax={100}><div className={`h-full rounded-full transition-all duration-300 ${isOverBudget ? 'bg-[#c95d5d]' : 'bg-[#5c9a70]'}`} style={{ width: `${progressWidth}%` }} /></div>{isOverBudget && <p className="mt-2 text-xs font-medium text-[#b34e4e]">You&apos;re {currency.format(total - budgetValue)} over budget.</p>}</div>
        </section>

        <footer className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-end"><label className="flex items-center gap-2 text-sm font-medium text-[#526158] sm:mr-auto"><span>Currency</span><select aria-label="Currency" value={currencyCode} onChange={(event) => setCurrencyCode(event.target.value as (typeof currencyOptions)[number]['value'])} className="rounded-lg border border-[#d5dfd7] bg-white px-3 py-2.5 font-semibold outline-none transition focus:border-[#548269] focus:ring-4 focus:ring-[#dceadf]">{currencyOptions.map((option) => <option key={option.value} value={option.value}>{option.symbol} {option.label}</option>)}</select></label><button onClick={reset} className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#d5dfd7] bg-white px-4 py-2.5 text-sm font-semibold text-[#526158] transition hover:bg-[#f0f4f0] focus:outline-none focus:ring-4 focus:ring-[#dceadf]"><RotateCcw aria-hidden="true" /> Reset plan</button><button onClick={saveCsv} className="inline-flex items-center justify-center gap-2 rounded-lg bg-[#193b29] px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-[#2b5940] focus:outline-none focus:ring-4 focus:ring-[#dceadf]"><ArrowDownToLine aria-hidden="true" /> Save to CSV</button></footer>
      </div>
    </main>
  )
}
