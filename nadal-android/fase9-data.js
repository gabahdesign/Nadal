(() => {
  const valid = value => /^\d{4}-\d{2}-\d{2}$/.test(value || '') && !Number.isNaN(Date.parse(value + 'T00:00:00Z'));
  const localDay = now => `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}`;
  function eligible(item, now = new Date()) {
    const today=localDay(now), move=item.trobadaMove;
    // A scheduled Move meeting is a specific plan, even if the fair lasts longer.
    if (move && valid(move.data)) {
      const times=String(move.hora || '').match(/\d{1,2}:\d{2}/g) || [];
      if (!times.length) return move.data >= today;
      const minutes=t=>{const [h,m]=t.split(':').map(Number);return h*60+m;};
      const start=minutes(times[0]), end=times[1] ? minutes(times[1]) : start;
      const clock=now.getHours()*60+now.getMinutes();
      if (move.data > today) return true;
      if (move.data === today) return end < start || clock <= end;
      if (end < start) { const yesterday=new Date(now.getFullYear(),now.getMonth(),now.getDate()-1); return move.data === localDay(yesterday) && clock <= end; }
      return false;
    }
    const start=valid(item.dataInici) ? item.dataInici : null;
    const end=valid(item.dataFi) ? item.dataFi : null;
    // Do not invent an end date for an event whose dates remain unspecified.
    if (!start && !end) return false;
    if (end) return end >= today && (!start || start <= end);
    return start >= today;
  }
  globalThis.NadalWheelDates={eligible,localDay};
})();
