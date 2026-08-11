import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import { createServer as createViteServer } from 'vite';
import { google } from 'googleapis';
import { INITIAL_DISBURSEMENTS } from './src/data/initialData.ts';
import { DisbursementItem } from './src/types.ts';

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(cookieParser());

// In-memory persistent database for disbursements
let disbursementsDatabase: DisbursementItem[] = [...INITIAL_DISBURSEMENTS];

// OAuth Client configuration for Google Workspace (Drive & Sheets)
const getOAuth2Client = (req?: express.Request) => {
  const redirectUri = process.env.APP_URL 
    ? `${process.env.APP_URL.replace(/\/$/, '')}/api/auth/google/callback`
    : `http://localhost:${PORT}/api/auth/google/callback`;

  return new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID || 'dummy_client_id',
    process.env.GOOGLE_CLIENT_SECRET || 'dummy_client_secret',
    redirectUri
  );
};

// ==========================================
// 1. DISBURSEMENT CRUD API ENDPOINTS
// ==========================================

// GET /api/disbursements
app.get('/api/disbursements', (req, res) => {
  const { search, month, department, status, category } = req.query;
  
  let results = [...disbursementsDatabase];

  if (search && typeof search === 'string') {
    const q = search.toLowerCase().trim();
    results = results.filter(
      d => d.id.toLowerCase().includes(q) ||
           d.docNumber.toLowerCase().includes(q) ||
           d.item.toLowerCase().includes(q) ||
           d.department.toLowerCase().includes(q) ||
           d.notes.toLowerCase().includes(q)
    );
  }

  if (department && typeof department === 'string' && department !== 'ALL') {
    results = results.filter(d => d.department === department);
  }

  if (status && typeof status === 'string' && status !== 'ALL') {
    results = results.filter(d => d.status === status);
  }

  if (category && typeof category === 'string' && category !== 'ALL') {
    results = results.filter(d => d.category === category);
  }

  if (month && typeof month === 'string' && month !== 'ALL') {
    results = results.filter(d => {
      // requestDate format: d/m/yyyy e.g. 6/2/2569
      const parts = d.requestDate.split('/');
      if (parts.length === 3) {
        const m = parts[1].padStart(2, '0');
        const y = parts[2];
        return `${m}/${y}` === month;
      }
      return false;
    });
  }

  res.json({ success: true, data: results });
});

// POST /api/disbursements - Create new request
app.post('/api/disbursements', (req, res) => {
  const newItem: DisbursementItem = req.body;
  if (!newItem.id) {
    const maxId = disbursementsDatabase.reduce((max, item) => {
      const num = parseInt(item.id.replace(/\D/g, '')) || 0;
      return num > max ? num : max;
    }, 0);
    newItem.id = `TH${String(maxId + 1).padStart(3, '0')}`;
  }

  disbursementsDatabase.unshift(newItem);
  res.status(201).json({ success: true, data: newItem });
});

// PUT /api/disbursements/:id - Update request
app.put('/api/disbursements/:id', (req, res) => {
  const { id } = req.params;
  const index = disbursementsDatabase.findIndex(d => d.id === id);

  if (index === -1) {
    return res.status(404).json({ success: false, error: 'Disbursement request not found' });
  }

  disbursementsDatabase[index] = {
    ...disbursementsDatabase[index],
    ...req.body,
    id // keep original ID
  };

  res.json({ success: true, data: disbursementsDatabase[index] });
});

// DELETE /api/disbursements/:id - Delete request
app.delete('/api/disbursements/:id', (req, res) => {
  const { id } = req.params;
  const initialLen = disbursementsDatabase.length;
  disbursementsDatabase = disbursementsDatabase.filter(d => d.id !== id);

  if (disbursementsDatabase.length === initialLen) {
    return res.status(404).json({ success: false, error: 'Item not found' });
  }

  res.json({ success: true, message: 'Deleted successfully' });
});

// GET /api/stats - Compute Real-Time Dashboard Analytics
app.get('/api/stats', (req, res) => {
  const totalAmount = disbursementsDatabase.reduce((sum, d) => sum + d.amount, 0);
  
  const approvedItems = disbursementsDatabase.filter(d => d.status === 'อนุมัติ' || d.status === 'โอนเงินแล้ว');
  const approvedAmount = approvedItems.reduce((sum, d) => sum + d.amount, 0);

  const pendingItems = disbursementsDatabase.filter(d => d.status === 'ยื่นเอกสาร' || d.status === 'รอตรวจสอบเอกสาร');
  const pendingAmount = pendingItems.reduce((sum, d) => sum + d.amount, 0);

  const returnedItems = disbursementsDatabase.filter(d => d.status === 'ส่งคืนเอกสารแก้ไข');
  const returnedAmount = returnedItems.reduce((sum, d) => sum + d.amount, 0);

  // Group by Month (BE format e.g. "02/2569")
  const thaiMonths: Record<string, string> = {
    '01': 'มกราคม', '02': 'กุมภาพันธ์', '03': 'มีนาคม', '04': 'เมษายน',
    '05': 'พฤษภาคม', '06': 'มิถุนายน', '07': 'กรกฎาคม', '08': 'สิงหาคม',
    '09': 'กันยายน', '10': 'ตุลาคม', '11': 'พฤศจิกายน', '12': 'ธันวาคม'
  };

  const monthlyMap: Record<string, { monthYear: string; monthName: string; yearBE: number; totalAmount: number; approvedAmount: number; pendingAmount: number; returnedAmount: number; count: number }> = {};

  disbursementsDatabase.forEach(item => {
    const parts = item.requestDate.split('/');
    if (parts.length === 3) {
      const m = parts[1].padStart(2, '0');
      const yearBE = parseInt(parts[2]) || 2569;
      const key = `${m}/${yearBE}`;
      const monthName = `${thaiMonths[m] || m} ${yearBE}`;

      if (!monthlyMap[key]) {
        monthlyMap[key] = {
          monthYear: key,
          monthName,
          yearBE,
          totalAmount: 0,
          approvedAmount: 0,
          pendingAmount: 0,
          returnedAmount: 0,
          count: 0
        };
      }

      monthlyMap[key].totalAmount += item.amount;
      monthlyMap[key].count += 1;

      if (item.status === 'อนุมัติ' || item.status === 'โอนเงินแล้ว') {
        monthlyMap[key].approvedAmount += item.amount;
      } else if (item.status === 'ส่งคืนเอกสารแก้ไข') {
        monthlyMap[key].returnedAmount += item.amount;
      } else {
        monthlyMap[key].pendingAmount += item.amount;
      }
    }
  });

  const monthlyList = Object.values(monthlyMap).sort((a, b) => a.monthYear.localeCompare(b.monthYear));

  // Category Breakdown
  const categoryMap: Record<string, { category: string; amount: number; count: number }> = {};
  disbursementsDatabase.forEach(item => {
    const cat = item.category || 'อื่นๆ';
    if (!categoryMap[cat]) {
      categoryMap[cat] = { category: cat, amount: 0, count: 0 };
    }
    categoryMap[cat].amount += item.amount;
    categoryMap[cat].count += 1;
  });

  const categoryList = Object.values(categoryMap).map(c => ({
    ...c,
    percentage: totalAmount > 0 ? Math.round((c.amount / totalAmount) * 1000) / 10 : 0
  }));

  // Department Breakdown
  const departmentMap: Record<string, { department: string; totalAmount: number; approvedAmount: number; returnedCount: number; pendingCount: number }> = {};
  disbursementsDatabase.forEach(item => {
    const dept = item.department || 'ไม่ระบุ';
    if (!departmentMap[dept]) {
      departmentMap[dept] = { department: dept, totalAmount: 0, approvedAmount: 0, returnedCount: 0, pendingCount: 0 };
    }
    departmentMap[dept].totalAmount += item.amount;
    if (item.status === 'อนุมัติ' || item.status === 'โอนเงินแล้ว') {
      departmentMap[dept].approvedAmount += item.amount;
    } else if (item.status === 'ส่งคืนเอกสารแก้ไข') {
      departmentMap[dept].returnedCount += 1;
    } else {
      departmentMap[dept].pendingCount += 1;
    }
  });

  res.json({
    success: true,
    data: {
      totalAmount,
      approvedAmount,
      pendingAmount,
      returnedAmount,
      totalCount: disbursementsDatabase.length,
      approvedCount: approvedItems.length,
      pendingCount: pendingItems.length,
      returnedCount: returnedItems.length,
      monthlyList,
      categoryList,
      departmentList: Object.values(departmentMap)
    }
  });
});

// ==========================================
// 2. GOOGLE DRIVE & SHEETS INTEGRATION
// ==========================================

// Get OAuth URL
app.get('/api/auth/google/url', (req, res) => {
  const oauth2Client = getOAuth2Client(req);
  const scopes = [
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/spreadsheets'
  ];

  const url = oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: scopes,
    prompt: 'consent'
  });

  res.json({ success: true, url });
});

// Auth callback
app.get('/api/auth/google/callback', async (req, res) => {
  const code = req.query.code as string;
  if (!code) {
    return res.status(400).send('No authorization code provided');
  }

  try {
    const oauth2Client = getOAuth2Client(req);
    const { tokens } = await oauth2Client.getToken(code);
    
    res.cookie('google_tokens', JSON.stringify(tokens), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 30 * 24 * 60 * 60 * 1000 // 30 days
    });

    res.send(`
      <html>
        <body style="font-family: sans-serif; text-align: center; padding: 50px;">
          <h2 style="color: #16a34a;">เชื่อมต่อ Google Drive & Sheets สำเร็จ!</h2>
          <p>กำลังกลับเข้าสู่ระบบติดตามการเบิกจ่ายงบประมาณ มทบ.42...</p>
          <script>
            if (window.opener) {
              window.opener.postMessage({ type: 'GOOGLE_OAUTH_SUCCESS' }, '*');
              window.close();
            } else {
              window.location.href = '/';
            }
          </script>
        </body>
      </html>
    `);
  } catch (err: any) {
    console.error('OAuth Callback Error:', err);
    res.status(500).send(`OAuth Error: ${err.message}`);
  }
});

// Auth status
app.get('/api/auth/google/status', (req, res) => {
  const tokenCookie = req.cookies?.google_tokens;
  if (tokenCookie) {
    try {
      const tokens = JSON.parse(tokenCookie);
      if (tokens.access_token) {
        return res.json({ connected: true });
      }
    } catch (e) {}
  }
  res.json({ connected: false });
});

// Logout Google
app.post('/api/auth/google/logout', (req, res) => {
  res.clearCookie('google_tokens');
  res.json({ success: true });
});

// Export data to Google Sheets in user's Drive
app.post('/api/google/export-sheet', async (req, res) => {
  try {
    const tokenCookie = req.cookies?.google_tokens;
    if (!tokenCookie) {
      return res.status(401).json({ success: false, error: 'กรุณาเข้าสู่ระบบ Google Drive ก่อนส่งออกข้อมูล' });
    }

    const tokens = JSON.parse(tokenCookie);
    const oauth2Client = getOAuth2Client(req);
    oauth2Client.setCredentials(tokens);

    const sheets = google.sheets({ version: 'v4', auth: oauth2Client });
    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    // 1. Create a new Google Spreadsheet
    const spreadsheet = await sheets.spreadsheets.create({
      requestBody: {
        properties: {
          title: `รายงานการเบิกจ่ายงบประมาณ_มทบ42_${new Date().toISOString().slice(0, 10)}`
        }
      }
    });

    const spreadsheetId = spreadsheet.data.spreadsheetId!;
    const spreadsheetUrl = spreadsheet.data.spreadsheetUrl!;

    // 2. Prepare headers and rows according to requested schema
    const headers = [
      'เลขที่คำขอ',
      'หน่วยตั้งเบิก',
      'วันที่ตั้งเบิก',
      'หลักฐานฎีกา',
      'รายการ',
      'ประเภทงบประมาณ',
      'ยอดเงิน (บาท)',
      'ฝ่ายงบประมาณ',
      'ฝ่ายอนุมัติ',
      'สถานะ',
      'หมายเหตุ',
      'วันที่ส่งคืนเอกสารแก้ไข',
      'วันที่โอนเงิน'
    ];

    const rows = disbursementsDatabase.map(item => [
      item.id,
      item.department,
      item.requestDate,
      item.docNumber,
      item.item,
      item.category,
      item.amount,
      item.budgetOfficer,
      item.approver,
      item.status,
      item.notes,
      item.returnDate || '',
      item.transferDate || ''
    ]);

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: 'Sheet1!A1',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [headers, ...rows]
      }
    });

    res.json({
      success: true,
      message: 'ส่งออกข้อมูลไปยัง Google Sheets ใน Google Drive สำเร็จ',
      spreadsheetId,
      spreadsheetUrl
    });
  } catch (error: any) {
    console.error('Export Google Sheet Error:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to export to Google Sheets' });
  }
});

// Upload attachment (PDF / Image) directly to Google Drive folder "เอกสารเบิกจ่าย_มทบ42"
app.post('/api/google/upload-file', async (req, res) => {
  try {
    const tokenCookie = req.cookies?.google_tokens;
    if (!tokenCookie) {
      return res.status(401).json({ success: false, error: 'กรุณาเชื่อมต่อ Google Drive ก่อนอัปโหลดไฟล์' });
    }

    const tokens = JSON.parse(tokenCookie);
    const oauth2Client = getOAuth2Client(req);
    oauth2Client.setCredentials(tokens);

    const drive = google.drive({ version: 'v3', auth: oauth2Client });

    const { fileName, mimeType, dataUrl, requestId } = req.body;
    if (!fileName || !dataUrl) {
      return res.status(400).json({ success: false, error: 'ข้อมูลไฟล์ไม่ครบถ้วน' });
    }

    // 1. Find or create folder "เอกสารเบิกจ่าย_มทบ42"
    const folderName = "เอกสารเบิกจ่าย_มทบ42";
    let folderId: string | null = null;

    const folderSearch = await drive.files.list({
      q: `mimeType='application/vnd.google-apps.folder' and name='${folderName}' and trashed=false`,
      fields: 'files(id, name)'
    });

    if (folderSearch.data.files && folderSearch.data.files.length > 0) {
      folderId = folderSearch.data.files[0].id!;
    } else {
      const createdFolder = await drive.files.create({
        requestBody: {
          name: folderName,
          mimeType: 'application/vnd.google-apps.folder'
        },
        fields: 'id'
      });
      folderId = createdFolder.data.id!;
    }

    // 2. Decode base64
    const matches = dataUrl.match(/^data:(.+);base64,(.+)$/);
    const base64Data = matches ? matches[2] : dataUrl.replace(/^data:.*;base64,/, '');
    const finalMimeType = matches ? matches[1] : (mimeType || 'application/octet-stream');
    const buffer = Buffer.from(base64Data, 'base64');

    const stream = new (await import('stream')).PassThrough();
    stream.end(buffer);

    // 3. Upload to Google Drive
    const response = await drive.files.create({
      requestBody: {
        name: requestId ? `[${requestId}]_${fileName}` : fileName,
        parents: folderId ? [folderId] : undefined
      },
      media: {
        mimeType: finalMimeType,
        body: stream
      },
      fields: 'id, name, webViewLink, webContentLink'
    });

    res.json({
      success: true,
      message: 'อัปโหลดไฟล์ไปยัง Google Drive เรียบร้อยแล้ว',
      fileId: response.data.id,
      fileName: response.data.name,
      webViewLink: response.data.webViewLink,
      webContentLink: response.data.webContentLink
    });
  } catch (error: any) {
    console.error('Upload Google Drive File Error:', error);
    res.status(500).json({ success: false, error: error.message || 'Failed to upload file to Google Drive' });
  }
});

// ==========================================
// 4. VITE SERVER INTEGRATION
// ==========================================
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`มทบ.42 Budget Tracking Application running on http://localhost:${PORT}`);
  });
}

startServer();
