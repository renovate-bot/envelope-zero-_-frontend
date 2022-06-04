import { ChevronRightIcon, LockClosedIcon } from '@heroicons/react/solid'
import { useTranslation } from 'react-i18next'
import { Link } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { ApiObject, Translation, Transaction, Budget, Account } from '../types'
import Error from './Error'
import { getTransactions } from '../lib/api/transactions'
import { formatMoney } from '../lib/format'
import { getConfiguration } from '../lib/transaction-helper'

type Props = { parent: ApiObject; budget: Budget; accounts: Account[] }

const LatestTransactions = ({ parent, budget, accounts }: Props) => {
  const { t }: Translation = useTranslation()

  const [error, setError] = useState('')
  const [transactions, setTransactions] = useState<Transaction[]>([])

  useEffect(() => {
    getTransactions(parent)
      .then(transactionData => {
        setTransactions(transactionData)
        setError('')
      })
      .catch(err => {
        setError(err.message)
      })
  }, [parent])

  const anyReconciled = transactions.some(transaction => transaction.reconciled)

  return (
    <>
      <div className="flex justify-between">
        <h2>{t('transactions.transactions')}</h2>
        <Link to="TODO" className="flex items-center link-blue">
          {/* TODO: confirmation before navigating if unsaved data in form */}
          {t('seeAll')} <ChevronRightIcon className="inline h-6" />
        </Link>
      </div>
      <div>
        <Error error={error} />
        {transactions.length > 0 ? (
          <ul>
            {transactions.map(transaction => {
              const { sign, color, counterparties } = getConfiguration(
                transaction,
                accounts
              )

              return (
                <li key={transaction.id}>
                  <Link
                    to={`/transactions/${transaction.id}`}
                    className="block hover:bg-gray-50"
                  >
                    <div className="px-2 py-4 sm:px-6">
                      <div className="flex items-center justify-between">
                        <p
                          className={`text-sm font-medium truncate ${
                            transaction.note ? '' : 'italic'
                          }`}
                        >
                          {transaction.note
                            ? `${transaction.note} (${counterparties})`
                            : counterparties}
                        </p>
                        <div className="flex items-center flex-shrink-0">
                          <div className="pl-2 flex items-center">
                            <p
                              className={`px-2 inline-flex text-xs leading-5 font-bold rounded-full ${color}`}
                            >
                              {sign}
                              {formatMoney(
                                transaction.amount,
                                budget.currency,
                                'never'
                              )}
                            </p>
                          </div>
                          <div
                            className={`ml-1 flex ${
                              anyReconciled ? 'w-5' : 'hidden'
                            }`}
                          >
                            {transaction.reconciled ? (
                              <LockClosedIcon className="text-gray-500" />
                            ) : null}
                          </div>
                          <div
                            className={`${
                              anyReconciled ? 'ml-1' : ''
                            } flex w-5`}
                          >
                            <ChevronRightIcon className="text-gray-900" />
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>
        ) : (
          t('transactions.emptyList')
        )}
      </div>
    </>
  )
}

export default LatestTransactions
