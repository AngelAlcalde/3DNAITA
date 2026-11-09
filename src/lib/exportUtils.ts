/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Order, Income, Expense, Product, Client } from '../types';

// Helper to trigger browser download
export function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

// Generate Excel-compatible XML (SpreadsheetML) with styled headers and native numeric columns
function generateExcelXML(sheetName: string, headers: string[], rows: (string | number)[][]): string {
  const sanitize = (val: string | number) => {
    if (val === null || val === undefined) return '';
    return String(val)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  };

  const xmlHeaderRows = headers
    .map(
      (h) => `<Cell ss:StyleID="Header"><Data ss:Type="String">${sanitize(h)}</Data></Cell>`
    )
    .join('');

  const xmlDataRows = rows
    .map((row) => {
      const cells = row
        .map((cell) => {
          const isNum = typeof cell === 'number';
          return `<Cell ss:StyleID="${isNum ? 'Number' : 'Default'}"><Data ss:Type="${
            isNum ? 'Number' : 'String'
          }">${sanitize(cell)}</Data></Cell>`;
        })
        .join('');
      return `<Row>${cells}</Row>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <Styles>
  <Style ss:ID="Default" ss:Name="Normal">
   <Alignment ss:Vertical="Center"/>
   <Font ss:FontName="Segoe UI" x:Family="Swiss" ss:Size="10" ss:Color="#1E293B"/>
  </Style>
  <Style ss:ID="Header">
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#6D28D9"/>
   </Borders>
   <Font ss:FontName="Segoe UI" x:Family="Swiss" ss:Size="11" ss:Bold="1" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#4C1D95" ss:Pattern="Solid"/>
  </Style>
  <Style ss:ID="Number">
   <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
   <Font ss:FontName="Segoe UI" x:Family="Swiss" ss:Size="10"/>
  </Style>
 </Styles>
 <Worksheet ss:Name="${sanitize(sheetName)}">
  <Table>
   <Row ss:Height="24">
    ${xmlHeaderRows}
   </Row>
   ${xmlDataRows}
  </Table>
 </Worksheet>
</Workbook>`;
}

// Generate CSV with UTF-8 BOM so Excel opens with proper accents and currency symbols
function generateCSV(headers: string[], rows: (string | number)[][]): string {
  const escapeCell = (val: string | number) => {
    if (val === null || val === undefined) return '""';
    const str = String(val).replace(/"/g, '""');
    return `"${str}"`;
  };

  const headerLine = headers.map(escapeCell).join(';');
  const dataLines = rows.map((r) => r.map(escapeCell).join(';')).join('\r\n');

  // Prefix with UTF-8 Byte Order Mark (BOM)
  return '\uFEFF' + headerLine + '\r\n' + dataLines;
}

// Filter items by date period
export function filterByPeriod<T extends { createdAt?: string; date?: string }>(
  items: T[],
  period: 'all' | 'today' | 'week' | 'month' | 'year' | 'custom',
  customStart?: string,
  customEnd?: string
): T[] {
  if (period === 'all') return items;

  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];

  return items.filter((item) => {
    const rawDate = item.date || (item.createdAt ? item.createdAt.split('T')[0] : '');
    if (!rawDate) return true;

    if (period === 'today') {
      return rawDate === todayStr;
    }

    if (period === 'week') {
      const itemDate = new Date(rawDate);
      const diffTime = Math.abs(now.getTime() - itemDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays <= 7;
    }

    if (period === 'month') {
      const currentYearMonth = todayStr.substring(0, 7); // e.g. "2026-11"
      return rawDate.startsWith(currentYearMonth);
    }

    if (period === 'year') {
      const currentYear = todayStr.substring(0, 4); // e.g. "2026"
      return rawDate.startsWith(currentYear);
    }

    if (period === 'custom' && customStart && customEnd) {
      return rawDate >= customStart && rawDate <= customEnd;
    }

    return true;
  });
}

// 1. Export Pedidos (Orders)
export function exportOrders(orders: Order[], format: 'excel' | 'csv' = 'excel'): void {
  const headers = [
    'Número de Pedido',
    'Fecha de Ingreso',
    'Cliente',
    'Teléfono',
    'Producto',
    'Descripción',
    'Cantidad',
    'Color',
    'Material',
    'Fecha Entrega Estimada',
    'Costo Unitario ($)',
    'Precio Minorista ($)',
    'Precio Mayorista ($)',
    'Precio Acordado ($)',
    'Total Acordado ($)',
    'Seña Recibida ($)',
    'Saldo Pendiente ($)',
    'Estado',
    'Observaciones',
  ];

  const rows = orders.map((o) => [
    o.orderNumber,
    o.createdAt.split('T')[0],
    o.clientName,
    o.clientPhone || '',
    o.productName,
    o.description || '',
    o.quantity,
    o.color,
    o.material,
    o.estimatedDeliveryDate,
    o.costPrice,
    o.retailPrice,
    o.wholesalePrice,
    o.agreedPrice,
    o.totalAgreed,
    o.deposit,
    o.pendingBalance,
    o.status,
    o.notes || '',
  ]);

  const timestamp = new Date().toISOString().split('T')[0];
  if (format === 'excel') {
    const xml = generateExcelXML('Pedidos 3DNA', headers, rows);
    downloadFile(xml, `3DNA_Pedidos_${timestamp}.xls`, 'application/vnd.ms-excel;charset=utf-8');
  } else {
    const csv = generateCSV(headers, rows);
    downloadFile(csv, `3DNA_Pedidos_${timestamp}.csv`, 'text/csv;charset=utf-8');
  }
}

// 2. Export Ingresos (Incomes)
export function exportIncomes(incomes: Income[], format: 'excel' | 'csv' = 'excel'): void {
  const headers = [
    'Fecha',
    'Pedido Relacionado',
    'Cliente',
    'Concepto',
    'Importe ($)',
    'Medio de Pago',
    'Observaciones',
  ];

  const rows = incomes.map((i) => [
    i.date,
    i.orderNumber || 'Sin pedido',
    i.clientName,
    i.concept,
    i.amount,
    i.paymentMethod,
    i.notes || '',
  ]);

  const timestamp = new Date().toISOString().split('T')[0];
  if (format === 'excel') {
    const xml = generateExcelXML('Ingresos 3DNA', headers, rows);
    downloadFile(xml, `3DNA_Ingresos_${timestamp}.xls`, 'application/vnd.ms-excel;charset=utf-8');
  } else {
    const csv = generateCSV(headers, rows);
    downloadFile(csv, `3DNA_Ingresos_${timestamp}.csv`, 'text/csv;charset=utf-8');
  }
}

// 3. Export Gastos (Expenses)
export function exportExpenses(expenses: Expense[], format: 'excel' | 'csv' = 'excel'): void {
  const headers = [
    'Fecha',
    'Tipo (Operativo/Equipamiento)',
    'Categoría',
    'Descripción',
    'Importe ($)',
    'Medio de Pago',
    'Observaciones',
  ];

  const rows = expenses.map((e) => [
    e.date,
    e.expenseType,
    e.categoryName,
    e.description,
    e.amount,
    e.paymentMethod,
    e.notes || '',
  ]);

  const timestamp = new Date().toISOString().split('T')[0];
  if (format === 'excel') {
    const xml = generateExcelXML('Gastos 3DNA', headers, rows);
    downloadFile(xml, `3DNA_Gastos_${timestamp}.xls`, 'application/vnd.ms-excel;charset=utf-8');
  } else {
    const csv = generateCSV(headers, rows);
    downloadFile(csv, `3DNA_Gastos_${timestamp}.csv`, 'text/csv;charset=utf-8');
  }
}

// 4. Export Catálogo / Lista de Precios (Products)
export function exportProducts(products: Product[], format: 'excel' | 'csv' = 'excel'): void {
  const headers = [
    'Producto',
    'Categoría',
    'Material',
    'Costo Fabricación ($)',
    'Precio Minorista ($)',
    'Margen Minorista (%)',
    'Precio Mayorista ($)',
    'Margen Mayorista (%)',
    'Horas Impresión (hs)',
    'Gramos Filamento (g)',
    'Descripción',
  ];

  const rows = products.map((p) => [
    p.name,
    p.category,
    p.material,
    p.manufacturingCost,
    p.retailPrice,
    p.retailMarginPercent,
    p.wholesalePrice,
    p.wholesaleMarginPercent,
    p.printTimeHours || 0,
    p.filamentWeightGrams || 0,
    p.description || '',
  ]);

  const timestamp = new Date().toISOString().split('T')[0];
  if (format === 'excel') {
    const xml = generateExcelXML('Lista Precios 3DNA', headers, rows);
    downloadFile(xml, `3DNA_Lista_Precios_${timestamp}.xls`, 'application/vnd.ms-excel;charset=utf-8');
  } else {
    const csv = generateCSV(headers, rows);
    downloadFile(csv, `3DNA_Lista_Precios_${timestamp}.csv`, 'text/csv;charset=utf-8');
  }
}

// 5. Export Clientes
export function exportClients(clients: Client[], format: 'excel' | 'csv' = 'excel'): void {
  const headers = [
    'Nombre del Cliente',
    'Teléfono',
    'Email',
    'Fecha de Registro',
    'Pedidos Realizados',
    'Total Comprado ($)',
    'Saldo Pendiente ($)',
    'Observaciones',
  ];

  const rows = clients.map((c) => [
    c.name,
    c.phone,
    c.email || '',
    c.createdAt.split('T')[0],
    c.totalOrders,
    c.totalSpent,
    c.pendingBalance,
    c.notes || '',
  ]);

  const timestamp = new Date().toISOString().split('T')[0];
  if (format === 'excel') {
    const xml = generateExcelXML('Clientes 3DNA', headers, rows);
    downloadFile(xml, `3DNA_Clientes_${timestamp}.xls`, 'application/vnd.ms-excel;charset=utf-8');
  } else {
    const csv = generateCSV(headers, rows);
    downloadFile(csv, `3DNA_Clientes_${timestamp}.csv`, 'text/csv;charset=utf-8');
  }
}

// 6. Export Balance Financiero Completo
export function exportFinancialBalance(
  incomes: Income[],
  expenses: Expense[],
  orders: Order[],
  format: 'excel' | 'csv' = 'excel'
): void {
  const totalIngresado = incomes.reduce((sum, i) => sum + i.amount, 0);
  const totalGastosOperativos = expenses
    .filter((e) => e.expenseType === 'Operativo')
    .reduce((sum, e) => sum + e.amount, 0);
  const totalEquipamiento = expenses
    .filter((e) => e.expenseType === 'Equipamiento')
    .reduce((sum, e) => sum + e.amount, 0);
  const totalGastos = totalGastosOperativos + totalEquipamiento;
  const dineroDisponible = totalIngresado - totalGastos;
  const saldoPorCobrar = orders
    .filter((o) => o.status !== 'Cancelado')
    .reduce((sum, o) => sum + o.pendingBalance, 0);
  const gananciaEstimada = totalIngresado - totalGastosOperativos;

  const headers = ['Concepto Financiero', 'Monto en Pesos ($)', 'Detalle'];
  const rows: (string | number)[][] = [
    ['Total Dinero Ingresado (Cobrado Real)', totalIngresado, 'Ingresos efectivamente cobrados en caja'],
    ['Total Gastos Operativos', totalGastosOperativos, 'Filamentos, repuestos, servicios, etc.'],
    ['Total Inversión en Equipamiento / Maquinaria', totalEquipamiento, 'Impresoras 3D y mejoras de taller'],
    ['Total Salidas de Dinero', totalGastos, 'Gastos operativos + equipamiento'],
    ['Dinero Disponible en Caja', dineroDisponible, 'Caja neta disponible en este período'],
    ['Saldo Pendiente de Cobro', saldoPorCobrar, 'Ventas pactadas pendientes de pago por clientes'],
    ['Ganancia Operativa Estimada', gananciaEstimada, 'Ingresos cobrados menos gastos operativos'],
  ];

  const timestamp = new Date().toISOString().split('T')[0];
  if (format === 'excel') {
    const xml = generateExcelXML('Balance Financiero 3DNA', headers, rows);
    downloadFile(xml, `3DNA_Balance_Financiero_${timestamp}.xls`, 'application/vnd.ms-excel;charset=utf-8');
  } else {
    const csv = generateCSV(headers, rows);
    downloadFile(csv, `3DNA_Balance_Financiero_${timestamp}.csv`, 'text/csv;charset=utf-8');
  }
}
