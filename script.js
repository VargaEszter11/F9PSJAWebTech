document.addEventListener('DOMContentLoaded', function(){
  const promoEl = document.getElementById('promo');
  let ytPlayer = null;
  if(promoEl){
    const playBtn = document.getElementById('playBtn');
    const pauseBtn = document.getElementById('pauseBtn');
    const rewindBtn = document.getElementById('rewindBtn');

    if(promoEl.tagName && promoEl.tagName.toLowerCase() === 'video'){
      playBtn && playBtn.addEventListener('click', ()=> promoEl.play());
      pauseBtn && pauseBtn.addEventListener('click', ()=> promoEl.pause());
      rewindBtn && rewindBtn.addEventListener('click', ()=> promoEl.currentTime = Math.max(0, promoEl.currentTime - 5));
    } else if(promoEl.tagName && promoEl.tagName.toLowerCase() === 'iframe' && promoEl.src && promoEl.src.includes('youtube.com')){
      window.onYouTubeIframeAPIReady = function(){
        ytPlayer = new YT.Player('promo', {
          events: {
            'onReady': function(){
              playBtn && playBtn.addEventListener('click', ()=> ytPlayer.playVideo());
              pauseBtn && pauseBtn.addEventListener('click', ()=> ytPlayer.pauseVideo());
              rewindBtn && rewindBtn.addEventListener('click', ()=> {
                try{
                  const t = ytPlayer.getCurrentTime();
                  ytPlayer.seekTo(Math.max(0, t - 5), true);
                } catch(e){
                  console.error('YT rewind failed', e);
                }
              });
            }
          }
        });
      };
      if(window.YT && typeof window.YT.Player === 'function'){
        setTimeout(()=> window.onYouTubeIframeAPIReady && window.onYouTubeIframeAPIReady(), 0);
      }
    }
  }

  const tabla = document.querySelector('#orszagTabla tbody');
  const loader = document.getElementById('loader');
  if(tabla){
    fetch('adatok.json')
      .then(r => r.json())
      .then(data => {
        loader.style.display = 'none';

        const saved = JSON.parse(localStorage.getItem('orszagok')) || [];
        const combined = [...data, ...saved];

        combined.forEach(o => {
          const tr = document.createElement('tr');
          tr.innerHTML = `
            <td>${o.nev}</td>
            <td>${o.fovaros}</td>
            <td>${o.nepesseg.toLocaleString()}</td>
            <td>${o.eu ? 'Igen' : 'Nem'}</td>
            <td><button class="delBtn">❌</button></td>
          `;

          tr.querySelector('.delBtn').addEventListener('click', () => {
            if(confirm(`Biztosan törölni szeretnéd ${o.nev} adatait?`)){
              tr.remove();

              let orszagok = JSON.parse(localStorage.getItem('orszagok')) || [];
              orszagok = orszagok.filter(item => item.nev !== o.nev);
              localStorage.setItem('orszagok', JSON.stringify(orszagok));
            }
          });

          tabla.appendChild(tr);
        });
      })
      .catch(err => {
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
        } else {
          el.classList.remove('error');
        }
      });

      if(!valid){
        uzenet.textContent = 'Kérlek javítsd a hibákat piros mezőkben.';
        uzenet.style.color = 'red';
        return;
      }

      const kepInput = document.getElementById('kep');
      const kepUtvonal = kepInput && kepInput.value ? kepInput.value : 'default.png';

      const payload = {
        nev: document.getElementById('nev').value,
        fovaros: document.getElementById('fovaros').value,
        nepesseg: Number(document.getElementById('nepesseg').value),
        eu: document.getElementById('eu').checked,
        alapit: document.getElementById('alapit').value,
        szin: document.getElementById('szin').value,
        leiras: document.getElementById('leiras').value,
        kep: kepUtvonal
      };

      let orszagok = JSON.parse(localStorage.getItem('orszagok')) || [];
      orszagok.push(payload);
      localStorage.setItem('orszagok', JSON.stringify(orszagok));

      uzenet.style.color = 'green';
      uzenet.textContent = 'Sikeres mentés (localStorage-be mentve is). Lásd alább:';
      const pre = document.createElement('pre');
      pre.textContent = JSON.stringify(payload, null, 2);
      uzenet.appendChild(pre);

      $('#orszagForm').fadeOut(400, function(){ 
        this.reset(); 
        $(this).fadeIn(400); 
      });
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

      const saved = JSON.parse(localStorage.getItem('orszagok')) || [];
      const combined = [...data, ...saved];

      combined.forEach(o => {
        const fig = document.createElement('figure');
        fig.classList.add('zaszlo-elem');
        fig.innerHTML = `
          <img src="${o.kep || 'default.png'}" alt="${o.nev} zászló" class="zaszlo-kep">
          <figcaption>${o.nev}</figcaption>
        `;

        fig.addEventListener('click', () => {
          orszagInfo.innerHTML = `
            <h3>${o.nev}</h3>
            <img src="${o.kep || 'default.png'}" alt="${o.nev} zászló" style="width:140px;border-radius:8px;box-shadow:0 2px 6px rgba(0,0,0,0.2);">
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
