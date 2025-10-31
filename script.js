document.addEventListener('DOMContentLoaded', function(){
  const video = document.getElementById('promo');
  if(video){
    document.getElementById('playBtn').addEventListener('click', ()=> video.play());
    document.getElementById('pauseBtn').addEventListener('click', ()=> video.pause());
    document.getElementById('rewindBtn').addEventListener('click', ()=> video.currentTime = Math.max(0, video.currentTime - 5));
  }

  const tabla = document.querySelector('#orszagTabla tbody');
  const loader = document.getElementById('loader');
  if(tabla){
    fetch('adatok.json')
      .then(r=>r.json())
      .then(data=>{
        loader.style.display='none';
        data.forEach(o=>{
          const tr = document.createElement('tr');
          tr.innerHTML = `<td>${o.nev}</td><td>${o.fovaros}</td><td>${o.nepesseg.toLocaleString()}</td><td>${o.eu ? 'Igen' : 'Nem'}</td>`;
          tabla.appendChild(tr);
        });
      })
      .catch(err=>{
        loader.textContent = 'Hiba a betöltéskor.';
        console.error(err);
      });

    const search = document.getElementById('search');
    if(search){
      search.addEventListener('input', ()=>{
        const q = search.value.toLowerCase();
        Array.from(tabla.rows).forEach(row=>{
          const show = row.cells[0].textContent.toLowerCase().includes(q);
          row.style.display = show ? '' : 'none';
        });
      });
    }

    $('#toggleBtn').on('click', function(){
      $('#orszagTabla').slideToggle(400);
    });
  }

  const form = document.getElementById('orszagForm');
  const uzenet = document.getElementById('uzenet');
  if(form){
    form.addEventListener('submit', function(e){
      e.preventDefault();
      let valid = true;
      ['nev','fovaros','nepesseg'].forEach(id=>{
        const el = document.getElementById(id);
        if(!el.value || (el.type==='number' && Number(el.value) <= 0)){
          el.classList.add('error'); valid = false;
          const span = document.createElement('div'); span.textContent = `Hiba: ${el.previousElementSibling.textContent}`;
        } else {
          el.classList.remove('error');
        }
      });

      if(!valid){
        uzenet.textContent = 'Kérlek javítsd a hibákat piros mezőkben.';
        uzenet.style.color = 'red';
        return;
      }

      const payload = {
        nev: document.getElementById('nev').value,
        fovaros: document.getElementById('fovaros').value,
        nepesseg: Number(document.getElementById('nepesseg').value),
        eu: document.getElementById('eu').checked,
        alapit: document.getElementById('alapit').value,
        szin: document.getElementById('szin').value,
        leiras: document.getElementById('leiras').value
      };

      uzenet.style.color = 'green';
      uzenet.textContent = 'Sikeres mentés (például a JSON-hez hozzáadható). Lásd alább:';
      const pre = document.createElement('pre');
      pre.textContent = JSON.stringify(payload, null, 2);
      uzenet.appendChild(pre);

      $('#orszagForm').fadeOut(400, function(){ this.reset(); $(this).fadeIn(400); });
    });
  }
});

// Zászlós rész
document.addEventListener('DOMContentLoaded', () => {
  const zaszloContainer = document.getElementById('zaszloGaleria');
  const modal = document.getElementById('infoModal');
  const orszagInfo = document.getElementById('orszagInfo');
  const closeBtn = document.getElementById('closeModal');

  if (!zaszloContainer) return;

  fetch('adatok.json')
    .then(r => {
      if (!r.ok) throw new Error('Nem sikerült betölteni a JSON-t');
      return r.json();
    })
    .then(data => {
      zaszloContainer.innerHTML = '';
      data.forEach(o => {
        const fig = document.createElement('figure');
        fig.classList.add('zaszlo-elem');
        fig.innerHTML = `
          <img src="${o.kep}" alt="${o.nev} zászló" class="zaszlo-kep">
          <figcaption>${o.nev}</figcaption>
        `;
        fig.addEventListener('click', () => {
          orszagInfo.innerHTML = `
            <h3>${o.nev}</h3>
            <img src="${o.kep}" alt="${o.nev} zászló" style="width:140px;border-radius:8px;box-shadow:0 2px 6px rgba(0,0,0,0.2);">
            <p><strong>Főváros:</strong> ${o.fovaros}</p>
            <p><strong>Lakosság:</strong> ${o.nepesseg.toLocaleString()} fő</p>
            <p><strong>EU tag:</strong> ${o.eu ? 'Igen' : 'Nem'}</p>
          `;
          modal.style.display = 'flex';
          document.body.classList.add('blurred');
        });
        zaszloContainer.appendChild(fig);
      });
    })
    .catch(err => {
      zaszloContainer.innerHTML = `<p style="color:red;">Hiba: ${err.message}</p>`;
      console.error(err);
    });

  closeBtn.addEventListener('click', () => {
    modal.style.display = 'none';
    document.body.classList.remove('blurred');
  });

  window.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.style.display = 'none';
      document.body.classList.remove('blurred');
    }
  });

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      modal.style.display = 'none';
      document.body.classList.remove('blurred');
    }
  });
});
