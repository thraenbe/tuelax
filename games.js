/*
 * Shared game data + propagation logic for the Deutsche Lacrosse-Meisterschaft 2026.
 * Used by index.html (display) and edit.html (score entry).
 *
 * A team slot is either a fixed name (string) or a reference
 * { ref: <gameId>, take: 'winner'|'loser', label: <placeholder> }.
 */
const DLM = (function () {
  const GAMES = [
    { id: 'hpi1', comp: 'hpi', day: 'Sa', time: '09:00', name: 'Herren Play-Ins · Spiel 1', home: 'Stuttgart', away: 'Freiburg' },
    { id: 'hf1', comp: 'meist', day: 'Sa', time: '10:15', name: 'Halbfinale 1', home: 'Köln', away: 'Tübingen' },
    { id: 'hf2', comp: 'meist', day: 'Sa', time: '11:30', name: 'Halbfinale 2', home: 'Frankfurt', away: 'Hamburg' },
    { id: 'dpi1', comp: 'dpi', day: 'Sa', time: '12:45', name: 'Damen Play-Ins · Spiel 1', home: 'München', away: 'Heidelberg' },
    { id: 'hpi2', comp: 'hpi', day: 'Sa', time: '14:00', name: 'Herren Play-Ins · Spiel 2', home: 'München', away: 'Stuttgart' },
    { id: 'dpi2', comp: 'dpi', day: 'Sa', time: '15:15', name: 'Damen Play-Ins · Spiel 2', home: 'Karlsruhe', away: 'Stuttgart' },
    { id: 'p3', comp: 'meist', day: 'Sa', time: '17:00', name: 'Spiel um Platz 3', home: { ref: 'hf1', take: 'loser', label: 'Verlierer HF1' }, away: { ref: 'hf2', take: 'loser', label: 'Verlierer HF2' } },
    { id: 'finale', comp: 'meist', day: 'Sa', time: '18:30', name: 'Finale', home: { ref: 'hf1', take: 'winner', label: 'Gewinner HF1' }, away: { ref: 'hf2', take: 'winner', label: 'Gewinner HF2' } },
    { id: 'dpi3', comp: 'dpi', day: 'So', time: '10:15', name: 'Damen Play-Ins · Spiel 3', home: { ref: 'dpi1', take: 'winner', label: 'Sieger Spiel 1' }, away: { ref: 'dpi2', take: 'winner', label: 'Sieger Spiel 2' } },
    { id: 'dpi4', comp: 'dpi', day: 'So', time: '11:30', name: 'Damen Play-Ins · Spiel 4', home: { ref: 'dpi1', take: 'loser', label: 'Verlierer Spiel 1' }, away: { ref: 'dpi2', take: 'loser', label: 'Verlierer Spiel 2' } },
    { id: 'hpi3', comp: 'hpi', day: 'So', time: '12:45', name: 'Herren Play-Ins · Spiel 3', home: 'München', away: 'Freiburg' },
    { id: 'dpi5', comp: 'dpi', day: 'So', time: '14:00', name: 'Damen Play-Ins · Spiel 5', home: { ref: 'dpi3', take: 'loser', label: 'Verlierer Spiel 3' }, away: { ref: 'dpi4', take: 'winner', label: 'Gewinner Spiel 4' } },
  ];

  const byId = {};
  GAMES.forEach(function (g) { byId[g.id] = g; });

  // Games whose result feeds another game — a tie here blocks propagation.
  const REFERENCED = new Set();
  GAMES.forEach(function (g) {
    ['home', 'away'].forEach(function (side) {
      if (typeof g[side] === 'object') { REFERENCED.add(g[side].ref); }
    });
  });

  function score(scores, id) {
    const s = scores && scores[id];
    return s && Number.isInteger(s.home) && Number.isInteger(s.away) ? s : null;
  }

  // 'home' | 'away' | null (no result yet, or a tie)
  function outcome(scores, id) {
    const s = score(scores, id);
    if (!s || s.home === s.away) { return null; }
    return s.home > s.away ? 'home' : 'away';
  }

  // Resolve a team slot to { name, resolved }. Follows winner/loser chains
  // recursively; falls back to the placeholder label while undecided.
  function teamName(scores, slot) {
    if (typeof slot === 'string') { return { name: slot, resolved: true }; }
    const o = outcome(scores, slot.ref);
    if (o) {
      const refGame = byId[slot.ref];
      const side = slot.take === 'winner' ? o : (o === 'home' ? 'away' : 'home');
      const inner = teamName(scores, refGame[side]);
      if (inner.resolved) { return inner; }
    }
    return { name: slot.label, resolved: false };
  }

  return { GAMES: GAMES, byId: byId, REFERENCED: REFERENCED, score: score, outcome: outcome, teamName: teamName };
})();
if (typeof module !== 'undefined' && module.exports) { module.exports = DLM; }
