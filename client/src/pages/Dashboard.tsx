import React, { useState } from 'react';
import { useAnalysis } from '@/hooks/use-analysis';
import { StatCard } from '@/components/StatCard';
import { MapComponent } from '@/components/MapComponent';
import { ThreeDTerrain } from '@/components/ThreeDTerrain';
import { ComparisonSlider } from '@/components/ComparisonSlider';
import { PixelGrid } from '@/components/PixelGrid';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { 
  TreePine, Building2, Map, AlertTriangle, Layers, Activity, Loader2, ArrowRight
} from 'lucide-react';

export default function Dashboard() {
  const { data, runAnalysis, isRunning } = useAnalysis();
  const [activeTab, setActiveTab] = useState<'overview' | 'details' | 'compare'>('overview');
  const [startYear, setStartYear] = useState(2022);
  const [endYear, setEndYear] = useState(2026);

  const handleRunAnalysis = (e: React.FormEvent) => {
    e.preventDefault();
    runAnalysis({ startYear, endYear });
  };

  // Format data for Recharts
  const chartData = [
    { name: 'Water', [startYear]: data.landCover.year1.water, [endYear]: data.landCover.year2.water },
    { name: 'Vegetation', [startYear]: data.landCover.year1.vegetation, [endYear]: data.landCover.year2.vegetation },
    { name: 'Built-up', [startYear]: data.landCover.year1.builtUp, [endYear]: data.landCover.year2.builtUp },
    { name: 'Barren', [startYear]: data.landCover.year1.barren, [endYear]: data.landCover.year2.barren },
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
              { id: 'compare', label: 'Before/After Comparison', icon: Layers }
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
                <option value={2020}>2020</option>
                <option value={2021}>2021</option>
                <option value={2022}>2022</option>
              </select>
              <ArrowRight size={14} className="text-slate-400" />
              <select 
                value={endYear} 
                onChange={e => setEndYear(Number(e.target.value))}
                className="bg-slate-50 border border-slate-200 text-sm rounded-md px-2 py-1.5 focus:ring-2 focus:ring-blue-500 outline-none"
              >
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
          </form>
        </div>

        {/* Dynamic Content based on Tab */}
        <div className="flex-1 w-full relative">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
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
                  <div className="dashboard-card p-4 flex flex-col">
                    <h3 className="text-sm font-bold text-slate-700 mb-4 uppercase">Land Cover Comparison (%)</h3>
                    <div className="flex-1 min-h-0">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                          <XAxis dataKey="name" tick={{fontSize: 12}} axisLine={false} tickLine={false} />
                          <YAxis tick={{fontSize: 12}} axisLine={false} tickLine={false} />
                          <RechartsTooltip cursor={{fill: '#f1f5f9'}} contentStyle={{borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}} />
                          <Legend wrapperStyle={{fontSize: '12px'}} />
                          <Bar dataKey={startYear.toString()} fill="#94a3b8" radius={[4,4,0,0]} />
                          <Bar dataKey={endYear.toString()} fill="#3b82f6" radius={[4,4,0,0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
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
              </div>
            </div>
          )}

          {/* TAB 3: COMPARISON */}
          {activeTab === 'compare' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
              
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
          )}

        </div>
      </main>
    </div>
  );
}
