
/* ---------- eventos y arranque ---------- */
document.addEventListener('click', e => {
  const b = e.target.closest('[data-a]'); if (!b || b.disabled) return;
  const f = A[b.dataset.a]; if (f) f(b.dataset, b);
});
document.addEventListener('input', e => {
  const t = e.target, k = t.dataset && t.dataset.i; if (!k) return;
  if (I[k]) I[k](t, e); else { S.f[k] = t.value; draw(); }
});
document.addEventListener('change', e => { const t = e.target, k = t.dataset && t.dataset.c; if (k && C[k]) C[k](t, e); });
document.addEventListener('keydown', e => { if (e.key === 'Escape' && !$('#modal').hidden) cerrar(); });
$('#modal').addEventListener('click', e => { if (e.target.id === 'modal') cerrar(); });

const LIM = { ejecuciones: q => q.orderBy('ts', 'desc').limit(400), movimientos: q => q.orderBy('ts', 'desc').limit(300), auditoria: q => q.orderBy('ts', 'desc').limit(150) };
function suscribir() {
  Object.keys(S.d).forEach(c => {
    let q = col(c); if (LIM[c]) q = LIM[c](q);
    q.onSnapshot(sn => {
      S.d[c] = sn.docs.map(d => ({ id: d.id, ...d.data() }));
      if (!sn.metadata.fromCache) S.synced = true;
      S.err = ''; sched();
    }, er => { S.err = (er && er.code) || 'error'; sched(); });
  });
  setTimeout(() => { if (!S.synced) { S.slow = true; sched(); } }, 10000);
}
async function arrancar() {
  const h = location.hash.slice(1); if (VIEWS.includes(h)) S.view = h;
  draw();
  const c = window.claude;
  if (c && c.use) [DB, USER, ASSETS, DL] = await Promise.all(['db', 'user', 'assets', 'downloads'].map(n => c.use(n).catch(() => null)));
  S.booted = true; S.caps.db = !!DB; S.caps.upload = !!ASSETS; S.caps.save = !!DL;
  if (USER) {
    const me = await USER.me(); S.me = { id: me.id, name: me.name || '' };
    S.caps.owner = await USER.isOwner(); S.caps.admin = await USER.canEdit(); S.caps.write = await USER.can('data.write');
    if (S.caps.owner) S.caps.write = true;
  }
  if (DB) suscribir();
  draw();
}
arrancar();
})();
