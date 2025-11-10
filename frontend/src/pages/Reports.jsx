import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import Layout from '../components/Layout/Layout.jsx';
import { reportService } from '../services/reportService.js';
import { 
  Download, 
  Filter, 
  Package, 
  Calendar, 
  Folder,
  DollarSign,
  TrendingUp,
  BarChart3
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';

const Reports = () => {
  const { isAdmin } = useAuth();
  const [activeReport, setActiveReport] = useState('sales-by-item');
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState(null);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    category: '',
    groupBy: 'day'
  });

  const reportTypes = [
    { id: 'sales-by-item', name: 'Sales by Item', icon: Package },
    { id: 'sales-by-date', name: 'Sales by Date', icon: Calendar },
    { id: 'sales-by-category', name: 'Sales by Category', icon: Folder }
  ];

  const generateReport = async () => {
    if (!isAdmin) {
      alert('Only administrators can generate reports');
      return;
    }

    setLoading(true);
    try {
      let data;
      const params = {};

      // Add filters to params
      if (filters.startDate) params.startDate = filters.startDate;
      if (filters.endDate) params.endDate = filters.endDate;
      if (filters.category) params.category = filters.category;
      if (filters.groupBy) params.groupBy = filters.groupBy;

      switch (activeReport) {
        case 'sales-by-item':
          data = await reportService.getSalesByItem(params);
          break;
        case 'sales-by-date':
          data = await reportService.getSalesByDate(params);
          break;
        case 'sales-by-category':
          data = await reportService.getSalesByCategory(params);
          break;
        default:
          throw new Error('Invalid report type');
      }

      setReportData(data);
    } catch (error) {
      console.error('Error generating report:', error);
      alert('Failed to generate report: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const exportToExcel = () => {
    if (!reportData) return;

    let worksheet;
    let fileName = '';

    switch (activeReport) {
      case 'sales-by-item':
        worksheet = XLSX.utils.json_to_sheet(reportData.salesByItem);
        fileName = 'sales_by_item_report.xlsx';
        break;
      case 'sales-by-date':
        worksheet = XLSX.utils.json_to_sheet(reportData.salesByDate);
        fileName = 'sales_by_date_report.xlsx';
        break;
      case 'sales-by-category':
        worksheet = XLSX.utils.json_to_sheet(reportData.salesByCategory);
        fileName = 'sales_by_category_report.xlsx';
        break;
      default:
        return;
    }

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Report');

    // Add summary sheet
    const summarySheet = XLSX.utils.json_to_sheet([reportData.summary]);
    XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    const data = new Blob([excelBuffer], { type: 'application/octet-stream' });
    saveAs(data, fileName);
  };

  const renderReportTable = () => {
  if (!reportData) return null;

  switch (activeReport) {
    case 'sales-by-item':
      return (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Item Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity Sold</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Revenue</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sale Count</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avg Price</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reportData.salesByItem.map((item, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">{item.itemName}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{item.categoryName || 'Uncategorized'}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{item.totalQuantity}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-green-600">${item.totalRevenue?.toFixed(2)}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{item.saleCount}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">${item.averagePrice?.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    case 'sales-by-date':
      return (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Period</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity Sold</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Revenue</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Transactions</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Avg Sale Value</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reportData.salesByDate.map((period, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">{period.periodLabel}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{period.totalSales}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-green-600">${period.totalRevenue?.toFixed(2)}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{period.transactionCount}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">${period.averageSaleValue?.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    case 'sales-by-category':
      return (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items Count</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantity Sold</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Revenue</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sale Count</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue %</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {reportData.salesByCategory.map((category, index) => (
                <tr key={index} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm text-gray-900">{category.categoryName}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{category.itemCount}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{category.totalQuantity}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-green-600">${category.totalRevenue?.toFixed(2)}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{category.saleCount}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{category.revenuePercentage?.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );

    default:
      return null;
  }
};

  const renderSummary = () => {
    if (!reportData || !reportData.summary) return null;

    const summary = reportData.summary;
    
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-6">
        <h3 className="text-lg font-semibold text-amber-800 mb-4">Report Summary</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {Object.entries(summary).map(([key, value]) => (
            <div key={key} className="text-center">
              <div className="text-2xl font-bold text-amber-600">
                {typeof value === 'number' ? value.toLocaleString() : value}
              </div>
              <div className="text-sm text-amber-700 capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  if (!isAdmin) {
    return (
      <Layout>
        <div className="text-center py-12">
          <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900">Access Denied</h2>
          <p className="text-gray-600 mt-2">Only administrators can access reports.</p>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Sales Reports</h1>
            <p className="text-gray-600">Generate and analyze sales reports</p>
          </div>
          {reportData && (
            <button
              onClick={exportToExcel}
              className="flex items-center bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors gap-2"
            >
              <Download className="w-4 h-4" />
              Export Excel
            </button>
          )}
        </div>

        {/* Report Type Selector */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Select Report Type</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {reportTypes.map((report) => {
              const Icon = report.icon;
              const isActive = activeReport === report.id;
              
              return (
                <button
                  key={report.id}
                  onClick={() => setActiveReport(report.id)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    isActive
                      ? 'border-amber-500 bg-amber-50'
                      : 'border-gray-200 hover:border-amber-300'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <Icon className={`w-5 h-5 ${isActive ? 'text-amber-600' : 'text-gray-400'}`} />
                    <span className={`font-medium ${isActive ? 'text-amber-800' : 'text-gray-700'}`}>
                      {report.name}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white p-6 rounded-lg shadow border">
          <div className="flex items-center gap-2 mb-4">
            <Filter className="w-5 h-5 text-gray-400" />
            <h3 className="text-lg font-semibold text-gray-800">Report Filters</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input
                type="date"
                value={filters.startDate}
                onChange={(e) => setFilters({ ...filters, startDate: e.target.value })}
                className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={filters.endDate}
                onChange={(e) => setFilters({ ...filters, endDate: e.target.value })}
                className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            {activeReport === 'sales-by-date' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Group By</label>
                <select
                  value={filters.groupBy}
                  onChange={(e) => setFilters({ ...filters, groupBy: e.target.value })}
                  className="w-full border border-gray-300 rounded-md p-2 focus:outline-none focus:ring-2 focus:ring-amber-500"
                >
                  <option value="day">Daily</option>
                  <option value="week">Weekly</option>
                  <option value="month">Monthly</option>
                </select>
              </div>
            )}

            <div className="flex items-end">
              <button
                onClick={generateReport}
                disabled={loading}
                className="w-full bg-amber-600 text-white py-2 rounded-lg hover:bg-amber-700 disabled:bg-gray-400 transition-colors flex items-center justify-center gap-2"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Generating...
                  </>
                ) : (
                  <>
                    <TrendingUp className="w-4 h-4" />
                    Generate Report
                  </>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Report Results */}
        {reportData && (
          <div className="bg-white p-6 rounded-lg shadow border">
            {/* Filters Applied */}
            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
              <h4 className="text-sm font-medium text-gray-700 mb-2">Filters Applied:</h4>
              <div className="flex flex-wrap gap-2">
                {Object.entries(reportData.filters).map(([key, value]) => (
                  <span key={key} className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
                    {key}: {value}
                  </span>
                ))}
              </div>
            </div>

            {/* Summary */}
            {renderSummary()}

            {/* Report Table */}
            <div className="overflow-hidden">
              {renderReportTable()}
            </div>

            {(!reportData.salesByItem?.length && 
              !reportData.salesByDate?.length && 
              !reportData.salesByCategory?.length) && (
              <div className="text-center py-12">
                <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">No data found for the selected filters.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </Layout>
  );
};

export default Reports;