const express = require('express');
const cors = require('cors');
const { createClient } = require('@supabase/supabase-js');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Init Supabase
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("ERROR: SUPABASE_URL atau SUPABASE_ANON_KEY belum diatur di Environment Variables Vercel!");
}
const supabase = createClient(supabaseUrl || 'http://localhost', supabaseKey || 'dummy_key');

// Middleware Admin Check
const checkAdmin = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Unauthorized' });
  
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return res.status(401).json({ error: 'Unauthorized' });

  if (user.email !== 'andrizalhacieboan@gmail.com') {
    return res.status(403).json({ error: 'Akses Ditolak. Halaman Admin!' });
  }
  req.user = user;
  next();
};

// API Endpoint: Hitung Simulasi Pinjaman (BAGIAN 5)
app.post('/api/simulasi-pinjaman', (req, res) => {
  const { plafon, tenor } = req.body;
  const bungaPerBulan = plafon * 0.01; // 1% flat
  const pokokPerBulan = plafon / tenor;
  const totalAngsuran = pokokPerBulan + bungaPerBulan;
  
  res.json({
    bunga: bungaPerBulan,
    pokok: pokokPerBulan,
    totalAngsuran: totalAngsuran,
    totalBayar: totalAngsuran * tenor
  });
});

// API Endpoint: Kasir Bayar Angsuran (BAGIAN 8)
app.post('/api/bayar-angsuran', checkAdmin, async (req, res) => {
  const { angsuran_id, tanggal_bayar, jatuh_tempo } = req.body;
  
  // Hitung Denda
  const telatHari = Math.max(0, Math.floor((new Date(tanggal_bayar) - new Date(jatuh_tempo)) / (1000 * 60 * 60 * 24)));
  const denda = telatHari * 10000;

  const { data, error } = await supabase
    .from('angsuran')
    .update({ status: 'lunas', tanggal_bayar, denda })
    .eq('id', angsuran_id);

  if (error) return res.status(400).json({ error: error.message });
  res.json({ success: true, data, denda });
});

// Route Handler untuk HTML (Vercel Node)
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'public', 'index.html')));
app.get('/login', (req, res) => res.sendFile(path.join(__dirname, 'public', 'login.html')));
app.get('/admin', (req, res) => res.sendFile(path.join(__dirname, 'public', 'admin.html')));
app.get('/simulasi', (req, res) => res.sendFile(path.join(__dirname, 'public', 'simulasi.html')));
app.get('/sop', (req, res) => res.sendFile(path.join(__dirname, 'public', 'sop.html')));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server KSP ANKOP running on ${PORT}`));

module.exports = app;
