import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { AnalysisResponse } from '@shared/schema';

export function generateForestWatchReport(data: AnalysisResponse, startYear: number, endYear: number) {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 20;
  let y = 20;

  // Helper function to add text with word wrap
  const addText = (text: string, size: number, isBold: boolean = false, color: [number, number, number] = [0, 0, 0]) => {
    doc.setFontSize(size);
    doc.setFont('helvetica', isBold ? 'bold' : 'normal');
    doc.setTextColor(color[0], color[1], color[2]);
    const lines = doc.splitTextToSize(text, pageWidth - margin * 2);
    doc.text(lines, margin, y);
    y += lines.length * size * 0.4 + 5;
  };

  // Helper to add a section break
  const addSectionBreak = () => {
    y += 5;
    doc.setDrawColor(200, 200, 200);
    doc.line(margin, y, pageWidth - margin, y);
    y += 10;
  };

  // Helper to check if we need a new page
  const checkNewPage = (spaceNeeded: number = 40) => {
    if (y + spaceNeeded > pageHeight - 20) {
      doc.addPage();
      y = 20;
      return true;
    }
    return false;
  };

  // Helper to draw a bar chart
  const drawBarChart = (chartData: Array<{label: string, value: number, color: string}>, title: string, chartY: number, maxValue?: number) => {
    const chartHeight = 60;
    const chartWidth = pageWidth - margin * 2 - 40;
    const barWidth = chartWidth / chartData.length - 10;
    const maxVal = maxValue || Math.max(...chartData.map(d => d.value));
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 0);
    doc.text(title, margin, chartY);
    
    chartY += 10;
    
    // Draw bars
    chartData.forEach((item, idx) => {
      const barHeight = (item.value / maxVal) * chartHeight;
      const x = margin + 40 + (idx * (barWidth + 10));
      
      // Bar
      const rgb = hexToRgb(item.color);
      doc.setFillColor(rgb.r, rgb.g, rgb.b);
      doc.rect(x, chartY + chartHeight - barHeight, barWidth, barHeight, 'F');
      
      // Value on top
      doc.setFontSize(8);
      doc.setTextColor(0, 0, 0);
      doc.text(item.value.toFixed(1) + '%', x + barWidth/2, chartY + chartHeight - barHeight - 2, { align: 'center' });
      
      // Label
      doc.setFontSize(7);
      const labelLines = doc.splitTextToSize(item.label, barWidth);
      doc.text(labelLines, x + barWidth/2, chartY + chartHeight + 5, { align: 'center' });
    });
    
    // Y-axis
    doc.setDrawColor(100, 100, 100);
    doc.line(margin + 35, chartY, margin + 35, chartY + chartHeight);
    doc.line(margin + 35, chartY + chartHeight, margin + 40 + chartWidth, chartY + chartHeight);
    
    return chartY + chartHeight + 15;
  };

  // Helper to draw a pie chart
  const drawPieChart = (chartData: Array<{label: string, value: number, color: string}>, title: string, chartY: number, chartX: number) => {
    const radius = 25;
    const centerX = chartX;
    const centerY = chartY + radius + 10;
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text(title, chartX - radius, chartY);
    
    // Filter out zero values to avoid drawing issues
    const validData = chartData.filter(item => item.value > 0);
    const total = validData.reduce((sum, item) => sum + item.value, 0);
    
    // Only draw if we have valid data
    if (total > 0 && validData.length > 0) {
      let currentAngle = -90;
      
      validData.forEach((item) => {
        const sliceAngle = (item.value / total) * 360;
        
        // Only draw slice if angle is significant
        if (sliceAngle > 0.1) {
          const rgb = hexToRgb(item.color);
          doc.setFillColor(rgb.r, rgb.g, rgb.b);
          
          // Draw slice
          drawPieSlice(doc, centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
        }
        
        currentAngle += sliceAngle;
      });
    }
    
    // Legend
    let legendY = chartY + 10;
    chartData.forEach((item) => {
      const rgb = hexToRgb(item.color);
      doc.setFillColor(rgb.r, rgb.g, rgb.b);
      doc.rect(centerX + radius + 10, legendY - 3, 5, 5, 'F');
      
      doc.setFontSize(8);
      doc.setTextColor(0, 0, 0);
      doc.text(`${item.label}: ${item.value.toFixed(1)}%`, centerX + radius + 18, legendY);
      legendY += 7;
    });
    
    return chartY + radius * 2 + 20;
  };

  // Helper function to draw pie slice
  const drawPieSlice = (doc: jsPDF, cx: number, cy: number, radius: number, startAngle: number, endAngle: number) => {
    const startRad = (startAngle * Math.PI) / 180;
    const endRad = (endAngle * Math.PI) / 180;
    
    // Validate inputs
    if (!isFinite(cx) || !isFinite(cy) || !isFinite(radius) || !isFinite(startRad) || !isFinite(endRad)) {
      console.warn('Invalid pie slice parameters', { cx, cy, radius, startAngle, endAngle });
      return;
    }
    
    doc.moveTo(cx, cy);
    doc.lineTo(cx + radius * Math.cos(startRad), cy + radius * Math.sin(startRad));
    
    const steps = Math.max(Math.abs(endAngle - startAngle), 1);
    for (let i = 0; i <= steps; i++) {
      const angle = startRad + (i / steps) * (endRad - startRad);
      const x = cx + radius * Math.cos(angle);
      const y = cy + radius * Math.sin(angle);
      
      if (isFinite(x) && isFinite(y)) {
        doc.lineTo(x, y);
      }
    }
    
    doc.lineTo(cx, cy);
    doc.fill();
  };

  // Helper to convert hex color to RGB
  const hexToRgb = (hex: string): {r: number, g: number, b: number} => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
      r: parseInt(result[1], 16),
      g: parseInt(result[2], 16),
      b: parseInt(result[3], 16)
    } : { r: 0, g: 0, b: 0 };
  };

  // Calculate areas in square meters
  const vegetationLossArea = (data.visualChange.vegetationLossPixels * 100).toLocaleString();
  const urbanExpansionArea = (data.visualChange.urbanExpansionPixels * 100).toLocaleString();
  const totalAffectedArea = ((data.visualChange.vegetationLossPixels + data.visualChange.urbanExpansionPixels) * 100).toLocaleString();

  // ========== COVER PAGE ==========
  // Header with government style
  doc.setFillColor(30, 58, 138); // blue-900
  doc.rect(0, 0, pageWidth, 60, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(22);
  doc.setFont('helvetica', 'bold');
  doc.text('GOVERNMENT OF TAMIL NADU', pageWidth / 2, 20, { align: 'center' });
  
  doc.setFontSize(18);
  doc.text('FOREST WATCH MONITORING REPORT', pageWidth / 2, 35, { align: 'center' });
  
  doc.setFontSize(11);
  doc.setFont('helvetica', 'normal');
  doc.text('Sentinel-2 Satellite Land Change Analysis', pageWidth / 2, 48, { align: 'center' });
  
  y = 80;
  
  // Report metadata box
  doc.setDrawColor(30, 58, 138);
  doc.setLineWidth(0.5);
  doc.rect(margin, y, pageWidth - margin * 2, 50);
  
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('Report Reference:', margin + 5, y + 10);
  doc.setFont('helvetica', 'normal');
  doc.text(`FW-TN-${startYear}-${endYear}-${String(Date.now()).slice(-6)}`, margin + 50, y + 10);
  
  doc.setFont('helvetica', 'bold');
  doc.text('Analysis Period:', margin + 5, y + 20);
  doc.setFont('helvetica', 'normal');
  doc.text(`${startYear} to ${endYear}`, margin + 50, y + 20);
  
  doc.setFont('helvetica', 'bold');
  doc.text('Report Date:', margin + 5, y + 30);
  doc.setFont('helvetica', 'normal');
  doc.text(new Date().toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }), margin + 50, y + 30);
  
  doc.setFont('helvetica', 'bold');
  doc.text('Data Source:', margin + 5, y + 40);
  doc.setFont('helvetica', 'normal');
  doc.text('Sentinel-2 Satellite (10m resolution)', margin + 50, y + 40);
  
  y += 65;
  
  // Risk Assessment - Official Style
  const riskColor = data.risk.score > 70 ? '#DC2626' : data.risk.score > 50 ? '#F59E0B' : '#10B981';
  const riskBg = data.risk.score > 70 ? [220, 38, 38] : data.risk.score > 50 ? [245, 158, 11] : [16, 185, 129];
  
  doc.setFillColor(riskBg[0], riskBg[1], riskBg[2], 0.15);
  doc.roundedRect(margin, y, pageWidth - margin * 2, 40, 3, 3, 'F');
   doc.setDrawColor(riskBg[0], riskBg[1], riskBg[2]);
  doc.setLineWidth(1);
  doc.roundedRect(margin, y, pageWidth - margin * 2, 40, 3, 3, 'S');
  
  doc.setTextColor(riskBg[0], riskBg[1], riskBg[2]);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('RISK ASSESSMENT', pageWidth / 2, y + 12, { align: 'center' });
  
  doc.setFontSize(14);
  doc.text(`${data.risk.level.toUpperCase()}: ${data.risk.score}/100`, pageWidth / 2, y + 25, { align: 'center' });
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const riskText = data.risk.score > 70 
    ? 'URGENT ACTION REQUIRED - Significant environmental changes detected'
    : data.risk.score > 50 
    ? 'MODERATE CONCERN - Monitoring and intervention recommended'
    : 'LOW RISK - Continue regular monitoring';
  doc.text(riskText, pageWidth / 2, y + 34, { align: 'center' });
  
  y += 50;
  
  doc.setTextColor(0, 0, 0);
  
  // Official stamp/signature area
  y = pageHeight - 60;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'italic');
  doc.setTextColor(100, 100, 100);
  doc.text('This is a computer-generated report from the Forest Watch Monitoring System', pageWidth / 2, y, { align: 'center' });
  doc.text('Tamil Nadu Forest Department | Environmental Monitoring Division', pageWidth / 2, y + 7, { align: 'center' });
  
  // ========== PAGE 2: EXECUTIVE SUMMARY ==========
  doc.addPage();
  y = 20;
  
  doc.setFillColor(30, 58, 138);
  doc.rect(0, y, pageWidth, 12, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('1. EXECUTIVE SUMMARY', margin, y + 8);
  
  y += 20;
  doc.setTextColor(0, 0, 0);
  
  addText('Overview of Land Changes', 12, true);
  addText(`Between ${startYear} and ${endYear}, the Tamil Nadu region has experienced significant land cover transformations. This report presents findings from satellite imagery analysis covering an area of approximately ${totalAffectedArea} square meters.`, 10);
  
  y += 5;
  addText('Key Findings:', 11, true);
  
  // Summary statistics in boxes
  const summaryData = [
    { label: 'Forest Loss', value: `${vegetationLossArea} m²`, percent: `${data.visualChange.vegetationLoss}%`, color: '#DC2626' },
    { label: 'Urban Expansion', value: `${urbanExpansionArea} m²`, percent: `${data.visualChange.urbanExpansion}%`, color: '#8B5CF6' },
    { label: 'Total Changed', value: `${totalAffectedArea} m²`, percent: `${data.changeSummary.totalChanged}%`, color: '#F59E0B' },
  ];
  
  summaryData.forEach((item, idx) => {
    checkNewPage(30);
    const rgb = hexToRgb(item.color);
    doc.setFillColor(rgb.r, rgb.g, rgb.b, 0.1);
    doc.roundedRect(margin, y, (pageWidth - margin * 2 - 10) / 3, 25, 2, 2, 'F');
    
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(rgb.r, rgb.g, rgb.b);
    doc.text(item.label, margin + ((pageWidth - margin * 2 - 10) / 3) * idx + 5, y + 8);
    
    doc.setFontSize(11);
    doc.text(item.percent, margin + ((pageWidth - margin * 2 - 10) / 3) * idx + 5, y + 16);
    
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text(item.value, margin + ((pageWidth - margin * 2 - 10) / 3) * idx + 5, y + 22);
  });
  
  y += 35;
  doc.setTextColor(0, 0, 0);
  
  // Land Cover Change Bar Chart
  checkNewPage(90);
  y = drawBarChart([
    { label: `Water ${startYear}`, value: data.landCover.year1.water, color: '#3B82F6' },
    { label: `Water ${endYear}`, value: data.landCover.year2.water, color: '#60A5FA' },
    { label: `Vegetation ${startYear}`, value: data.landCover.year1.vegetation, color: '#10B981' },
    { label: `Vegetation ${endYear}`, value: data.landCover.year2.vegetation, color: '#34D399' },
    { label: `Built-up ${startYear}`, value: data.landCover.year1.builtUp, color: '#8B5CF6' },
    { label: `Built-up ${endYear}`, value: data.landCover.year2.builtUp, color: '#A78BFA' },
    { label: `Barren ${startYear}`, value: data.landCover.year1.barren, color: '#F59E0B' },
    { label: `Barren ${endYear}`, value: data.landCover.year2.barren, color: '#FBBF24' },
  ], 'Figure 1.1: Land Cover Comparison', y, 100);
  
  addSectionBreak();
  
  // ========== PAGE 3: DEFORESTATION ANALYSIS ==========
  checkNewPage(100);
  
  doc.setFillColor(30, 58, 138);
  doc.rect(0, y, pageWidth, 12, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('2. FOREST & VEGETATION LOSS ANALYSIS', margin, y + 8);
  
  y += 20;
  doc.setTextColor(0, 0, 0);
  
  addText('Impact Assessment', 12, true);
  addText('Deforestation refers to the permanent removal of tree cover and vegetation. This affects biodiversity, carbon sequestration, soil stability, and water cycles. The analysis identifies areas where vegetation health has significantly declined.', 10);
  
  y += 5;
  
  // Statistics table using autoTable
  checkNewPage(60);
  autoTable(doc, {
    startY: y,
    head: [['Metric', 'Value', 'Unit']],
    body: [
      ['Forest Coverage Lost', data.deforestation.areaLost.toFixed(2), '% of total area'],
      ['Total Area Affected', vegetationLossArea, 'square meters'],
      ['Equivalent Area', Math.round(data.visualChange.vegetationLossPixels * 100 / 10000), 'hectares'],
      ['Deforestation Hotspots', data.deforestation.hotspotsFound, 'sites identified'],
      ['NDVI Decline', Math.abs(data.indices.ndvi.change).toFixed(3), 'index points'],
      ['Pixels Affected', data.deforestation.pixelsLost.toLocaleString(), 'pixels (10m resolution)'],
    ],
    theme: 'grid',
    headStyles: { fillColor: [30, 58, 138], textColor: [255, 255, 255], fontStyle: 'bold' },
    styles: { fontSize: 9 },
  });
  
  y = (doc as any).lastAutoTable.finalY + 15;
  
  // Deforestation bar chart
  checkNewPage(90);
  const hotspotChartData = data.deforestation.hotspots.slice(0, 5).map((spot, idx) => ({
    label: spot.area,
    value: (spot.pixels * 100) / 1000, // Convert to thousands of m²
    color: ['#DC2626', '#EF4444', '#F87171', '#FCA5A5', '#FECACA'][idx]
  }));
  
  y = drawBarChart(hotspotChartData, 'Figure 2.1: Top 5 Deforestation Hotspots (Area in thousands of m²)', y, Math.max(...hotspotChartData.map(d => d.value)) * 1.2);
  
  // Hotspot locations table
  checkNewPage(80);
  addText('Critical Deforestation Hotspots - Top Priority Locations', 11, true);
  
  autoTable(doc, {
    startY: y,
    head: [['Rank', 'Location Name', 'Area Affected (m²)', 'Pixels', 'Severity']],
    body: data.deforestation.hotspots.slice(0, 5).map((spot, idx) => [
      `${idx + 1}`,
      `${spot.area}\n(${spot.location[0]}°N, ${spot.location[1]}°E)`,
      (spot.pixels * 100).toLocaleString(),
      spot.pixels.toLocaleString(),
      idx === 0 ? 'Critical' : idx < 3 ? 'High' : 'Moderate'
    ]),
    theme: 'grid',
    headStyles: { fillColor: [220, 38, 38], textColor: [255, 255, 255], fontStyle: 'bold' },
    styles: { fontSize: 9, cellPadding: 3 },
    columnStyles: {
      1: { cellWidth: 60 }
    }
  });
  
  y = (doc as any).lastAutoTable.finalY + 15;
  
  addSectionBreak();
  
  // ========== PAGE 4: URBAN EXPANSION ==========
  checkNewPage(100);
  
  doc.setFillColor(30, 58, 138);
  doc.rect(0, y, pageWidth, 12, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('3. URBAN EXPANSION & DEVELOPMENT', margin, y + 8);
  
  y += 20;
  doc.setTextColor(0, 0, 0);
  
  addText('Urbanization Assessment', 12, true);
  addText('Urban expansion refers to the growth of built-up areas including residential, commercial, and industrial developments. This analysis tracks conversion of natural land to urban infrastructure.', 10);
  
  y += 5;
  
  // Urban statistics table
  checkNewPage(60);
  autoTable(doc, {
    startY: y,
    head: [['Metric', 'Value', 'Unit']],
    body: [
      ['Urban Growth Rate', data.urbanExpansion.urbanGrowthRate.toFixed(2), '% per year'],
      ['Total Expansion', urbanExpansionArea, 'square meters'],
      ['Equivalent Area', Math.round(data.visualChange.urbanExpansionPixels * 100 / 10000), 'hectares'],
      ['Vegetation to Built-up', data.urbanExpansion.treesToBuildings.toFixed(2), '% converted'],
      ['Development Zones', data.urbanExpansion.expansionZones, 'major sites'],
      ['NDBI Increase', data.indices.ndbi.change.toFixed(3), 'index points'],
    ],
    theme: 'grid',
    headStyles: { fillColor: [30, 58, 138], textColor: [255, 255, 255], fontStyle: 'bold' },
    styles: { fontSize: 9 },
  });
  
  y = (doc as any).lastAutoTable.finalY + 15;
  
  // Urban expansion bar chart
  checkNewPage(90);
  const urbanChartData = data.urbanExpansion.zones.slice(0, 5).map((zone, idx) => ({
    label: zone.area,
    value: (zone.pixels * 100) / 1000,
    color: ['#8B5CF6', '#A78BFA', '#C4B5FD', '#DDD6FE', '#EDE9FE'][idx]
  }));
  
  y = drawBarChart(urbanChartData, 'Figure 3.1: Top 5 Urban Expansion Zones (Area in thousands of m²)', y, Math.max(...urbanChartData.map(d => d.value)) * 1.2);
  
  // Expansion zones table
  checkNewPage(80);
  addText('Major Urban Development Zones - Top Priority Locations', 11, true);
  
  autoTable(doc, {
    startY: y,
    head: [['Rank', 'Location Name', 'Development Area (m²)', 'Pixels', 'Growth Rate']],
    body: data.urbanExpansion.zones.slice(0, 5).map((zone, idx) => [
      `${idx + 1}`,
      `${zone.area}\n(${zone.location[0]}°N, ${zone.location[1]}°E)`,
      (zone.pixels * 100).toLocaleString(),
      zone.pixels.toLocaleString(),
      idx === 0 ? 'Very High' : idx < 3 ? 'High' : 'Moderate'
    ]),
    theme: 'grid',
    headStyles: { fillColor: [139, 92, 246], textColor: [255, 255, 255], fontStyle: 'bold' },
    styles: { fontSize: 9, cellPadding: 3 },
    columnStyles: {
      1: { cellWidth: 60 }
    }
  });
  
  y = (doc as any).lastAutoTable.finalY + 15;
  
  addSectionBreak();
  
  // ========== PAGE 5: LAND COVER TRANSFORMATION ==========
  checkNewPage(120);
  
  doc.setFillColor(30, 58, 138);
  doc.rect(0, y, pageWidth, 12, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('4. LAND COVER TRANSFORMATION MATRIX', margin, y + 8);
  
  y += 20;
  doc.setTextColor(0, 0, 0);
  
  addText('Comparative Analysis', 12, true);
  addText('The following analysis shows how different land cover types have changed over the observation period.', 10);
  
  y += 5;
  
  // Land cover comparison table
  checkNewPage(70);
  autoTable(doc, {
    startY: y,
    head: [['Land Cover Type', `${startYear} (%)`, `${endYear} (%)`, 'Change (%)', 'Trend']],
    body: [
      ['Water Bodies', data.landCover.year1.water.toFixed(1), data.landCover.year2.water.toFixed(1), 
       (data.landCover.year2.water - data.landCover.year1.water).toFixed(1),
       data.landCover.year2.water < data.landCover.year1.water ? 'Decrease' : 'Increase'],
      ['Vegetation Cover', data.landCover.year1.vegetation.toFixed(1), data.landCover.year2.vegetation.toFixed(1),
       (data.landCover.year2.vegetation - data.landCover.year1.vegetation).toFixed(1),
       data.landCover.year2.vegetation < data.landCover.year1.vegetation ? 'Decrease' : 'Increase'],
      ['Built-up Areas', data.landCover.year1.builtUp.toFixed(1), data.landCover.year2.builtUp.toFixed(1),
       (data.landCover.year2.builtUp - data.landCover.year1.builtUp).toFixed(1),
       data.landCover.year2.builtUp > data.landCover.year1.builtUp ? 'Increase' : 'Decrease'],
      ['Barren Land', data.landCover.year1.barren.toFixed(1), data.landCover.year2.barren.toFixed(1),
       (data.landCover.year2.barren - data.landCover.year1.barren).toFixed(1),
       data.landCover.year2.barren > data.landCover.year1.barren ? 'Increase' : 'Decrease'],
    ],
    theme: 'grid',
    headStyles: { fillColor: [30, 58, 138], textColor: [255, 255, 255], fontStyle: 'bold' },
    styles: { fontSize: 9 },
  });
  
  y = (doc as any).lastAutoTable.finalY + 15;
  
  // Draw pie charts side by side
  checkNewPage(80);
  y = drawPieChart([
    { label: 'Water', value: data.landCover.year1.water, color: '#3B82F6' },
    { label: 'Vegetation', value: data.landCover.year1.vegetation, color: '#10B981' },
    { label: 'Built-up', value: data.landCover.year1.builtUp, color: '#8B5CF6' },
    { label: 'Barren', value: data.landCover.year1.barren, color: '#F59E0B' },
  ], `Figure 4.1: ${startYear}`, y, pageWidth / 4);
  
  drawPieChart([
    { label: 'Water', value: data.landCover.year2.water, color: '#3B82F6' },
    { label: 'Vegetation', value: data.landCover.year2.vegetation, color: '#10B981' },
    { label: 'Built-up', value: data.landCover.year2.builtUp, color: '#8B5CF6' },
    { label: 'Barren', value: data.landCover.year2.barren, color: '#F59E0B' },
  ], `Figure 4.2: ${endYear}`, y - (25 + 10), (pageWidth * 3) / 4);
  
  // Land transition table
  checkNewPage(50);
  addText('Land Cover Transitions', 11, true);
  
  autoTable(doc, {
    startY: y,
    head: [['Transition Type', 'Percentage', 'Description']],
    body: [
      ['Vegetation to Built-up', `${data.changeSummary.vegetationToBuiltUp}%`, 'Natural areas converted to urban'],
      ['Vegetation to Barren', `${data.changeSummary.vegetationToBarren}%`, 'Forest degradation or clearing'],
      ['Water to Barren', `${data.changeSummary.waterToBarren}%`, 'Water body depletion'],
    ],
    theme: 'grid',
    headStyles: { fillColor: [30, 58, 138], textColor: [255, 255, 255], fontStyle: 'bold' },
    styles: { fontSize: 9 },
  });
  
  y = (doc as any).lastAutoTable.finalY + 15;
  
  addSectionBreak();
  
  // ========== PAGE 6: SATELLITE INDICES ==========
  checkNewPage(100);
  
  doc.setFillColor(30, 58, 138);
  doc.rect(0, y, pageWidth, 12, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('5. SATELLITE-DERIVED INDICES', margin, y + 8);
  
  y += 20;
  doc.setTextColor(0, 0, 0);
  
  addText('Technical Indicators', 12, true);
  addText('Normalized Difference Vegetation Index (NDVI) and Normalized Difference Built-up Index (NDBI) are calculated from satellite spectral bands to assess vegetation health and urban density.', 10);
  
  y += 5;
  
  // Indices table
  checkNewPage(50);
  autoTable(doc, {
    startY: y,
    head: [['Index', `${startYear}`, `${endYear}`, 'Change', 'Interpretation']],
    body: [
      ['NDVI\n(Vegetation Health)', 
       data.indices.ndvi.year1.toFixed(3), 
       data.indices.ndvi.year2.toFixed(3),
       `${data.indices.ndvi.change > 0 ? '+' : ''}${data.indices.ndvi.change.toFixed(3)}`,
       data.indices.ndvi.change < 0 ? 'Vegetation decline' : 'Vegetation improvement'],
      ['NDBI\n(Built-up Density)',
       data.indices.ndbi.year1.toFixed(3),
       data.indices.ndbi.year2.toFixed(3),
       `${data.indices.ndbi.change > 0 ? '+' : ''}${data.indices.ndbi.change.toFixed(3)}`,
       data.indices.ndbi.change > 0 ? 'Urban expansion' : 'Urban reduction'],
    ],
    theme: 'grid',
    headStyles: { fillColor: [30, 58, 138], textColor: [255, 255, 255], fontStyle: 'bold' },
    styles: { fontSize: 9 },
  });
  
  y = (doc as any).lastAutoTable.finalY + 15;
  
  // Index interpretation
  checkNewPage(40);
  doc.setFillColor(241, 245, 249);
  doc.rect(margin, y, pageWidth - margin * 2, 30, 'F');
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('Index Interpretation Guide:', margin + 5, y + 8);
  doc.setFont('helvetica', 'normal');
  doc.text('NDVI: Range -1 to +1. Values > 0.3 indicate healthy vegetation. Our change indicates vegetation stress.', margin + 5, y + 15);
  doc.text('NDBI: Positive values indicate built-up areas. Increase suggests urban development. Negative values show vegetation.', margin + 5, y + 22);
  
  y += 40;
  
  addSectionBreak();
  
  // ========== PAGE 7: RECOMMENDATIONS ==========
  checkNewPage(100);
  
  doc.setFillColor(30, 58, 138);
  doc.rect(0, y, pageWidth, 12, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text('6. RECOMMENDATIONS & ACTION PLAN', margin, y + 8);
  
  y += 20;
  doc.setTextColor(0, 0, 0);
  
  addText('Strategic Interventions', 12, true);
  addText('Based on the analysis, the following actions are recommended to mitigate environmental degradation and promote sustainable development:', 10);
  
  y += 5;
  
  const recommendations = [
    { priority: 'High', action: 'Reforestation Programs', description: 'Implement large-scale tree plantation in identified hotspot areas, targeting recovery of ' + Math.round(data.visualChange.vegetationLossPixels * 100 / 10000) + ' hectares.' },
    { priority: 'High', action: 'Protected Zone Declaration', description: 'Establish protected zones in remaining high-vegetation areas to prevent further deforestation.' },
    { priority: 'Medium', action: 'Sustainable Urban Planning', description: 'Mandate green space integration in new urban developments, ensuring minimum 20% vegetation cover.' },
    { priority: 'Medium', action: 'Water Conservation', description: 'Protect and restore water bodies showing depletion trends. Implement catchment area management.' },
    { priority: 'Medium', action: 'Continuous Monitoring', description: 'Establish quarterly satellite monitoring to track land changes and intervention effectiveness.' },
    { priority: 'Low', action: 'Community Awareness', description: 'Launch public education campaigns on environmental conservation and sustainable practices.' },
    { priority: 'Low', action: 'Policy Enforcement', description: 'Strengthen enforcement of existing environmental protection regulations and penalties for violations.' },
  ];
  
  checkNewPage(80);
  autoTable(doc, {
    startY: y,
    head: [['Priority', 'Action', 'Description']],
    body: recommendations.map(r => [r.priority, r.action, r.description]),
    theme: 'grid',
    headStyles: { fillColor: [30, 58, 138], textColor: [255, 255, 255], fontStyle: 'bold' },
    styles: { fontSize: 9 },
    columnStyles: {
      0: { cellWidth: 20 },
      1: { cellWidth: 45 },
      2: { cellWidth: 'auto' },
    }
  });
  
  y = (doc as any).lastAutoTable.finalY + 15;
  
  addSectionBreak();

  // ========== AI PREDICTIONS ==========
  if (data.prediction) {
    checkNewPage(80);
    
    doc.setFillColor(30, 58, 138);
    doc.rect(0, y, pageWidth, 12, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(`7. AI-POWERED PREDICTIONS FOR ${data.prediction.projectedYear}`, margin, y + 8);
    
    y += 20;
    doc.setTextColor(0, 0, 0);
    
    addText('Machine Learning Forecast', 12, true);
    addText(`Using Random Forest Regression trained on the ${startYear}-${endYear} period data, our AI model predicts the following environmental trends for the year ${data.prediction.projectedYear}:`, 10);
    
    y += 5;
    
    // Prediction metrics table
    const predictionMetrics = [
      ['Projected Vegetation Loss', `${data.prediction.nextYearVegetationLoss}%`, 'Critical - Exceeds historical average'],
      ['Projected Urban Expansion', `${data.prediction.nextYearUrbanGrowth}%`, 'High growth trajectory'],
      ['Predicted Risk Score', `${data.prediction.predictedRiskScore}/100`, data.prediction.predictedRiskScore > 70 ? 'CRITICAL LEVEL' : 'MODERATE LEVEL'],
      ['Model Confidence', `${(data.prediction.confidence * 100).toFixed(1)}%`, 'High reliability'],
    ];
    
    checkNewPage(60);
    autoTable(doc, {
      startY: y,
      head: [['Metric', 'Predicted Value', 'Assessment']],
      body: predictionMetrics,
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246], textColor: [255, 255, 255], fontStyle: 'bold' },
      styles: { fontSize: 10 },
      columnStyles: {
        0: { cellWidth: 60, fontStyle: 'bold' },
        1: { cellWidth: 40, halign: 'center' },
        2: { cellWidth: 'auto' },
      }
    });
    
    y = (doc as any).lastAutoTable.finalY + 15;
    
    // Location-specific predictions for major hotspots
    addText('High-Risk Locations for ' + data.prediction.projectedYear, 12, true);
    addText('Based on current trajectories, the following locations in Tamil Nadu require immediate attention:', 10);
    
    y += 5;
    
    // Extract top 6 hotspots with their locations
    const topHotspots = data.deforestation.hotspots.slice(0, 6).map(spot => [
      spot.id,
      spot.area,
      `${spot.location[0].toFixed(2)}°N, ${spot.location[1].toFixed(2)}°E`,
      `${Math.round(spot.pixels * 100)} m²`,
      'Immediate intervention required'
    ]);
    
    checkNewPage(80);
    autoTable(doc, {
      startY: y,
      head: [['ID', 'Location Name', 'Coordinates', 'Affected Area', 'Status']],
      body: topHotspots,
      theme: 'striped',
      headStyles: { fillColor: [220, 38, 38], textColor: [255, 255, 255], fontStyle: 'bold' },
      styles: { fontSize: 9 },
      columnStyles: {
        0: { cellWidth: 20 },
        1: { cellWidth: 45 },
        2: { cellWidth: 40 },
        3: { cellWidth: 30 },
        4: { cellWidth: 'auto' },
      }
    });
    
    y = (doc as any).lastAutoTable.finalY + 15;
    
    // AI Recommendation
    doc.setFillColor(59, 130, 246, 20);
    doc.roundedRect(margin, y, pageWidth - margin * 2, 50, 3, 3, 'F');
    doc.setDrawColor(59, 130, 246);
    doc.roundedRect(margin, y, pageWidth - margin * 2, 50, 3, 3, 'S');
    
    y += 8;
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(30, 58, 138);
    doc.text('AI MODEL RECOMMENDATION', margin + 5, y);
    
    y += 8;
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(0, 0, 0);
    const recLines = doc.splitTextToSize(data.prediction.recommendation, pageWidth - margin * 2 - 10);
    doc.text(recLines, margin + 5, y);
    
    y += recLines.length * 9 * 0.4 + 15;
    
    // Model details
    doc.setFontSize(7);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(100, 100, 100);
    doc.text(`Model: Random Forest Regression | Training Period: ${startYear}-${endYear} (${endYear - startYear} years) | Confidence: ${(data.prediction.confidence * 100).toFixed(1)}% | Projection Year: ${data.prediction.projectedYear}`, margin + 5, y);
    
    y += 15;
    addSectionBreak();
  }
  
  // ========== CONCLUSION ==========
  checkNewPage(60);
  
  doc.setFillColor(30, 58, 138);
  doc.rect(0, y, pageWidth, 12, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(data.prediction ? '8. CONCLUSION' : '7. CONCLUSION', margin, y + 8);
  
  y += 20;
  doc.setTextColor(0, 0, 0);
  
  const conclusion = `This comprehensive analysis of Tamil Nadu's land changes from ${startYear} to ${endYear} reveals significant environmental transformations. The region has experienced ${data.deforestation.areaLost}% forest loss covering ${vegetationLossArea} square meters, coupled with ${data.urbanExpansion.urbanGrowthRate}% annual urban growth rate expanding over ${urbanExpansionArea} square meters. 

The current environmental risk score of ${data.risk.score}/100 (${data.risk.level}) necessitates ${data.risk.score > 70 ? 'immediate and decisive' : 'continued'} action from governmental and non-governmental stakeholders. The transition velocity of ${data.risk.transitionVelocity}% indicates rapid land cover changes that require urgent attention.

Satellite-derived indices show NDVI decline of ${Math.abs(data.indices.ndvi.change).toFixed(3)} and NDBI increase of ${data.indices.ndbi.change.toFixed(3)}, confirming the conversion of natural ecosystems to built environments. Implementation of recommended interventions is crucial to balance development needs with environmental conservation for sustainable regional growth.`;
  
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  const conclusionLines = doc.splitTextToSize(conclusion, pageWidth - margin * 2);
  doc.text(conclusionLines, margin, y);
  y += conclusionLines.length * 10 * 0.4 + 15;
  
  // Official footer
  y = pageHeight - 50;
  doc.setDrawColor(30, 58, 138);
  doc.line(margin, y, pageWidth - margin, y);
  y += 8;
  
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.text('Report Generated by:', margin, y);
  doc.setFont('helvetica', 'normal');
  doc.text('Forest Watch - Sentinel-2 Land Change Mapping System', margin, y + 6);
  doc.text('Environmental Monitoring Division, Tamil Nadu Forest Department', margin, y + 12);
  
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(7);
  doc.setTextColor(100, 100, 100);
  doc.text(`Report Reference: FW-TN-${startYear}-${endYear} | Generated: ${new Date().toLocaleString('en-IN')}`, margin, y + 22);

  // Save the PDF
  const fileName = `Forest_Watch_Report_${startYear}-${endYear}_${new Date().getTime()}.pdf`;
  doc.save(fileName);
}
