(() => {
  if (!matchMedia('(max-width: 760px)').matches) return;
  let attached = false;
  function setup() {
    const form = document.querySelector('#nadalProposalForm');
    if (!form || attached) return false;
    attached = true;
    const placeholders = {date_proposed:'Per concretar', schedule:'Matí, tarda, vespre…', price:'Gratuït / aprox. 15 €', info_url:'https://…'};
    form.querySelectorAll('.proposal-field').forEach(field => {
      const input = field.querySelector('input, textarea');
      if (!input) return;
      const label = input.getAttribute('aria-label') || field.firstChild?.textContent.trim();
      if (label) input.setAttribute('aria-label', label);
      input.placeholder = placeholders[input.name] || label || '';
    });
    const spanish = new URLSearchParams(location.search).get('lang') === 'es';
    const date = form.elements.date_proposed;
    const time = form.elements.schedule;
    [[date, 'date', spanish ? 'Fecha propuesta (opcional)' : 'Data proposada (opcional)'], [time, 'time', spanish ? 'Hora propuesta (opcional)' : 'Hora proposada (opcional)']].forEach(([input, type, label]) => {
      if (!input) return;
      input.type = type; input.required = false; input.removeAttribute('maxlength'); input.removeAttribute('placeholder');
      input.setAttribute('aria-label', label); input.setAttribute('aria-describedby', 'proposal-date-note');
      const visibleLabel = document.createElement('span'); visibleLabel.className = 'app-proposal-date-label'; visibleLabel.textContent = label;
      input.before(visibleLabel);
    });
    if (time) {
      const note = document.createElement('p'); note.id = 'proposal-date-note'; note.className = 'app-proposal-date-note';
      note.textContent = spanish ? 'Si no indicas fecha u hora, las elegiremos nosotros. Aunque las indiques, no podemos garantizar que el plan se haga en el horario propuesto.' : 'Si no indiques data o hora, les triarem nosaltres. Encara que les indiquis, no podem assegurar que el pla es faci en l’horari proposat.';
      time.closest('.proposal-field').after(note);
    }
    const description = form.elements.description?.closest('.proposal-field');
    const location = form.elements.location?.closest('.proposal-field');
    if (description && location) description.before(location);
    const details = document.createElement('details'); details.className = 'app-proposal-optional';
    const summary = document.createElement('summary'); summary.textContent = spanish ? 'Datos opcionales' : 'Dades opcionals'; details.appendChild(summary);
    const optionalFields = document.createElement('div'); optionalFields.className = 'app-proposal-optional-fields'; details.appendChild(optionalFields);
    ['date_proposed','schedule','price','info_url','observations'].forEach(name => {
      const input = form.elements[name]; if (!input) return; input.required = false;
      const field = input.closest('.proposal-field'); if (field) optionalFields.appendChild(field);
      if (name === 'schedule') { const note = form.querySelector('#proposal-date-note'); if (note) optionalFields.appendChild(note); }
    });
    form.querySelector('[type="submit"]').before(details);
    const status = form.querySelector('#nadalProposalStatus');
    const submit = form.querySelector('[type="submit"]');
    form.addEventListener('submit', async event => {
      event.preventDefault();
      event.stopImmediatePropagation();
      if (!form.reportValidity()) return;
      if (form.elements.website?.value) return;
      submit.disabled = true;
      status.textContent = 'Enviant…';
      try {
        const configResponse = await fetch('./proposal-config.json', {cache:'no-store'});
        if (!configResponse.ok) throw new Error('configuration');
        const config = await configResponse.json();
        const endpoint = String(config.formspreeEndpoint || '').trim();
        if (!/^https:\/\/formspree\.io\/f\/[A-Za-z0-9]+$/.test(endpoint)) throw new Error('configuration');
        const values = new FormData(form);
        values.delete('website');
        values.set('_subject', 'Nova proposta d’activitat · MOVE × LOBITOS');
        const response = await fetch(endpoint, {method:'POST', headers:{Accept:'application/json'}, body:values});
        if (!response.ok) throw new Error('send');
        form.reset();
        status.textContent = 'Proposta enviada. Gràcies per compartir-la!';
        status.classList.add('is-success');
        const confirmation = document.createElement('section');
        confirmation.className = 'app-proposal-confirmation';
        confirmation.setAttribute('role', 'status');
        confirmation.tabIndex = -1;
        const message = document.createElement('h2');
        message.textContent = 'Proposta enviada. Gràcies per compartir-la!';
        const again = document.createElement('button');
        again.type = 'button'; again.textContent = 'Enviar una altra proposta';
        again.addEventListener('click', () => { confirmation.remove(); form.hidden = false; form.querySelector('input')?.focus(); });
        confirmation.append(message, again); form.hidden = true; form.after(confirmation); confirmation.focus();
      } catch(error) {
        status.classList.remove('is-success');
        status.textContent = error.message === 'configuration'
          ? 'El formulari encara no està configurat. Torna-ho a provar més endavant.'
          : 'No s’ha pogut enviar la proposta. Comprova la connexió i torna-ho a provar.';
      } finally { submit.disabled = false; }
    }, true);
    status.tabIndex = -1;
    return true;
  }
  if (!setup()) {
    const observer = new MutationObserver(() => { if (setup()) observer.disconnect(); });
    observer.observe(document.body, {childList:true, subtree:true});
  }
})();
