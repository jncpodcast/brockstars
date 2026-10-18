/* Preserve existing bookmarks without exposing performer controls on the public home page. */
const route=location.hash.slice(1);if(['setlists','stage','game-control'].includes(route))location.replace('performer.html');else if(['shows','games','rewards','profile'].includes(route))location.replace('live.html');
