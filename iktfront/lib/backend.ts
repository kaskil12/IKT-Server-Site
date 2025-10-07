// Utility to fetch backend IP from public/backend_ip.txt
export async function getBackendIp() {
  const res = await fetch('/backend_ip.txt');
  if (!res.ok) throw new Error('Failed to load backend IP');
  return (await res.text()).trim();
}

// Helper to build backend URL
export async function backendUrl(path: string) {
  const ip = await getBackendIp();
  return `http://${ip}${path}`;
}


//npx next dev --port 3001 --hostname 10.230.17.52