import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { billingApi } from '../../billing/api/billing.api';
import { paymentsApi } from '../api/payments.api';
import { PaymentForm } from '../components/PaymentForm';
import type { Bill } from '../../../types/billing.types';
import { formatCurrency } from '../../../lib/formatCurrency';
import { Badge } from '../../../components/ui/Badge';
import { Card } from '../../../components/ui/Card';
import { Button } from '../../../components/ui/Button';
import { toast } from 'sonner';
import { useAuth } from '../../../hooks/useAuth';

export function MakePaymentPage() {
  const [searchParams] = useSearchParams();
  const billId = searchParams.get('billId');
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [bill, setBill] = useState<Bill | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'offline' | 'online'>('online');
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    if (!billId) {
      toast.error('No bill specified');
      navigate('/my-bills');
      return;
    }

    const fetchBill = async () => {
      try {
        const res = await billingApi.getBillById(billId);
        setBill((res.data.data as any).bill || res.data.data);
      } catch (error) {
        toast.error('Failed to load bill details');
        navigate('/my-bills');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBill();
  }, [billId, navigate]);

  const handleOfflinePayment = async (data: any) => {
    if (!bill) return;
    
    try {
      setIsProcessing(true);
      await paymentsApi.recordOffline({
        billId: bill.id,
        paymentMethod: data.paymentMethod,
        amount: data.amount,
        transactionReference: data.transactionReference,
      });
      toast.success('Payment recorded. Awaiting admin verification.');
      navigate('/my-bills');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to record payment');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleOnlinePayment = async () => {
    if (!bill) return;

    try {
      setIsProcessing(true);
      // 1. Create order
      const orderRes = await paymentsApi.createOnlineOrder({ billId: bill.id });
      const order = orderRes.data.data;

      // 2. Open Razorpay checkout
      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: 'Society Management',
        description: `Bill: ${order.billNumber}`,
        order_id: order.orderId,
        handler: async (response: any) => {
          try {
            await paymentsApi.verifyOnlinePayment({
              billId: bill.id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpayOrderId: response.razorpay_order_id,
              razorpaySignature: response.razorpay_signature,
            });
            toast.success('Payment successful!');
            navigate('/my-bills');
          } catch (err) {
            toast.error('Payment verification failed. Please contact admin.');
          }
        },
        prefill: {
          email: user?.email,
        },
        theme: {
          color: '#6D28D9',
        },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        toast.error(`Payment failed: ${response.error.description}`);
      });
      
      rzp.open();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to initiate payment');
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return <div className="animate-pulse bg-aura h-64 rounded-xl"></div>;
  }

  if (!bill) return null;

  const totalAmount = Number(bill.totalAmount);

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="font-display text-2xl font-bold text-charcoal">Make Payment</h1>
        <p className="text-charcoal-muted mt-1">Pay your maintenance bill</p>
      </div>

      <Card className="p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div>
            <h2 className="text-lg font-semibold text-charcoal">{bill.billNumber}</h2>
            <p className="text-charcoal-muted text-sm">{bill.billingPeriod}</p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-display font-bold text-charcoal">
              {formatCurrency(totalAmount)}
            </div>
            <Badge variant="warning">{bill.status}</Badge>
          </div>
        </div>

        <div className="border-t border-orchid/10 pt-6">
          <div className="flex space-x-4 mb-6">
            <button
              className={`pb-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'online' 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-charcoal-muted hover:text-charcoal'
              }`}
              onClick={() => setActiveTab('online')}
            >
              Online (Razorpay)
            </button>
            <button
              className={`pb-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === 'offline' 
                  ? 'border-primary text-primary' 
                  : 'border-transparent text-charcoal-muted hover:text-charcoal'
              }`}
              onClick={() => setActiveTab('offline')}
            >
              Offline Payment
            </button>
          </div>

          {activeTab === 'online' ? (
            <div className="space-y-6">
              <p className="text-charcoal-muted text-sm">
                Pay instantly using Credit Card, Debit Card, Net Banking, or UPI via Razorpay secure checkout.
              </p>
              <Button 
                variant="primary" 
                size="lg" 
                className="w-full"
                onClick={handleOnlinePayment}
                loading={isProcessing}
              >
                Pay {formatCurrency(totalAmount)} with Razorpay
              </Button>
            </div>
          ) : (
            <PaymentForm 
              defaultAmount={totalAmount} 
              onSubmit={handleOfflinePayment}
              isLoading={isProcessing}
            />
          )}
        </div>
      </Card>
    </div>
  );
}
