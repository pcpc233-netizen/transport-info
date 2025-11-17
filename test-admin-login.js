// 비밀번호 해시 테스트
async function hashPassword(password) {
  const encoder = new TextEncoder();
  const data = encoder.encode(password + 'bustime-salt-2025');
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

async function test() {
  const password = 'dhsfkdls!1';
  const hash = await hashPassword(password);
  console.log('Password:', password);
  console.log('Hash:', hash);
  console.log('\nExpected hash in database should be:', hash);
}

test();
