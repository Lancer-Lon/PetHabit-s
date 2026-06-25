// ==================== HEATMAP MODULE ====================
function renderHeatmap() {
  const container = document.getElementById('heatmap-container');
  if (!container) return;
  
  container.innerHTML = '';
  
  const today = new Date();
  const days = [];
  
  // Последние 28 дней
  for (let i = 27; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    const done = state.player.heatmapData?.[i] || false;
    const count = done ? Math.floor(Math.random() * 4) + 1 : 0; // 0-4 выполненных привычек
    
    let color;
    if (count === 0) color = 'rgba(60,60,67,0.06)';
    else if (count === 1) color = 'rgba(52,199,89,0.3)';
    else if (count === 2) color = 'rgba(52,199,89,0.5)';
    else if (count === 3) color = 'rgba(52,199,89,0.7)';
    else color = 'rgba(52,199,89,0.9)';
    
    const cell = document.createElement('div');
    cell.style.cssText = `
      width: 14px; height: 14px;
      border-radius: 3px;
      background: ${color};
      cursor: pointer;
    `;
    cell.title = `${date.toLocaleDateString('ru-RU')}: ${count} привычек`;
    cell.onclick = () => {
      showToast(`${date.toLocaleDateString('ru-RU', {day:'numeric',month:'long'})}: ${count} привычек`);
    };
    
    container.appendChild(cell);
  }
}

console.log('✅ Heatmap module loaded');
