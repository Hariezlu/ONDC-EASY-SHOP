import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { ArrowUpRight, ArrowDownRight } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Skeleton } from "@/components/ui/skeleton";
import { User } from "@shared/schema";

interface Transaction {
  id: number;
  amount: number;
  type: "deposit" | "withdrawal" | "payment" | "refund";
  description: string;
  date: string;
}

interface WalletCardProps {
  user: User;
}

export default function WalletCard({ user }: WalletCardProps) {
  const { toast } = useToast();
  const [amount, setAmount] = useState("");

  // Fetch wallet transactions
  const { data: transactions, isLoading } = useQuery<Transaction[]>({
    queryKey: ["/api/wallet/transactions"],
    refetchInterval: 3000, // Refetch every 3 seconds
    refetchOnWindowFocus: true, // Refetch when window gets focus
    queryFn: async () => {
      // This is a mock function since we don't have actual API implemented
      return [];
    },
  });

  const addFundsMutation = useMutation({
    mutationFn: async (amount: number) => {
      await apiRequest("POST", "/api/wallet/add", { amount });
    },
    onSuccess: () => {
      toast({
        title: "Funds added",
        description: `$${amount} has been added to your wallet.`,
      });
      setAmount("");
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      queryClient.invalidateQueries({ queryKey: ["/api/wallet/transactions"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to add funds: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const handleAddFunds = () => {
    const amountValue = parseFloat(amount);
    if (isNaN(amountValue) || amountValue <= 0) {
      toast({
        title: "Invalid amount",
        description: "Please enter a valid amount greater than zero.",
        variant: "destructive",
      });
      return;
    }
    addFundsMutation.mutate(amountValue);
  };

  return (
    <>
      <Card className="bg-gray-50 border border-gray-200 rounded-lg p-4 mb-8">
        <CardContent className="p-0">
          <div className="flex justify-between items-center mb-4">
            <div>
              <p className="text-gray-600 text-sm">Available Balance</p>
              <p className="text-2xl font-bold">${(parseFloat(user?.walletBalance) || 0).toFixed(2)}</p>
            </div>
            <div>
              <Button 
                className="bg-primary text-white"
                onClick={() => document.getElementById('add-funds-input')?.focus()}
              >
                Add Money
              </Button>
            </div>
          </div>
          
          <div className="bg-white border border-gray-200 rounded-lg p-4 mb-4">
            <Label htmlFor="add-funds-input" className="text-sm font-medium mb-2 block">
              Add Funds to Wallet
            </Label>
            <div className="flex space-x-2">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500">$</span>
                </div>
                <Input
                  id="add-funds-input"
                  type="number"
                  placeholder="Enter amount"
                  className="pl-7"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="0.01"
                  step="0.01"
                />
              </div>
              <Button 
                className="bg-primary text-white"
                onClick={handleAddFunds}
                disabled={addFundsMutation.isPending || !amount}
              >
                Add Funds
              </Button>
            </div>
            <p className="text-xs text-gray-500 mt-2">
              * For demonstration purposes, funds are added instantly without actual payment processing.
            </p>
          </div>

          <div className="border-t border-gray-200 pt-4">
            <h4 className="font-medium mb-2">Recent Transactions</h4>
            {isLoading ? (
              <div className="space-y-3">
                {Array(3).fill(0).map((_, i) => (
                  <div key={i} className="flex justify-between items-center py-2">
                    <div className="flex items-center">
                      <Skeleton className="h-8 w-8 rounded-full mr-3" />
                      <div>
                        <Skeleton className="h-4 w-32 mb-1" />
                        <Skeleton className="h-3 w-24" />
                      </div>
                    </div>
                    <Skeleton className="h-5 w-16" />
                  </div>
                ))}
              </div>
            ) : !transactions || transactions.length === 0 ? (
              <div className="text-gray-500 text-sm text-center py-4">
                No transactions yet
              </div>
            ) : (
              <div className="space-y-3">
                {transactions.map((transaction) => (
                  <div key={transaction.id} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                    <div className="flex items-center">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center mr-3 ${
                        transaction.type === 'deposit' || transaction.type === 'refund' 
                          ? 'bg-green-100 text-green-600'
                          : 'bg-red-100 text-red-600'
                      }`}>
                        {transaction.type === 'deposit' || transaction.type === 'refund' 
                          ? <ArrowUpRight className="h-4 w-4" /> 
                          : <ArrowDownRight className="h-4 w-4" />
                        }
                      </div>
                      <div>
                        <p className="font-medium text-sm">
                          {transaction.type === 'deposit' ? 'Added Funds' :
                           transaction.type === 'withdrawal' ? 'Withdrawal' :
                           transaction.type === 'payment' ? 'Payment' : 'Refund'
                          }
                        </p>
                        <p className="text-gray-500 text-xs">{new Date(transaction.date).toLocaleDateString()}</p>
                      </div>
                    </div>
                    <p className={`font-medium ${
                      transaction.type === 'deposit' || transaction.type === 'refund' 
                        ? 'text-green-600' 
                        : 'text-red-600'
                    }`}>
                      {transaction.type === 'deposit' || transaction.type === 'refund' ? '+' : '-'}${transaction.amount.toFixed(2)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <h3 className="font-bold mb-4">Wallet Information</h3>
          <div className="space-y-4">
            <div>
              <h4 className="font-medium text-sm mb-1">How Your Wallet Works</h4>
              <p className="text-sm text-gray-600">
                Your wallet balance can be used to make purchases on our platform. When you place an order, 
                the payment amount is held in your wallet until the delivery is confirmed or the return period 
                expires.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-sm mb-1">Order Payment</h4>
              <p className="text-sm text-gray-600">
                When you place an order, the payment amount is deducted from your wallet balance but is held 
                in escrow until the order is delivered and the return period expires.
              </p>
            </div>
            <div>
              <h4 className="font-medium text-sm mb-1">Refunds</h4>
              <p className="text-sm text-gray-600">
                If you return an order, the payment amount is refunded back to your wallet after the return is approved.
                The refund process is typically completed within 1-3 business days after return approval.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </>
  );
}
