(() => {
  const iso = value => /^\d{4}-\d{2}-\d{2}$/.test(value || '') && !Number.isNaN(Date.parse(value + 'T00:00:00Z'));
  const compact = value => value.replaceAll('-', '');
  const nextDay = value => { const date = new Date(value + 'T00:00:00Z'); date.setUTCDate(date.getUTCDate() + 1); return date.toISOString().slice(0, 10); };
  const esc = value => String(value || '').replaceAll('\\','\\\\').replaceAll('\n','\\n').replaceAll(';','\\;').replaceAll(',','\\,');
  function eventDate(item) {
    const move = item.trobadaMove;
    if (move && iso(move.data)) return { start: move.data, end: move.data, time: move.hora || '', move: true };
    const verification = item.verificacioDates || {};
    if (verification.estat !== 'font oficial consultada' || !iso(verification.inici) || !iso(verification.final)) return null;
    if ((item.datesMarcadesWeb || []).length > 0 && verification.inici !== verification.final) return null;
    return { start: verification.inici, end: verification.final, time: '', move: false };
  }
  function build(item, now = new Date()) {
    const date = eventDate(item); if (!date) return null;
    const start = compact(date.start), end = compact(nextDay(date.end));
    const time = date.time.match(/(?:^|\s)(\d{1,2}):(\d{2})/);
    const startTime = time && Number(time[1]) < 24 && Number(time[2]) < 60 ? String(time[1]).padStart(2,'0') + time[2] + '00' : null;
    const stamp = now.toISOString().replace(/[-:]/g,'').replace(/\.\d{3}Z$/,'Z');
    const lines = ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//MOVE//Nadal//CA','CALSCALE:GREGORIAN'];
    if (startTime) lines.push('BEGIN:VTIMEZONE','TZID:Europe/Madrid','BEGIN:DAYLIGHT','TZOFFSETFROM:+0100','TZOFFSETTO:+0200','TZNAME:CEST','DTSTART:19700329T020000','RRULE:FREQ=YEARLY;BYMONTH=3;BYDAY=-1SU','END:DAYLIGHT','BEGIN:STANDARD','TZOFFSETFROM:+0200','TZOFFSETTO:+0100','TZNAME:CET','DTSTART:19701025T030000','RRULE:FREQ=YEARLY;BYMONTH=10;BYDAY=-1SU','END:STANDARD','END:VTIMEZONE');
    lines.push('BEGIN:VEVENT','UID:'+esc(item.id)+'@move-nadal','DTSTAMP:'+stamp,'SUMMARY:'+esc(item.titol));
    if (startTime) lines.push('DTSTART;TZID=Europe/Madrid:'+start+'T'+startTime);
    else lines.push('DTSTART;VALUE=DATE:'+start,'DTEND;VALUE=DATE:'+end);
    if (item.lloc || item.trobadaMove?.lloc) lines.push('LOCATION:'+esc(item.trobadaMove?.lloc || item.lloc));
    const description = [date.move ? 'Proposta de trobada de Move.' : 'Dates de l’activitat; no confirmen que Move hi vagi.',item.descripcio,item.trobadaMove?.nota,item.webOficial].filter(Boolean).join('\n');
    lines.push('DESCRIPTION:'+esc(description),'END:VEVENT','END:VCALENDAR');
    // Fold by UTF-8 octets, as required by iCalendar, without splitting a character.
    const encoder = new TextEncoder();
    return lines.map(line => { let parts=[], chunk='', size=0; for(const char of line) { const n=encoder.encode(char).length; if(size+n>75){parts.push(chunk);chunk=' ';size=1;} chunk+=char;size+=n; }parts.push(chunk);return parts.join('\r\n'); }).join('\r\n')+'\r\n';
  }
  async function download(item) {
    const content=build(item); if(!content)return false;
    const filename=(item.id || 'activitat')+'.ics';
    if (window.Capacitor?.isNativePlatform?.()) {
      const plugin=window.Capacitor.Plugins?.CalendarExport;
      if (!plugin) throw new Error('El desament del calendari no està disponible.');
      const result=await plugin.save({content,filename}); return result.saved;
    }
    const url=URL.createObjectURL(new Blob([content],{type:'text/calendar;charset=utf-8'}));
    const a=document.createElement('a');a.href=url;a.download=filename;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);return true;
  }
  window.NadalCalendar={ eventDate, build, download };
})();
