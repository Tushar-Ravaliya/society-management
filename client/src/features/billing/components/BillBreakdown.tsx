import React from 'react';
import { Card } from '../../../components/ui/Card';
import { Badge } from '../../../components/ui/Badge';
import { Button } from '../../../components/ui/Button';
import { useNavigate } from 'react-router-dom';
import { formatCurrency } from '../../../lib/formatCurrency';
import { formatDate } from '../../../lib/formatDate';
import type { Bill } from '../../../types/billing.types';
import { useAuth } from '../../../hooks/useAuth';

interface BillBreakdownProps {
  bill: Bill;
}

export const BillBreakdown: React.FC<BillBreakdownProps> = ({ bill }) => {
  const navigate = useNavigate();
  const { role } = useAuth();
  const isResident = role === 'resident';
  
  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'paid': return 'success';
      case 'unpaid': return 'warning';
      case 'overdue': return 'danger';
      case 'partially_paid': return 'info';
      default: return 'neutral';
    }
  };

  const isPayable = (bill.status === 'unpaid' || bill.status === 'overdue') && isResident;

  return (
    <Card className="max-w-2xl mx-auto overflow-hidden">
      {/* Header */}
      <div className="bg-aura/30 p-6 border-b border-orchid/10">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
          <div>
            <h2 className="text-xl font-bold text-charcoal">{bill.billNumber}</h2>
            <p className="text-charcoal-muted">
              Unit: <span className="font-medium text-charcoal">{bill.unit?.block}-{bill.unit?.flatNumber}</span>
            </p>
          </div>
          <Badge variant={getStatusVariant(bill.status)} className="text-sm px-3 py-1">
            {bill.status.replace('_', ' ').toUpperCase()}
          </Badge>
        </div>
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <p className="text-charcoal-muted">Billing Period</p>
            <p className="font-medium text-charcoal">{bill.billingPeriod}</p>
          </div>
          <div>
            <p className="text-charcoal-muted">Due Date</p>
            <p className="font-medium text-charcoal">{formatDate(bill.dueDate)}</p>
          </div>
        </div>
      </div>

      {/* Breakdown */}
      <div className="p-6">
        <h3 className="text-sm font-semibold text-charcoal-muted uppercase tracking-wider mb-4">Charges Breakdown</h3>
        
        <div className="space-y-3 mb-6">
          <div className="flex justify-between items-center py-2 border-b border-orchid/10">
            <span className="text-charcoal">Maintenance Charges</span>
            <span className="text-charcoal font-medium">{formatCurrency(Number(bill.maintenanceAmount))}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-orchid/10">
            <span className="text-charcoal">Water Charges</span>
            <span className="text-charcoal font-medium">{formatCurrency(Number(bill.waterAmount))}</span>
          </div>
          <div className="flex justify-between items-center py-2 border-b border-orchid/10">
            <span className="text-charcoal">Electricity Charges</span>
            <span className="text-charcoal font-medium">{formatCurrency(Number(bill.electricityAmount))}</span>
          </div>
          {Number(bill.penaltyAmount) > 0 && (
            <div className="flex justify-between items-center py-2 border-b border-orchid/10">
              <span className="text-error">Late Penalty</span>
              <span className="text-error font-medium">{formatCurrency(Number(bill.penaltyAmount))}</span>
            </div>
          )}
          {Number(bill.otherAmount) > 0 && (
            <div className="flex justify-between items-center py-2 border-b border-orchid/10">
              <span className="text-charcoal">Other Charges</span>
              <span className="text-charcoal font-medium">{formatCurrency(Number(bill.otherAmount))}</span>
            </div>
          )}
          
          <div className="flex justify-between items-center py-4 bg-aura/10 px-4 rounded-lg mt-4">
            <span className="text-charcoal font-bold text-lg">Total Amount</span>
            <span className="text-primary font-bold text-xl">{formatCurrency(Number(bill.totalAmount))}</span>
          </div>
        </div>

        {isPayable && (
          <Button 
            variant="primary" 
            className="w-full text-lg py-3"
            onClick={() => navigate(`/payments/new?billId=${bill.id}`)}
          >
            Pay Now
          </Button>
        )}
      </div>
    </Card>
  );
};
