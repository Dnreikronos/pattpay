import type { Payment } from '@/types/payment'

/**
 * Export payments data to CSV format
 */
export function exportPaymentsToCSV(payments: Payment[]): void {
  const headers = [
    'ID',
    'Hash',
    'Date',
    'Amount (SOL)',
    'Amount (USD)',
    'Status',
    'From',
    'To',
    'Link',
    'Block',
    'Confirmations',
    'Fee'
  ]

  const rows = payments.map(payment => [
    payment.id,
    payment.hash,
    new Date(payment.createdAt).toISOString(),
    payment.amount.toString(),
    payment.amountUSD.toString(),
    payment.status,
    payment.from,
    payment.to,
    payment.linkName || 'Direct',
    payment.block.toString(),
    payment.confirmations.toString(),
    payment.fee.toString()
  ])

  const csvContent = [
    headers.join(','),
    ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
  ].join('\n')

  downloadFile(
    csvContent,
    `pattpay-payments-${new Date().toISOString().split('T')[0]}.csv`,
    'text/csv'
  )
}

/**
 * Export payments data to JSON format
 */
export function exportPaymentsToJSON(payments: Payment[]): void {
  const jsonContent = JSON.stringify(payments, null, 2)

  downloadFile(
    jsonContent,
    `pattpay-payments-${new Date().toISOString().split('T')[0]}.json`,
    'application/json'
  )
}

/**
 * Trigger browser download for a file
 */
function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)
  URL.revokeObjectURL(url)
}
