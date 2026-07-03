// public/magic-nav.js
const navItemsData = [
  { title: 'Dashboard', icon: 'fa-house', color: '#00A859', iconType: 'solid', link: '/' },
  { title: 'Simulasi', icon: 'fa-calculator', color: '#007BFF', iconType: 'solid', link: '/simulasi.html' },
  { title: 'SOP', icon: 'fa-book', color: '#ffb703', iconType: 'solid', link: '/sop.html' },
  { title: 'Bantuan', icon: 'fa-headset', color: '#e100ff', iconType: 'solid', link: 'https://wa.me/6281934874758' },
  { title: 'Akun', icon: 'fa-user', color: '#ff0076', iconType: 'solid', link: '/login.html' }
];

function initMagicNavbar() {
  const wrapper = document.querySelector('.magic-nav-wrapper');
  if (!wrapper) return;

  // Tentukan menu aktif berdasarkan URL saat ini
  const currentPath = window.location.pathname;
  let activeIndex = navItemsData.findIndex(item => item.link === currentPath);
  if (activeIndex === -1) activeIndex = 0; // Default ke Home

  const ul = wrapper.querySelector('ul');
  ul.innerHTML = ''; // Bersihkan dulu

  // Render Item Menu
  navItemsData.forEach((item, index) => {
    const li = document.createElement('li');
    li.className = `magic-nav-item ${activeIndex === index ? 'active' : ''}`;
    li.style.setProperty('--clr', item.color);
    li.dataset.index = index;
    
    // Jika link eksternal (WA), buka tab baru
    const target = item.link.startsWith('http') ? '_blank' : '_self';

    li.innerHTML = `
      <a href="${item.link}" target="${target}">
        <span class="icon"><i class="fa-${item.iconType} ${item.icon}"></i></span>
        <span class="text">${item.title}</span>
      </a>
    `;

    // Event Listener Klik
    li.addEventListener('click', (e) => {
      if (item.link.startsWith('http')) return; // Biarkan WA terbuka normal
      
      e.preventDefault();
      const newIndex = parseInt(li.dataset.index);
      updateActiveMenu(newIndex);
      
      // Pindah halaman setelah animasi sedikit jalan
      setTimeout(() => {
        window.location.href = item.link;
      }, 200);
    });

    ul.appendChild(li);
  });

  // Buat Indikator (Lingkaran yang geser)
  const indicator = document.createElement('div');
  indicator.className = 'magic-indicator';
  ul.appendChild(indicator);

  function updateIndicator() {
    const activeElement = ul.querySelector('.magic-nav-item.active');
    if (activeElement) {
      const activeColor = activeElement.style.getPropertyValue('--clr');
      const offsetLeft = activeElement.offsetLeft;
      const elementWidth = activeElement.offsetWidth;
      const indicatorOffset = offsetLeft + (elementWidth / 2) - 35; // 35 = setengah lebar indikator (70px)
      
      indicator.style.transform = `translateX(${indicatorOffset}px)`;
      wrapper.style.setProperty('--active-clr', activeColor);
    }
  }

  function updateActiveMenu(index) {
    document.querySelectorAll('.magic-nav-item').forEach((el, i) => {
      el.classList.toggle('active', i === index);
    });
    updateIndicator();
  }

  // Update indikator saat resize window
  window.addEventListener('resize', updateIndicator);
  
  // Initial render
  setTimeout(updateIndicator, 50);
}

// Jalankan saat DOM siap
document.addEventListener('DOMContentLoaded', initMagicNavbar);
