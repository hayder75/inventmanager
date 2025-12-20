'use client';

import { useState, useEffect } from 'react';
import { DollarSign, Percent } from 'lucide-react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

interface SystemSettings {
  vat_enabled: string;
  tot_enabled: string;
  commission_enabled: string;
  commission_percentage: string;
  consistent_daily_opening_balance_enabled: string;
  consistent_daily_opening_balance_amount: string;
}

interface Salesperson {
  id: string;
  name: string;
  email: string;
  role: string;
}

interface SalespersonCommission {
  salespersonId: string;
  salespersonName: string;
  commissionPercentage: string;
}

export default function SettingsPage() {
  const { user } = useAuth();
  const [systemSettings, setSystemSettings] = useState<SystemSettings>({
    vat_enabled: 'false',
    tot_enabled: 'false',
    commission_enabled: 'false',
    commission_percentage: '0',
    consistent_daily_opening_balance_enabled: 'false',
    consistent_daily_opening_balance_amount: '0',
  });
  const [systemSaved, setSystemSaved] = useState(false);
  const [salespeople, setSalespeople] = useState<Salesperson[]>([]);
  const [salespersonCommissions, setSalespersonCommissions] = useState<SalespersonCommission[]>([]);

  useEffect(() => {
    // Load system settings from API
    fetchSystemSettings();
  }, []);

  useEffect(() => {
    if (user?.role === 'ADMIN' && systemSettings.commission_percentage) {
      fetchSalespeople();
    }
  }, [user, systemSettings.commission_percentage]);

  const fetchSystemSettings = async () => {
    try {
      const response = await api.get('/api/settings');
      setSystemSettings({
        vat_enabled: response.data.vat_enabled || 'false',
        tot_enabled: response.data.tot_enabled || 'false',
        commission_enabled: response.data.commission_enabled || 'false',
        commission_percentage: response.data.commission_percentage || '0',
        consistent_daily_opening_balance_enabled: response.data.consistent_daily_opening_balance_enabled || 'false',
        consistent_daily_opening_balance_amount: response.data.consistent_daily_opening_balance_amount || '0',
      });
    } catch (error) {
      console.error('Failed to fetch system settings:', error);
    }
  };

  const fetchSalespeople = async () => {
    try {
      const response = await api.get('/api/users', {
        params: { role: 'SALES', isActive: 'true' },
      });
      setSalespeople(response.data);
      // Fetch commissions after salespeople are loaded
      fetchSalespersonCommissions(response.data);
    } catch (error) {
      console.error('Failed to fetch salespeople:', error);
    }
  };

  const fetchSalespersonCommissions = async (salespeopleList?: Salesperson[]) => {
    try {
      const spList = salespeopleList || salespeople;
      if (spList.length === 0) return;

      const response = await api.get('/api/settings');
      // Get all commission settings (format: commission_salesperson_{id})
      const commissionSettings: SalespersonCommission[] = [];
      spList.forEach((sp) => {
        const key = `commission_salesperson_${sp.id}`;
        const value = response.data[key] || systemSettings.commission_percentage || '0';
        commissionSettings.push({
          salespersonId: sp.id,
          salespersonName: sp.name,
          commissionPercentage: value,
        });
      });
      setSalespersonCommissions(commissionSettings);
    } catch (error) {
      console.error('Failed to fetch salesperson commissions:', error);
    }
  };

  const updateSalespersonCommission = (salespersonId: string, percentage: string) => {
    setSalespersonCommissions(prev =>
      prev.map(sc =>
        sc.salespersonId === salespersonId
          ? { ...sc, commissionPercentage: percentage }
          : sc
      )
    );
  };

  const saveSalespersonCommissions = async () => {
    try {
      for (const commission of salespersonCommissions) {
        await api.put('/api/settings', {
          key: `commission_salesperson_${commission.salespersonId}`,
          value: commission.commissionPercentage,
          description: `Individual commission for ${commission.salespersonName}`,
        });
      }
      alert('Salesperson commissions saved successfully!');
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to save salesperson commissions');
    }
  };

  const handleSaveSystemSettings = async () => {
    try {
      // Update all settings in a single request
      const settingsToUpdate = [
        { key: 'vat_enabled', value: systemSettings.vat_enabled },
        { key: 'tot_enabled', value: systemSettings.tot_enabled },
        { key: 'commission_enabled', value: systemSettings.commission_enabled },
        { key: 'commission_percentage', value: systemSettings.commission_percentage },
        { key: 'vat_rate', value: '7.5' },
        { key: 'tot_rate', value: '3' },
        { key: 'commission_rate', value: systemSettings.commission_percentage },
        { key: 'consistent_daily_opening_balance_enabled', value: systemSettings.consistent_daily_opening_balance_enabled },
        { key: 'consistent_daily_opening_balance_amount', value: systemSettings.consistent_daily_opening_balance_amount },
      ];
      
      for (const setting of settingsToUpdate) {
        await api.put('/api/settings', setting);
      }
      setSystemSaved(true);
      setTimeout(() => setSystemSaved(false), 3000);
    } catch (error: any) {
      alert(error.response?.data?.error || 'Failed to save system settings');
    }
  };


  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="text-gray-600 mt-1">Manage system settings and preferences</p>
      </div>

      {/* System Settings (Admin Only) */}
      {user?.role === 'ADMIN' && (
        <div className="bg-white rounded-lg shadow p-6 space-y-6">
          <div className="flex items-center mb-4">
            <DollarSign className="h-5 w-5 mr-2 text-gray-600" />
            <h2 className="text-lg font-semibold">System Settings</h2>
          </div>

          {systemSaved && (
            <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg">
              System settings saved successfully!
            </div>
          )}

          {/* VAT Setting */}
          <div className="border-b border-gray-200 pb-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <label className="text-sm font-medium text-gray-900">
                  7.5% VAT (Value Added Tax)
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  Enable VAT on sales. VAT is a liability that must be remitted to the government.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={systemSettings.vat_enabled === 'true'}
                  onChange={(e) =>
                    setSystemSettings({
                      ...systemSettings,
                      vat_enabled: e.target.checked ? 'true' : 'false',
                      tot_enabled: e.target.checked ? 'false' : systemSettings.tot_enabled, // Disable TOT if VAT enabled
                    })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>
          </div>

          {/* TOT Setting */}
          <div className="border-b border-gray-200 pb-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <label className="text-sm font-medium text-gray-900">
                  3% TOT (Turnover Tax)
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  Enable TOT on sales (only if VAT is disabled). TOT is a tax on turnover.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={systemSettings.tot_enabled === 'true'}
                  disabled={systemSettings.vat_enabled === 'true'}
                  onChange={(e) =>
                    setSystemSettings({
                      ...systemSettings,
                      tot_enabled: e.target.checked ? 'true' : 'false',
                    })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600 peer-disabled:opacity-50"></div>
              </label>
            </div>
          </div>

          {/* Commission Setting */}
          <div className="border-b border-gray-200 pb-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <label className="text-sm font-medium text-gray-900">
                  Sales Commission
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  Enable commission for salespeople. Commission is automatically recorded as an expense.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={systemSettings.commission_enabled === 'true'}
                  onChange={(e) =>
                    setSystemSettings({
                      ...systemSettings,
                      commission_enabled: e.target.checked ? 'true' : 'false',
                    })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>
            {systemSettings.commission_enabled === 'true' && (
              <div className="mt-4 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Default Commission Percentage (%)
                  </label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      min="0"
                      max="100"
                      step="0.1"
                      value={systemSettings.commission_percentage && systemSettings.commission_percentage !== '0' ? systemSettings.commission_percentage : ''}
                      onChange={(e) =>
                        setSystemSettings({
                          ...systemSettings,
                          commission_percentage: e.target.value,
                        })
                      }
                      className="w-32 px-3 py-2 border border-gray-300 rounded-lg"
                      placeholder="Enter %"
                    />
                    <Percent className="h-5 w-5 text-gray-500" />
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Default commission for all salespeople (can be overridden individually below)
                  </p>
                </div>

                {/* Individual Salesperson Commissions */}
                <div className="mt-6 pt-4 border-t border-gray-200">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Individual Salesperson Commissions</h3>
                  {salespeople.length === 0 ? (
                    <p className="text-sm text-gray-500">No salespeople found</p>
                  ) : (
                    <div className="space-y-3">
                      {salespeople.map((sp) => {
                        const commission = salespersonCommissions.find(sc => sc.salespersonId === sp.id);
                        return (
                          <div key={sp.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                            <div className="flex-1">
                              <p className="text-sm font-medium text-gray-900">{sp.name}</p>
                              <p className="text-xs text-gray-500">{sp.email}</p>
                            </div>
                            <div className="flex items-center space-x-2">
                              <input
                                type="number"
                                min="0"
                                max="100"
                                step="0.1"
                                value={(commission?.commissionPercentage || systemSettings.commission_percentage) && (commission?.commissionPercentage || systemSettings.commission_percentage) !== '0' ? (commission?.commissionPercentage || systemSettings.commission_percentage) : ''}
                                onChange={(e) => updateSalespersonCommission(sp.id, e.target.value)}
                                className="w-24 px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                placeholder="Enter %"
                              />
                              <span className="text-sm text-gray-500">%</span>
                            </div>
                          </div>
                        );
                      })}
                      <button
                        onClick={saveSalespersonCommissions}
                        className="w-full mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                      >
                        Save Individual Commissions
                      </button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Consistent Daily Opening Balance Setting */}
          <div className="border-b border-gray-200 pb-4">
            <div className="flex items-center justify-between mb-2">
              <div>
                <label className="text-sm font-medium text-gray-900">
                  Consistent Daily Opening Balance
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  If enabled, every day will start with this fixed opening balance (from today forward). You can still override for specific days.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={systemSettings.consistent_daily_opening_balance_enabled === 'true'}
                  onChange={(e) =>
                    setSystemSettings({
                      ...systemSettings,
                      consistent_daily_opening_balance_enabled: e.target.checked ? 'true' : 'false',
                    })
                  }
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>
            {systemSettings.consistent_daily_opening_balance_enabled === 'true' && (
              <div className="mt-3">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Daily Opening Balance Amount
                </label>
                <div className="flex items-center space-x-2">
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={systemSettings.consistent_daily_opening_balance_amount && systemSettings.consistent_daily_opening_balance_amount !== '0' && systemSettings.consistent_daily_opening_balance_amount !== '0.00' ? systemSettings.consistent_daily_opening_balance_amount : ''}
                    onChange={(e) =>
                      setSystemSettings({
                        ...systemSettings,
                        consistent_daily_opening_balance_amount: e.target.value,
                      })
                    }
                    className="w-32 px-3 py-2 border border-gray-300 rounded-lg"
                    placeholder="Enter amount"
                  />
                  <DollarSign className="h-5 w-5 text-gray-500" />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  This amount will be used as opening balance for all future days (until disabled)
                </p>
              </div>
            )}
          </div>

          {/* Save System Settings Button */}
          <div className="pt-4 border-t border-gray-200">
            <button
              onClick={handleSaveSystemSettings}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700"
            >
              Save System Settings
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

