export function errorHandler(err: any, _req: any, res: any, _next: any) {
  console.error(err);
  if (err?.message === 'PATH_TRAVERSAL' || err?.message === 'SYMLINK_ESCAPE') {
    return res.status(403).json({ error: 'Akses fail ditolak' });
  }
  if (err?.message === 'ZIP_SLIP_DETECTED') {
    return res.status(400).json({ error: 'ZIP mengandungi path tidak sah' });
  }
  res.status(500).json({ error: 'Ralat dalaman pelayan' });
}