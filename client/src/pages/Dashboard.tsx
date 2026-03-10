import React, { useState } from 'react';
import { useAnalysis } from '@/hooks/use-analysis';
import { StatCard } from '@/components/StatCard';
import { MapComponent } from '@/components/MapComponent';
import { ThreeDTerrain } from '@/components/ThreeDTerrain';
import { DataVisualization3D } from '@/components/DataVisualization3D';
import { ThreeDComparison } from '@/components/ThreeDComparison';
import { ComparisonSlider } from '@/components/ComparisonSlider';
import { PixelGrid } from '@/components/PixelGrid';
import { generateForestWatchReport } from '@/lib/pdfGenerator';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Area, AreaChart
} from 'recharts';
import { 
  TreePine, Building2, Map, AlertTriangle, Layers, Activity, Loader2, ArrowRight, Download, BarChart3
} from 'lucide-react';

export default function Dashboard() {
  const { data, runAnalysis, isRunning } = useAnalysis();
  const [activeTab, setActiveTab] = useState<'overview' | 'details' | 'compare' | 'charts'>('overview');
  const [startYear, setStartYear] = useState(2000);
  const [endYear, setEndYear] = useState(2026);

  const handleRunAnalysis = (e: React.FormEvent) => {
    e.preventDefault();
    runAnalysis({ startYear, endYear });
  };

  const handleDownloadReport = () => {
    generateForestWatchReport(data, startYear, endYear);
  };

  // Format data for Recharts
  const chartData = [
    { name: 'Water', [startYear]: data.landCover.year1.water, [endYear]: data.landCover.year2.water },
    { name: 'Vegetation', [startYear]: data.landCover.year1.vegetation, [endYear]: data.landCover.year2.vegetation },
    { name: 'Built-up', [startYear]: data.landCover.year1.builtUp, [endYear]: data.landCover.year2.builtUp },
    { name: 'Barren', [startYear]: data.landCover.year1.barren, [endYear]: data.landCover.year2.barren },
  ];

  // Pie chart data for land distribution
  const pieDataYear1 = [
    { name: 'Water', value: data.landCover.year1.water, color: '#3B82F6' },
    { name: 'Vegetation', value: data.landCover.year1.vegetation, color: '#10B981' },
    { name: 'Built-up', value: data.landCover.year1.builtUp, color: '#8B5CF6' },
    { name: 'Barren', value: data.landCover.year1.barren, color: '#F59E0B' },
  ];

  const pieDataYear2 = [
    { name: 'Water', value: data.landCover.year2.water, color: '#3B82F6' },
    { name: 'Vegetation', value: data.landCover.year2.vegetation, color: '#10B981' },
    { name: 'Built-up', value: data.landCover.year2.builtUp, color: '#8B5CF6' },
    { name: 'Barren', value: data.landCover.year2.barren, color: '#F59E0B' },
  ];

  // Indices trend data
  const indicesData = [
    { 
      metric: 'NDVI', 
      [startYear]: data.indices.ndvi.year1, 
      [endYear]: data.indices.ndvi.year2,
      change: data.indices.ndvi.change 
    },
    { 
      metric: 'NDBI', 
      [startYear]: data.indices.ndbi.year1, 
      [endYear]: data.indices.ndbi.year2,
      change: data.indices.ndbi.change 
    },
  ];

  // Hotspot data for charts
  const hotspotChartData = data.deforestation.hotspots.slice(0, 5).map((spot, idx) => ({
    name: spot.area || `Location ${idx + 1}`,
    area: (spot.pixels * 100) / 1000, // in thousands of m²
    lat: spot.location[0],
    long: spot.location[1],
  }));

  // Urban zones chart data
  const urbanZonesData = data.urbanExpansion.zones.slice(0, 5).map((zone, idx) => ({
    name: `Zone ${idx + 1}`,
    area: (zone.pixels * 100) / 1000, // in thousands of m²
    lat: zone.location[0],
    long: zone.location[1],
  }));

  // Change summary data for area chart
  const changeSummaryData = [
    { category: 'Initial State', vegetation: data.landCover.year1.vegetation, builtUp: data.landCover.year1.builtUp },
    { category: 'Final State', vegetation: data.landCover.year2.vegetation, builtUp: data.landCover.year2.builtUp },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-[#f8fafc]">
      {/* Header */}
      <header className="bg-[hsl(222,47%,14%)] text-white px-6 py-4 shadow-md z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500/20 p-2 rounded-lg">
              <Map className="text-blue-400" size={24} />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-wide">SENTINEL-2 LAND CHANGE MAPPING SYSTEM</h1>
              <p className="text-blue-300 text-sm font-medium">Tamil Nadu Region Analysis</p>
            </div>
          </div>
          <div className="flex gap-4 text-sm font-mono text-slate-300">
            <div className="bg-slate-800/50 px-3 py-1.5 rounded-md border border-slate-700">Status: <span className="text-green-400">Online</span></div>
            <div className="bg-slate-800/50 px-3 py-1.5 rounded-md border border-slate-700">Resolution: 10m/px</div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-6 flex flex-col gap-6">
        
        {/* Top Control Bar */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-2 rounded-xl shadow-sm border border-slate-200">
          {/* Tabs */}
          <div className="flex p-1 bg-slate-100 rounded-lg">
            {[
              { id: 'overview', label: 'Overview & Map', icon: Map },
              { id: 'details', label: 'Deforestation & Urban', icon: TreePine },
              { id: 'compare', label: 'Before/After Comparison', icon: Layers },
              { id: 'charts', label: 'Charts & Graphs', icon: BarChart3 }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-md transition-all duration-200 ${
                  activeTab === tab.id 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-slate-500 hover:text-slate-800 hover:bg-slate-200/50'
                }`}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleRunAnalysis} className="flex items-center gap-3 px-2">
            <div className="flex items-center gap-2">
              <label className="text-sm font-medium text-slate-600">Period:</label>
              <select 
                value={startYear} 
                onChange={e => setStartYear(Number(e.target.value))}
                className="bg-slate-50 border border-slate-200 text-sm rounded-md px-2 py-1.5 focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value={2000}>2000</option>
                <option value={2005}>2005</option>
                <option value={2010}>2010</option>
                <option value={2015}>2015</option>
                <option value={2020}>2020</option>
              </select>
              <ArrowRight size={14} className="text-slate-400" />
              <select 
                value={endYear} 
                onChange={e => setEndYear(Number(e.target.value))}
                className="bg-slate-50 border border-slate-200 text-sm rounded-md px-2 py-1.5 focus:ring-2 focus:ring-blue-500 outline-none"
              >
                <option value={2020}>2020</option>
                <option value={2022}>2022</option>
                <option value={2024}>2024</option>
                <option value={2025}>2025</option>
                <option value={2026}>2026</option>
              </select>
            </div>
            <button 
              type="submit" 
              disabled={isRunning}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-md text-sm font-medium transition-colors shadow-sm flex items-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {isRunning ? <Loader2 size={16} className="animate-spin" /> : <Activity size={16} />}
              {isRunning ? 'Analyzing...' : 'Run Analysis'}
            </button>
            <button 
              type="button" 
              onClick={handleDownloadReport}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-1.5 rounded-md text-sm font-medium transition-colors shadow-sm flex items-center gap-2"
            >
              <Download size={16} />
              Download Report
            </button>
          </form>
        </div>

        {/* Dynamic Content based on Tab */}
        <div className="flex-1 w-full relative">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <>
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              {/* Left Column: Map & 3D */}
              <div className="lg:col-span-8 flex flex-col gap-6">
                <div className="dashboard-card p-1 h-[400px]">
                  <MapComponent data={data} />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[250px]">
                  <div className="dashboard-card p-0 overflow-hidden">
                     <ThreeDTerrain />
                  </div>
                  <div className="dashboard-card p-0 overflow-hidden">
                    <DataVisualization3D
                      vegetationLoss={data.visualChange.vegetationLoss}
                      urbanExpansion={data.visualChange.urbanExpansion}
                      waterToBarren={data.changeSummary.waterToBarren}
                      totalChange={data.changeSummary.totalChanged}
                    />
                  </div>
                </div>
              </div>

              {/* Right Column: Stats */}
              <div className="lg:col-span-4 flex flex-col gap-4">
                <StatCard 
                  title="Overall Risk Score" 
                  value={data.risk.score} 
                  subtitle={`/ 100 (${data.risk.level})`}
                  icon={AlertTriangle}
                  colorTheme={data.risk.score > 70 ? 'red' : 'default'}
                />
                <StatCard 
                  title="Vegetation Loss" 
                  value={`${data.visualChange.vegetationLoss}%`} 
                  subtitle={`(${data.visualChange.vegetationLossPixels} px)`}
                  icon={TreePine}
                  colorTheme="red"
                  trend="up"
                  trendValue="2.4%"
                />
                <StatCard 
                  title="Urban Expansion" 
                  value={`${data.visualChange.urbanExpansion}%`} 
                  subtitle={`(${data.visualChange.urbanExpansionPixels} px)`}
                  icon={Building2}
                  colorTheme="purple"
                  trend="up"
                  trendValue="1.2%"
                />
                
                {/* Detailed Summary Card */}
                <div className="dashboard-card p-5 mt-auto bg-gradient-to-br from-slate-50 to-slate-100">
                  <h3 className="text-sm font-bold text-slate-700 mb-3 border-b pb-2">Change Transitions</h3>
                  <ul className="space-y-3 text-sm">
                    <li className="flex justify-between items-center">
                      <span className="text-slate-600">Vegetation → Built-up</span>
                      <span className="font-mono font-bold text-purple-600">{data.changeSummary.vegetationToBuiltUp}%</span>
                    </li>
                    <li className="flex justify-between items-center">
                      <span className="text-slate-600">Vegetation → Barren</span>
                      <span className="font-mono font-bold text-red-600">{data.changeSummary.vegetationToBarren}%</span>
                    </li>
                    <li className="flex justify-between items-center">
                      <span className="text-slate-600">Water → Barren</span>
                      <span className="font-mono font-bold text-amber-600">{data.changeSummary.waterToBarren}%</span>
                    </li>
                    <li className="flex justify-between items-center pt-2 border-t mt-2">
                      <span className="font-semibold text-slate-800">Total Changed Area</span>
                      <span className="font-mono font-bold text-slate-800">{data.changeSummary.totalChanged}%</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
            
            {/* Additional Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
              {/* Land Cover Bar Chart */}
              <div className="dashboard-card p-6">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Land Cover Comparison</h3>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                    <YAxis stroke="#64748b" fontSize={12} label={{ value: 'Percentage (%)', angle: -90, position: 'insideLeft', style: { fontSize: 12 } }} />
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: 'white' }}
                      labelStyle={{ color: 'white', fontWeight: 'bold' }}
                    />
                    <Legend />
                    <Bar dataKey={startYear} fill="#3B82F6" radius={[8, 8, 0, 0]} />
                    <Bar dataKey={endYear} fill="#8B5CF6" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Pie Charts for Land Distribution */}
              <div className="dashboard-card p-6">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Land Distribution</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-center font-semibold text-sm text-slate-600 mb-2">{startYear}</p>
                    <ResponsiveContainer width="100%" height={180}>
                      <PieChart>
                        <Pie
                          data={pieDataYear1}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={70}
                          paddingAngle={2}
                          dataKey="value"
                          label={({ name, value }) => `${value.toFixed(1)}%`}
                          labelLine={false}
                        >
                          {pieDataYear1.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <RechartsTooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div>
                    <p className="text-center font-semibold text-sm text-slate-600 mb-2">{endYear}</p>
                    <ResponsiveContainer width="100%" height={180}>
                      <PieChart>
                        <Pie
                          data={pieDataYear2}
                          cx="50%"
                          cy="50%"
                          innerRadius={40}
                          outerRadius={70}
                          paddingAngle={2}
                          dataKey="value"
                          label={({ name, value }) => `${value.toFixed(1)}%`}
                          labelLine={false}
                        >
                          {pieDataYear2.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <RechartsTooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {pieDataYear1.map((item) => (
                    <div key={item.name} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                      <span className="text-xs text-slate-600">{item.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* AI Prediction Section */}
            {data.prediction && (
              <div className="mt-6">
                <div className="flex items-center gap-3 border-b-2 border-blue-500 pb-2 mb-6">
                  <Activity className="text-blue-500" />
                  <h2 className="text-xl font-bold text-slate-800">AI-Powered Predictions for {data.prediction.projectedYear}</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <div className="dashboard-card p-5 bg-gradient-to-br from-red-50 to-red-100 border-l-4 border-red-500">
                    <div className="flex items-center gap-2 mb-2">
                      <TreePine size={18} className="text-red-600" />
                      <h3 className="text-xs font-semibold text-red-800 uppercase tracking-wide">Predicted Vegetation Loss</h3>
                    </div>
                    <p className="text-3xl font-bold text-red-700">{data.prediction.nextYearVegetationLoss}%</p>
                    <p className="text-xs text-red-600 mt-1">Next year projection</p>
                  </div>
                  
                  <div className="dashboard-card p-5 bg-gradient-to-br from-purple-50 to-purple-100 border-l-4 border-purple-500">
                    <div className="flex items-center gap-2 mb-2">
                      <Building2 size={18} className="text-purple-600" />
                      <h3 className="text-xs font-semibold text-purple-800 uppercase tracking-wide">Predicted Urban Growth</h3>
                    </div>
                    <p className="text-3xl font-bold text-purple-700">{data.prediction.nextYearUrbanGrowth}%</p>
                    <p className="text-xs text-purple-600 mt-1">Next year projection</p>
                  </div>
                  
                  <div className={`dashboard-card p-5 bg-gradient-to-br ${data.prediction.predictedRiskScore > 70 ? 'from-red-50 to-orange-100 border-red-500' : 'from-yellow-50 to-yellow-100 border-yellow-500'} border-l-4`}>
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle size={18} className={data.prediction.predictedRiskScore > 70 ? 'text-red-600' : 'text-yellow-600'} />
                      <h3 className={`text-xs font-semibold uppercase tracking-wide ${data.prediction.predictedRiskScore > 70 ? 'text-red-800' : 'text-yellow-800'}`}>Predicted Risk Score</h3>
                    </div>
                    <p className={`text-3xl font-bold ${data.prediction.predictedRiskScore > 70 ? 'text-red-700' : 'text-yellow-700'}`}>{data.prediction.predictedRiskScore}</p>
                    <p className={`text-xs mt-1 ${data.prediction.predictedRiskScore > 70 ? 'text-red-600' : 'text-yellow-600'}`}>/ 100</p>
                  </div>
                  
                  <div className="dashboard-card p-5 bg-gradient-to-br from-blue-50 to-indigo-100 border-l-4 border-blue-500">
                    <div className="flex items-center gap-2 mb-2">
                      <Activity size={18} className="text-blue-600" />
                      <h3 className="text-xs font-semibold text-blue-800 uppercase tracking-wide">Model Confidence</h3>
                    </div>
                    <p className="text-3xl font-bold text-blue-700">{(data.prediction.confidence * 100).toFixed(0)}%</p>
                    <p className="text-xs text-blue-600 mt-1">Prediction accuracy</p>
                  </div>
                </div>
                
                <div className="dashboard-card p-6 bg-gradient-to-br from-slate-50 to-blue-50 border-l-4 border-blue-600">
                  <h3 className="text-sm font-bold text-slate-800 mb-3 flex items-center gap-2">
                    <AlertTriangle size={16} className="text-blue-600" />
                    AI Recommendation
                  </h3>
                  <p className="text-slate-700 leading-relaxed">{data.prediction.recommendation}</p>
                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <p className="text-xs text-slate-600">
                      <span className="font-semibold">Model:</span> Random Forest Regression | 
                      <span className="font-semibold ml-2">Training Period:</span> {startYear}-{endYear} | 
                      <span className="font-semibold ml-2">Confidence Level:</span> {(data.prediction.confidence * 100).toFixed(1)}%
                    </p>
                  </div>
                </div>
              </div>
            )}
            </>
          )}

          {/* TAB 2: DEFORESTATION & URBAN EXPANSION */}
          {activeTab === 'details' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              {/* Deforestation Side */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b-2 border-red-500 pb-2">
                  <TreePine className="text-red-500" />
                  <h2 className="text-xl font-bold text-slate-800">Deforestation Analysis</h2>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <StatCard title="Area Lost" value={`${data.deforestation.areaLost}%`} colorTheme="red" />
                  <StatCard title="Hotspots Detected" value={data.deforestation.hotspotsFound} colorTheme="red" />
                </div>

                <div className="dashboard-card p-0 overflow-hidden">
                  <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
                    <h3 className="font-semibold text-slate-700">Top Hotspots</h3>
                  </div>
                  <ul className="divide-y divide-slate-100">
                    {data.deforestation.hotspots.map(spot => (
                      <li key={spot.id} className="p-4 hover:bg-slate-50 transition-colors flex justify-between items-center">
                        <div>
                          <p className="font-bold text-slate-800">{spot.area}</p>
                          <p className="text-xs text-slate-500 font-mono mt-0.5">Loc: [{spot.location.join(', ')}]</p>
                        </div>
                        <div className="text-right">
                          <span className="block font-mono font-bold text-red-600">{spot.pixels}</span>
                          <span className="text-xs text-slate-400">pixels</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
                
                {/* Hotspots Bar Chart */}
                <div className="dashboard-card p-4">
                  <h3 className="font-semibold text-slate-700 mb-4">Hotspot Areas (sq. meters in thousands)</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={hotspotChartData} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" stroke="#fee2e2" />
                      <XAxis type="number" stroke="#991b1b" fontSize={11} />
                      <YAxis type="category" dataKey="name" stroke="#991b1b" fontSize={11} width={80} />
                      <RechartsTooltip 
                        contentStyle={{ backgroundColor: '#7f1d1d', border: 'none', borderRadius: '6px', color: 'white' }}
                        formatter={(value: any, name: any, props: any) => [
                          `${value.toFixed(1)} thousand m²`,
                          `Location: ${props.payload.lat}°N, ${props.payload.long}°E`
                        ]}
                      />
                      <Bar dataKey="area" fill="#DC2626" radius={[0, 8, 8,0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Urban Expansion Side */}
              <div className="space-y-6">
                <div className="flex items-center gap-3 border-b-2 border-purple-500 pb-2">
                  <Building2 className="text-purple-500" />
                  <h2 className="text-xl font-bold text-slate-800">Urban Expansion Analysis</h2>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <StatCard title="Growth Rate" value={`${data.urbanExpansion.urbanGrowthRate}%`} colorTheme="purple" />
                  <StatCard title="Trees → Buildings" value={`${data.urbanExpansion.treesToBuildings}%`} colorTheme="purple" />
                </div>

                <div className="dashboard-card p-0 overflow-hidden">
                  <div className="bg-slate-50 px-4 py-3 border-b border-slate-200">
                    <h3 className="font-semibold text-slate-700">Major Expansion Zones</h3>
                  </div>
                  <ul className="divide-y divide-slate-100">
                    {data.urbanExpansion.zones.map(zone => (
                      <li key={zone.id} className="p-4 hover:bg-slate-50 transition-colors flex justify-between items-center">
                        <div>
                          <p className="font-bold text-slate-800">{zone.area}</p>
                          <p className="text-xs text-slate-500 font-mono mt-0.5">Loc: [{zone.location.join(', ')}]</p>
                        </div>
                        <div className="text-right">
                          <span className="block font-mono font-bold text-purple-600">{zone.pixels}</span>
                          <span className="text-xs text-slate-400">pixels</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
                
                {/* Urban Zones Bar Chart */}
                <div className="dashboard-card p-4">
                  <h3 className="font-semibold text-slate-700 mb-4">Expansion Zones (sq. meters in thousands)</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <BarChart data={urbanZonesData} layout="horizontal">
                      <CartesianGrid strokeDasharray="3 3" stroke="#f3e8ff" />
                      <XAxis type="number" stroke="#6b21a8" fontSize={11} />
                      <YAxis type="category" dataKey="name" stroke="#6b21a8" fontSize={11} width={80} />
                      <RechartsTooltip 
                        contentStyle={{ backgroundColor: '#581c87', border: 'none', borderRadius: '6px', color: 'white' }}
                        formatter={(value: any, name: any, props: any) => [
                          `${value.toFixed(1)} thousand m²`,
                          `Location: ${props.payload.lat}°N, ${props.payload.long}°E`
                        ]}
                      />
                      <Bar dataKey="area" fill="#8B5CF6" radius={[0, 8, 8, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
                
                {/* Indices Table */}
                <div className="dashboard-card p-4 bg-slate-800 text-white border-slate-700">
                  <h3 className="text-sm font-bold text-slate-300 mb-3 uppercase tracking-wider">Sentinel-2 Indices</h3>
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-600 text-left text-slate-400">
                        <th className="pb-2 font-medium">Index</th>
                        <th className="pb-2 font-medium">{startYear}</th>
                        <th className="pb-2 font-medium">{endYear}</th>
                        <th className="pb-2 font-medium text-right">Change</th>
                      </tr>
                    </thead>
                    <tbody className="font-mono">
                      <tr className="border-b border-slate-700">
                        <td className="py-3 font-sans font-medium text-green-400">NDVI (Vegetation)</td>
                        <td className="py-3">{data.indices.ndvi.year1.toFixed(2)}</td>
                        <td className="py-3">{data.indices.ndvi.year2.toFixed(2)}</td>
                        <td className="py-3 text-right text-red-400">{data.indices.ndvi.change > 0 ? '+' : ''}{data.indices.ndvi.change.toFixed(2)}</td>
                      </tr>
                      <tr>
                        <td className="py-3 font-sans font-medium text-purple-400">NDBI (Built-up)</td>
                        <td className="py-3">{data.indices.ndbi.year1.toFixed(2)}</td>
                        <td className="py-3">{data.indices.ndbi.year2.toFixed(2)}</td>
                        <td className="py-3 text-right text-purple-400">{data.indices.ndbi.change > 0 ? '+' : ''}{data.indices.ndbi.change.toFixed(2)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
                
                {/* Vegetation vs Built-up Trend */}
                <div className="dashboard-card p-4 col-span-2">
                  <h3 className="font-semibold text-slate-700 mb-4">Land Cover Transformation Trend</h3>
                  <ResponsiveContainer width="100%" height={200}>
                    <AreaChart data={changeSummaryData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category" stroke="#64748b" fontSize={11} />
                      <YAxis stroke="#64748b" fontSize={11} label={{ value: '%', angle: 0, position: 'insideLeft' }} />
                      <RechartsTooltip 
                        contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '6px', color: 'white' }}
                      />
                      <Legend />
                      <Area type="monotone" dataKey="vegetation" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.6} name="Vegetation" />
                      <Area type="monotone" dataKey="builtUp" stackId="1" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.6} name="Built-up" />
                    </AreaChart>
                  </ResponsiveContainer>
                  <div className="mt-3 p-3 bg-slate-50 rounded-lg">
                    <p className="text-xs text-slate-600">
                      <strong>Analysis:</strong> Vegetation decreased by <span className="text-red-600 font-semibold">{(data.landCover.year1.vegetation - data.landCover.year2.vegetation).toFixed(1)}%</span> while 
                      built-up areas increased by <span className="text-purple-600 font-semibold">{(data.landCover.year2.builtUp - data.landCover.year1.builtUp).toFixed(1)}%</span> during the analysis period.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: COMPARISON */}
          {activeTab === 'compare' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              {/* 3D Comparison View */}
              <div className="dashboard-card p-0 overflow-hidden h-[400px]">
                <ThreeDComparison
                  vegetationLoss={data.visualChange.vegetationLoss}
                  urbanExpansion={data.visualChange.urbanExpansion}
                  startYear={startYear}
                  endYear={endYear}
                />
              </div>
              
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              
              {/* Interactive Slider */}
              <div className="lg:col-span-8">
                <ComparisonSlider title="NDVI Interactive Comparison overlay" year1={startYear} year2={endYear} />
              </div>

              {/* NDBI Grids */}
              <div className="lg:col-span-4 flex flex-col gap-6">
                <div className="dashboard-card p-6 flex flex-col items-center justify-center flex-1">
                  <h3 className="text-lg font-bold text-slate-800 mb-6 w-full text-center border-b pb-2">NDBI Grid Comparison</h3>
                  <div className="flex gap-6 justify-center w-full">
                    <PixelGrid title={startYear.toString()} type="ndbi" score={data.indices.ndbi.year1} />
                    <div className="flex items-center text-slate-300">
                       <ArrowRight size={24} />
                    </div>
                    <PixelGrid title={endYear.toString()} type="ndbi" score={data.indices.ndbi.year2} />
                  </div>
                  <div className="mt-8 w-full bg-purple-50 p-4 rounded-lg border border-purple-100">
                    <p className="text-sm text-purple-800 text-center">
                      Visual representation of Normalized Difference Built-up Index transition. Darker purple indicates higher density of built structures.
                    </p>
                  </div>
                </div>
              </div>

            </div>
            
            {/* Indices Comparison Line Chart */}
            <div className="dashboard-card p-6">
              <h3 className="text-lg font-bold text-slate-800 mb-4">Satellite Indices Comparison</h3>
              <ResponsiveContainer width="100%" height={250}>
                <LineChart data={indicesData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="metric" stroke="#64748b" />
                  <YAxis stroke="#64748b" domain={[-0.5, 1]} label={{ value: 'Index Value', angle: -90, position: 'insideLeft' }} />
                  <RechartsTooltip 
                    contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '6px', color: 'white' }}
                  />
                  <Legend />
                  <Line type="monotone" dataKey={startYear} stroke="#3B82F6" strokeWidth={3} dot={{ r: 6 }} activeDot={{ r: 8 }} name={`${startYear} Value`} />
                  <Line type="monotone" dataKey={endYear} stroke="#F59E0B" strokeWidth={3} dot={{ r: 6 }} activeDot={{ r: 8 }} name={`${endYear} Value`} />
                </LineChart>
              </ResponsiveContainer>
              <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="p-3 bg-green-50 rounded-lg border border-green-200">
                  <p className="text-xs font-semibold text-green-800 mb-1">NDVI (Vegetation Health)</p>
                  <p className="text-lg font-bold text-green-900">{data.indices.ndvi.year1.toFixed(3)} → {data.indices.ndvi.year2.toFixed(3)}</p>
                  <p className="text-xs text-green-700 mt-1">
                    Change: <span className={data.indices.ndvi.change < 0 ? 'text-red-600' : 'text-green-600'}>{data.indices.ndvi.change.toFixed(3)}</span>
                  </p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                  <p className="text-xs font-semibold text-purple-800 mb-1">NDBI (Built-up Index)</p>
                  <p className="text-lg font-bold text-purple-900">{data.indices.ndbi.year1.toFixed(3)} → {data.indices.ndbi.year2.toFixed(3)}</p>
                  <p className="text-xs text-purple-700 mt-1">
                    Change: <span className={data.indices.ndbi.change > 0 ? 'text-purple-600' : 'text-green-600'}>{data.indices.ndbi.change > 0 ? '+' : ''}{data.indices.ndbi.change.toFixed(3)}</span>
                  </p>
                </div>
              </div>
            </div>
            </div>
          )}

          {/* TAB 4: CHARTS & GRAPHS - All Visualizations in One Place */}
          {activeTab === 'charts' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              {/* Introduction Section */}
              <div className="dashboard-card p-6 bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-blue-600">
                <h2 className="text-2xl font-bold text-slate-800 mb-2 flex items-center gap-2">
                  <BarChart3 className="text-blue-600" size={28} />
                  Data Visualizations - Easy to Understand Charts
                </h2>
                <p className="text-slate-600 leading-relaxed">
                  This page shows all our analysis results in visual charts and graphs. Each chart explains how the land has changed 
                  from {startYear} to {endYear}. You can easily see which areas lost forests, where cities expanded, and what the future predictions are.
                </p>
              </div>

              {/* Section 1: Land Cover Changes */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 border-b-2 border-green-500 pb-2">
                  <TreePine className="text-green-600" size={24} />
                  <h3 className="text-xl font-bold text-slate-800">1. Land Cover Changes Over Time</h3>
                </div>
                <p className="text-slate-600 text-sm px-4">
                  These charts show how different types of land (forests, buildings, water, barren land) changed between {startYear} and {endYear}.
                </p>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Bar Chart */}
                  <div className="dashboard-card p-6">
                    <h4 className="text-lg font-bold text-slate-800 mb-2">Land Type Comparison</h4>
                    <p className="text-xs text-slate-500 mb-4">Compare the percentage of each land type between two years</p>
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                        <YAxis stroke="#64748b" fontSize={12} label={{ value: 'Percentage (%)', angle: -90, position: 'insideLeft', style: { fontSize: 12 } }} />
                        <RechartsTooltip 
                          contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: 'white' }}
                          labelStyle={{ color: 'white', fontWeight: 'bold' }}
                        />
                        <Legend />
                        <Bar dataKey={startYear} fill="#3B82F6" radius={[8, 8, 0, 0]} name={`Year ${startYear}`} />
                        <Bar dataKey={endYear} fill="#8B5CF6" radius={[8, 8, 0, 0]} name={`Year ${endYear}`} />
                      </BarChart>
                    </ResponsiveContainer>
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                      <p className="text-xs text-blue-800">
                        📊 <strong>What this shows:</strong> Blue bars are {startYear}, purple bars are {endYear}. 
                        Shorter vegetation bars mean forest loss. Taller built-up bars mean city expansion.
                      </p>
                    </div>
                  </div>

                  {/* Pie Charts */}
                  <div className="dashboard-card p-6">
                    <h4 className="text-lg font-bold text-slate-800 mb-2">Land Distribution Breakdown</h4>
                    <p className="text-xs text-slate-500 mb-4">See the proportion of each land type as a circular chart</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-center font-semibold text-sm text-slate-600 mb-2">{startYear}</p>
                        <ResponsiveContainer width="100%" height={200}>
                          <PieChart>
                            <Pie
                              data={pieDataYear1}
                              cx="50%"
                              cy="50%"
                              innerRadius={30}
                              outerRadius={60}
                              paddingAngle={2}
                              dataKey="value"
                              label={({ value }) => `${value.toFixed(1)}%`}
                              labelLine={false}
                            >
                              {pieDataYear1.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <RechartsTooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                      <div>
                        <p className="text-center font-semibold text-sm text-slate-600 mb-2">{endYear}</p>
                        <ResponsiveContainer width="100%" height={200}>
                          <PieChart>
                            <Pie
                              data={pieDataYear2}
                              cx="50%"
                              cy="50%"
                              innerRadius={30}
                              outerRadius={60}
                              paddingAngle={2}
                              dataKey="value"
                              label={({ value }) => `${value.toFixed(1)}%`}
                              labelLine={false}
                            >
                              {pieDataYear2.map((entry, index) => (
                                <Cell key={`cell-${index}`} fill={entry.color} />
                              ))}
                            </Pie>
                            <RechartsTooltip />
                          </PieChart>
                        </ResponsiveContainer>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2 mt-3">
                      {pieDataYear1.map((item) => (
                        <div key={item.name} className="flex items-center gap-2">
                          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                          <span className="text-xs text-slate-600">{item.name}</span>
                        </div>
                      ))}
                    </div>
                    <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                      <p className="text-xs text-blue-800">
                        📊 <strong>What this shows:</strong> Each slice represents one type of land. 
                        Green is forests/vegetation, purple is buildings/cities. Compare how slices changed in size.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Area Chart for Transformation */}
                <div className="dashboard-card p-6">
                  <h4 className="text-lg font-bold text-slate-800 mb-2">Land Transformation Trend</h4>
                  <p className="text-xs text-slate-500 mb-4">Visual representation of how vegetation and built-up areas shifted over time</p>
                  <ResponsiveContainer width="100%" height={300}>
                    <AreaChart data={changeSummaryData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="category" stroke="#64748b" />
                      <YAxis stroke="#64748b" label={{ value: 'Percentage (%)', angle: -90, position: 'insideLeft' }} />
                      <RechartsTooltip 
                        contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '6px', color: 'white' }}
                      />
                      <Legend />
                      <Area type="monotone" dataKey="vegetation" stackId="1" stroke="#10B981" fill="#10B981" fillOpacity={0.6} name="Vegetation" />
                      <Area type="monotone" dataKey="builtUp" stackId="1" stroke="#8B5CF6" fill="#8B5CF6" fillOpacity={0.6} name="Built-up" />
                    </AreaChart>
                  </ResponsiveContainer>
                  <div className="mt-3 p-3 bg-green-50 rounded-lg">
                    <p className="text-xs text-green-800">
                      📊 <strong>What this shows:</strong> Vegetation decreased by <strong className="text-red-600">{data.visualChange.vegetationLoss.toFixed(1)}%</strong> while built-up areas increased by <strong className="text-purple-600">{data.visualChange.urbanExpansion.toFixed(1)}%</strong> during the analysis period.
                    </p>
                  </div>
                </div>
              </div>

              {/* Section 2: Problem Areas (Hotspots) */}
            {/*   <div className="space-y-4">
                <div className="flex items-center gap-3 border-b-2 border-red-500 pb-2">
                  <AlertTriangle className="text-red-600" size={24} />
                  <h3 className="text-xl font-bold text-slate-800">2. Where Are the Problems? (Deforestation Hotspots)</h3>
                </div>
                <p className="text-slate-600 text-sm px-4">
                  These charts show the specific locations in Tamil Nadu where forests are being cut down the most. 
                  Bigger bars = bigger problem areas.
                </p>

                <div className="dashboard-card p-6">
                  <h4 className="text-lg font-bold text-slate-800 mb-2">Top 5 Deforestation Problem Areas</h4>
                  <p className="text-xs text-slate-500 mb-4">Area shown in thousands of square meters (the bigger the bar, the more forest was lost)</p>
                  
                  <ResponsiveContainer width="100%" height={350}>
                    <BarChart 
                      data={hotspotChartData} 
                      layout="horizontal" 
                      margin={{ top: 5, right: 30, left: 150, bottom: 5 }}
                    >
                      <CartesianGrid strokeDasharray="3 3" stroke="#fee2e2" />
                      <XAxis 
                        type="number" 
                        stroke="#991b1b" 
                        fontSize={11}
                        domain={[0, 'dataMax']}
                      />
                      <YAxis 
                        type="category" 
                        dataKey="name" 
                        stroke="#991b1b" 
                        fontSize={9} 
                        width={145}
                        interval={0}
                      />
                      <RechartsTooltip 
                        contentStyle={{ backgroundColor: '#7f1d1d', border: 'none', borderRadius: '6px', color: 'white' }}
                        formatter={(value: any, name: any, props: any) => {
                          return [
                            `Area: ${Number(value).toFixed(1)} thousand m² (${(Number(value) * 1000).toLocaleString()} square meters)`,
                            `Location: ${props.payload.lat}°N, ${props.payload.long}°E`
                          ];
                        }}
                      />
                      <Bar dataKey="area" fill="#DC2626" radius={[0, 8, 8, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="mt-3 p-3 bg-red-50 rounded-lg">
                    <p className="text-xs text-red-800">
                      📊 <strong>What this shows:</strong> The longer the red bar, the more forest area was lost in that location. 
                      Total of <strong>{data.deforestation.hotspotsFound} hotspots</strong> were detected across Tamil Nadu.
                    </p>
                  </div>
                </div>
              </div> */}

              {/* Section 3: City Expansion Areas */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 border-b-2 border-purple-500 pb-2">
                  <Building2 className="text-purple-600" size={24} />
                  <h3 className="text-xl font-bold text-slate-800">3. Where Are Cities Growing? (Urban Expansion)</h3>
                </div>
                <p className="text-slate-600 text-sm px-4">
                  These charts show where cities and towns are expanding and building new areas. 
                  This is often where forests used to be.
                </p>

                <div className="dashboard-card p-6">
                  <h4 className="text-lg font-bold text-slate-800 mb-2">Top 5 Urban Growth Areas</h4>
                  <p className="text-xs text-slate-500 mb-4">Area shown in thousands of square meters (the taller the bar, the more city expansion)</p>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={data.urbanExpansion.zones.slice(0, 5).map((zone, idx) => ({
                      name: zone.area || `Zone ${idx + 1}`,
                      areaValue: (zone.pixels * 100) / 1000,
                      lat: zone.location[0],
                      long: zone.location[1]
                    }))} margin={{ bottom: 80 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#ede9fe" />
                      <XAxis 
                        dataKey="name" 
                        stroke="#6b21a8" 
                        fontSize={10} 
                        angle={-45} 
                        textAnchor="end" 
                        height={100}
                      />
                      <YAxis 
                        stroke="#6b21a8" 
                        fontSize={11}
                        label={{ value: 'Area (thousand m²)', angle: -90, position: 'insideLeft', style: { fontSize: 10 } }}
                      />
                      <RechartsTooltip 
                        contentStyle={{ backgroundColor: '#6b21a8', border: 'none', borderRadius: '6px', color: 'white' }}
                        formatter={(value: any, name: any, props: any) => {
                          return [
                            `Area: ${Number(value).toFixed(1)} thousand m² (${(Number(value) * 1000).toLocaleString()} square meters)`,
                            `Location: ${props.payload.lat}°N, ${props.payload.long}°E`
                          ];
                        }}
                      />
                      <Bar dataKey="areaValue" fill="#8B5CF6" radius={[8, 8, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                  <div className="mt-3 p-3 bg-purple-50 rounded-lg">
                    <p className="text-xs text-purple-800">
                      📊 <strong>What this shows:</strong> Taller purple bars mean more urban development. 
                      Total of <strong>{data.urbanExpansion.expansionZones} zones</strong> are experiencing rapid city growth.
                    </p>
                  </div>
                </div>
              </div>

              {/* Section 4: Satellite Health Indicators */}
              <div className="space-y-4">
                <div className="flex items-center gap-3 border-b-2 border-orange-500 pb-2">
                  <Activity className="text-orange-600" size={24} />
                  <h3 className="text-xl font-bold text-slate-800">4. Environmental Health Indicators (Satellite Data)</h3>
                </div>
                <p className="text-slate-600 text-sm px-4">
                  These measurements come from satellite images. NDVI measures vegetation health (higher = healthier forests). 
                  NDBI measures built-up areas (higher = more buildings).
                </p>

                <div className="dashboard-card p-6">
                  <h4 className="text-lg font-bold text-slate-800 mb-2">Vegetation and Built-up Index Changes</h4>
                  <p className="text-xs text-slate-500 mb-4">See how environmental indicators shifted from {startYear} to {endYear}</p>
                  <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={indicesData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="metric" stroke="#64748b" />
                      <YAxis stroke="#64748b" domain={[-0.5, 1]} label={{ value: 'Index Value', angle: -90, position: 'insideLeft' }} />
                      <RechartsTooltip 
                        contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '6px', color: 'white' }}
                      />
                      <Legend />
                      <Line type="monotone" dataKey={startYear} stroke="#3B82F6" strokeWidth={3} dot={{ r: 6 }} activeDot={{ r: 8 }} name={`${startYear} Value`} />
                      <Line type="monotone" dataKey={endYear} stroke="#F59E0B" strokeWidth={3} dot={{ r: 6 }} activeDot={{ r: 8 }} name={`${endYear} Value`} />
                    </LineChart>
                  </ResponsiveContainer>
                  <div className="grid grid-cols-2 gap-4 mt-4">
                    <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                      <p className="text-xs font-semibold text-green-800 mb-2">NDVI - Vegetation Health</p>
                      <div className="flex items-baseline gap-2">
                        <p className="text-2xl font-bold text-green-900">{data.indices.ndvi.year1.toFixed(3)}</p>
                        <span className="text-slate-500">→</span>
                        <p className="text-2xl font-bold text-green-900">{data.indices.ndvi.year2.toFixed(3)}</p>
                      </div>
                      <p className="text-xs text-green-700 mt-2">
                        Change: <span className={data.indices.ndvi.change < 0 ? 'text-red-600 font-bold' : 'text-green-600 font-bold'}>{data.indices.ndvi.change.toFixed(3)}</span>
                      </p>
                      <p className="text-xs text-slate-600 mt-2">Lower NDVI = Less healthy vegetation</p>
                    </div>
                    <div className="p-4 bg-purple-50 rounded-lg border border-purple-200">
                      <p className="text-xs font-semibold text-purple-800 mb-2">NDBI - Built-up Index</p>
                      <div className="flex items-baseline gap-2">
                        <p className="text-2xl font-bold text-purple-900">{data.indices.ndbi.year1.toFixed(3)}</p>
                        <span className="text-slate-500">→</span>
                        <p className="text-2xl font-bold text-purple-900">{data.indices.ndbi.year2.toFixed(3)}</p>
                      </div>
                      <p className="text-xs text-purple-700 mt-2">
                        Change: <span className={data.indices.ndbi.change > 0 ? 'text-purple-600 font-bold' : 'text-green-600 font-bold'}>{data.indices.ndbi.change > 0 ? '+' : ''}{data.indices.ndbi.change.toFixed(3)}</span>
                      </p>
                      <p className="text-xs text-slate-600 mt-2">Higher NDBI = More buildings/urban areas</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Summary Box */}
              <div className="dashboard-card p-6 bg-gradient-to-r from-slate-50 to-slate-100 border-l-4 border-slate-600">
                <h4 className="text-lg font-bold text-slate-800 mb-3 flex items-center gap-2">
                  <AlertTriangle className="text-slate-600" size={20} />
                  Quick Summary - In Simple Words
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-white rounded-lg shadow-sm">
                    <p className="text-sm font-semibold text-slate-600 mb-1">Forest Loss</p>
                    <p className="text-3xl font-bold text-red-600">{data.visualChange.vegetationLoss.toFixed(1)}%</p>
                    <p className="text-xs text-slate-500 mt-1">That's {(data.visualChange.vegetationLossPixels * 100).toLocaleString()} square meters</p>
                  </div>
                  <div className="p-4 bg-white rounded-lg shadow-sm">
                    <p className="text-sm font-semibold text-slate-600 mb-1">City Growth</p>
                    <p className="text-3xl font-bold text-purple-600">{data.visualChange.urbanExpansion.toFixed(1)}%</p>
                    <p className="text-xs text-slate-500 mt-1">That's {(data.visualChange.urbanExpansionPixels * 100).toLocaleString()} square meters</p>
                  </div>
                  <div className="p-4 bg-white rounded-lg shadow-sm">
                    <p className="text-sm font-semibold text-slate-600 mb-1">Risk Level</p>
                    <p className="text-3xl font-bold text-orange-600">{data.risk.score}/100</p>
                    <p className="text-xs text-slate-500 mt-1">{data.risk.level}</p>
                  </div>
                </div>
                <p className="text-sm text-slate-700 mt-4 leading-relaxed">
                  💡 <strong>What does this mean?</strong> Between {startYear} and {endYear}, Tamil Nadu lost {data.visualChange.vegetationLoss.toFixed(1)}% of its vegetation cover 
                  (about {(data.visualChange.vegetationLossPixels * 100 / 10000).toFixed(0)} hectares of forest) while cities expanded by {data.visualChange.urbanExpansion.toFixed(1)}%. 
                  The current risk level is <strong>{data.risk.level}</strong>, which means {data.risk.score > 70 ? 'immediate action is needed' : 'careful monitoring is required'} to protect our environment.
                </p>
              </div>

            </div>
          )}

        </div>
      </main>
    </div>
  );
}
