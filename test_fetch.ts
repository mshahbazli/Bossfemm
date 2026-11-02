async function check() {
  const r = await fetch('http://localhost:3000/api/check-ai');
  console.log(await r.json());
}
check();
