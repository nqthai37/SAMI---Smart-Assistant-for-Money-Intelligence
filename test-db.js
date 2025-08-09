import pg from 'pg';
const { Client } = pg;

const client = new Client({
  connectionString: 'postgresql://postgres.ghiecdwqfhturcdjwlll:Thai372005@aws-0-ap-northeast-2.pooler.supabase.com:6543/postgres'
});

client.connect()
  .then(() => {
    console.log('✅ Kết nối thành công!');
    return client.end();
  })
  .catch(err => {
    console.error('❌ Kết nối thất bại:', err.message);
  });
