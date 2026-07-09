import React from "react";
import {
  DollarSign,
  CreditCard,
  TrendingUp,
  Wallet
} from "lucide-react";

const RevenueAnalytics = () => {
  const stats = [
    {
      title: "Total Revenue",
      value: "$250,000",
      icon: DollarSign
    },
    {
      title: "Subscriptions",
      value: "18,500",
      icon: CreditCard
    },
    {
      title: "Monthly Growth",
      value: "+25%",
      icon: TrendingUp
    },
    {
      title: "Available Balance",
      value: "$85,000",
      icon: Wallet
    }
  ];

  return (
    <div className="space-y-6">

      <div>
        <h1 className="text-3xl font-bold">
          Revenue Analytics
        </h1>

        <p className="text-slate-400 mt-1">
          Track platform income, subscriptions and financial growth.
        </p>
      </div>


      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-5">

        {stats.map((item) => {
          const Icon = item.icon;

          return (
            <div
              key={item.title}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-5"
            >

              <div className="w-12 h-12 rounded-xl bg-green-500/10 text-green-400 flex items-center justify-center mb-4">
                <Icon size={24}/>
              </div>


              <p className="text-slate-400">
                {item.title}
              </p>


              <h2 className="text-3xl font-bold mt-2">
                {item.value}
              </h2>

            </div>
          );
        })}

      </div>


      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">

        <h2 className="text-xl font-semibold mb-4">
          Revenue Overview
        </h2>

        <div className="h-64 flex items-center justify-center text-slate-500">
          Revenue Chart
        </div>

      </div>

    </div>
  );
};

export default RevenueAnalytics;