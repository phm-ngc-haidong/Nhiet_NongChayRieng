/* ============================================================
   THÍ NGHIỆM: NHIỆT NÓNG CHẢY RIÊNG CỦA NƯỚC ĐÁ
   λ = P·t·(1/Δm)      (Δm: khối lượng đá tan)
   Đồ thị: trục hoành 1/Δm, trục tung λ
   ============================================================ */
/* Mục 2 — nhập tay: P, Δt, m1 (tổng khối lượng đầu), m2 (tổng khối lượng sau).
   Δm được TỰ TÍNH từ m1, m2 (lấy giá trị tuyệt đối của m2 − m1 nên nhập theo chiều nào cũng ra số dương). */
const FIELDS = ['P', 't', 'm1', 'm2'];
/* Dữ liệu mẫu: giữ nguyên P, Δt và Δm như trước (0,045 · 0,049 · 0,040 · 0,042 · 0,044),
   m1/m2 được chọn sao cho m1 − m2 đúng bằng các Δm đó (m2 của lần trước = m1 của lần sau). */
const SAMPLE = [
  { P: 1000, t: 60, m1: 1.58638, m2: 1.40674 },
  { P: 1000, t: 60, m1: 1.40674, m2: 1.23041 },
  { P: 1000, t: 60, m1: 1.23041, m2: 1.04136 },
  { P: 1000, t: 60, m1: 1.04136, m2: 0.87215 },
  { P: 1000, t: 60, m1: 0.87215, m2: 0.68933 },
];

/* Mục 1 — số liệu THẬT của nhóm, cố định, không sửa được trên giao diện.
   Nguồn: bảng ghi tay của nhóm (P = 1300 W, Δt = 30 s, 10 lần đo).
   m1 = tổng khối lượng đầu, m2 = tổng khối lượng sau, dm = Δm ghi trên bảng
   (λ = P·Δt/Δm tính ra khớp đúng bảng: λ trung bình ≈ 331 341,0447 J/kg). */
const FIXED_DATA = [
  { P: 1300, t: 30, m1: 1.6567, m2: 1.5364, dm: 0.1203 },
  { P: 1300, t: 30, m1: 1.5364, m2: 1.4042, dm: 0.1322 },
  { P: 1300, t: 30, m1: 1.4042, m2: 1.2876, dm: 0.1166 },
  { P: 1300, t: 30, m1: 1.2876, m2: 1.1640, dm: 0.1236 },
  { P: 1300, t: 30, m1: 1.1640, m2: 1.0469, dm: 0.1171 },
  { P: 1300, t: 30, m1: 1.0469, m2: 0.9265, dm: 0.1204 },
  { P: 1300, t: 30, m1: 0.9265, m2: 0.8040, dm: 0.1225 },
  { P: 1300, t: 30, m1: 0.8040, m2: 0.6893, dm: 0.1147 },
  { P: 1300, t: 30, m1: 0.6893, m2: 0.5765, dm: 0.1128 },
  { P: 1300, t: 30, m1: 0.5765, m2: 0.4747, dm: 0.1018 },
];

const RESULT_LABEL = 'λ';
const RESULT_UNIT = 'J/kg';
const Y_AXIS_UNIT = '·10⁵ J/kg'; // đơn vị hiển thị trên trục tung (giá trị tick = J/kg ÷ 10⁵)
const Y_AXIS_DIV = 1e5;
const X_LABEL = '1/Δm (kg⁻¹)';
const REF_VALUE = 334000; // giá trị chuẩn của nhiệt nóng chảy riêng nước đá (J/kg)
/* Trục λ: gốc luôn là 0. Vạch chia (đơn vị) = Y_GRID_STEP; độ giãn dọc tính bằng số px cho mỗi 10⁵ J/kg,
   giữ CỐ ĐỊNH (không ép vừa khung) → các điểm không bị dồn cục dù vạch chia thưa.
   Muốn giãn hơn: tăng Y_PX_PER_UNIT (đồ thị cao thêm). Muốn đổi vạch chia: sửa Y_GRID_STEP. */
const Y_GRID_STEP = 100000;        // vạch chia trục λ: 1·10⁵ J/kg
const Y_PX_PER_UNIT = 221;         // số px ứng với 1·10⁵ J/kg trên màn hình rộng (nhỏ → trục ngắn lại)
const Y_PX_PER_UNIT_SMALL = 121;   // ... trên điện thoại
const Y_TOP_MARGIN = 111000;        // chừa phía trên điểm cao nhất (J/kg)
const LINE_EXTEND_RATIO = 0.25;      // đường kéo dài thêm mỗi phía = 25% độ rộng trục x (không bao giờ về gốc)
const LINE_WIDTH = 2.8;              // độ dày đường đồ thị (px)
const POINT_RADIUS = 3.5;             // bán kính chấm điểm trên đồ thị (px)

const sections = {
  fixed: {
    rows: FIXED_DATA.map(r => ({ ...r })),
    fields: ['P', 't', 'm1', 'm2', 'dm'],
    exactResult: true,
    editable: false,
    tableId: 'fusion-table-fixed',
    summaryId: 'fusion-summary-fixed',
    canvasId: 'fusion-chart-fixed',
    calcId: 'calc-fixed'
  },
  editable: {
    rows: [],
    fields: FIELDS,
    exactResult: true,
    editable: true,
    tableId: 'fusion-table',
    summaryId: 'fusion-summary',
    canvasId: 'fusion-chart',
    calcId: 'calc-editable'
  }
};

function isFiniteNum(v) { return typeof v === 'number' && isFinite(v); }
function fmt(v, digits = 2) {
  if (!isFiniteNum(v)) return '-';
  if (Math.abs(v) >= 1000) return Math.round(v).toLocaleString('en-US').replace(/,/g, ' ');
  return v.toLocaleString('vi-VN', { maximumFractionDigits: digits });
}
/* Hiển thị KHÔNG làm tròn phần nguyên: 324 189,5262 (giống bảng ghi tay) */
function fmtExact(v, digits = 4) {
  if (!isFiniteNum(v)) return '-';
  const [intPart, decPart] = Math.abs(v).toFixed(digits).split('.');
  const grouped = intPart.replace(/\B(?=(\d{3})+(?!\d))/g, '\u00A0');
  return (v < 0 ? '-' : '') + grouped + ',' + decPart;
}
/* Phần trăm: luôn làm tròn đến 11 chữ số thập phân (giữ cả số 0 cuối), dấu phẩy kiểu Việt */
const PERCENT_DIGITS = 11;
function fmtPercent(v) {
  return isFiniteNum(v) ? fmtExact(v, PERCENT_DIGITS) + '%' : '- %';
}
/* Số nguyên có dấu cách nghìn (334 000) */
function fmtInt(v) {
  return Math.round(v).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '\u00A0');
}
/* Số thường, dấu phẩy Việt, không nhóm nghìn (dùng cho P, Δt) */
function fmtPlain(v, maxD = 4) {
  return v.toLocaleString('vi-VN', { maximumFractionDigits: maxD, useGrouping: false });
}
/* Δm: luôn 5 chữ số thập phân như trong bảng */
function fmtDm(v) {
  return v.toLocaleString('vi-VN', { minimumFractionDigits: 5, maximumFractionDigits: 5, useGrouping: false });
}
/* Như fmtExact nhưng bỏ các số 0 thừa ở cuối phần thập phân: 331 341,0440 → 331 341,044 */
function fmtTrim(v, digits = 4) {
  const t = fmtExact(v, digits);
  return t.includes(',') ? t.replace(/0+$/, '').replace(/,$/, '') : t;
}
function fmtResult(section, v) {
  return section.exactResult ? fmtExact(v) : fmt(v);
}
function mean(arr) { return arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : NaN; }
function stddev(arr) {
  if (arr.length < 2) return NaN;
  const m = mean(arr);
  return Math.sqrt(arr.reduce((s, v) => s + (v - m) ** 2, 0) / (arr.length - 1));
}

/* y = λ, x = 1/Δm */
function computeY(row) {
  const { P, t, dm } = row;
  if (![P, t, dm].every(isFiniteNum) || dm === 0) return null;
  return P * t * (1 / dm);
}
function computeX(row) {
  const dm = row.dm;
  if (!isFiniteNum(dm) || dm === 0) return null;
  return 1 / dm;
}

/* Mục 2: Δm = |m2 − m1| (làm tròn 10 chữ số để bỏ sai số dấu phẩy động) */
function syncDm(row) {
  row.dm = (isFiniteNum(row.m1) && isFiniteNum(row.m2))
    ? Math.round(Math.abs(row.m2 - row.m1) * 1e10) / 1e10
    : NaN;
}

function blankRow() {
  const row = {};
  FIELDS.forEach(f => row[f] = '');
  return row;
}

function renderTable(section) {
  const table = document.getElementById(section.tableId);
  const tbody = table.querySelector('tbody');
  tbody.innerHTML = '';

  section.rows.forEach((row, i) => {
    const tr = document.createElement('tr');

    const tdIndex = document.createElement('td');
    tdIndex.textContent = i + 1;
    tdIndex.style.fontWeight = '600';
    tr.appendChild(tdIndex);

    section.fields.forEach(field => {
      const td = document.createElement('td');
      if (section.editable) {
        const input = document.createElement('input');
        input.type = 'number';
        input.step = 'any';
        input.inputMode = 'decimal';
        input.autocomplete = 'off';
        input.placeholder = '-';
        /* m1, m2 hiện đủ 5 chữ số thập phân như mục 1 (0.30000) */
        input.value = ((field === 'm1' || field === 'm2') && isFiniteNum(row[field]))
          ? row[field].toFixed(5)
          : (isFiniteNum(row[field]) ? row[field] : '');
        input.addEventListener('input', () => {
          section.rows[i][field] = parseFloat(input.value);
          syncDm(section.rows[i]);
          updateResultCell(section, i);
          updateSummaryAndChart(section);
        });
        td.appendChild(input);
      } else {
        /* Số chữ số thập phân cố định cho mỗi cột (giữ cả số 0 cuối) để các dòng thẳng hàng:
           m1, m2: 5 chữ số · Δm: 5 chữ số · P, Δt: số nguyên */
        const isMass = (field === 'm1' || field === 'm2');
        const minD = isMass ? 5 : (field === 'dm' ? 5 : 0);
        const maxD = isMass ? 5 : (field === 'dm' ? 5 : 0);
        td.textContent = isFiniteNum(row[field])
          ? row[field].toLocaleString('vi-VN', { minimumFractionDigits: minD, maximumFractionDigits: maxD, useGrouping: false })
          : '-';
        td.style.textAlign = 'center';
        td.style.color = 'var(--ink-soft)';
      }
      tr.appendChild(td);
    });

    if (section.editable) {
      const tdDm = document.createElement('td');
      tdDm.id = `${section.tableId}-dm-${i}`;
      tdDm.style.textAlign = 'center';
      tdDm.style.color = 'var(--ink-soft)';
      tr.appendChild(tdDm);
    }

    const tdResult = document.createElement('td');
    tdResult.className = 'result-cell';
    tdResult.id = `${section.tableId}-result-${i}`;
    tr.appendChild(tdResult);

    if (section.editable) {
      const tdDel = document.createElement('td');
      tdDel.className = 'del-col';
      const btn = document.createElement('button');
      btn.className = 'row-del';
      btn.title = 'Xóa dòng';
      btn.innerHTML = '&times;';
      btn.addEventListener('click', () => {
        section.rows.splice(i, 1);
        renderTable(section);
        updateSummaryAndChart(section);
      });
      tdDel.appendChild(btn);
      tr.appendChild(tdDel);
    }

    tbody.appendChild(tr);
  });

  if (section.editable) section.rows.forEach(syncDm);
  section.rows.forEach((_, i) => updateResultCell(section, i));
}

function updateResultCell(section, i) {
  if (section.editable) {
    const dmCell = document.getElementById(`${section.tableId}-dm-${i}`);
    const dm = section.rows[i].dm;
    if (dmCell) dmCell.textContent = isFiniteNum(dm)
      ? dm.toLocaleString('vi-VN', { minimumFractionDigits: 5, maximumFractionDigits: 5, useGrouping: false })
      : '-';
  }
  const cell = document.getElementById(`${section.tableId}-result-${i}`);
  if (!cell) return;
  const val = computeY(section.rows[i]);
  cell.textContent = isFiniteNum(val) ? fmtResult(section, val) : '-';
}

function updateSummaryAndChart(section) {
  const values = section.rows.map(computeY).filter(isFiniteNum);
  const points = section.rows
    .map(r => ({ x: computeX(r), y: computeY(r) }))
    .filter(p => isFiniteNum(p.x) && isFiniteNum(p.y));

  const avg = mean(values);
  /* Sai số tương đối của λ trung bình so với giá trị chuẩn 334 000 J/kg */
  const relErr = isFiniteNum(avg) ? (Math.abs(avg - REF_VALUE) / REF_VALUE) * 100 : NaN;

  document.getElementById(section.summaryId).innerHTML = `
    <div class="stat">
      <span class="label">Số lần đo hợp lệ</span>
      <span class="value">${values.length}</span>
    </div>
    <div class="stat">
      <span class="label">Nhiệt nóng chảy riêng trung bình</span>
      <span class="value">${fmtTrim(avg)} <small>${RESULT_UNIT}</small></span>
    </div>
    <div class="stat">
      <span class="label">Phần trăm sai số tương đối</span>
      <span class="value">${fmtPercent(relErr)}</span>
    </div>
  `;

  renderCalc(section, avg, relErr);
  renderChart(section.canvasId, points);
}

/* ============================================================
   PHẦN TÍNH TOÁN (có công thức) — nằm giữa bảng số liệu và đồ thị
   ============================================================ */
function sumExpr(items) {
  const term = it => `<i>λ</i><sub>${it.idx}</sub>`;
  if (!items.length) return '<i>λ</i><sub>1</sub> + <i>λ</i><sub>2</sub> + … + <i>λ</i><sub><i>n</i></sub>';
  if (items.length <= 6) return items.map(term).join(' + ');
  return [term(items[0]), term(items[1]), '…', term(items[items.length - 1])].join(' + ');
}

function renderCalc(section, avg, relErr) {
  const el = document.getElementById(section.calcId);
  if (!el) return;

  const items = [];
  section.rows.forEach((r, i) => {
    const L = computeY(r);
    if (isFiniteNum(L)) items.push({ idx: i + 1, P: r.P, t: r.t, dm: r.dm, L });
  });
  const has = items.length > 0;   // chưa có số nào -> chỉ hiện công thức, không thế số, không đơn vị

  const refTxt = fmtInt(REF_VALUE);
  const rows = items.map(it => `
    <div class="calc-line math">
      <span class="calc-lbl">Lần ${it.idx}:</span>
      <span><i>λ</i><sub>${it.idx}</sub> =</span>
      <span class="mfrac"><span>${fmtPlain(it.P)}·${fmtPlain(it.t)}</span><span>${fmtDm(it.dm)}</span></span>
      <span>≈ ${fmtExact(it.L)} <span class="calc-unit">J/kg</span></span>
    </div>`).join('');

  /* Trung bình: công thức tổng quát → thế đủ giá trị từng lần đo → kết quả */
  const avgNum = has ? `
        <span>=</span>
        <span class="mfrac mfrac-wrap"><span>${items.map(it => fmtExact(it.L)).join(' + ')}</span><span>${items.length}</span></span>
        <span>≈ ${fmtTrim(avg)} <span class="calc-unit">J/kg</span></span>` : '';

  /* Sai số tương đối: công thức → thế số → kết quả */
  const errNum = has ? `
        <span>=</span>
        <span class="mfrac">
          <span>|${fmtTrim(avg)} − ${refTxt}|</span>
          <span>${refTxt}</span>
        </span>
        <span>·100% ≈ ${fmtPercent(relErr)}</span>` : '';

  el.innerHTML = `
    <div class="calc-block">
      <h4>Nhiệt nóng chảy riêng của từng lần đo</h4>
      <div class="calc-main math">
        <i>λ</i> =
        <span class="mfrac"><span><i>P</i> ·Δ<i>t</i></span><span>Δ<i>m</i></span></span>
      </div>
      <div class="calc-list">${rows}
      </div>
    </div>

    <div class="calc-block">
      <h4>Nhiệt nóng chảy riêng trung bình</h4>
      <div class="calc-line math">
        <span><span class="ov"><i>λ</i></span> =</span>
        <span class="mfrac"><span>${sumExpr(items)}</span><span>${has ? items.length : '<i>n</i>'}</span></span>${avgNum}
      </div>
    </div>

    <div class="calc-block">
      <h4>Phần trăm sai số tương đối</h4>
      <div class="calc-line math">
        <span><i>δλ</i> =</span>
        <span class="mfrac">
          <span>|<span class="ov"><i>λ</i></span> − <i>λ</i><sub>chuẩn</sub>|</span>
          <span><i>λ</i><sub>chuẩn</sub></span>
        </span>
        <span>·100%</span>${errNum}
      </div>
    </div>`;
}

/* ============================================================
   VẼ ĐỒ THỊ BẰNG CANVAS 2D THUẦN (không phụ thuộc Chart.js)
   ============================================================ */
const CHART_COLORS = {
  point: '#C9862F',
  line: '#146B5E',
  grid: '#E7EBE2',
  axis: '#1C2B24',
  text: '#4B5D53',
  tickText: '#4B5D53'
};

/* Nhãn số trên trục λ (đơn vị ·10⁵ J/kg): số chữ số thập phân tự theo bước lưới (1,0 · 0,5 · 0,25 · …) */
function fmtAxisL(v, stepY) {
  const dec = Math.min(4, Math.max(1, Math.ceil(-Math.log10(stepY / Y_AXIS_DIV) - 1e-9)));
  return (v / Y_AXIS_DIV).toLocaleString('vi-VN', { minimumFractionDigits: dec, maximumFractionDigits: dec });
}

function niceStep(range, targetTicks = 5) {
  if (!isFiniteNum(range) || range <= 0) return 1;
  const rough = range / targetTicks;
  const mag = Math.pow(10, Math.floor(Math.log10(rough)));
  const norm = rough / mag;
  let step;
  if (norm < 1.5) step = 1;
  else if (norm < 3) step = 2;
  else if (norm < 7) step = 5;
  else step = 10;
  return step * mag;
}

function setupCanvasDPR(canvas, cssW, cssH) {
  const dpr = window.devicePixelRatio || 1;
  canvas.width = Math.round(cssW * dpr);
  canvas.height = Math.round(cssH * dpr);
  canvas.style.width = cssW + 'px';
  canvas.style.height = cssH + 'px';
  const ctx = canvas.getContext('2d');
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  return { ctx, w: cssW, h: cssH };
}

/* Tỉ lệ pixel/đơn vị của 2 trục — tính MỘT LẦN cho mỗi đồ thị (lúc vẽ đầu
   tiên hoặc khi khung đồ thị đổi kích thước), sau đó giữ CỐ ĐỊNH; số liệu
   trong bảng thay đổi chỉ được phép nới rộng thêm ô lưới, không co giãn lại. */
/* Khi bảng còn trống (chưa có điểm nào), lấy dữ liệu mẫu làm chuẩn để chia trục — giống bản gốc
   (bản gốc luôn khởi động với dữ liệu mẫu). Nhờ vậy trục không bị chia theo miền [0; 1] rồi
   khóa cứng, làm các điểm bị dồn sát gốc khi người dùng nhập số liệu hoặc bấm "Điền dữ liệu mẫu". */
function seedPoints() {
  return SAMPLE.map(r => {
    const row = { ...r };
    syncDm(row);
    return { x: computeX(row), y: computeY(row) };
  }).filter(p => isFiniteNum(p.x) && isFiniteNum(p.y));
}

function computeAxisScale(points, availPlotW) {
  if (!points.length) points = seedPoints();
  const xs = points.map(p => p.x);
  const baseMaxX = xs.length ? Math.max(...xs, 0) : 1;
  const stepX = niceStep(baseMaxX || 1, 5);
  const stepsX = Math.max(4, Math.ceil((baseMaxX || stepX) / stepX));

  /* Trục λ: gốc 0, vạch chia cố định, độ giãn dọc cố định (không ép vừa khung) */
  const maxY = Math.max(...points.map(p => p.y), REF_VALUE);
  const stepY = Y_GRID_STEP;
  const pxPerUnit = availPlotW < 600 ? Y_PX_PER_UNIT_SMALL : Y_PX_PER_UNIT;
  const baseMaxY = Math.ceil((maxY + Y_TOP_MARGIN) / stepY) * stepY;
  return {
    stepX, stepY, baseMaxY,
    pxPerUnitX: availPlotW / (stepsX * stepX),
    pxPerUnitY: pxPerUnit / Y_AXIS_DIV
  };
}

/* Trạng thái riêng cho mỗi đồ thị (mục 1 & mục 2 hoàn toàn độc lập) */
const chartStates = new Map();
function getChartState(canvasId) {
  if (!chartStates.has(canvasId)) {
    chartStates.set(canvasId, { points: [], axisScale: null, resizeAttached: false, hoverAttached: false });
  }
  return chartStates.get(canvasId);
}

function drawChart(canvas, state, hover) {
  const points = state.points;
  const padL = 58, padR = 22, padT = 40, padB = 44;

  const wrapRect = canvas.parentElement.getBoundingClientRect();
  const availW = Math.max(wrapRect.width, 100);
  const availPlotW = Math.max(availW - padL - padR, 10);

  if (!state.axisScale) state.axisScale = computeAxisScale(points, availPlotW);

  /* Miền hiển thị của trục tính theo dữ liệu đang có; nếu bảng còn trống thì tính theo dữ liệu mẫu
     (cùng cơ sở với thang chia trục ở trên) để đồ thị trống và đồ thị có số vừa vặn như nhau. */
  const basis = points.length ? points : seedPoints();
  const xs = basis.map(p => p.x);
  const ys = basis.map(p => p.y);
  const dataMinX = xs.length ? Math.min(0, ...xs) : 0;
  const dataMaxX = xs.length ? Math.max(...xs, 0) : 1;
  const dataMaxY = Math.max(...ys, REF_VALUE);

  const { stepX, stepY, baseMaxY, pxPerUnitX, pxPerUnitY } = state.axisScale;

  const domainMinX = Math.min(0, Math.floor(dataMinX / stepX) * stepX);
  const domainMaxX = Math.max(stepX * 4, Math.ceil(dataMaxX / stepX) * stepX);
  /* Trục λ luôn bắt đầu từ 0; miền chỉ được NỚI RỘNG thêm khi có điểm nằm ngoài, không co giãn lại */
  const domainMinY = 0;
  const domainMaxY = Math.max(stepY * 4, baseMaxY, Math.ceil((dataMaxY + Y_TOP_MARGIN) / stepY) * stepY);

  /* Nếu số liệu nằm xa miền của dữ liệu mẫu khiến đồ thị dài vượt khung (phải cuộn ngang),
     chia lại trục x theo chính số liệu đó cho vừa khung. Số liệu gần dữ liệu mẫu thì giữ nguyên thang cũ. */
  if (points.length && padL + (domainMaxX - domainMinX) * pxPerUnitX + padR > availW + 1) {
    state.axisScale = computeAxisScale(points, availPlotW);
    return drawChart(canvas, state, hover);
  }

  const plotW = (domainMaxX - domainMinX) * pxPerUnitX;
  const plotH = (domainMaxY - domainMinY) * pxPerUnitY;

  const cssW = Math.max(availW, padL + plotW + padR);
  const cssH = padT + plotH + padB;   // chiều cao đồ thị do số ô lưới quyết định (khung tự cao theo)

  const { ctx, w, h } = setupCanvasDPR(canvas, cssW, cssH);
  ctx.clearRect(0, 0, w, h);

  const xt = { ticks: [] };
  for (let v = domainMinX; v <= domainMaxX + stepX * 1e-9; v += stepX) xt.ticks.push(v);
  const yt = { ticks: [] };
  const nStepsY = Math.round((domainMaxY - domainMinY) / stepY);
  for (let i = 0; i <= nStepsY; i++) yt.ticks.push(domainMinY + i * stepY);

  const xScale = (x) => padL + (x - domainMinX) * pxPerUnitX;
  const yScale = (y) => padT + plotH - (y - domainMinY) * pxPerUnitY;

  ctx.font = '11px "IBM Plex Mono", monospace';
  ctx.fillStyle = CHART_COLORS.tickText;
  ctx.strokeStyle = CHART_COLORS.grid;
  ctx.lineWidth = 1;

  yt.ticks.forEach(v => {
    const y = yScale(v);
    ctx.beginPath();
    ctx.moveTo(padL, y);
    ctx.lineTo(padL + plotW, y);
    ctx.stroke();
    if (v === 0) return;
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText(fmtAxisL(v, stepY), padL - 8, y);
  });
  xt.ticks.forEach(v => {
    const x = xScale(v);
    ctx.beginPath();
    ctx.moveTo(x, padT);
    ctx.lineTo(x, padT + plotH);
    ctx.stroke();
    ctx.textAlign = v === 0 ? 'right' : 'center';
    ctx.textBaseline = 'top';
    ctx.fillText(fmt(v, 3), v === 0 ? x - 6 : x, padT + plotH + 8);
  });

  const ARROW = 8;
  function drawArrowhead(tipX, tipY, angle) {
    ctx.save();
    ctx.translate(tipX, tipY);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-ARROW, ARROW * 0.45);
    ctx.lineTo(-ARROW, -ARROW * 0.45);
    ctx.closePath();
    ctx.fillStyle = CHART_COLORS.axis;
    ctx.fill();
    ctx.restore();
  }

  ctx.strokeStyle = CHART_COLORS.axis;
  ctx.lineWidth = 2;

  ctx.beginPath();
  ctx.moveTo(padL, padT + plotH);
  ctx.lineTo(padL, padT - ARROW * 0.6);
  ctx.stroke();
  drawArrowhead(padL, padT - ARROW * 0.6, -Math.PI / 2);

  ctx.beginPath();
  ctx.moveTo(padL, padT + plotH);
  ctx.lineTo(padL + plotW + ARROW * 0.6, padT + plotH);
  ctx.stroke();
  drawArrowhead(padL + plotW + ARROW * 0.6, padT + plotH, 0);

  ctx.fillStyle = CHART_COLORS.text;
  ctx.font = '600 12px Inter, sans-serif';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'bottom';
  ctx.fillText(X_LABEL, padL + plotW + ARROW * 0.6, padT + plotH - 8);

  ctx.textAlign = 'left';
  ctx.textBaseline = 'bottom';
  ctx.fillText(`${RESULT_LABEL} (${Y_AXIS_UNIT})`, padL + 6, padT - ARROW * 0.6 - 2);

  /* Đường chuẩn λ = 334 000 J/kg (nét đứt nhẹ) để so sai số tương đối */
  {
    const yRef = yScale(REF_VALUE);
    ctx.save();
    ctx.strokeStyle = 'rgba(178, 74, 60, 0.75)';
    ctx.lineWidth = 1.5;
    ctx.setLineDash([7, 5]);
    ctx.beginPath();
    ctx.moveTo(padL, yRef);
    ctx.lineTo(padL + plotW, yRef);
    ctx.stroke();
    ctx.restore();

    ctx.fillStyle = 'rgba(178, 74, 60, 0.95)';
    ctx.font = '500 11px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'bottom';
    ctx.fillText(`${RESULT_LABEL} = ${fmt(REF_VALUE / Y_AXIS_DIV, 2)} ${Y_AXIS_UNIT}`, padL + 8, yRef - 5);

    /* Vạch 3,34·10⁵ trên trục λ: gạch nhỏ + nhãn đỏ đậm để đọc thẳng giá trị chuẩn */
    const refTxt = fmt(REF_VALUE / Y_AXIS_DIV, 2);
    ctx.font = '700 11px "IBM Plex Mono", monospace';
    const rw = ctx.measureText(refTxt).width + 8;
    ctx.fillStyle = '#fff';
    ctx.fillRect(padL - 8 - rw + 4, yRef - 8, rw, 16);
    ctx.fillStyle = 'rgba(178, 74, 60, 1)';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'middle';
    ctx.fillText(refTxt, padL - 8, yRef);
    ctx.strokeStyle = 'rgba(178, 74, 60, 1)';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(padL - 5, yRef);
    ctx.lineTo(padL + 5, yRef);
    ctx.stroke();
  }

  /* Đường đồ thị: đi qua điểm đầu và điểm cuối (theo 1/Δm) rồi KÉO DÀI thêm về hai phía
     → thấy rõ xu hướng. Vì 1/Δm không bao giờ bằng 0 nên đường KHÔNG được kéo về gốc tọa độ:
     phía trái chỉ kéo dài thêm một đoạn (LINE_EXTEND_RATIO × độ rộng trục x) và luôn dừng
     trước x = 0; phía phải kéo dài đến hết khung. */
  if (points.length >= 2) {
    const sorted = [...points].sort((a, b) => a.x - b.x);
    const first = sorted[0], last = sorted[sorted.length - 1];
    if (last.x - first.x > 1e-9) {
      const m = (last.y - first.y) / (last.x - first.x);
      const yAt = (x) => first.y + m * (x - first.x);
      ctx.save();
      ctx.beginPath();
      ctx.rect(padL, padT, plotW, plotH);   // cắt phần đường vượt ra ngoài khung
      ctx.clip();
      ctx.strokeStyle = CHART_COLORS.line;
      ctx.lineWidth = LINE_WIDTH;
      ctx.lineCap = 'round';
      ctx.beginPath();
      const ext = LINE_EXTEND_RATIO * (domainMaxX - domainMinX);
      const xFrom = Math.max(first.x - ext, first.x * 0.5);   // không bao giờ chạm x = 0
      const xTo = Math.min(last.x + ext, domainMaxX);
      ctx.moveTo(xScale(xFrom), yScale(yAt(xFrom)));
      ctx.lineTo(xScale(xTo), yScale(yAt(xTo)));
      ctx.stroke();
      ctx.restore();
    }
  }

  const pixelPoints = points.map(p => ({ ...p, px: xScale(p.x), py: yScale(p.y) }));
  /* Đếm số lần đo trùng đúng một vị trí (các điểm trùng nhau chỉ hiện thành 1 chấm) */
  pixelPoints.forEach(p => {
    p.count = pixelPoints.filter(q => Math.hypot(q.px - p.px, q.py - p.py) < 1).length;
  });
  pixelPoints.forEach(p => {
    const isHover = hover && hover === p;
    ctx.beginPath();
    ctx.fillStyle = CHART_COLORS.point;
    ctx.arc(p.px, p.py, isHover ? POINT_RADIUS + 2 : POINT_RADIUS, 0, Math.PI * 2);
    ctx.fill();
    ctx.lineWidth = isHover ? 1.5 : 1;
    ctx.strokeStyle = '#fff';
    ctx.stroke();
  });

  /* Nhãn ×n cạnh những chấm do nhiều lần đo trùng nhau */
  {
    const labelled = [];
    ctx.font = '700 12px Inter, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'top';
    ctx.lineJoin = 'round';
    pixelPoints.forEach(p => {
      if (p.count < 2 || labelled.some(q => Math.hypot(q.px - p.px, q.py - p.py) < 1)) return;
      labelled.push(p);
      const txt = `×${p.count}`;
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#fff';
      ctx.strokeText(txt, p.px + 7, p.py + 3);
      ctx.fillStyle = CHART_COLORS.line;
      ctx.fillText(txt, p.px + 7, p.py + 3);
    });
  }

  if (hover) {
    const label = `1/Δm = ${fmt(hover.x, 3)}  ·  ${RESULT_LABEL} = ${fmt(hover.y)} ${RESULT_UNIT}` + (hover.count > 1 ? `  ·  ${hover.count} lần đo trùng` : '');
    ctx.font = '500 11px Inter, sans-serif';
    const tw = ctx.measureText(label).width + 16;
    const th = 24;
    let tx = hover.px + 12, ty = hover.py - th - 8;
    if (tx + tw > w) tx = hover.px - tw - 12;
    if (ty < 0) ty = hover.py + 12;
    ctx.fillStyle = 'rgba(20,107,94,0.94)';
    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(tx, ty, tw, th, 5) : ctx.rect(tx, ty, tw, th);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText(label, tx + 8, ty + th / 2);
  }

  return pixelPoints;
}

function renderChart(canvasId, points) {
  const canvas = document.getElementById(canvasId);
  const state = getChartState(canvasId);
  state.points = points;
  drawChart(canvas, state, null);
  attachChartInteractivity(canvas, state);
}

function attachChartInteractivity(canvas, state) {
  if (!state.resizeAttached) {
    const ro = new ResizeObserver(() => {
      state.axisScale = null;
      drawChart(canvas, state, null);
    });
    ro.observe(canvas.parentElement);
    state.resizeAttached = true;
  }
  if (!state.hoverAttached) {
    canvas.addEventListener('mousemove', (e) => {
      const rect = canvas.getBoundingClientRect();
      const mx = e.clientX - rect.left;
      const my = e.clientY - rect.top;
      const pixelPoints = drawChart(canvas, state, null);
      let nearest = null, bestDist = 14;
      pixelPoints.forEach(p => {
        const d = Math.hypot(p.px - mx, p.py - my);
        if (d < bestDist) { bestDist = d; nearest = p; }
      });
      drawChart(canvas, state, nearest);
    });
    canvas.addEventListener('mouseleave', () => {
      drawChart(canvas, state, null);
    });
    state.hoverAttached = true;
  }
}

function addRow() {
  sections.editable.rows.push(blankRow());
  renderTable(sections.editable);
  updateSummaryAndChart(sections.editable);
}
function loadSample() {
  getChartState(sections.editable.canvasId).axisScale = null;   // thang trục về như lúc mở trang
  sections.editable.rows = SAMPLE.map(r => ({ ...r }));
  renderTable(sections.editable);
  updateSummaryAndChart(sections.editable);
}
function clearTable() {
  getChartState(sections.editable.canvasId).axisScale = null;   // thang trục về như lúc mở trang
  /* Bảng trống: giữ nguyên số dòng như dữ liệu mẫu, mọi ô để trống (hiện "-") */
  sections.editable.rows = SAMPLE.map(() => blankRow());
  renderTable(sections.editable);
  updateSummaryAndChart(sections.editable);
}

function init() {
  document.getElementById('btn-add').addEventListener('click', addRow);
  document.getElementById('btn-sample').addEventListener('click', loadSample);
  document.getElementById('btn-clear').addEventListener('click', clearTable);

  clearTable();   // ban đầu: các lần đo để trống, hiện "-" ở mọi cột

  renderTable(sections.fixed);
  updateSummaryAndChart(sections.fixed);
}

document.addEventListener('DOMContentLoaded', init);
