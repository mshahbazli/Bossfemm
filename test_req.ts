import 'dotenv/config';

async function test() {
  const res = await fetch('http://localhost:3000/api/reviews', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      text: "Maaşım çox az verildi, belə bir mühitdə işləmək dəyməz. Rəhbərlik ümumiyyətlə maraqlanmır",
      companyId: "c1",
      userId: "u2" // use u2 to avoid max 3 reviews limit for u1
    })
  });
  console.log(await res.json());
}
test();
