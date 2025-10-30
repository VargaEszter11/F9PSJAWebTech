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
