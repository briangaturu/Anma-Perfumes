import React from 'react';
import { useSelector } from 'react-redux';
import { motion } from 'framer-motion';
import { paymentApi } from '../../features/APIS/PaymentApi';
import type { RootState } from '../../App/store';

const GetPaymentsByNationalId: React.FC = () => {
  const nationalId = useSelector((state: RootState) => state.auth.user?.nationalId);
  const firstName = useSelector((state: RootState) => state.auth.user?.firstName);

  const {
    data: payments,
    isLoading,
    isError,
    error,
  } = paymentApi.useGetPaymentsByNationalIdQuery(nationalId, {
    skip: !nationalId,
  });

  const [currentPage, setCurrentPage] = React.useState(1);
  const [statusFilter, setStatusFilter] = React.useState<string>('All');

  const paymentsPerPage = 10;

  // ✅ Filter payments by "Completed" or "Pending"
  const filteredPayments = payments
    ? payments.filter((p: any) => {
        if (statusFilter === 'All') return true;
        if (statusFilter === 'Completed') return p.paymentStatus === 'Completed';
        if (statusFilter === 'Pending') return p.paymentStatus === 'Pending';
        return false;
      })
    : [];

  // ✅ Sort from latest to oldest
  const sortedPayments = [...filteredPayments].sort(
    (a, b) => new Date(b.paymentDate).getTime() - new Date(a.paymentDate).getTime()
  );

  // ✅ Paginate
  const indexOfLast = currentPage * paymentsPerPage;
  const indexOfFirst = indexOfLast - paymentsPerPage;
  const currentPayments = sortedPayments.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(sortedPayments.length / paymentsPerPage);

  React.useEffect(() => {
    setCurrentPage(1);
  }, [statusFilter]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="min-h-screen mt-20 px-4"
    >
      <div className="max-w-6xl mx-auto bg-gradient-to-r from-indigo-500 via-purple-500 to-blue-500 p-1 rounded-2xl shadow-xl mb-20">
        <div className="rounded-2xl bg-base-100 p-6">
          <h2 className="text-2xl font-semibold text-primary mb-2 text-center">
            👋 Hey {firstName || 'there'}, welcome back!
          </h2>
          <h2 className="text-3xl font-bold mb-4 text-primary text-center">💳 My Payments</h2>

          {/* ✅ Filter Dropdown */}
          <div className="flex justify-center mb-6">
            <select
              className="select select-bordered max-w-xs"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="All">All</option>
              <option value="Completed">Completed</option>
              <option value="Pending">Pending</option>
            </select>
          </div>

          {isLoading && <p className="text-center text-base-content">Loading your payments...</p>}
          {isError && (
            <p className="text-center text-error">
              Error: {(error as any)?.data?.error || 'Something went wrong.'}
            </p>
          )}

          {payments && sortedPayments.length > 0 ? (
            <div className="overflow-x-auto animate-fadeIn">
              <table className="min-w-full text-sm text-left text-base-content border-separate border-spacing-y-2">
                <thead className="text-xs uppercase bg-base-200 text-primary font-semibold">
                  <tr>
                    <th className="px-4 py-2">Transaction ID</th>
                    <th className="px-4 py-2">Booking ID</th>
                    <th className="px-4 py-2">Amount</th>
                    <th className="px-4 py-2">Status</th>
                    <th className="px-4 py-2">Method</th>
                    <th className="px-4 py-2">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {currentPayments.map((payment: any) => (
                    <motion.tr
                      key={payment.paymentId}
                      whileHover={{ scale: 1.01 }}
                      transition={{ type: 'spring', stiffness: 300 }}
                      className="bg-base-100 hover:bg-base-200 transition duration-200 shadow rounded-xl"
                    >
                      <td className="px-4 py-3 rounded-l-xl">{payment.transactionId || 'N/A'}</td>
                      <td className="px-4 py-3">{payment.bookingId}</td>
                      <td className="px-4 py-3">KSH {(payment.amount / 100).toFixed(2)}</td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-1 rounded text-xs font-medium ${
                            payment.paymentStatus === 'PAID'
                              ? 'bg-green-100 text-green-800'
                              : payment.paymentStatus === 'FAILED'
                              ? 'bg-red-100 text-red-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}
                        >
                          {payment.paymentStatus}
                        </span>
                      </td>
                      <td className="px-4 py-3">{payment.paymentMethod || 'N/A'}</td>
                      <td className="px-4 py-3 rounded-r-xl">
                        {new Date(payment.paymentDate).toLocaleString()}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>

              {/* ✅ Pagination Controls */}
              {totalPages > 1 && (
                <div className="flex justify-center mt-4 gap-2">
                  <button
                    className="btn btn-sm"
                    onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                  >
                    Prev
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`btn btn-sm ${currentPage === i + 1 ? 'btn-active' : ''}`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    className="btn btn-sm"
                    onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                  >
                    Next
                  </button>
                </div>
              )}
            </div>
          ) : (
            !isLoading && (
              <p className="text-center text-slate-500 mt-4">
                No payments found for selected status.
              </p>
            )
          )}
        </div>
      </div>
    </motion.div>
  );
};

export default GetPaymentsByNationalId;
